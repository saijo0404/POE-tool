use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    pub static ref LIFE_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)\s+to\s+maximum\s+Life|\+(\d+(?:\.\d+)?)\s*最大生命").unwrap();
    pub static ref STR_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)\s+to\s+Strength|\+(\d+(?:\.\d+)?)\s*力量").unwrap();
    pub static ref ALL_ATTR_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)\s+to\s+all\s+Attributes|\+(\d+(?:\.\d+)?)\s*全部能力").unwrap();
    pub static ref FLAT_ES_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)\s+to\s+maximum\s+Energy\s+Shield|\+(\d+(?:\.\d+)?)\s*最大能量護盾").unwrap();
    pub static ref INC_ES_RE: Regex = Regex::new(r"(?i)(\d+(?:\.\d+)?)%\s+increased\s+(?:maximum\s+)?Energy\s+Shield|增加\s*(\d+(?:\.\d+)?)%\s*能量護盾").unwrap();
    pub static ref INT_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)\s+to\s+Intelligence|\+(\d+(?:\.\d+)?)\s*智慧").unwrap();
    pub static ref FIRE_RES_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+Fire\s+Resistance|\+(\d+(?:\.\d+)?)%\s*火焰抗性").unwrap();
    pub static ref COLD_RES_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+Cold\s+Resistance|\+(\d+(?:\.\d+)?)%\s*冰冷抗性").unwrap();
    pub static ref LIGHTNING_RES_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+Lightning\s+Resistance|\+(\d+(?:\.\d+)?)%\s*閃電抗性").unwrap();
    pub static ref ALL_ELE_RES_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+all\s+Elemental\s+Resistances|\+(\d+(?:\.\d+)?)%\s*全部元素抗性").unwrap();
    pub static ref TWO_ELE_RES_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+(?:Fire|Cold|Lightning)\s+and\s+(?:Fire|Cold|Lightning)\s+Resistances|\+(\d+(?:\.\d+)?)%\s*(?:火焰|冰冷|閃電)和(?:火焰|冰冷|閃電)抗性").unwrap();
    pub static ref CHAOS_RES_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+Chaos\s+Resistance|\+(\d+(?:\.\d+)?)%\s*混沌抗性").unwrap();
    pub static ref SUPP_RE: Regex = Regex::new(r"(?i)\+?(\d+(?:\.\d+)?)%\s+chance\s+to\s+Suppress\s+Spell\s+Damage|壓抑法術傷害率\s*\+?(\d+(?:\.\d+)?)%|\+(\d+(?:\.\d+)?)%\s*法術壓抑").unwrap();
    pub static ref MS_RE: Regex = Regex::new(r"(?i)\+?(\d+(?:\.\d+)?)%\s+increased\s+Movement\s+Speed|增加\s*(\d+(?:\.\d+)?)%\s*移動速度").unwrap();
    pub static ref CRIT_MULTI_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+(?:Global\s+)?Critical\s+Strike\s+Multiplier|\+(\d+(?:\.\d+)?)%\s*暴擊傷害加成").unwrap();
    pub static ref DOT_MULTI_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+(?:[A-Za-z]+\s+)?Damage\s+over\s+Time\s+Multiplier|\+(\d+(?:\.\d+)?)%\s*(?:持續|混沌|冰冷|火焰|物理)傷害加成").unwrap();
    pub static ref GEM_LEVEL_RE: Regex = Regex::new(r"(?i)\+(\d+)\s+to\s+Level\s+of\s+|\+(\d+)\s*等級").unwrap();
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ModSource {
    Enchant,
    Implicit,
    Fractured,
    Explicit,
    Crafted,
}

