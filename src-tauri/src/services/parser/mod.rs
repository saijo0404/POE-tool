pub mod header_parser;
pub mod mod_parser;

#[cfg(test)]
mod tests;

use crate::models::item::{ModType, ParsedItem};
use crate::services::dictionary::lookup_english_base_type;
use header_parser::{
    check_is_armour, check_is_weapon, extract_header_info, extract_rarity, CORRUPTED_RE,
    ITEM_CLASS_EN_RE, ITEM_CLASS_ZH_RE, ITEM_LEVEL_EN_RE, ITEM_LEVEL_ZH_RE, QUALITY_RE, SOCKETS_RE,
};
use lazy_static::lazy_static;
use mod_parser::{detect_mod_type, parse_single_mod_line};
pub use mod_parser::{normalize_stat_id_for_mod_type, ROLL_RANGE_RE, VALUE_EXTRACT_RE};
use regex::Regex;

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

fn parse_pob_or_stream_item(clean_text: &str, is_zh: bool, language: &str) -> ParsedItem {
    let all_lines: Vec<&str> = clean_text
        .lines()
        .map(|l| l.trim())
        .filter(|l| !l.is_empty())
        .collect();
    if all_lines.is_empty() {
        return ParsedItem {
            name: String::new(),
            base_type: String::new(),
            rarity: "Rare".to_string(),
            item_class: None,
            item_level: None,
            quality: None,
            corrupted: None,
            sockets: None,
            language: language.to_string(),
            implicits: Vec::new(),
            explicits: Vec::new(),
            raw_text: clean_text.to_string(),
        };
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

        if header_parser::is_prefix_header_line(line) {
            continue;
        }

        if header_parser::is_body_metadata_line(line) {
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

    let mut implicits = Vec::new();
    let mut explicits = Vec::new();
    let mut remaining_implicits = total_implicits_count;
    let mut pending_mod_type: Option<ModType> = None;

    for line in mod_candidates {
        if is_pure_tag_line(line, &mut pending_mod_type) || is_ignorable_line(line) {
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

        if let Some(m) = parse_single_mod_line(line, mod_type, is_armour, is_weapon) {
            if m.mod_type == ModType::Implicit {
                implicits.push(m);
            } else {
                explicits.push(m);
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
    let lower = line.to_lowercase();
    if lower.starts_with("備註:")
        || lower.starts_with("note:")
        || lower.starts_with("~b/o")
        || lower.starts_with("~price")
        || lower.starts_with("unique id:")
    {
        return true;
    }
    lower.starts_with("需求:")
        || lower.starts_with("requirements:")
        || lower.starts_with("等級:")
        || lower.starts_with("level:")
        || lower.starts_with("levelreq:")
        || lower.starts_with("力量:")
        || lower.starts_with("strength:")
        || lower.starts_with("str:")
        || lower.starts_with("敏捷:")
        || lower.starts_with("dexterity:")
        || lower.starts_with("dex:")
        || lower.starts_with("智慧:")
        || lower.starts_with("intelligence:")
        || lower.starts_with("int:")
        || lower.starts_with("物品等級:")
        || lower.starts_with("item level:")
        || lower.starts_with("itemlevel:")
        || lower.starts_with("ilvl:")
        || lower.starts_with("插槽:")
        || lower.starts_with("sockets:")
        || lower.starts_with("護甲:")
        || lower.starts_with("閃避值:")
        || lower.starts_with("能量護盾:")
        || lower.starts_with("格擋機率:")
        || lower.starts_with("格擋率:")
        || lower.starts_with("無形性:")
        || lower.starts_with("armour:")
        || lower.starts_with("evasion:")
        || lower.starts_with("energy shield:")
        || lower.starts_with("ward:")
        || lower.starts_with("implicits:")
        || lower.starts_with("prefix:")
        || lower.starts_with("suffix:")
        || lower.starts_with("variant:")
        || lower.starts_with("selected variant:")
        || lower.starts_with("has alt variant:")
        || lower.starts_with("catalyst:")
        || lower.starts_with("catalystquality:")
        || lower.starts_with("radius:")
        || lower.starts_with("limited to:")
        || lower.starts_with("requires class:")
        || lower.starts_with("physical damage:")
        || lower.starts_with("elemental damage:")
        || lower.starts_with("critical strike chance:")
        || lower.starts_with("attacks per second:")
        || lower == "corrupted"
        || lower == "已汙染"
        || lower == "已污染"
        || lower.contains("塑者之物")
        || lower.contains("尊師之物")
        || lower.contains("shaper item")
        || lower.contains("elder item")
}

fn is_pure_metadata_section(lines: &[&str]) -> bool {
    lines.iter().all(|l| is_ignorable_line(l))
}
