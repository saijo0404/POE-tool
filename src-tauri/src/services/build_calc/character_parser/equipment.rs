use super::container::{
    extract_mods_from_src, get_all_item_containers, try_parse_string_containers,
};
use super::properties::extract_property_numeric_value;
use crate::models::ninja::NinjaBuildItem;
use serde_json::Value;

fn calculate_max_links(sockets_vec: Option<&Vec<Value>>) -> Option<i64> {
    let sockets = sockets_vec?;
    let mut group_counts = std::collections::HashMap::new();
    for s in sockets {
        if let Some(g) = s["group"].as_i64() {
            *group_counts.entry(g).or_insert(0i64) += 1;
        }
    }
    group_counts.values().copied().max()
}

pub fn parse_ninja_build_equipment_item(
    src: &Value,
    it: &Value,
    inv_id: &str,
    name: &str,
    type_line: &str,
    icon: String,
    frame_type: i64,
) -> NinjaBuildItem {
    let rarity = match frame_type {
        1 => "Magic",
        2 => "Rare",
        3 => "Unique",
        _ => "Normal",
    }
    .to_string();

    let parsed_strings = try_parse_string_containers(src, it);
    let containers = get_all_item_containers(src, it, &parsed_strings);

    let props_vec = containers
        .iter()
        .find_map(|c| c.get("properties").and_then(|v| v.as_array()));
    let sockets_vec = containers
        .iter()
        .find_map(|c| c.get("sockets").and_then(|v| v.as_array()));
    let links = calculate_max_links(sockets_vec);

    let ilvl = containers
        .iter()
        .find_map(|c| c.get("ilvl").and_then(|v| v.as_i64()))
        .unwrap_or(85);
    let corrupted = containers
        .iter()
        .find_map(|c| c.get("corrupted").and_then(|v| v.as_bool()))
        .unwrap_or(false);

    let explicit_mods = extract_mods_from_src(src, it, "explicitMods");
    let implicit_mods = extract_mods_from_src(src, it, "implicitMods");
    let crafted_mods = extract_mods_from_src(src, it, "craftedMods");
    let fractured_mods = extract_mods_from_src(src, it, "fracturedMods");
    let enchant_mods = extract_mods_from_src(src, it, "enchantMods");

    crate::app_log!(
        "[BuildCalc] 🔍 裝備 [{}] '{}' (基底: '{}'), 稀有度={}, 提取詞綴: explicit={}, implicit={}, crafted={}, fractured={}, enchant={}",
        inv_id, name, type_line, rarity, explicit_mods.len(), implicit_mods.len(), crafted_mods.len(), fractured_mods.len(), enchant_mods.len()
    );

    NinjaBuildItem {
        name: name.to_string(),
        type_line: type_line.to_string(),
        slot: inv_id.to_string(),
        rarity,
        icon,
        ilvl,
        corrupted,
        explicit_mods,
        implicit_mods,
        crafted_mods,
        fractured_mods,
        enchant_mods,
        links,
        property_energy_shield: extract_property_numeric_value(
            props_vec,
            &["Energy Shield", "能量護盾"],
        ),
        property_armour: extract_property_numeric_value(props_vec, &["Armour", "護甲"]),
        property_evasion: extract_property_numeric_value(
            props_vec,
            &["Evasion Rating", "閃避值", "閃避"],
        ),
    }
}
