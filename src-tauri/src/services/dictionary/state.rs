use super::patterns::{entry_priority, normalize_pattern};
use crate::services::storage::{get_data_dir, read_json_safe};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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

static EMBEDDED_ITEM_DICT_JSON: &str = include_str!("../../../../data/item_dictionary.json");
static EMBEDDED_STAT_DICT_JSON: &str = include_str!("../../../../data/stat_dictionary.json");

pub struct DictionaryState {
    pub stat_dict: Vec<StatDictionaryEntry>,
    pub stat_pattern_map: HashMap<String, StatDictionaryEntry>,
    pub stat_armour_local_map: HashMap<String, StatDictionaryEntry>,
    pub stat_weapon_local_map: HashMap<String, StatDictionaryEntry>,
    pub stat_local_map: HashMap<String, StatDictionaryEntry>,
    pub item_dict: HashMap<String, String>,
}

impl Default for DictionaryState {
    fn default() -> Self {
        Self::new()
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
        let mut stats: Vec<StatDictionaryEntry> =
            serde_json::from_str(EMBEDDED_STAT_DICT_JSON).unwrap_or_default();
        if let Ok(embedded_items) =
            serde_json::from_str::<HashMap<String, String>>(EMBEDDED_ITEM_DICT_JSON)
        {
            for (k, v) in embedded_items {
                self.item_dict.insert(k, v);
            }
        }

        for (k, v) in super::base_types::get_common_item_map() {
            self.item_dict.insert(k, v);
        }

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
    }

    fn rebuild_stat_indexes(&mut self) {
        self.stat_pattern_map.clear();
        self.stat_armour_local_map.clear();
        self.stat_weapon_local_map.clear();
        self.stat_local_map.clear();

        let entries = self.stat_dict.clone();
        for entry in &entries {
            let is_local = entry.en_text.contains("(Local)")
                || entry.en_text.contains("(local)")
                || entry.zh_text.contains("(部分)")
                || entry.zh_text.contains("(局部)");
            let is_armour = check_stat_is_armour(entry);
            let is_weapon = check_stat_is_weapon(entry);

            let clean_zh = entry
                .zh_text
                .replace("(部分)", "")
                .replace("(局部)", "")
                .replace("(Local)", "")
                .replace("(local)", "");
            let clean_en = entry
                .en_text
                .replace("(Local)", "")
                .replace("(local)", "")
                .replace("(部分)", "")
                .replace("(局部)", "");

            if is_local {
                self.index_local_entry(entry, &clean_zh, &clean_en, is_armour, is_weapon);
            } else {
                self.index_global_entry(entry);
            }
        }
    }

    fn index_local_entry(
        &mut self,
        entry: &StatDictionaryEntry,
        clean_zh: &str,
        clean_en: &str,
        is_armour: bool,
        is_weapon: bool,
    ) {
        let prio = entry_priority(&entry.id);
        if !clean_zh.is_empty() {
            let zh_p = normalize_pattern(clean_zh);
            if is_armour
                && self
                    .stat_armour_local_map
                    .get(&zh_p)
                    .is_none_or(|e| prio > entry_priority(&e.id))
            {
                self.stat_armour_local_map
                    .insert(zh_p.clone(), entry.clone());
            }
            if is_weapon
                && self
                    .stat_weapon_local_map
                    .get(&zh_p)
                    .is_none_or(|e| prio > entry_priority(&e.id))
            {
                self.stat_weapon_local_map
                    .insert(zh_p.clone(), entry.clone());
            }
            if self
                .stat_local_map
                .get(&zh_p)
                .is_none_or(|e| prio > entry_priority(&e.id))
            {
                self.stat_local_map.insert(zh_p, entry.clone());
            }
        }
        if !clean_en.is_empty() {
            let en_p = normalize_pattern(clean_en);
            if is_armour
                && self
                    .stat_armour_local_map
                    .get(&en_p)
                    .is_none_or(|e| prio > entry_priority(&e.id))
            {
                self.stat_armour_local_map
                    .insert(en_p.clone(), entry.clone());
            }
            if is_weapon
                && self
                    .stat_weapon_local_map
                    .get(&en_p)
                    .is_none_or(|e| prio > entry_priority(&e.id))
            {
                self.stat_weapon_local_map
                    .insert(en_p.clone(), entry.clone());
            }
            if self
                .stat_local_map
                .get(&en_p)
                .is_none_or(|e| prio > entry_priority(&e.id))
            {
                self.stat_local_map.insert(en_p, entry.clone());
            }
        }
    }

    fn index_global_entry(&mut self, entry: &StatDictionaryEntry) {
        let prio = entry_priority(&entry.id);
        if !entry.zh_text.is_empty() {
            let zh_p = normalize_pattern(&entry.zh_text);
            if self
                .stat_pattern_map
                .get(&zh_p)
                .is_none_or(|e| prio > entry_priority(&e.id))
            {
                self.stat_pattern_map.insert(zh_p, entry.clone());
            }
        }
        if !entry.en_text.is_empty() {
            let en_p = normalize_pattern(&entry.en_text);
            if self
                .stat_pattern_map
                .get(&en_p)
                .is_none_or(|e| prio > entry_priority(&e.id))
            {
                self.stat_pattern_map.insert(en_p, entry.clone());
            }
        }
    }
}

fn check_stat_is_armour(entry: &StatDictionaryEntry) -> bool {
    entry.en_text.contains("Energy Shield")
        || entry.en_text.contains("Armour")
        || entry.en_text.contains("Evasion")
        || entry.zh_text.contains("能量護盾")
        || entry.zh_text.contains("護甲")
        || entry.zh_text.contains("閃避")
}

fn check_stat_is_weapon(entry: &StatDictionaryEntry) -> bool {
    entry.en_text.contains("Physical Damage")
        || entry.en_text.contains("Attack Speed")
        || entry.en_text.contains("Critical Strike Chance")
        || entry.en_text.contains("Accuracy")
        || entry.zh_text.contains("物理傷害")
        || entry.zh_text.contains("攻擊速度")
        || entry.zh_text.contains("暴擊率")
        || entry.zh_text.contains("命中")
}
