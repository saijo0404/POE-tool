use super::super::*;
use serde_json::Value;

#[test]
fn test_parse_character_window_json_nested_item_data() {
    let json_val = serde_json::json!({
        "character": { "name": "saijo_Glacial_Cascade", "league": "Allflame", "level": 95, "class": "Elementalist" },
        "items": [
            {
                "inventoryId": "BodyArmour",
                "itemData": {
                    "name": "Empyrean Coat",
                    "typeLine": "Twilight Regalia",
                    "frameType": 2,
                    "explicitMods": [
                        "+90 to maximum Energy Shield",
                        "126% increased Energy Shield",
                        "+46% to Cold Resistance",
                        "+27% to Chaos Resistance"
                    ],
                    "properties": [{ "name": "Energy Shield", "values": [["750", 0]] }],
                    "sockets": [{ "group": 0 }, { "group": 0 }, { "group": 0 }, { "group": 0 }, { "group": 0 }, { "group": 0 }]
                }
            }
        ]
    });

    let build =
        parse_character_window_json(&json_val, "saijo", "Allflame").expect("Parse nested json");
    assert_eq!(build.equipment.len(), 1);
    let item = &build.equipment[0];
    assert_eq!(item.name, "Empyrean Coat");
    assert_eq!(item.type_line, "Twilight Regalia");
    assert_eq!(item.slot, "BodyArmour");
    assert_eq!(item.links, Some(6));
    assert_eq!(item.property_energy_shield, Some(750.0));
    assert_eq!(item.explicit_mods.len(), 4);

    let (_url, json_str) = generate_trade_search_query(
        &build.league,
        &item.name,
        &item.type_line,
        &item.rarity,
        &item.slot,
        item.links,
        &item.explicit_mods,
        &item.implicit_mods,
        &item.crafted_mods,
        &item.fractured_mods,
        &item.enchant_mods,
        item.property_energy_shield,
        item.property_armour,
        item.property_evasion,
        None,
        None,
        None,
    );
    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    let stats = val["query"]["stats"][0]["filters"]
        .as_array()
        .expect("Stats array");
    assert!(
        !stats.is_empty(),
        "Stats must be generated for nested itemData character"
    );
}

#[test]
fn test_parse_character_window_json_poe_ninja_ssr_format() {
    let json_val = serde_json::json!({
        "character": { "name": "saijo_Glacial_Cascade", "league": "Allflame", "level": 95, "class": "Elementalist" },
        "items": [
            {
                "slot": "BodyArmour",
                "item": {
                    "name": "Empyrean Coat",
                    "typeLine": "Twilight Regalia",
                    "frameType": 2,
                    "explicitMods": [
                        "+90 to maximum Energy Shield",
                        "126% increased Energy Shield",
                        "+46% to Cold Resistance",
                        "+27% to Chaos Resistance"
                    ],
                    "properties": [{ "name": "Energy Shield", "values": [["750", 0]] }],
                    "sockets": [{ "group": 0 }, { "group": 0 }, { "group": 0 }, { "group": 0 }, { "group": 0 }, { "group": 0 }]
                }
            }
        ]
    });

    let build = parse_character_window_json(&json_val, "saijo", "Allflame")
        .expect("Parse poe.ninja ssr json");
    assert_eq!(build.equipment.len(), 1);
    let item = &build.equipment[0];
    assert_eq!(item.name, "Empyrean Coat");
    assert_eq!(item.type_line, "Twilight Regalia");
    assert_eq!(item.slot, "BodyArmour");
    assert_eq!(item.links, Some(6));
    assert_eq!(item.property_energy_shield, Some(750.0));
    assert_eq!(item.explicit_mods.len(), 4);

    let (_url, json_str) = generate_trade_search_query(
        &build.league,
        &item.name,
        &item.type_line,
        &item.rarity,
        &item.slot,
        item.links,
        &item.explicit_mods,
        &item.implicit_mods,
        &item.crafted_mods,
        &item.fractured_mods,
        &item.enchant_mods,
        item.property_energy_shield,
        item.property_armour,
        item.property_evasion,
        None,
        None,
        None,
    );
    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    let stats = val["query"]["stats"][0]["filters"]
        .as_array()
        .expect("Stats array");
    assert!(
        !stats.is_empty(),
        "Stats must be generated for poe.ninja SSR character item"
    );
}

#[test]
fn test_parse_character_window_json_with_stringified_item_data() {
    let raw_str = r#"{"name":"Empyrean Coat","typeLine":"Twilight Regalia","frameType":2,"explicitMods":["+90 to maximum Energy Shield","126% increased Energy Shield","+46% to Cold Resistance","+27% to Chaos Resistance"],"properties":[{"name":"Energy Shield","values":[["750",0]]}],"sockets":[{"group":0},{"group":0},{"group":0},{"group":0},{"group":0},{"group":0}]}"#;
    let json_val = serde_json::json!({
        "character": { "name": "saijo_Glacial_Cascade", "league": "Allflame", "level": 95, "class": "Elementalist" },
        "items": [
            {
                "slot": "BodyArmour",
                "itemData": raw_str,
                "item": {
                    "name": "Empyrean Coat",
                    "typeLine": "Twilight Regalia",
                    "frameType": 2
                }
            }
        ]
    });

    let build = parse_character_window_json(&json_val, "saijo", "Allflame")
        .expect("Parse json with stringified itemData");
    assert_eq!(build.equipment.len(), 1);
    let item = &build.equipment[0];
    assert_eq!(item.name, "Empyrean Coat");
    assert_eq!(item.type_line, "Twilight Regalia");
    assert_eq!(item.explicit_mods.len(), 4);
    assert_eq!(item.property_energy_shield, Some(750.0));
    assert_eq!(item.links, Some(6));

    let (_url, json_str) = generate_trade_search_query(
        &build.league,
        &item.name,
        &item.type_line,
        &item.rarity,
        &item.slot,
        item.links,
        &item.explicit_mods,
        &item.implicit_mods,
        &item.crafted_mods,
        &item.fractured_mods,
        &item.enchant_mods,
        item.property_energy_shield,
        item.property_armour,
        item.property_evasion,
        None,
        None,
        None,
    );
    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    let stats = val["query"]["stats"][0]["filters"]
        .as_array()
        .expect("Stats array");
    assert!(
        !stats.is_empty(),
        "Stats must be generated for stringified itemData"
    );
}
