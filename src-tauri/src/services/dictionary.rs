use std::collections::HashMap;
use std::sync::RwLock;
use lazy_static::lazy_static;
use regex::Regex;
use serde::{Deserialize, Serialize};
use super::storage::{get_data_dir, read_json_safe};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StatDictionaryEntry {
    pub id: String,
    pub zh_text: String,
    pub en_text: String,
}

#[derive(Debug, Clone)]
pub struct StatMatchResult {
    pub id: String,
    pub en_text: String,
    pub value: Option<f64>,
    pub min_value: Option<f64>,
    pub max_value: Option<f64>,
}

static EMBEDDED_ITEM_DICT_JSON: &str = include_str!("../../../data/item_dictionary.json");
static EMBEDDED_STAT_DICT_JSON: &str = include_str!("../../../data/stat_dictionary.json");

lazy_static! {
    static ref NUM_RE: Regex = Regex::new(r"[+-]?\d+(?:\.\d+)?").unwrap();
    static ref PATTERN_NORM_RE: Regex = Regex::new(r"[+-]?\d+(?:\.\d+)?|[+-]?#").unwrap();
    static ref TAG_PREFIX_RE: Regex = Regex::new(r"(?i)^\{[^}]+\}\s*|^\([^)]+\)\s*").unwrap();
    
    pub static ref DICTIONARY_STATE: RwLock<DictionaryState> = RwLock::new(DictionaryState::new());
}

pub fn normalize_pattern(text: &str) -> String {
    let clean = TAG_PREFIX_RE.replace_all(text, "");
    let s = PATTERN_NORM_RE.replace_all(&clean, "#");
    s.split_whitespace().collect::<Vec<_>>().join(" ").to_lowercase()
}

pub struct DictionaryState {
    pub stat_dict: Vec<StatDictionaryEntry>,
    pub stat_pattern_map: HashMap<String, StatDictionaryEntry>,
    pub stat_armour_local_map: HashMap<String, StatDictionaryEntry>,
    pub stat_weapon_local_map: HashMap<String, StatDictionaryEntry>,
    pub stat_local_map: HashMap<String, StatDictionaryEntry>,
    pub item_dict: HashMap<String, String>,
}

fn entry_priority(id: &str) -> i32 {
    if id.starts_with("explicit.") {
        100
    } else if id.starts_with("pseudo.") {
        80
    } else if id.starts_with("implicit.") {
        60
    } else if id.starts_with("fractured.") {
        40
    } else {
        20
    }
}

impl DictionaryState {
    pub fn new() -> Self {
        let mut state = Self {
            stat_dict: Vec::new(),
            stat_pattern_map: HashMap::new(),
            stat_armour_local_map: HashMap::new(),
            stat_weapon_local_map: HashMap::new(),
            stat_local_map: HashMap::new(),
            item_dict: HashMap::new(),
        };
        state.init();
        state
    }

    pub fn init(&mut self) {
        // 1. 載入內嵌的完整詞綴字典 (17,600+ 條)
        let mut stats: Vec<StatDictionaryEntry> = serde_json::from_str(EMBEDDED_STAT_DICT_JSON).unwrap_or_default();

        // 2. 載入內嵌的完整物品名稱字典 (5,100+ 個)
        if let Ok(embedded_items) = serde_json::from_str::<HashMap<String, String>>(EMBEDDED_ITEM_DICT_JSON) {
            for (k, v) in embedded_items {
                self.item_dict.insert(k, v);
            }
        }

        // 3. 嘗試讀取外部覆寫字典 (若磁碟存在更新版本)
        let data_dir = get_data_dir();
        let stat_path = data_dir.join("stat_dictionary.json");
        let item_path = data_dir.join("item_dictionary.json");

        if stat_path.exists() {
            let loaded_stats: Vec<StatDictionaryEntry> = read_json_safe(&stat_path, Vec::new());
            if !loaded_stats.is_empty() {
                stats.extend(loaded_stats);
            }
        }
        self.stat_dict = stats;
        self.rebuild_stat_indexes();

        if item_path.exists() {
            let loaded_items: HashMap<String, String> = read_json_safe(&item_path, HashMap::new());
            for (k, v) in loaded_items {
                self.item_dict.insert(k, v);
            }
        }

        crate::app_log!(
            "[Dictionary] 字典初始化完成：已載入 {} 條詞綴索引、{} 個物品中英對照名稱",
            self.stat_dict.len(),
            self.item_dict.len()
        );
    }

