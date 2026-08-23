use super::*;
use serde_json::Value;

#[test]
fn test_generate_trade_query_rare_body_armour() {
    let explicit_mods = vec![
        "+85 to maximum Energy Shield".to_string(),
        "120% increased Energy Shield".to_string(),
        "+45% to Fire Resistance".to_string(),
        "+42% to Lightning Resistance".to_string(),
    ];
    let (_url, json_str) = generate_trade_search_query(
        "Allflame", "Empyrean Coat", "Twilight Regalia", "Rare", "BodyArmour",
        Some(6), &explicit_mods, &[], &[], &[], &[], Some(750.0), None, None, None, None, None,
    );

    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    assert_eq!(val["query"]["status"]["option"], "securable");
    assert_eq!(val["query"]["type"], "Twilight Regalia");
    assert_eq!(val["query"]["filters"]["type_filters"]["filters"]["rarity"]["option"], "rare");
    assert_eq!(val["query"]["filters"]["socket_filters"]["filters"]["links"]["min"], 6);

    let stats = val["query"]["stats"][0]["filters"].as_array().expect("Stats array");
    assert!(!stats.is_empty(), "Stats must not be empty for rare item with high ES and resistances");
    
    let stat_ids: Vec<&str> = stats.iter().filter_map(|s| s["id"].as_str()).collect();
    for id in &stat_ids {
        assert!(id.starts_with("explicit.stat_") || id.starts_with("crafted.stat_") || id.starts_with("implicit.stat_"));
    }
}

#[test]
fn test_generate_trade_query_rare_boots() {
    let explicit_mods = vec![
        "30% increased Movement Speed".to_string(),
        "+89 to maximum Life".to_string(),
        "+35% to Cold Resistance".to_string(),
        "+12% chance to Suppress Spell Damage".to_string(),
    ];
    let (_url, json_str) = generate_trade_search_query(
        "Allflame", "Bramble Trail", "Two-Toned Boots", "Rare", "Boots",
        None, &explicit_mods, &[], &[], &[], &[], None, None, None, None, None, None,
    );

    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    assert_eq!(val["query"]["status"]["option"], "securable");
    let stats = val["query"]["stats"][0]["filters"].as_array().expect("Stats array");
    let stat_ids: Vec<&str> = stats.iter().filter_map(|s| s["id"].as_str()).collect();
    for id in &stat_ids {
        assert!(id.starts_with("explicit.stat_") || id.starts_with("crafted.stat_") || id.starts_with("implicit.stat_"));
    }
}

#[test]
fn test_generate_trade_query_unique_item() {
    let (_url, json_str) = generate_trade_search_query(
        "Allflame", "The Taming", "Prismatic Ring", "Unique", "Ring",
        None, &[], &[], &[], &[], &[], None, None, None, None, None, None,
    );

    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    assert_eq!(val["query"]["status"]["option"], "securable");
    assert_eq!(val["query"]["name"], "The Taming");
}

