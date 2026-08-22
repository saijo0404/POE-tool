use regex::Regex;
use lazy_static::lazy_static;
use crate::models::item::{ModType, ParsedItem, ParsedItemMod};
use super::dictionary::{lookup_english_base_type, lookup_stat_by_text};

lazy_static! {
    static ref SECTION_RE: Regex = Regex::new(r"(?m)^-{4,}\s*$").unwrap();
    static ref RARITY_ZH_RE: Regex = Regex::new(r"稀有度:\s*([^\r\n]+)").unwrap();
    static ref RARITY_EN_RE: Regex = Regex::new(r"Rarity:\s*([^\r\n]+)").unwrap();
    static ref ITEM_CLASS_ZH_RE: Regex = Regex::new(r"(?:物品種類|物品類別):\s*([^\r\n]+)").unwrap();
    static ref ITEM_CLASS_EN_RE: Regex = Regex::new(r"Item Class:\s*([^\r\n]+)").unwrap();
    static ref ITEM_LEVEL_ZH_RE: Regex = Regex::new(r"物品等級:\s*(\d+)").unwrap();
    static ref ITEM_LEVEL_EN_RE: Regex = Regex::new(r"Item Level:\s*(\d+)").unwrap();
    static ref QUALITY_RE: Regex = Regex::new(r"品質:\s*\+?(\d+)%|Quality:\s*\+?(\d+)%").unwrap();
    static ref SOCKETS_RE: Regex = Regex::new(r"(?:插槽|Sockets):\s*([RGBWAW\s-]+)").unwrap();
    static ref CORRUPTED_RE: Regex = Regex::new(r"已汙染|已污染|Corrupted").unwrap();
    pub(crate) static ref ROLL_RANGE_RE: Regex = Regex::new(r"\([+-]?\d+(?:\.\d+)?(?:--?[+-]?\d+(?:\.\d+)?)?\)").unwrap();
    pub(crate) static ref VALUE_EXTRACT_RE: Regex = Regex::new(r"[-+]?\d+(?:\.\d+)?").unwrap();
}

