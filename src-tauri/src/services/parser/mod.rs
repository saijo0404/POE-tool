pub mod header_parser;
pub mod mod_parser;

#[cfg(test)]
mod tests;

use regex::Regex;
use lazy_static::lazy_static;
use crate::models::item::{ModType, ParsedItem};
pub use mod_parser::{normalize_stat_id_for_mod_type, ROLL_RANGE_RE, VALUE_EXTRACT_RE};
use header_parser::extract_header_info;
use mod_parser::{detect_mod_type, parse_single_mod_line};

lazy_static! {
    static ref SECTION_RE: Regex = Regex::new(r"(?m)^-{4,}\s*$").unwrap();
}

pub fn parse_item_text(text: &str) -> ParsedItem {
    let normalized = text.replace("\r\n", "\n").replace('\r', "\n");
    let clean_text = normalized.trim();
    let is_zh = clean_text.contains("稀有度:") || clean_text.contains("物品種類:") || clean_text.contains("物品類別:") || clean_text.contains("需求:");
    let language = if is_zh { "zh" } else { "en" };

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
    }
}

fn parse_mod_sections(
    sections: &[&str],
    is_armour: bool,
    is_weapon: bool,
) -> (Vec<crate::models::item::ParsedItemMod>, Vec<crate::models::item::ParsedItemMod>) {
    let mut implicits = Vec::new();
    let mut explicits = Vec::new();

    for section in sections.iter().skip(1) {
        let lines: Vec<&str> = section.lines().map(|l| l.trim()).filter(|l| !l.is_empty()).collect();
        if lines.is_empty() || is_pure_metadata_section(&lines) {
            continue;
        }

        let is_implicit_sec = lines.iter().any(|l| l.contains("固定詞綴") || l.contains("(implicit)") || l.contains("{ implicit"));
        let is_fractured_sec = lines.iter().any(|l| l.to_lowercase().contains("fractured") || l.contains("已分裂") || l.contains("分裂"));

        parse_section_lines(&lines, is_implicit_sec, is_fractured_sec, is_armour, is_weapon, &mut implicits, &mut explicits);
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

    for line in lines {
        let trimmed = line.trim();
        if is_pure_tag_line(trimmed, &mut pending_mod_type) || is_ignorable_line(trimmed) {
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
        if let Some(m) = parse_single_mod_line(trimmed, mod_type, is_armour, is_weapon) {
            if is_implicit {
                implicits.push(m);
            } else {
                explicits.push(m);
            }
        }
    }
}

fn is_pure_tag_line(line: &str, pending: &mut Option<ModType>) -> bool {
    let lower = line.to_lowercase();
    if line.starts_with('{') && line.ends_with('}') {
        if lower.contains("fractured") || line.contains("已分裂") || line.contains("分裂") {
            *pending = Some(ModType::Fractured);
            return true;
        }
        if lower.contains("crafted") || line.contains("工藝") {
            *pending = Some(ModType::Crafted);
            return true;
        }
        if lower.contains("enchant") || line.contains("附魔") {
            *pending = Some(ModType::Enchant);
            return true;
        }
        if lower.contains("implicit") || line.contains("固定詞綴") {
            *pending = Some(ModType::Implicit);
            return true;
        }
        return true;
    }
    false
}

fn is_ignorable_line(line: &str) -> bool {
    if line.starts_with("備註:") || line.starts_with("Note:") || line.starts_with("~b/o") || line.starts_with("~price") {
        return true;
    }
    line.starts_with("需求:") || line.starts_with("Requirements:") ||
    line.starts_with("等級:") || line.starts_with("Level:") ||
    line.starts_with("力量:") || line.starts_with("Strength:") || line.starts_with("Str:") ||
    line.starts_with("敏捷:") || line.starts_with("Dexterity:") || line.starts_with("Dex:") ||
    line.starts_with("智慧:") || line.starts_with("Intelligence:") || line.starts_with("Int:") ||
    line.starts_with("物品等級:") || line.starts_with("Item Level:") ||
    line.starts_with("插槽:") || line.starts_with("Sockets:") ||
    line.starts_with("護甲:") || line.starts_with("閃避值:") || line.starts_with("能量護盾:") || line.starts_with("格擋機率:") || line.starts_with("格擋率:") || line.starts_with("無形性:") ||
    line.starts_with("Armour:") || line.starts_with("Evasion:") || line.starts_with("Energy Shield:") ||
    header_parser::CORRUPTED_RE.is_match(line) || line.contains("塑者之物") || line.contains("尊師之物") || line.contains("Shaper Item") || line.contains("Elder Item")
}

fn is_pure_metadata_section(lines: &[&str]) -> bool {
    lines.iter().all(|l| is_ignorable_line(l))
}