#[test]
fn test_parse_pob_xml_items_and_mods() {
    let xml = r#"<PathOfBuilding>
        <Build level="95" className="Witch" ascendClassName="Elementalist" league="Allflame" />
        <Items>
            <Item id="1">
Rarity: RARE
Empyrean Coat
Twilight Regalia
Energy Shield: 750
Item Level: 86
Quality: 20
Sockets: B-B-B-B-B-B
LevelReq: 72
Implicits: 0
{range:0.8}+90 to maximum Energy Shield
{range:0.6}126% increased Energy Shield
{range:0.7}+46% to Cold Resistance
{range:0.5}+27% to Chaos Resistance
            </Item>
            <ItemSet useSecondWeaponSet="false" id="1">
                <Slot name="Body Armour" itemId="1" />
            </ItemSet>
        </Items>
    </PathOfBuilding>"#;

    let build = parse_pob_xml(xml, "test_build").expect("Parse PoB XML");
    assert_eq!(build.equipment.len(), 1);
    let item = &build.equipment[0];
    assert_eq!(item.name, "Empyrean Coat");
    assert_eq!(item.type_line, "Twilight Regalia");
    assert_eq!(item.slot, "BodyArmour");
    assert_eq!(item.links, Some(6));
    assert_eq!(item.property_energy_shield, Some(750.0));
    assert_eq!(item.explicit_mods.len(), 4);
    assert_eq!(item.explicit_mods[0], "+90 to maximum Energy Shield");

    let (_url, json_str) = generate_trade_search_query(
        &build.league, &item.name, &item.type_line, &item.rarity, &item.slot, item.links,
        &item.explicit_mods, &item.implicit_mods, &item.crafted_mods, &item.fractured_mods, &item.enchant_mods,
        item.property_energy_shield, item.property_armour, item.property_evasion, None, None, None,
    );
    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    let stats = val["query"]["stats"][0]["filters"].as_array().expect("Stats array");
    assert!(!stats.is_empty(), "Stats must be generated for parsed PoB item with mods");
}

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

    let build = parse_character_window_json(&json_val, "saijo", "Allflame").expect("Parse nested json");
    assert_eq!(build.equipment.len(), 1);
    let item = &build.equipment[0];
    assert_eq!(item.name, "Empyrean Coat");
    assert_eq!(item.type_line, "Twilight Regalia");
    assert_eq!(item.slot, "BodyArmour");
    assert_eq!(item.links, Some(6));
    assert_eq!(item.property_energy_shield, Some(750.0));
    assert_eq!(item.explicit_mods.len(), 4);

    let (_url, json_str) = generate_trade_search_query(
        &build.league, &item.name, &item.type_line, &item.rarity, &item.slot, item.links,
        &item.explicit_mods, &item.implicit_mods, &item.crafted_mods, &item.fractured_mods, &item.enchant_mods,
        item.property_energy_shield, item.property_armour, item.property_evasion, None, None, None,
    );
    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    let stats = val["query"]["stats"][0]["filters"].as_array().expect("Stats array");
    assert!(!stats.is_empty(), "Stats must be generated for nested itemData character");
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

    let build = parse_character_window_json(&json_val, "saijo", "Allflame").expect("Parse poe.ninja ssr json");
    assert_eq!(build.equipment.len(), 1);
    let item = &build.equipment[0];
    assert_eq!(item.name, "Empyrean Coat");
    assert_eq!(item.type_line, "Twilight Regalia");
    assert_eq!(item.slot, "BodyArmour");
    assert_eq!(item.links, Some(6));
    assert_eq!(item.property_energy_shield, Some(750.0));
    assert_eq!(item.explicit_mods.len(), 4);

    let (_url, json_str) = generate_trade_search_query(
        &build.league, &item.name, &item.type_line, &item.rarity, &item.slot, item.links,
        &item.explicit_mods, &item.implicit_mods, &item.crafted_mods, &item.fractured_mods, &item.enchant_mods,
        item.property_energy_shield, item.property_armour, item.property_evasion, None, None, None,
    );
    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    let stats = val["query"]["stats"][0]["filters"].as_array().expect("Stats array");
    assert!(!stats.is_empty(), "Stats must be generated for poe.ninja SSR character item");
}

#[test]
fn test_unique_item_trade_query_generation() {
    let (_url, json_str) = generate_trade_search_query(
        "Allflame", "The Taming", "Prismatic Ring", "Unique", "Ring", None,
        &[], &[], &[], &[], &[], None, None, None, None, None, None,
    );
    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    assert_eq!(val["query"]["name"], "The Taming");
    assert_eq!(val["query"]["type"], "Prismatic Ring");
    assert_eq!(val["query"]["filters"]["type_filters"]["filters"]["rarity"]["option"], "unique");

    let (_url, json_jewel) = generate_trade_search_query(
        "Allflame", "Unnatural Instinct", "Viridian Jewel", "Unique", "Jewel", None,
        &[], &[], &[], &[], &[], None, None, None, None, None, None,
    );
    let val_jewel: Value = serde_json::from_str(&json_jewel).expect("Valid JSON");
    assert_eq!(val_jewel["query"]["name"], "Unnatural Instinct");
    assert_eq!(val_jewel["query"]["type"], "Viridian Jewel");
    assert_eq!(val_jewel["query"]["filters"]["type_filters"]["filters"]["rarity"]["option"], "unique");
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

    let build = parse_character_window_json(&json_val, "saijo", "Allflame").expect("Parse json with stringified itemData");
    assert_eq!(build.equipment.len(), 1);
    let item = &build.equipment[0];
    assert_eq!(item.name, "Empyrean Coat");
    assert_eq!(item.type_line, "Twilight Regalia");
    assert_eq!(item.explicit_mods.len(), 4);
    assert_eq!(item.property_energy_shield, Some(750.0));
    assert_eq!(item.links, Some(6));

    let (_url, json_str) = generate_trade_search_query(
        &build.league, &item.name, &item.type_line, &item.rarity, &item.slot, item.links,
        &item.explicit_mods, &item.implicit_mods, &item.crafted_mods, &item.fractured_mods, &item.enchant_mods,
        item.property_energy_shield, item.property_armour, item.property_evasion, None, None, None,
    );
    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    let stats = val["query"]["stats"][0]["filters"].as_array().expect("Stats array");
    assert!(!stats.is_empty(), "Stats must be generated for stringified itemData");
}