    fn rebuild_stat_indexes(&mut self) {
        self.stat_pattern_map.clear();
        self.stat_armour_local_map.clear();
        self.stat_weapon_local_map.clear();
        self.stat_local_map.clear();

        for entry in &self.stat_dict {
            let prio = entry_priority(&entry.id);
            let is_local = entry.en_text.contains("(Local)")
                || entry.en_text.contains("(local)")
                || entry.zh_text.contains("(部分)")
                || entry.zh_text.contains("(局部)");

            let is_armour_stat = entry.en_text.contains("Energy Shield")
                || entry.en_text.contains("Armour")
                || entry.en_text.contains("Evasion Rating")
                || entry.en_text.contains("Evasion")
                || entry.zh_text.contains("能量護盾")
                || entry.zh_text.contains("護甲")
                || entry.zh_text.contains("閃避");

            let is_weapon_stat = entry.en_text.contains("Physical Damage")
                || entry.en_text.contains("Attack Speed")
                || entry.en_text.contains("Critical Strike Chance")
                || entry.en_text.contains("Accuracy Rating")
                || entry.en_text.contains("Damage (Local)")
                || entry.zh_text.contains("物理傷害")
                || entry.zh_text.contains("攻擊速度")
                || entry.zh_text.contains("暴擊率")
                || entry.zh_text.contains("命中值");

            let clean_zh = entry.zh_text.replace("(部分)", "").replace("(局部)", "").replace("(Local)", "").replace("(local)", "");
            let clean_en = entry.en_text.replace("(Local)", "").replace("(local)", "").replace("(部分)", "").replace("(局部)", "");

            if is_local {
                if !clean_zh.is_empty() {
                    let zh_pattern = normalize_pattern(&clean_zh);
                    if is_armour_stat {
                        let should_insert = self.stat_armour_local_map.get(&zh_pattern)
                            .map_or(true, |existing| prio > entry_priority(&existing.id));
                        if should_insert {
                            self.stat_armour_local_map.insert(zh_pattern.clone(), entry.clone());
                        }
                    }
                    if is_weapon_stat {
                        let should_insert = self.stat_weapon_local_map.get(&zh_pattern)
                            .map_or(true, |existing| prio > entry_priority(&existing.id));
                        if should_insert {
                            self.stat_weapon_local_map.insert(zh_pattern.clone(), entry.clone());
                        }
                    }
                    let should_insert = self.stat_local_map.get(&zh_pattern)
                        .map_or(true, |existing| prio > entry_priority(&existing.id));
                    if should_insert {
                        self.stat_local_map.insert(zh_pattern, entry.clone());
                    }
                }
                if !clean_en.is_empty() {
                    let en_pattern = normalize_pattern(&clean_en);
                    if is_armour_stat {
                        let should_insert = self.stat_armour_local_map.get(&en_pattern)
                            .map_or(true, |existing| prio > entry_priority(&existing.id));
                        if should_insert {
                            self.stat_armour_local_map.insert(en_pattern.clone(), entry.clone());
                        }
                    }
                    if is_weapon_stat {
                        let should_insert = self.stat_weapon_local_map.get(&en_pattern)
                            .map_or(true, |existing| prio > entry_priority(&existing.id));
                        if should_insert {
                            self.stat_weapon_local_map.insert(en_pattern.clone(), entry.clone());
                        }
                    }
                    let should_insert = self.stat_local_map.get(&en_pattern)
                        .map_or(true, |existing| prio > entry_priority(&existing.id));
                    if should_insert {
                        self.stat_local_map.insert(en_pattern, entry.clone());
                    }
                }
            } else {
                if !entry.zh_text.is_empty() {
                    let zh_pattern = normalize_pattern(&entry.zh_text);
                    let should_insert = self.stat_pattern_map.get(&zh_pattern)
                        .map_or(true, |existing| prio > entry_priority(&existing.id));
                    if should_insert {
                        self.stat_pattern_map.insert(zh_pattern, entry.clone());
                    }
                }

                if !entry.en_text.is_empty() {
                    let en_pattern = normalize_pattern(&entry.en_text);
                    let should_insert = self.stat_pattern_map.get(&en_pattern)
                        .map_or(true, |existing| prio > entry_priority(&existing.id));
                    if should_insert {
                        self.stat_pattern_map.insert(en_pattern, entry.clone());
                    }
                }
            }
        }
    }
}