pub fn parse_item_text(text: &str) -> ParsedItem {
    let normalized = text.replace("\r\n", "\n").replace('\r', "\n");
    let clean_text = normalized.trim();
    let is_zh = clean_text.contains("稀有度:") || clean_text.contains("物品種類:") || clean_text.contains("物品類別:") || clean_text.contains("需求:");
    let language = if is_zh { "zh" } else { "en" };

    let sections: Vec<&str> = SECTION_RE.split(clean_text).collect();

    // 1. Extract Rarity
    let mut rarity = "Rare".to_string();
    if is_zh {
        if let Some(cap) = RARITY_ZH_RE.captures(clean_text) {
            let r_str = cap[1].trim();
            rarity = match r_str {
                "普通" => "Normal",
                "魔法" => "Magic",
                "稀有" => "Rare",
                "傳奇" => "Unique",
                "通貨" => "Currency",
                "寶石" | "技能寶石" => "Gem",
                _ => "Rare",
            }.to_string();
        }
    } else {
        if let Some(cap) = RARITY_EN_RE.captures(clean_text) {
            rarity = cap[1].trim().to_string();
        }
    }

    // 2. Extract Item Class
    let mut item_class = None;
    if is_zh {
        if let Some(cap) = ITEM_CLASS_ZH_RE.captures(clean_text) {
            item_class = Some(cap[1].trim().to_string());
        }
    } else {
        if let Some(cap) = ITEM_CLASS_EN_RE.captures(clean_text) {
            item_class = Some(cap[1].trim().to_string());
        }
    }

    // 3. Extract Item Level, Quality, Sockets, Corrupted
    let item_level = if is_zh {
        ITEM_LEVEL_ZH_RE.captures(clean_text).and_then(|c| c[1].parse::<i64>().ok())
    } else {
        ITEM_LEVEL_EN_RE.captures(clean_text).and_then(|c| c[1].parse::<i64>().ok())
    };

    let quality = QUALITY_RE.captures(clean_text).and_then(|c| {
        c.get(1).or_else(|| c.get(2)).and_then(|m| m.as_str().parse::<i64>().ok())
    });

    let sockets = SOCKETS_RE.captures(clean_text).map(|c| c[1].trim().to_string());
    let corrupted = if CORRUPTED_RE.is_match(clean_text) { Some(true) } else { None };

    // 4. Extract Name and Base Type
    let mut name = String::new();
    let mut base_type = String::new();

    if !sections.is_empty() {
        let header_lines: Vec<&str> = sections[0]
            .lines()
            .map(|l| l.trim())
            .filter(|l| !l.is_empty() && !l.starts_with("Item Class:") && !l.starts_with("物品種類:") && !l.starts_with("物品類別:") && !l.starts_with("Rarity:") && !l.starts_with("稀有度:"))
            .collect();

        if header_lines.len() >= 2 {
            name = header_lines[0].to_string();
            base_type = header_lines[1].to_string();
        } else if header_lines.len() == 1 {
            base_type = header_lines[0].to_string();
            name = base_type.clone();
        }
    }

    // If English translation exists for Chinese base type or unique name, resolve it
    if is_zh && !base_type.is_empty() {
        if let Some(en_base) = lookup_english_base_type(&base_type) {
            if rarity != "Unique" && name == base_type {
                name = en_base.clone();
            }
            base_type = en_base;
        }
    }

    let class_str = item_class.as_deref().unwrap_or("");
    let is_armour = class_str.contains("Armour") || class_str.contains("Body") || class_str.contains("Boots") || class_str.contains("Gloves") || class_str.contains("Helmet") || class_str.contains("Shield")
        || class_str.contains("胸甲") || class_str.contains("鞋") || class_str.contains("手套") || class_str.contains("頭部") || class_str.contains("盾")
        || base_type.contains("Regalia") || base_type.contains("Plate") || base_type.contains("Robe") || base_type.contains("Vestment") || base_type.contains("Leather") || base_type.contains("Tunic") || base_type.contains("Garb") || base_type.contains("Jacket") || base_type.contains("Mail") || base_type.contains("Crown") || base_type.contains("Circlet") || base_type.contains("Helmet") || base_type.contains("Helm") || base_type.contains("Cap") || base_type.contains("Mask") || base_type.contains("Hood") || base_type.contains("Boots") || base_type.contains("Greaves") || base_type.contains("Slippers") || base_type.contains("Shoes") || base_type.contains("Gloves") || base_type.contains("Gauntlets") || base_type.contains("Mitts") || base_type.contains("Shield") || base_type.contains("Buckler");

    let is_weapon = class_str.contains("Weapon") || class_str.contains("Bow") || class_str.contains("Wand") || class_str.contains("Sword") || class_str.contains("Axe") || class_str.contains("Mace") || class_str.contains("Dagger") || class_str.contains("Claw") || class_str.contains("Staff") || class_str.contains("Sceptre")
        || class_str.contains("武器") || class_str.contains("弓") || class_str.contains("杖") || class_str.contains("劍") || class_str.contains("斧") || class_str.contains("槌") || class_str.contains("匕首") || class_str.contains("爪")
        || base_type.contains("Wand") || base_type.contains("Bow") || base_type.contains("Sword") || base_type.contains("Axe") || base_type.contains("Mace") || base_type.contains("Dagger") || base_type.contains("Claw") || base_type.contains("Staff") || base_type.contains("Sceptre");

    // 5. Parse Mod Sections
    let mut implicits = Vec::new();
    let mut explicits = Vec::new();

    // Iterate through content sections (skip header)
    for section in sections.iter().skip(1) {
        let lines: Vec<&str> = section.lines().map(|l| l.trim()).filter(|l| !l.is_empty()).collect();
        if lines.is_empty() {
            continue;
        }

        // Check if this section is exclusively requirement / ilvl metadata
        let is_pure_metadata = lines.iter().all(|l| {
            l.starts_with("需求:") || l.starts_with("Requirements:") ||
            l.starts_with("等級:") || l.starts_with("Level:") ||
            l.starts_with("力量:") || l.starts_with("Strength:") ||
            l.starts_with("敏捷:") || l.starts_with("Dexterity:") ||
            l.starts_with("智慧:") || l.starts_with("Intelligence:") ||
            l.starts_with("物品等級:") || l.starts_with("Item Level:") ||
            l.starts_with("插槽:") || l.starts_with("Sockets:") ||
            l.starts_with("護甲:") || l.starts_with("Armour:") ||
            l.starts_with("閃避值:") || l.starts_with("Evasion:") ||
            l.starts_with("能量護盾:") || l.starts_with("Energy Shield:") ||
            l.starts_with("格擋機率:") || l.starts_with("格擋率:") || l.starts_with("Block:") ||
            l.starts_with("無形性:") || l.starts_with("Ward:") ||
            CORRUPTED_RE.is_match(l) || l.contains("塑者之物") || l.contains("尊師之物") ||
            l.contains("Shaper Item") || l.contains("Elder Item") ||
            l.starts_with("備註:") || l.starts_with("Note:") || l.starts_with("~b/o") || l.starts_with("~price")
        });

        if is_pure_metadata {
            continue;
        }

        let is_implicit_section = lines.iter().any(|l| l.contains("固定詞綴") || l.contains("(implicit)") || l.contains("{ implicit"));

        for line in lines {
            let trimmed = line.trim();
            if (trimmed.starts_with('{') && trimmed.ends_with('}') && !trimmed.to_lowercase().contains("implicit") && !trimmed.to_lowercase().contains("crafted") && !trimmed.to_lowercase().contains("fractured") && !trimmed.to_lowercase().contains("enchant") && !trimmed.contains("已分裂") && !trimmed.contains("工藝") && !trimmed.contains("附魔")) || trimmed.starts_with("備註:") || trimmed.starts_with("Note:") || trimmed.starts_with("~b/o") || trimmed.starts_with("~price") {
                continue;
            }
            if trimmed.starts_with("需求:") || trimmed.starts_with("Requirements:") ||
               trimmed.starts_with("等級:") || trimmed.starts_with("Level:") ||
               trimmed.starts_with("力量:") || trimmed.starts_with("Strength:") ||
               trimmed.starts_with("敏捷:") || trimmed.starts_with("Dexterity:") ||
               trimmed.starts_with("智慧:") || trimmed.starts_with("Intelligence:") ||
               trimmed.starts_with("物品等級:") || trimmed.starts_with("Item Level:") ||
               trimmed.starts_with("插槽:") || trimmed.starts_with("Sockets:") ||
               trimmed.starts_with("護甲:") || trimmed.starts_with("閃避值:") || trimmed.starts_with("能量護盾:") || trimmed.starts_with("格擋機率:") || trimmed.starts_with("格擋率:") || trimmed.starts_with("無形性:") ||
               trimmed.starts_with("Armour:") || trimmed.starts_with("Evasion:") || trimmed.starts_with("Energy Shield:") ||
               CORRUPTED_RE.is_match(trimmed) || trimmed.contains("塑者之物") || trimmed.contains("尊師之物") || trimmed.contains("Shaper Item") || trimmed.contains("Elder Item") {
                continue;
            }

            let lower = trimmed.to_lowercase();
            let detected_mod_type = if lower.contains("(fractured)") || lower.contains("{fractured}") || lower.contains("{ fractured }") || trimmed.contains("已分裂") || trimmed.contains("分裂") {
                ModType::Fractured
            } else if lower.contains("(crafted)") || lower.contains("{crafted}") || lower.contains("{ crafted }") || trimmed.contains("工藝") {
                ModType::Crafted
            } else if lower.contains("(enchant)") || lower.contains("{enchant}") || lower.contains("{ enchant }") || trimmed.contains("附魔") {
                ModType::Enchant
            } else if lower.contains("(implicit)") || lower.contains("{implicit}") || lower.contains("{ implicit }") || trimmed.contains("固定詞綴") || is_implicit_section {
                ModType::Implicit
            } else {
                ModType::Explicit
            };

            let is_implicit = detected_mod_type == ModType::Implicit;

            let parsed_mod = parse_single_mod_line(
                trimmed,
                detected_mod_type,
                is_armour,
                is_weapon,
            );
            if let Some(m) = parsed_mod {
                if is_implicit {
                    implicits.push(m);
                } else {
                    explicits.push(m);
                }
            }
        }
    }

    ParsedItem {
        name,
        base_type,
        rarity,
        item_class,
        item_level,
        quality,
        corrupted,
        sockets,
        language: language.to_string(),
        implicits,
        explicits,
        raw_text: clean_text.to_string(),
    }
}