pub fn format_stat_id_with_source(id: &str, source: ModSource) -> String {
    if id.starts_with("pseudo.") {
        return id.to_string();
    }
    if let Some(pos) = id.find(".stat_") {
        let stat_suffix = &id[pos + 1..];
        match source {
            ModSource::Implicit => format!("implicit.{}", stat_suffix),
            ModSource::Fractured => format!("fractured.{}", stat_suffix),
            ModSource::Crafted => format!("crafted.{}", stat_suffix),
            ModSource::Enchant => format!("enchant.{}", stat_suffix),
            ModSource::Explicit => format!("explicit.{}", stat_suffix),
        }
    } else {
        match source {
            ModSource::Implicit => format!("implicit.{}", id),
            ModSource::Fractured => format!("fractured.{}", id),
            ModSource::Crafted => format!("crafted.{}", id),
            ModSource::Enchant => format!("enchant.{}", id),
            ModSource::Explicit => format!("explicit.{}", id),
        }
    }
}

pub fn extract_mod_numeric_value(text: &str) -> Option<f64> {
    let clean = Regex::new(r"\([+-]?\d+(?:\.\d+)?(?:--?[+-]?\d+(?:\.\d+)?)?\)")
        .ok()?
        .replace_all(text, "")
        .to_string();
    let re = Regex::new(r"[-+]?\d+(?:\.\d+)?").ok()?;
    re.find(&clean).and_then(|m| m.as_str().parse::<f64>().ok())
}

#[derive(Debug, Clone)]
pub struct CandidateFilter {
    pub id: String,
    pub min_val: Option<f64>,
    pub score: i32,
    pub log_text: String,
}

pub fn is_armour_slot_or_type(slot: &str, trans_type: &str) -> bool {
    slot.contains("Body")
        || slot.contains("Helm")
        || slot.contains("Boots")
        || slot.contains("Gloves")
        || slot.contains("Offhand")
        || slot.contains("Shield")
        || trans_type.contains("Regalia")
        || trans_type.contains("Plate")
        || trans_type.contains("Robe")
        || trans_type.contains("Crown")
        || trans_type.contains("Boots")
        || trans_type.contains("Gloves")
        || trans_type.contains("Shield")
        || trans_type.contains("Buckler")
}

pub fn is_weapon_slot_or_type(slot: &str, trans_type: &str) -> bool {
    slot.contains("Weapon")
        || trans_type.contains("Wand")
        || trans_type.contains("Bow")
        || trans_type.contains("Sword")
        || trans_type.contains("Axe")
        || trans_type.contains("Mace")
        || trans_type.contains("Sceptre")
        || trans_type.contains("Staff")
        || trans_type.contains("Dagger")
        || trans_type.contains("Claw")
}

pub fn score_mod(text: &str, source: ModSource) -> i32 {
    let is_gem_lvl = GEM_LEVEL_RE.is_match(text);
    let is_low_utility = text.contains("Stun and Block Recovery")
        || text.contains("Light Radius")
        || text.contains("Life per Enemy")
        || text.contains("Mana per Enemy")
        || text.contains("Reflects");
    let is_core = LIFE_RE.is_match(text)
        || FLAT_ES_RE.is_match(text)
        || INC_ES_RE.is_match(text)
        || FIRE_RES_RE.is_match(text)
        || COLD_RES_RE.is_match(text)
        || LIGHTNING_RES_RE.is_match(text)
        || ALL_ELE_RES_RE.is_match(text)
        || TWO_ELE_RES_RE.is_match(text)
        || CHAOS_RES_RE.is_match(text)
        || SUPP_RE.is_match(text)
        || MS_RE.is_match(text)
        || CRIT_MULTI_RE.is_match(text)
        || DOT_MULTI_RE.is_match(text)
        || text.contains("increased Spell Damage")
        || text.contains("more Elemental Damage");

    if is_gem_lvl {
        1200
    } else if source == ModSource::Implicit || source == ModSource::Fractured {
        1100
    } else if is_core {
        900
    } else if source == ModSource::Crafted {
        800
    } else if is_low_utility {
        300
    } else {
        600
    }
}