pub fn lookup_english_base_type(zh_base_type: &str) -> Option<String> {
    if zh_base_type.is_empty() {
        return None;
    }
    let clean = zh_base_type.trim();
    let state = DICTIONARY_STATE.read().ok()?;
    state.item_dict.get(clean).cloned()
}

pub fn lookup_stat_with_context(clean_line: &str, is_armour: bool, is_weapon: bool) -> Option<StatMatchResult> {
    if clean_line.is_empty() {
        return None;
    }

    let mut numbers = Vec::new();
    for cap in NUM_RE.captures_iter(clean_line) {
        if let Some(m) = cap.get(0) {
            if let Ok(num) = m.as_str().parse::<f64>() {
                numbers.push(num);
            }
        }
    }
    let primary_val = numbers.first().copied();

    let normalized = normalize_pattern(clean_line);

    let state = DICTIONARY_STATE.read().ok()?;

    // 1. If armour context, check armour local stats first
    if is_armour {
        if let Some(entry) = state.stat_armour_local_map.get(&normalized) {
            return Some(StatMatchResult {
                id: entry.id.clone(),
                en_text: if !entry.en_text.is_empty() { entry.en_text.clone() } else { entry.zh_text.clone() },
                value: primary_val,
                min_value: primary_val.map(|v| if v > 0.0 { (v * 0.85).floor() } else { v }),
                max_value: primary_val.map(|v| if v > 0.0 { (v * 1.15).ceil() } else { v }),
            });
        }
    }

    // 2. If weapon context, check weapon local stats first
    if is_weapon {
        if let Some(entry) = state.stat_weapon_local_map.get(&normalized) {
            return Some(StatMatchResult {
                id: entry.id.clone(),
                en_text: if !entry.en_text.is_empty() { entry.en_text.clone() } else { entry.zh_text.clone() },
                value: primary_val,
                min_value: primary_val.map(|v| if v > 0.0 { (v * 0.85).floor() } else { v }),
                max_value: primary_val.map(|v| if v > 0.0 { (v * 1.15).ceil() } else { v }),
            });
        }
    }

    // 3. Exact pattern match in global/default map
    if let Some(entry) = state.stat_pattern_map.get(&normalized) {
        return Some(StatMatchResult {
            id: entry.id.clone(),
            en_text: if !entry.en_text.is_empty() { entry.en_text.clone() } else { entry.zh_text.clone() },
            value: primary_val,
            min_value: primary_val.map(|v| if v > 0.0 { (v * 0.85).floor() } else { v }),
            max_value: primary_val.map(|v| if v > 0.0 { (v * 1.15).ceil() } else { v }),
        });
    }

    // 4. Any local match fallback
    if let Some(entry) = state.stat_local_map.get(&normalized) {
        return Some(StatMatchResult {
            id: entry.id.clone(),
            en_text: if !entry.en_text.is_empty() { entry.en_text.clone() } else { entry.zh_text.clone() },
            value: primary_val,
            min_value: primary_val.map(|v| if v > 0.0 { (v * 0.85).floor() } else { v }),
            max_value: primary_val.map(|v| if v > 0.0 { (v * 1.15).ceil() } else { v }),
        });
    }

    // 5. Partial substring search fallback
    for entry in &state.stat_dict {
        let zh_clean = normalize_pattern(&entry.zh_text).replace('#', "");
        let en_clean = normalize_pattern(&entry.en_text).replace('#', "");

        let zh_trim = zh_clean.trim();
        let en_trim = en_clean.trim();

        if (!zh_trim.is_empty() && normalized.contains(zh_trim)) || (!en_trim.is_empty() && normalized.contains(en_trim)) {
            return Some(StatMatchResult {
                id: entry.id.clone(),
                en_text: if !entry.en_text.is_empty() { entry.en_text.clone() } else { entry.zh_text.clone() },
                value: primary_val,
                min_value: primary_val.map(|v| if v > 0.0 { (v * 0.85).floor() } else { v }),
                max_value: primary_val.map(|v| if v > 0.0 { (v * 1.15).ceil() } else { v }),
            });
        }
    }

    None
}