pub fn normalize_stat_id_for_mod_type(id: &str, mod_type: &ModType) -> String {
    if id.starts_with("pseudo.") {
        return id.to_string();
    }
    if let Some(pos) = id.find(".stat_") {
        let stat_suffix = &id[pos + 1..]; // e.g. "stat_3299347043"
        match mod_type {
            ModType::Implicit => format!("implicit.{}", stat_suffix),
            ModType::Fractured => format!("fractured.{}", stat_suffix),
            ModType::Crafted => format!("crafted.{}", stat_suffix),
            ModType::Enchant => format!("enchant.{}", stat_suffix),
            ModType::Explicit | ModType::Pseudo => format!("explicit.{}", stat_suffix),
        }
    } else if id.starts_with("custom") {
        id.to_string()
    } else {
        match mod_type {
            ModType::Implicit => format!("implicit.{}", id),
            ModType::Fractured => format!("fractured.{}", id),
            ModType::Crafted => format!("crafted.{}", id),
            ModType::Enchant => format!("enchant.{}", id),
            ModType::Explicit | ModType::Pseudo => format!("explicit.{}", id),
        }
    }
}

fn parse_single_mod_line(line: &str, mod_type: ModType, is_armour: bool, is_weapon: bool) -> Option<ParsedItemMod> {
    let clean = line.trim();
    if clean.is_empty() {
        return None;
    }

    // Extract roll range if present: e.g. (0-60), (-25-50), (6-15), (15--15), (85-104)
    let mut range_min: Option<f64> = None;
    let mut range_max: Option<f64> = None;
    if let Some(cap) = ROLL_RANGE_RE.find(clean) {
        let inside = &cap.as_str()[1..cap.as_str().len() - 1]; // strip ( and )
        let nums: Vec<f64> = VALUE_EXTRACT_RE
            .find_iter(inside)
            .filter_map(|m| m.as_str().parse::<f64>().ok())
            .collect();
        if nums.len() >= 2 {
            range_min = Some(nums[0]);
            range_max = Some(nums[nums.len() - 1]);
        } else if nums.len() == 1 {
            range_min = Some(nums[0]);
            range_max = Some(nums[0]);
        }
    }

    // Clean out roll range and mod tags from line
    let cleaned_line = ROLL_RANGE_RE.replace_all(clean, "").to_string();
    let cleaned_line = Regex::new(r"(?i)\s*\{[^}]+\}\s*|\s*\((?:fractured|crafted|enchant|implicit|local|部分|已分裂|分裂|工藝|附魔|固定詞綴)\)\s*")
        .unwrap()
        .replace_all(&cleaned_line, " ")
        .to_string();
    let cleaned_line = cleaned_line.trim();

    // Extract actual roll value
    let val = VALUE_EXTRACT_RE.find(cleaned_line).and_then(|m| m.as_str().parse::<f64>().ok());

    // Skip flavor text lines (e.g. poetry or story lines without numbers or PoE keywords)
    if val.is_none() && !cleaned_line.contains("造成") && !cleaned_line.contains("獲得") && !cleaned_line.contains("免疫") && !cleaned_line.contains("撲殺") && !cleaned_line.contains("偷取") && !cleaned_line.contains("無法") {
        if lookup_stat_by_text(cleaned_line).is_none() {
            return None;
        }
    }

    // Try dictionary lookup with context-aware cleaned line
    let matched_opt = if is_armour {
        super::dictionary::lookup_stat_for_armour(cleaned_line)
    } else if is_weapon {
        super::dictionary::lookup_stat_for_weapon(cleaned_line)
    } else {
        lookup_stat_by_text(cleaned_line)
    };

    if let Some(matched) = matched_opt {
        let final_id = normalize_stat_id_for_mod_type(&matched.id, &mod_type);
        let actual_val = val.or(matched.value);
        let effective_min = range_min.or(actual_val);
        return Some(ParsedItemMod {
            id: final_id,
            text: cleaned_line.to_string(),
            english_text: matched.en_text,
            mod_type,
            value: actual_val,
            min_value: effective_min,
            max_value: range_max.or(matched.max_value),
            enabled: true,
        });
    }

    // Fallback parsing
    let effective_min = range_min.or(val);
    Some(ParsedItemMod {
        id: format!("custom.{}", cleaned_line),
        text: cleaned_line.to_string(),
        english_text: cleaned_line.to_string(),
        mod_type,
        value: val,
        min_value: effective_min,
        max_value: range_max.or_else(|| val.map(|v| (v * 1.15).ceil())),
        enabled: true,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_ventors_gamble() {
        let text = r#"物品種類: 戒指
稀有度: 傳奇
賭神芬多
金光戒指
--------
需求:
等級: 65
--------
物品等級: 78
--------
{ 固定詞綴— 丟置 }
增加 15(6-15)% 物品稀有度
--------
{ 傳奇詞綴— 生命 }
+19(0-60) 最大生命
{ 傳奇詞綴— 元素,火焰,抗性 }
+25(-25-50)% 火焰抗性
{ 傳奇詞綴— 元素,冰冷,抗性 }
-6(-25-50)% 冰冷抗性
{ 傳奇詞綴— 元素,閃電,抗性 }
-2(-25-50)% 閃電抗性
{ 傳奇詞綴— 魔力 }
減少 10(15--15)% 技能的魔力保留效用
--------
至輝榮耀，劣境克敵
「不敗」怪物終遭天譴
芬多取得畢生最後勝績
--------
備註: ~b/o 5 chaos"#;

        let parsed = parse_item_text(text);
        assert_eq!(parsed.name, "賭神芬多");
        assert_eq!(parsed.base_type, "Gold Ring");
        assert_eq!(parsed.rarity, "Unique");
        assert_eq!(parsed.item_level, Some(78));

        assert_eq!(parsed.implicits.len(), 1);
        assert_eq!(parsed.implicits[0].value, Some(15.0));
        assert_eq!(parsed.implicits[0].text, "增加 15% 物品稀有度");

        assert_eq!(parsed.explicits.len(), 5);
        assert_eq!(parsed.explicits[0].value, Some(19.0));
        assert_eq!(parsed.explicits[0].text, "+19 最大生命");
        assert_eq!(parsed.explicits[1].value, Some(25.0));
        assert_eq!(parsed.explicits[1].text, "+25% 火焰抗性");
        assert_eq!(parsed.explicits[2].value, Some(-6.0));
        assert_eq!(parsed.explicits[2].text, "-6% 冰冷抗性");
        assert_eq!(parsed.explicits[3].value, Some(-2.0));
        assert_eq!(parsed.explicits[3].text, "-2% 閃電抗性");
        assert_eq!(parsed.explicits[4].value, Some(10.0));
        assert_eq!(parsed.explicits[4].text, "減少 10% 技能的魔力保留效用");
        assert!(parsed.explicits[0].id.starts_with("explicit."));
    }

    #[test]
    fn test_parse_crlf_pasted_item() {
        let text_with_crlf = "物品種類: 戒指\r\n稀有度: 傳奇\r\n賭神芬多\r\n金光戒指\r\n--------\r\n需求:\r\n等級: 65\r\n--------\r\n物品等級: 78\r\n--------\r\n{ 固定詞綴— 丟置 }\r\n增加 15(6-15)% 物品稀有度\r\n--------\r\n{ 傳奇詞綴— 生命 }\r\n+19(0-60) 最大生命\r\n--------\r\n";
        let parsed = parse_item_text(text_with_crlf);
        assert_eq!(parsed.name, "賭神芬多");
        assert_eq!(parsed.base_type, "Gold Ring");
        assert_eq!(parsed.implicits.len(), 1);
        assert_eq!(parsed.explicits.len(), 1);
        assert!(parsed.explicits[0].id.starts_with("explicit."));
    }

    #[test]
    fn test_parse_the_immortal_will() {
        let text = r#"物品種類: 盾
稀有度: 傳奇
不朽之意志
威能鳶盾
--------
格擋率: 27% (augmented)
護甲: 166
能量護盾: 34
--------
需求:
等級: 68
力量: 85
智慧: 85
--------
插槽: W-B W 
--------
物品等級: 79
--------
{ 固定詞綴— 元素,抗性 }
+12% 全部元素抗性
--------
{ 傳奇詞綴— 魔力 }
當你格擋時獲得 43(30-50) 魔力
{ 傳奇詞綴— 生命 }
+76(60-80) 最大生命
{ 傳奇詞綴— 元素,抗性 }
+12(10-15)% 全部元素抗性
{ 傳奇詞綴 }
+5% 格擋率
{ 傳奇詞綴 }
獲得召喚高階專注神諭技能 — 無法使用的值
{ 傳奇詞綴— 傷害 }
引導施放技能增加 54(50-70)% 傷害
--------
備註: ~b/o 20 chaos"#;

        let parsed = parse_item_text(text);
        assert_eq!(parsed.name, "不朽之意志");
        assert_eq!(parsed.base_type, "Archon Kite Shield");
        assert_eq!(parsed.implicits.len(), 1);
        assert_eq!(parsed.implicits[0].text, "+12% 全部元素抗性");
        assert!(parsed.implicits[0].id.starts_with("implicit."));
        assert!(parsed.explicits.len() >= 5);
        for m in &parsed.explicits {
            assert!(m.id.starts_with("explicit.") || m.id.starts_with("pseudo.") || m.id.starts_with("custom."));
        }
    }

    #[test]
    fn test_parse_fractured_and_crafted_mods() {
        let text = r#"Item Class: Helmets
Rarity: Rare
Gloom Crown
Archdemon Crown
--------
Requirements:
Level: 75
--------
Item Level: 85
--------
+2 to Level of Socketed Skill Gems (implicit)
-10% to all Elemental Resistances (implicit)
--------
+1 to Level of all Spell Skill Gems (fractured)
+85 to maximum Life
+45% to Fire Resistance
+25 to maximum Energy Shield (crafted)
"#;

        let parsed = parse_item_text(text);
        assert_eq!(parsed.implicits.len(), 2);
        assert_eq!(parsed.implicits[0].mod_type, ModType::Implicit);
        assert!(parsed.implicits[0].id.starts_with("implicit."));

        let fractured_mod = parsed.explicits.iter().find(|m| m.mod_type == ModType::Fractured).expect("Should find fractured mod");
        assert!(fractured_mod.id.starts_with("fractured."));

        let crafted_mod = parsed.explicits.iter().find(|m| m.mod_type == ModType::Crafted).expect("Should find crafted mod");
        assert!(crafted_mod.id.starts_with("crafted."));

        let explicit_mod = parsed.explicits.iter().find(|m| m.mod_type == ModType::Explicit).expect("Should find explicit mod");
        assert!(explicit_mod.id.starts_with("explicit."));
    }

    #[test]
    fn test_parse_mod_tier_range_min() {
        let text = r#"Item Class: Body Armours
Rarity: Rare
Empyrean Coat
Twilight Regalia
--------
Energy Shield: 976
--------
+90(85-104) to maximum Energy Shield
126(120-134)% increased Energy Shield
+46(42-48)% to Cold Resistance
"#;

        let parsed = parse_item_text(text);
        assert_eq!(parsed.explicits.len(), 3);
        
        let flat_es = &parsed.explicits[0];
        assert_eq!(flat_es.value, Some(90.0));
        assert_eq!(flat_es.min_value, Some(85.0)); // Tier MIN is 85
        assert_eq!(flat_es.max_value, Some(104.0)); // Tier MAX is 104

        let inc_es = &parsed.explicits[1];
        assert_eq!(inc_es.value, Some(126.0));
        assert_eq!(inc_es.min_value, Some(120.0)); // Tier MIN is 120

        let cold_res = &parsed.explicits[2];
        assert_eq!(cold_res.value, Some(46.0));
        assert_eq!(cold_res.min_value, Some(42.0)); // Tier MIN is 42
    }
}
