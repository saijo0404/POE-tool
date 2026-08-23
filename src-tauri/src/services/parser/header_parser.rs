use regex::Regex;
use lazy_static::lazy_static;
use crate::services::dictionary::lookup_english_base_type;

lazy_static! {
    pub static ref RARITY_ZH_RE: Regex = Regex::new(r"(?i)稀有度:\s*([^\r\n]+)").unwrap();
    pub static ref RARITY_EN_RE: Regex = Regex::new(r"(?i)Rarity:\s*([^\r\n]+)").unwrap();
    pub static ref ITEM_CLASS_ZH_RE: Regex = Regex::new(r"(?i)(?:物品種類|物品類別):\s*([^\r\n]+)").unwrap();
    pub static ref ITEM_CLASS_EN_RE: Regex = Regex::new(r"(?i)Item\s*Class:\s*([^\r\n]+)").unwrap();
    pub static ref ITEM_LEVEL_ZH_RE: Regex = Regex::new(r"(?i)物品等級:\s*(\d+)").unwrap();
    pub static ref ITEM_LEVEL_EN_RE: Regex = Regex::new(r"(?i)(?:Item\s*Level|ItemLevel|ilvl):\s*(\d+)").unwrap();
    pub static ref QUALITY_RE: Regex = Regex::new(r"(?i)(?:品質|Quality):\s*\+?(\d+)%?").unwrap();
    pub static ref SOCKETS_RE: Regex = Regex::new(r"(?i)(?:插槽|Sockets):\s*([RGBWWA\s-]+)").unwrap();
    pub static ref CORRUPTED_RE: Regex = Regex::new(r"(?i)已汙染|已污染|Corrupted").unwrap();
}

pub struct HeaderInfo {
    pub rarity: String,
    pub item_class: Option<String>,
    pub item_level: Option<i64>,
    pub quality: Option<i64>,
    pub sockets: Option<String>,
    pub corrupted: Option<bool>,
    pub name: String,
    pub base_type: String,
    pub is_armour: bool,
    pub is_weapon: bool,
}

pub fn extract_rarity(text: &str, is_zh: bool) -> String {
    if is_zh {
        if let Some(cap) = RARITY_ZH_RE.captures(text) {
            return match cap[1].trim() {
                "普通" => "Normal",
                "魔法" => "Magic",
                "稀有" => "Rare",
                "傳奇" => "Unique",
                "通貨" => "Currency",
                "寶石" | "技能寶石" => "Gem",
                _ => "Rare",
            }.to_string();
        }
    } else if let Some(cap) = RARITY_EN_RE.captures(text) {
        let val = cap[1].trim().to_uppercase();
        return match val.as_str() {
            "NORMAL" => "Normal".to_string(),
            "MAGIC" => "Magic".to_string(),
            "RARE" => "Rare".to_string(),
            "UNIQUE" => "Unique".to_string(),
            "GEM" => "Gem".to_string(),
            "CURRENCY" => "Currency".to_string(),
            "DIVINATION CARD" | "CARD" => "DivinationCard".to_string(),
            _ => cap[1].trim().to_string(),
        };
    }
    "Rare".to_string()
}

pub fn extract_header_info(clean_text: &str, is_zh: bool, first_section: Option<&&str>) -> HeaderInfo {
    let rarity = extract_rarity(clean_text, is_zh);
    let item_class = if is_zh {
        ITEM_CLASS_ZH_RE.captures(clean_text).map(|c| c[1].trim().to_string())
    } else {
        ITEM_CLASS_EN_RE.captures(clean_text).map(|c| c[1].trim().to_string())
    };

    let item_level = if is_zh {
        ITEM_LEVEL_ZH_RE.captures(clean_text).and_then(|c| c[1].parse::<i64>().ok())
    } else {
        ITEM_LEVEL_EN_RE.captures(clean_text).and_then(|c| c[1].parse::<i64>().ok())
    };

    let quality = QUALITY_RE.captures(clean_text).and_then(|c| {
        c.get(1).and_then(|m| m.as_str().parse::<i64>().ok())
    });

    let sockets = SOCKETS_RE.captures(clean_text).and_then(|c| {
        c.get(1).map(|m| m.as_str().lines().next().unwrap_or("").trim().to_string())
    });
    let corrupted = if CORRUPTED_RE.is_match(clean_text) { Some(true) } else { None };

    let (mut name, mut base_type) = extract_name_and_base(first_section);

    if is_zh && !base_type.is_empty() {
        if let Some(en_base) = lookup_english_base_type(&base_type) {
            if rarity != "Unique" && name == base_type {
                name = en_base.clone();
            }
            base_type = en_base;
        }
    }

    let class_str = item_class.as_deref().unwrap_or("");
    let is_armour = check_is_armour(class_str, &base_type);
    let is_weapon = check_is_weapon(class_str, &base_type);

    HeaderInfo {
        rarity,
        item_class,
        item_level,
        quality,
        sockets,
        corrupted,
        name,
        base_type,
        is_armour,
        is_weapon,
    }
}