pub fn lookup_stat_by_text(clean_line: &str) -> Option<StatMatchResult> {
    lookup_stat_with_context(clean_line, false, false)
}

pub fn lookup_stat_for_armour(clean_line: &str) -> Option<StatMatchResult> {
    lookup_stat_with_context(clean_line, true, false)
}

pub fn lookup_stat_for_weapon(clean_line: &str) -> Option<StatMatchResult> {
    lookup_stat_with_context(clean_line, false, true)
}

pub fn get_common_item_map() -> HashMap<String, String> {
    let mut map = HashMap::new();
    let pairs = [
        ("神聖石", "Divine Orb"),
        ("崇高石", "Exalted Orb"),
        ("混沌石", "Chaos Orb"),
        ("鏡子", "Mirror of Kalandra"),
        ("卡蘭德的魔鏡", "Mirror of Kalandra"),
        ("後悔石", "Orb of Regret"),
        ("重鑄石", "Orb of Scouring"),
        ("富豪石", "Regal Orb"),
        ("點金石", "Orb of Alchemy"),
        ("鏈結石", "Orb of Fusing"),
        ("工匠石", "Jeweller's Orb"),
        ("幻色石", "Chromatic Orb"),
        ("改造石", "Orb of Alteration"),
        ("增幅石", "Orb of Augmentation"),
        ("蛻變石", "Orb of Transmutation"),
        ("機會石", "Orb of Chance"),
        ("無效石", "Orb of Annulment"),
        ("古靈莊園", "Sacred Lifeforce"),
        ("罪魔邪冠", "Hubris Circlet"),
        ("魔影法衣", "Vaal Regalia"),
        ("術士長靴", "Sorcerer Boots"),
        ("術士手套", "Sorcerer Gloves"),
        ("厚頭盔", "Royal Burgonet"),
        ("皮革腰帶", "Leather Belt"),
        ("重型腰帶", "Heavy Belt"),
        ("素布腰帶", "Rustic Sash"),
        ("水晶腰帶", "Crystal Belt"),
        ("獵首", "Headhunter"),
        ("法師之血", "Mageblood"),
        ("灰燼之甕", "Ashes of the Stars"),
        ("滅絕之星", "Crystallised Omniscience"),
        ("西拉克", "The Squire"),
        ("原始之罪", "Original Sin"),
        ("尼米斯", "Nimis"),
    ];

    for (zh, en) in pairs {
        map.insert(zh.to_string(), en.to_string());
        map.insert(en.to_string(), en.to_string());
    }

    map
}

