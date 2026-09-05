use crate::models::item::{ModType, ParsedItemMod};
use crate::services::dictionary::{
    lookup_stat_by_text, lookup_stat_for_armour, lookup_stat_for_weapon,
};
pub use super::roll_range_extractor::{
    clean_mod_line_and_extract_values, extract_roll_range, ROLL_RANGE_RE, VALUE_EXTRACT_RE,
};
use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    pub static ref TIER_EXTRACT_RE: Regex = Regex::new(r"(?i)(?:階層|Tier)[:：]\s*(\d+)").unwrap();
}

pub fn normalize_stat_id_for_mod_type(id: &str, mod_type: &ModType) -> String {
    if id.starts_with("pseudo.") {
        return id.to_string();
    }
    let prefix = match mod_type {
        ModType::Implicit => "implicit.",
        ModType::Fractured => "fractured.",
        ModType::Crafted => "crafted.",
        ModType::Enchant => "enchant.",
        ModType::Explicit | ModType::Pseudo => "explicit.",
    };
    if let Some(pos) = id.find(".stat_") {
        format!("{}{}", prefix, &id[pos + 1..])
    } else if id.starts_with("custom") {
        id.to_string()
    } else {
        format!("{}{}", prefix, id)
    }
}

pub fn detect_mod_type(line: &str, is_implicit_section: bool) -> ModType {
    let lower = line.to_lowercase();
    if lower.contains("(fractured)")
        || lower.contains("{fractured}")
        || lower.contains("{ fractured }")
        || line.contains("已分裂")
        || line.contains("分裂")
    {
        ModType::Fractured
    } else if lower.contains("(crafted)")
        || lower.contains("{crafted}")
        || lower.contains("{ crafted }")
        || line.contains("工藝")
    {
        ModType::Crafted
    } else if lower.contains("(enchant)")
        || lower.contains("{enchant}")
        || lower.contains("{ enchant }")
        || line.contains("附魔")
    {
        ModType::Enchant
    } else if lower.contains("(implicit)")
        || lower.contains("{implicit}")
        || lower.contains("{ implicit }")
        || line.contains("固定詞綴")
        || is_implicit_section
    {
        ModType::Implicit
    } else {
        ModType::Explicit
    }
}

pub fn parse_single_mod_line(
    line: &str,
    mod_type: ModType,
    is_armour: bool,
    is_weapon: bool,
    tier: Option<i64>,
) -> Option<ParsedItemMod> {
    let clean = line.trim();
    if clean.is_empty() {
        return None;
    }

    let effective_tier = tier.or_else(|| {
        TIER_EXTRACT_RE
            .captures(clean)
            .and_then(|c| c[1].parse::<i64>().ok())
    });

    let (cleaned_line, val, range_min, range_max) = clean_mod_line_and_extract_values(clean);
    if is_skippable_flavor(&cleaned_line, val) {
        return None;
    }

    let matched_opt = if is_armour {
        lookup_stat_for_armour(&cleaned_line)
    } else if is_weapon {
        lookup_stat_for_weapon(&cleaned_line)
    } else {
        lookup_stat_by_text(&cleaned_line)
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
            tier: effective_tier,
            value: actual_val,
            min_value: effective_min,
            max_value: range_max.or(matched.max_value),
            enabled: true,
        });
    }

    let effective_min = range_min.or(val);
    Some(ParsedItemMod {
        id: format!("custom.{}", cleaned_line),
        text: cleaned_line.to_string(),
        english_text: cleaned_line.to_string(),
        mod_type,
        tier: effective_tier,
        value: val,
        min_value: effective_min,
        max_value: range_max.or_else(|| val.map(|v| (v * 1.15).ceil())),
        enabled: true,
    })
}

fn is_skippable_flavor(cleaned_line: &str, val: Option<f64>) -> bool {
    val.is_none()
        && !cleaned_line.contains("造成")
        && !cleaned_line.contains("獲得")
        && !cleaned_line.contains("免疫")
        && !cleaned_line.contains("撲殺")
        && !cleaned_line.contains("偷取")
        && !cleaned_line.contains("無法")
        && !cleaned_line.contains("cannot be removed")
        && !cleaned_line.contains("Flask Effects")
        && !cleaned_line.contains("Modifiers for")
        && !cleaned_line.contains("Unaffected by")
        && !cleaned_line.contains("Immune to")
        && !cleaned_line.contains("Hits cannot be Evaded")
        && !cleaned_line.contains("Enemies Explode")
        && lookup_stat_by_text(cleaned_line).is_none()
}
