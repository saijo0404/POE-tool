use std::collections::HashMap;
use regex::Regex;
use crate::models::ninja::{NinjaBuildData, NinjaBuildFlask, NinjaBuildItem, NinjaBuildJewel};
use super::pob_item_parser::{parse_pob_item_content, ParsedPobItemRaw};

pub fn parse_pob_xml(xml: &str, code: &str) -> Result<NinjaBuildData, String> {
    let (class_name, ascendancy, level, league) = extract_build_meta(xml);
    let item_slots = extract_item_slot_map(xml);

    let mut equipment = Vec::new();
    let mut flasks = Vec::new();
    let mut jewels = Vec::new();
    let gems = Vec::new();

    let item_re = Regex::new(r#"(?s)<Item\s+id="([^"]*)"[^>]*>(.*?)</Item>"#).unwrap();

    for cap in item_re.captures_iter(xml) {
        let item_id = &cap[1];
        let content = &cap[2];
        if let Some(parsed) = parse_pob_item_content(content) {
            let slot = item_slots.get(item_id).cloned().unwrap_or_else(|| "Equipment".to_string());
            categorize_parsed_item(parsed, slot, &mut equipment, &mut flasks, &mut jewels);
        }
    }

    Ok(NinjaBuildData {
        account: "pobb.in".to_string(),
        character_name: code.to_string(),
        league, level, class_name, ascendancy,
        equipment, gems, flasks, jewels,
    })
}

fn extract_build_meta(xml: &str) -> (String, String, i64, String) {
    let class_re = Regex::new(r#"className="([^"]+)""#).unwrap();
    let ascend_re = Regex::new(r#"ascendClassName="([^"]+)""#).unwrap();
    let level_re = Regex::new(r#"level="([^"]+)""#).unwrap();
    let league_re = Regex::new(r#"league="([^"]+)""#).unwrap();

    let class_name = class_re.captures(xml).map(|c| c[1].to_string()).unwrap_or_else(|| "Unknown".to_string());
    let ascendancy = ascend_re.captures(xml).map(|c| c[1].to_string()).unwrap_or_else(|| "None".to_string());
    let level = level_re.captures(xml).and_then(|c| c[1].parse::<i64>().ok()).unwrap_or(90);
    let league = league_re.captures(xml).map(|c| c[1].to_string()).unwrap_or_else(|| "Standard".to_string());

    (class_name, ascendancy, level, league)
}

fn extract_item_slot_map(xml: &str) -> HashMap<String, String> {
    let mut map = HashMap::new();
    let slot_re = Regex::new(r#"<Slot\s+name="([^"]+)"\s+itemId="([^"]+)""#).unwrap();
    for cap in slot_re.captures_iter(xml) {
        let slot_raw = &cap[1];
        let item_id = &cap[2];
        let normalized_slot = normalize_slot_name(slot_raw);
        map.insert(item_id.to_string(), normalized_slot);
    }
    map
}

fn normalize_slot_name(raw: &str) -> String {
    if raw.contains("Body Armour") { "BodyArmour".to_string() }
    else if raw.contains("Helmet") { "Helm".to_string() }
    else if raw.contains("Boots") { "Boots".to_string() }
    else if raw.contains("Gloves") { "Gloves".to_string() }
    else if raw.contains("Weapon 1") { "Weapon".to_string() }
    else if raw.contains("Weapon 2") { "Weapon2".to_string() }
    else if raw.contains("Ring 1") { "Ring".to_string() }
    else if raw.contains("Ring 2") { "Ring2".to_string() }
    else if raw.contains("Amulet") { "Amulet".to_string() }
    else if raw.contains("Belt") { "Belt".to_string() }
    else if raw.contains("Flask") { "Flask".to_string() }
    else { raw.to_string() }
}

fn categorize_parsed_item(
    p: ParsedPobItemRaw,
    slot: String,
    equipment: &mut Vec<NinjaBuildItem>,
    flasks: &mut Vec<NinjaBuildFlask>,
    jewels: &mut Vec<NinjaBuildJewel>,
) {
    if slot == "Flask" || p.type_line.contains("Flask") || p.name.contains("Flask") {
        flasks.push(NinjaBuildFlask {
            name: p.name, type_line: p.type_line, rarity: p.rarity,
            icon: "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvRmxhc2tzL2ZsYXNrMSIsInciOjEsImgiOjIsInNjYWxlIjoxfV0/6be457f5c5/flask1.png".to_string(),
            explicit_mods: p.explicit_mods, utility_mods: Vec::new(), enchant_mods: p.enchant_mods,
        });
    } else if p.type_line.contains("Jewel") || p.name.contains("Jewel") || p.type_line.contains("Cluster") {
        jewels.push(NinjaBuildJewel {
            name: p.name, type_line: p.type_line, rarity: p.rarity,
            icon: "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvSmV3ZWxzL2Jhc2ljMSIsInciOjEsImgiOjEsInNjYWxlIjoxfV0/d0ff9e4726/basic1.png".to_string(),
            explicit_mods: p.explicit_mods, implicit_mods: p.implicit_mods, crafted_mods: p.crafted_mods, fractured_mods: p.fractured_mods,
        });
    } else if !p.name.is_empty() {
        equipment.push(NinjaBuildItem {
            name: p.name, type_line: p.type_line, slot, rarity: p.rarity,
            icon: "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQXJtb3Vycy9IZWxtZXRzL0hlbG1ldDIiLCJ3IjoyLCJoIjoyLCJzY2FsZSI6MX1d/5ba9788f6c/Helmet2.png".to_string(),
            ilvl: p.item_level, corrupted: false, explicit_mods: p.explicit_mods, implicit_mods: p.implicit_mods,
            crafted_mods: p.crafted_mods, fractured_mods: p.fractured_mods, enchant_mods: p.enchant_mods, links: p.links,
            property_energy_shield: p.property_energy_shield, property_armour: p.property_armour, property_evasion: p.property_evasion,
        });
    }
}
