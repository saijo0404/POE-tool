pub mod container;
pub mod equipment;
pub mod gems_jewels_flasks;
pub mod properties;

use crate::models::ninja::{
    NinjaBuildData, NinjaBuildFlask, NinjaBuildGem, NinjaBuildItem, NinjaBuildJewel,
};
use container::{get_all_item_containers, try_parse_string_containers};
use equipment::parse_ninja_build_equipment_item;
use gems_jewels_flasks::{parse_flask_item, parse_gem_item, parse_jewel_item};
pub use properties::extract_property_numeric_value;
use serde_json::Value;

pub fn parse_character_window_json(
    data: &Value,
    account: &str,
    fallback_league: &str,
) -> Result<NinjaBuildData, String> {
    let char_obj = &data["character"];
    let character_name = char_obj["name"]
        .as_str()
        .or_else(|| data["name"].as_str())
        .unwrap_or("Character")
        .to_string();
    let league = char_obj["league"]
        .as_str()
        .or_else(|| data["league"].as_str())
        .unwrap_or(fallback_league)
        .to_string();
    let class_name = char_obj["class"]
        .as_str()
        .or_else(|| data["class"].as_str())
        .unwrap_or("Unknown")
        .to_string();
    let ascendancy = char_obj["ascendancyClass"]
        .as_str()
        .or_else(|| char_obj["class"].as_str())
        .unwrap_or(&class_name)
        .to_string();
    let level = char_obj["level"]
        .as_i64()
        .or_else(|| data["level"].as_i64())
        .unwrap_or(90);

    let raw_items = extract_raw_items(data);
    let mut equipment = Vec::new();
    let mut flasks = Vec::new();
    let mut jewels = Vec::new();
    let mut gems = Vec::new();

    for it in &raw_items {
        classify_item_into_build_collections(
            it,
            &mut equipment,
            &mut flasks,
            &mut jewels,
            &mut gems,
        );
    }

    Ok(NinjaBuildData {
        account: account.to_string(),
        character_name,
        league,
        level,
        class_name,
        ascendancy,
        equipment,
        gems,
        flasks,
        jewels,
    })
}

fn extract_raw_items(data: &Value) -> Vec<Value> {
    data["items"]
        .as_array()
        .or_else(|| data["equipment"].as_array())
        .or_else(|| data["character"]["items"].as_array())
        .or_else(|| data["character"]["equipment"].as_array())
        .or_else(|| data["snapshot"]["items"].as_array())
        .or_else(|| data["snapshot"]["equipment"].as_array())
        .cloned()
        .unwrap_or_default()
}

fn map_frame_type_to_rarity(frame_type: i64) -> &'static str {
    match frame_type {
        1 => "Magic",
        2 => "Rare",
        3 => "Unique",
        4 => "Gem",
        5 => "Currency",
        6 => "DivinationCard",
        7 => "Quest",
        8 => "Prophecy",
        9 => "Foil",
        _ => "Normal",
    }
}

fn classify_item_into_build_collections(
    it: &Value,
    equipment: &mut Vec<NinjaBuildItem>,
    flasks: &mut Vec<NinjaBuildFlask>,
    jewels: &mut Vec<NinjaBuildJewel>,
    gems: &mut Vec<NinjaBuildGem>,
) {
    let parsed_strings = try_parse_string_containers(&Value::Null, it);
    let src = if let Some(first_parsed) = parsed_strings.first() {
        first_parsed
    } else if it.get("itemData").is_some_and(|v| v.is_object()) {
        it.get("itemData").unwrap()
    } else if it.get("item").is_some_and(|v| v.is_object()) {
        it.get("item").unwrap()
    } else {
        it
    };

    let containers = get_all_item_containers(src, it, &parsed_strings);

    let inv_id = containers
        .iter()
        .find_map(|c| c["inventoryId"].as_str().or_else(|| c["slot"].as_str()))
        .unwrap_or_default();
    let type_line = containers
        .iter()
        .find_map(|c| c["typeLine"].as_str().or_else(|| c["baseType"].as_str()))
        .unwrap_or_default()
        .to_string();
    let name = containers
        .iter()
        .find_map(|c| c["name"].as_str())
        .unwrap_or(&type_line)
        .to_string();
    let icon = containers
        .iter()
        .find_map(|c| c["icon"].as_str())
        .unwrap_or_default()
        .to_string();
    let frame_type = containers
        .iter()
        .find_map(|c| c["frameType"].as_i64())
        .unwrap_or(0);

    let rarity = map_frame_type_to_rarity(frame_type).to_string();

    if inv_id.eq_ignore_ascii_case("MainInventory")
        || inv_id.eq_ignore_ascii_case("ExpandedMainInventory")
        || frame_type == 5
        || frame_type == 6
        || frame_type == 7
    {
        return;
    }

    if inv_id == "Flask" || type_line.contains("Flask") || name.contains("Flask") {
        flasks.push(parse_flask_item(src, it, name, type_line, rarity, icon));
    } else if inv_id == "PassiveJewels"
        || type_line.contains("Jewel")
        || name.contains("Jewel")
        || type_line.contains("Cluster")
    {
        jewels.push(parse_jewel_item(src, it, name, type_line, rarity, icon));
    } else if frame_type == 4 || inv_id == "Gems" || type_line.contains("Gem") {
        gems.push(parse_gem_item(name, icon, inv_id));
    } else if !type_line.is_empty() {
        equipment.push(parse_ninja_build_equipment_item(
            src, it, inv_id, &name, &type_line, icon, frame_type,
        ));
    }
}
