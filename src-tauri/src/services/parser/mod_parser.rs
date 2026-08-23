use regex::Regex;
use lazy_static::lazy_static;
use crate::models::item::{ModType, ParsedItemMod};
use crate::services::dictionary::{lookup_stat_by_text, lookup_stat_for_armour, lookup_stat_for_weapon};

lazy_static! {
    pub static ref ROLL_RANGE_RE: Regex = Regex::new(r"\([+-]?\d+(?:\.\d+)?(?:--?[+-]?\d+(?:\.\d+)?)?\)").unwrap();
    pub static ref POB_RANGE_TAG_RE: Regex = Regex::new(r"\{range:([0-9.]+)\}").unwrap();
    pub static ref VALUE_EXTRACT_RE: Regex = Regex::new(r"[-+]?\d+(?:\.\d+)?").unwrap();
    static ref TAGS_CLEAN_RE: Regex = Regex::new(r"(?i)\s*\{[^}]+\}\s*|\s*\((?:fractured|crafted|enchant|implicit|local|部分|已分裂|分裂|工藝|附魔|固定詞綴)\)\s*").unwrap();
    static ref POB_PLUS_RANGE_RE: Regex = Regex::new(r"^\+\s*\([+-]?\d+(?:\.\d+)?(?:--?[+-]?\d+(?:\.\d+)?)?\)").unwrap();
    static ref POB_PERCENT_RANGE_RE: Regex = Regex::new(r"(?:^|\s)\(([+-]?\d+(?:\.\d+)?(?:--?[+-]?\d+(?:\.\d+)?)?\)\s*%").unwrap();
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
    if lower.contains("(fractured)") || lower.contains("{fractured}") || lower.contains("{ fractured }") || line.contains("已分裂") || line.contains("分裂") {
        ModType::Fractured
    } else if lower.contains("(crafted)") || lower.contains("{crafted}") || lower.contains("{ crafted }") || line.contains("工藝") {
        ModType::Crafted
    } else if lower.contains("(enchant)") || lower.contains("{enchant}") || lower.contains("{ enchant }") || line.contains("附魔") {
        ModType::Enchant
    } else if lower.contains("(implicit)") || lower.contains("{implicit}") || lower.contains("{ implicit }") || line.contains("固定詞綴") || is_implicit_section {
        ModType::Implicit
    } else {
        ModType::Explicit
    }
}

pub fn extract_roll_range(line: &str) -> (Option<f64>, Option<f64>) {
    let Some(cap) = ROLL_RANGE_RE.find(line) else {
        return (None, None);
    };
    let inside = &cap.as_str()[1..cap.as_str().len() - 1].trim();
    if let Some((first, second)) = inside.split_once("--") {
        let min_val = first.parse::<f64>().ok();
        let max_val = format!("-{}", second).parse::<f64>().ok();
        (min_val, max_val)
    } else if let Some(dash_idx) = inside[1..].find('-').map(|i| i + 1) {
        let min_val = inside[..dash_idx].parse::<f64>().ok();
        let max_val = inside[dash_idx + 1..].parse::<f64>().ok();
        (min_val, max_val)
    } else if let Ok(single) = inside.parse::<f64>() {
        (Some(single), Some(single))
    } else {
        (None, None)
    }
}

pub fn clean_mod_line_and_extract_values(raw_line: &str) -> (String, Option<f64>, Option<f64>, Option<f64>) {
    let mut line = raw_line.trim().to_string();

    let pob_range_ratio = POB_RANGE_TAG_RE.captures(&line).and_then(|c| c[1].parse::<f64>().ok());
    let (range_min, range_max) = extract_roll_range(&line);

    let pob_val = if let (Some(min), Some(max)) = (range_min, range_max) {
        if let Some(r) = pob_range_ratio {
            let interpolated = min + (max - min) * r;
            Some((interpolated * 10.0).round() / 10.0)
        } else {
            Some(min)
        }
    } else {
        range_min
    };

    line = TAGS_CLEAN_RE.replace_all(&line, " ").to_string();
    let mut clean_line = line.trim().to_string();

    if clean_line.starts_with("+ (") || clean_line.starts_with("+(") {
        if let Some(v) = pob_val {
            clean_line = POB_PLUS_RANGE_RE.replace(&clean_line, format!("+{}", v)).to_string();
        }
    } else if clean_line.starts_with('(') || clean_line.contains(" (") {
        if let Some(v) = pob_val {
            clean_line = POB_PERCENT_RANGE_RE.replace(&clean_line, format!(" {}%", v)).to_string();
        }
    }

    clean_line = ROLL_RANGE_RE.replace_all(&clean_line, "").to_string();
    let cleaned_text = clean_line.split_whitespace().collect::<Vec<_>>().join(" ");

    let val = VALUE_EXTRACT_RE.find(&cleaned_text)
        .and_then(|m| m.as_str().parse::<f64>().ok())
        .or(pob_val);

    (cleaned_text, val, range_min, range_max)
}

pub fn parse_single_mod_line(line: &str, mod_type: ModType, is_armour: bool, is_weapon: bool) -> Option<ParsedItemMod> {
    let clean = line.trim();
    if clean.is_empty() {
        return None;
    }

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
