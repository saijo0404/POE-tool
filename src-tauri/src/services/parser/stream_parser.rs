use super::header_parser::{
    check_is_armour, check_is_weapon, extract_rarity, CORRUPTED_RE, ITEM_CLASS_EN_RE,
    ITEM_CLASS_ZH_RE, ITEM_LEVEL_EN_RE, ITEM_LEVEL_ZH_RE, QUALITY_RE, SOCKETS_RE,
};
use super::line_filter::{
    is_body_metadata_line, is_ignorable_line, is_prefix_header_line, is_pure_tag_line,
};
use super::mod_parser::{detect_mod_type, parse_single_mod_line};
use crate::models::item::{ModType, ParsedItem};
use crate::services::dictionary::lookup_english_base_type;

pub fn parse_pob_or_stream_item(clean_text: &str, is_zh: bool, language: &str) -> ParsedItem {
    let all_lines: Vec<&str> = clean_text
        .lines()
        .map(|l| l.trim())
        .filter(|l| !l.is_empty())
        .collect();
    if all_lines.is_empty() {
        return ParsedItem::empty(language, clean_text);
    }

    let rarity = extract_rarity(clean_text, is_zh);
    let item_class = if is_zh {
        ITEM_CLASS_ZH_RE
            .captures(clean_text)
            .map(|c| c[1].trim().to_string())
    } else {
        ITEM_CLASS_EN_RE
            .captures(clean_text)
            .map(|c| c[1].trim().to_string())
    };

    let item_level = if is_zh {
        ITEM_LEVEL_ZH_RE
            .captures(clean_text)
            .and_then(|c| c[1].parse::<i64>().ok())
    } else {
        ITEM_LEVEL_EN_RE
            .captures(clean_text)
            .and_then(|c| c[1].parse::<i64>().ok())
    };

    let quality = QUALITY_RE
        .captures(clean_text)
        .and_then(|c| c.get(1).and_then(|m| m.as_str().parse::<i64>().ok()));

    let sockets = SOCKETS_RE.captures(clean_text).and_then(|c| {
        c.get(1)
            .map(|m| m.as_str().lines().next().unwrap_or("").trim().to_string())
    });
    let corrupted = if CORRUPTED_RE.is_match(clean_text) {
        Some(true)
    } else {
        None
    };

    let mut header_candidates = Vec::new();
    let mut mod_candidates = Vec::new();
    let mut in_mod_body = false;
    let mut total_implicits_count = 0usize;

    for line in &all_lines {
        let lower = line.to_lowercase();
        if lower.starts_with("implicits:") {
            if let Some(cnt) = lower
                .split("implicits:")
                .nth(1)
                .and_then(|s| s.trim().parse::<usize>().ok())
            {
                total_implicits_count = cnt;
            }
            in_mod_body = true;
            continue;
        }

        if is_prefix_header_line(line) {
            continue;
        }

        if is_body_metadata_line(line) {
            in_mod_body = true;
            continue;
        }

        if !in_mod_body && header_candidates.len() < 2 {
            header_candidates.push(*line);
        } else {
            in_mod_body = true;
            mod_candidates.push(*line);
        }
    }

    let (mut name, mut base_type) = if header_candidates.len() >= 2 {
        (
            header_candidates[0].to_string(),
            header_candidates[1].to_string(),
        )
    } else if header_candidates.len() == 1 {
        let h = header_candidates[0].to_string();
        (h.clone(), h)
    } else {
        (String::new(), String::new())
    };

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

    let (implicits, explicits) =
        extract_stream_mods(mod_candidates, total_implicits_count, is_armour, is_weapon);

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

fn extract_stream_mods(
    mod_candidates: Vec<&str>,
    total_implicits_count: usize,
    is_armour: bool,
    is_weapon: bool,
) -> (
    Vec<crate::models::item::ParsedItemMod>,
    Vec<crate::models::item::ParsedItemMod>,
) {
    let mut implicits = Vec::new();
    let mut explicits = Vec::new();
    let mut remaining_implicits = total_implicits_count;
    let mut pending_mod_type: Option<ModType> = None;
    let mut pending_tier: Option<i64> = None;

    for line in mod_candidates {
        if is_pure_tag_line(line, &mut pending_mod_type, &mut pending_tier)
            || is_ignorable_line(line)
        {
            continue;
        }

        let is_implicit = remaining_implicits > 0;
        let mut mod_type = if is_implicit {
            remaining_implicits -= 1;
            ModType::Implicit
        } else {
            detect_mod_type(line, false)
        };

        if mod_type == ModType::Explicit {
            if let Some(pending) = pending_mod_type.take() {
                mod_type = pending;
            }
        }

        let tier = pending_tier.take();
        if let Some(m) = parse_single_mod_line(line, mod_type, is_armour, is_weapon, tier) {
            if m.mod_type == ModType::Implicit {
                implicits.push(m);
            } else {
                explicits.push(m);
            }
        }
    }

    (implicits, explicits)
}