pub fn get_default_stat_dict() -> Vec<StatDictionaryEntry> {
    vec![
        // Life & Mana & Energy Shield
        StatDictionaryEntry { id: "explicit.stat_3299347043".to_string(), zh_text: "+# 最大生命".to_string(), en_text: "+# to maximum Life".to_string() },
        StatDictionaryEntry { id: "explicit.stat_1050105434".to_string(), zh_text: "+# 最大魔力".to_string(), en_text: "+# to maximum Mana".to_string() },
        StatDictionaryEntry { id: "explicit.stat_4052037485".to_string(), zh_text: "+# 最大能量護盾".to_string(), en_text: "+# to maximum Energy Shield".to_string() },
        StatDictionaryEntry { id: "explicit.stat_3593843976".to_string(), zh_text: "增加 #% 能量護盾".to_string(), en_text: "#% increased Energy Shield".to_string() },
        StatDictionaryEntry { id: "explicit.stat_4237190083".to_string(), zh_text: "減少 #% 技能的魔力保留效用".to_string(), en_text: "#% reduced Mana Reservation Efficiency of Skills".to_string() },
        StatDictionaryEntry { id: "explicit.stat_4237190083".to_string(), zh_text: "增加 #% 技能的魔力保留效用".to_string(), en_text: "#% increased Mana Reservation Efficiency of Skills".to_string() },

        // Resistances
        StatDictionaryEntry { id: "explicit.stat_3372524247".to_string(), zh_text: "+#% 火焰抗性".to_string(), en_text: "+#% to Fire Resistance".to_string() },
        StatDictionaryEntry { id: "explicit.stat_4220027924".to_string(), zh_text: "+#% 冰冷抗性".to_string(), en_text: "+#% to Cold Resistance".to_string() },
        StatDictionaryEntry { id: "explicit.stat_1671376347".to_string(), zh_text: "+#% 閃電抗性".to_string(), en_text: "+#% to Lightning Resistance".to_string() },
        StatDictionaryEntry { id: "explicit.stat_2923486250".to_string(), zh_text: "+#% 混沌抗性".to_string(), en_text: "+#% to Chaos Resistance".to_string() },
        StatDictionaryEntry { id: "explicit.stat_2901986750".to_string(), zh_text: "+#% 全部元素抗性".to_string(), en_text: "+#% to all Elemental Resistances".to_string() },
        StatDictionaryEntry { id: "explicit.stat_3441501978".to_string(), zh_text: "+#% 火焰和冰冷抗性".to_string(), en_text: "+#% to Fire and Cold Resistances".to_string() },
        StatDictionaryEntry { id: "explicit.stat_4277795662".to_string(), zh_text: "+#% 冰冷和閃電抗性".to_string(), en_text: "+#% to Cold and Lightning Resistances".to_string() },
        StatDictionaryEntry { id: "explicit.stat_2915988346".to_string(), zh_text: "+#% 火焰和閃電抗性".to_string(), en_text: "+#% to Fire and Lightning Resistances".to_string() },

        // Item Rarity / Quantity
        StatDictionaryEntry { id: "explicit.stat_3919816157".to_string(), zh_text: "增加 #% 物品稀有度".to_string(), en_text: "#% increased Rarity of Items found".to_string() },
        StatDictionaryEntry { id: "implicit.stat_3919816157".to_string(), zh_text: "增加 #% 物品稀有度".to_string(), en_text: "#% increased Rarity of Items found".to_string() },
        StatDictionaryEntry { id: "explicit.stat_3943640232".to_string(), zh_text: "增加 #% 物品掉落數量".to_string(), en_text: "#% increased Quantity of Items found".to_string() },

        // Attributes
        StatDictionaryEntry { id: "explicit.stat_4082204447".to_string(), zh_text: "+# 力量".to_string(), en_text: "+# to Strength".to_string() },
        StatDictionaryEntry { id: "explicit.stat_3261801946".to_string(), zh_text: "+# 敏捷".to_string(), en_text: "+# to Dexterity".to_string() },
        StatDictionaryEntry { id: "explicit.stat_4167198415".to_string(), zh_text: "+# 智慧".to_string(), en_text: "+# to Intelligence".to_string() },
        StatDictionaryEntry { id: "explicit.stat_1379411836".to_string(), zh_text: "+# 全能力".to_string(), en_text: "+# to all Attributes".to_string() },

        // Damage & Offense
        StatDictionaryEntry { id: "explicit.stat_965082289".to_string(), zh_text: "增加 #% 物理傷害".to_string(), en_text: "#% increased Physical Damage".to_string() },
        StatDictionaryEntry { id: "explicit.stat_2974417149".to_string(), zh_text: "增加 #% 法術傷害".to_string(), en_text: "#% increased Spell Damage".to_string() },
        StatDictionaryEntry { id: "explicit.stat_3962278098".to_string(), zh_text: "增加 #% 火焰傷害".to_string(), en_text: "#% increased Fire Damage".to_string() },
        StatDictionaryEntry { id: "explicit.stat_3291658075".to_string(), zh_text: "增加 #% 冰冷傷害".to_string(), en_text: "#% increased Cold Damage".to_string() },
        StatDictionaryEntry { id: "explicit.stat_2231156303".to_string(), zh_text: "增加 #% 閃電傷害".to_string(), en_text: "#% increased Lightning Damage".to_string() },
        StatDictionaryEntry { id: "explicit.stat_736946781".to_string(), zh_text: "增加 #% 混沌傷害".to_string(), en_text: "#% increased Chaos Damage".to_string() },
        StatDictionaryEntry { id: "explicit.stat_681332047".to_string(), zh_text: "增加 #% 攻擊速度".to_string(), en_text: "#% increased Attack Speed".to_string() },
        StatDictionaryEntry { id: "explicit.stat_2891184298".to_string(), zh_text: "增加 #% 施法速度".to_string(), en_text: "#% increased Cast Speed".to_string() },
        StatDictionaryEntry { id: "explicit.stat_55876295".to_string(), zh_text: "增加 #% 暴擊率".to_string(), en_text: "#% increased Critical Strike Chance".to_string() },
        StatDictionaryEntry { id: "explicit.stat_3556824919".to_string(), zh_text: "+#% 暴擊加成".to_string(), en_text: "+#% to Critical Strike Multiplier".to_string() },

        // Speed & Defense
        StatDictionaryEntry { id: "explicit.stat_2250533757".to_string(), zh_text: "增加 #% 移動速度".to_string(), en_text: "#% increased Movement Speed".to_string() },
        StatDictionaryEntry { id: "explicit.stat_3489786338".to_string(), zh_text: "增加 #% 護甲".to_string(), en_text: "#% increased Armour".to_string() },
        StatDictionaryEntry { id: "explicit.stat_803737631".to_string(), zh_text: "+# 護甲".to_string(), en_text: "+# to Armour".to_string() },
        StatDictionaryEntry { id: "explicit.stat_2236087577".to_string(), zh_text: "增加 #% 閃避率".to_string(), en_text: "#% increased Evasion Rating".to_string() },
        StatDictionaryEntry { id: "explicit.stat_2482852589".to_string(), zh_text: "+# 閃避值".to_string(), en_text: "+# to Evasion Rating".to_string() },
    ]
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_local_vs_global_es_lookup() {
        // For armour, +85 to maximum Energy Shield should match local stat_4052037485
        let armour_res = lookup_stat_for_armour("+85 to maximum Energy Shield").expect("Should match armour ES");
        assert_eq!(armour_res.id, "explicit.stat_4052037485");

        // For jewellery / general, +85 to maximum Energy Shield should match global stat_3489782002
        let global_res = lookup_stat_by_text("+85 to maximum Energy Shield").expect("Should match global ES");
        assert_eq!(global_res.id, "explicit.stat_3489782002");

        // Chinese text check
        let zh_armour_res = lookup_stat_for_armour("+85 最大能量護盾").expect("Should match armour ES zh");
        assert_eq!(zh_armour_res.id, "explicit.stat_4052037485");

        let zh_global_res = lookup_stat_by_text("+85 最大能量護盾").expect("Should match global ES zh");
        assert_eq!(zh_global_res.id, "explicit.stat_3489782002");
    }

    #[test]
    fn test_local_vs_global_percent_es_lookup() {
        let armour_res = lookup_stat_for_armour("120% increased Energy Shield").expect("Should match armour % ES");
        assert_eq!(armour_res.id, "explicit.stat_4015621042");

        let zh_armour_res = lookup_stat_for_armour("增加 120% 能量護盾").expect("Should match armour % ES zh");
        assert_eq!(zh_armour_res.id, "explicit.stat_4015621042");
    }
}
