pub mod header_parser;
pub mod line_filter;
pub mod mod_parser;
pub mod poe2_parser;
pub mod roll_range_extractor;
pub mod stream_parser;

#[cfg(test)]
mod tests;

use crate::models::item::{ModType, ParsedItem};
use header_parser::extract_header_info;
use lazy_static::lazy_static;
use line_filter::{is_ignorable_line, is_pure_metadata_section, is_pure_tag_line};
use mod_parser::{detect_mod_type, parse_single_mod_line};
pub use mod_parser::{normalize_stat_id_for_mod_type, ROLL_RANGE_RE, VALUE_EXTRACT_RE};
use regex::Regex;
use stream_parser::parse_pob_or_stream_item;

lazy_static! {
    static ref SECTION_RE: Regex = Regex::new(r"(?m)^-{4,}\s*$").unwrap();
}

pub fn parse_item_text(text: &str) -> ParsedItem {
    let normalized = text.replace("\r\n", "\n").replace('\r', "\n");
    let clean_text = normalized.trim();
    let is_zh = clean_text.contains("稀有度:")
        || clean_text.contains("物品種類:")
        || clean_text.contains("物品類別:")
        || clean_text.contains("需求:");
    let language = if is_zh { "zh" } else { "en" };

    if !SECTION_RE.is_match(clean_text) {
        return parse_pob_or_stream_item(clean_text, is_zh, language);
    }

    let is_poe2 = poe2_parser::is_poe2_item_text(clean_text);
    let poe2_fields = if is_poe2 {
        poe2_parser::extract_poe2_fields(clean_text)
    } else {
        poe2_parser::Poe2ExtractedFields::default()
    };
    let engine = if is_poe2 {
        Some("poe2".to_string())
    } else {
        Some("poe1".to_string())
    };

    let sections: Vec<&str> = SECTION_RE.split(clean_text).collect();
    let header = extract_header_info(clean_text, is_zh, sections.first());

    let (implicits, explicits) = parse_mod_sections(&sections, header.is_armour, header.is_weapon);

    ParsedItem {
        name: header.name,
        base_type: header.base_type,
        rarity: header.rarity,
        item_class: header.item_class,
        item_level: header.item_level,
        quality: header.quality,
        corrupted: header.corrupted,
        sockets: header.sockets,
        language: language.to_string(),
        implicits,
        explicits,
        raw_text: clean_text.to_string(),
        engine,
        spirit: poe2_fields.spirit,
        waystone_tier: poe2_fields.waystone_tier,
        uncut_tier: poe2_fields.uncut_tier,
        rune_sockets: poe2_fields.rune_sockets,
    }
}

fn parse_mod_sections(
    sections: &[&str],
    is_armour: bool,
    is_weapon: bool,
) -> (
    Vec<crate::models::item::ParsedItemMod>,
    Vec<crate::models::item::ParsedItemMod>,
) {
    let mut implicits = Vec::new();
    let mut explicits = Vec::new();

    for section in sections.iter().skip(1) {
        let lines: Vec<&str> = section
            .lines()
            .map(|l| l.trim())
            .filter(|l| !l.is_empty())
            .collect();
        if lines.is_empty() || is_pure_metadata_section(&lines) {
            continue;
        }

        let is_implicit_sec = lines.iter().any(|l| {
            l.contains("固定詞綴") || l.contains("(implicit)") || l.contains("{ implicit")
        });
        let is_fractured_sec = lines.iter().any(|l| {
            l.to_lowercase().contains("fractured") || l.contains("已分裂") || l.contains("分裂")
        });

        parse_section_lines(
            &lines,
            is_implicit_sec,
            is_fractured_sec,
            is_armour,
            is_weapon,
            &mut implicits,
            &mut explicits,
        );
    }

    (implicits, explicits)
}

fn parse_section_lines(
    lines: &[&str],
    is_implicit_sec: bool,
    is_fractured_sec: bool,
    is_armour: bool,
    is_weapon: bool,
    implicits: &mut Vec<crate::models::item::ParsedItemMod>,
    explicits: &mut Vec<crate::models::item::ParsedItemMod>,
) {
    let mut pending_mod_type: Option<ModType> = None;
    let mut pending_tier: Option<i64> = None;

    for line in lines {
        let trimmed = line.trim();
        if is_pure_tag_line(trimmed, &mut pending_mod_type, &mut pending_tier)
            || is_ignorable_line(trimmed)
        {
            continue;
        }

        let mut mod_type = detect_mod_type(trimmed, is_implicit_sec);
        if mod_type == ModType::Explicit {
            if let Some(pending) = pending_mod_type.take() {
                mod_type = pending;
            } else if is_fractured_sec {
                mod_type = ModType::Fractured;
            }
        }

        let is_implicit = mod_type == ModType::Implicit;
        let tier = pending_tier.take();
        if let Some(m) = parse_single_mod_line(trimmed, mod_type, is_armour, is_weapon, tier) {
            if is_implicit {
                implicits.push(m);
            } else {
                explicits.push(m);
            }
        }
    }
}