pub fn is_prefix_header_line(line: &str) -> bool {
    let lower = line.to_lowercase();
    lower.starts_with("item class:") || lower.starts_with("物品種類:") || lower.starts_with("物品類別:") ||
    lower.starts_with("rarity:") || lower.starts_with("稀有度:")
}

pub fn is_body_metadata_line(line: &str) -> bool {
    let lower = line.to_lowercase();
    lower.starts_with("unique id:") || lower.starts_with("item level:") || lower.starts_with("itemlevel:") ||
    lower.starts_with("ilvl:") || lower.starts_with("物品等級:") ||
    lower.starts_with("quality:") || lower.starts_with("品質:") ||
    lower.starts_with("sockets:") || lower.starts_with("插槽:") ||
    lower.starts_with("levelreq:") || lower.starts_with("level:") || lower.starts_with("等級:") ||
    lower.starts_with("requirements:") || lower.starts_with("需求:") ||
    lower.starts_with("str:") || lower.starts_with("力量:") || lower.starts_with("dex:") || lower.starts_with("敏捷:") || lower.starts_with("int:") || lower.starts_with("智慧:") ||
    lower.starts_with("implicits:") || lower.starts_with("prefix:") || lower.starts_with("suffix:") ||
    lower.starts_with("variant:") || lower.starts_with("selected variant:") || lower.starts_with("has alt variant:") ||
    lower.starts_with("catalyst:") || lower.starts_with("catalystquality:") ||
    lower.starts_with("radius:") || lower.starts_with("limited to:") || lower.starts_with("requires class:") ||
    lower.starts_with("armour:") || lower.starts_with("護甲:") || lower.starts_with("evasion:") || lower.starts_with("閃避值:") || lower.starts_with("energy shield:") || lower.starts_with("能量護盾:") || lower.starts_with("ward:") ||
    lower.starts_with("physical damage:") || lower.starts_with("elemental damage:") || lower.starts_with("critical strike chance:") || lower.starts_with("attacks per second:") ||
    lower == "corrupted" || lower == "已汙染" || lower == "已污染" ||
    lower.starts_with("note:") || lower.starts_with("備註:") || lower.starts_with("~b/o") || lower.starts_with("~price")
}

pub fn is_header_metadata_line(line: &str) -> bool {
    is_prefix_header_line(line) || is_body_metadata_line(line)
}

pub fn extract_name_and_base(first_section: Option<&&str>) -> (String, String) {
    let Some(section) = first_section else {
        return (String::new(), String::new());
    };
    let header_lines: Vec<&str> = section
        .lines()
        .map(|l| l.trim())
        .filter(|l| !l.is_empty() && !is_header_metadata_line(l))
        .collect();

    if header_lines.len() >= 2 {
        let mut name = header_lines[0].to_string();
        let base_type = header_lines[1].to_string();
        if name.eq_ignore_ascii_case("unidentified") || name == "未鑑定" {
            name = base_type.clone();
        }
        (name, base_type)
    } else if header_lines.len() == 1 {
        let b = header_lines[0].to_string();
        (b.clone(), b)
    } else {
        (String::new(), String::new())
    }
}

pub fn check_is_armour(class_str: &str, base_type: &str) -> bool {
    class_str.contains("Armour") || class_str.contains("Body") || class_str.contains("Boots")
        || class_str.contains("Gloves") || class_str.contains("Helmet") || class_str.contains("Shield")
        || class_str.contains("胸甲") || class_str.contains("鞋") || class_str.contains("手套")
        || class_str.contains("頭部") || class_str.contains("盾") || base_type.contains("Regalia")
        || base_type.contains("Plate") || base_type.contains("Robe") || base_type.contains("Boots")
        || base_type.contains("Gloves") || base_type.contains("Shield")
}

pub fn check_is_weapon(class_str: &str, base_type: &str) -> bool {
    class_str.contains("Weapon") || class_str.contains("Bow") || class_str.contains("Wand")
        || class_str.contains("Sword") || class_str.contains("Axe") || class_str.contains("Mace")
        || class_str.contains("Dagger") || class_str.contains("Claw") || class_str.contains("Staff")
        || class_str.contains("武器") || class_str.contains("弓") || class_str.contains("杖")
        || class_str.contains("劍") || class_str.contains("斧") || class_str.contains("槌")
        || base_type.contains("Wand") || base_type.contains("Bow") || base_type.contains("Sword")
}
