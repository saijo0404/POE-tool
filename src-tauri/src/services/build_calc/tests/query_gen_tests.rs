use super::super::*;
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
        "Allflame",
        "Empyrean Coat",
        "Twilight Regalia",
        "Rare",
        "BodyArmour",
        Some(6),
        &explicit_mods,
        &[],
        &[],
        &[],
        &[],
        Some(750.0),
        None,
        None,
        None,
        None,
        None,
    );

    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    assert_eq!(val["query"]["status"]["option"], "securable");
    assert_eq!(val["query"]["type"], "Twilight Regalia");
    assert_eq!(
        val["query"]["filters"]["type_filters"]["filters"]["rarity"]["option"],
        "rare"
    );
    assert_eq!(
        val["query"]["filters"]["socket_filters"]["filters"]["links"]["min"],
        6
    );

    let stats = val["query"]["stats"][0]["filters"]
        .as_array()
        .expect("Stats array");
    assert!(
        !stats.is_empty(),
        "Stats must not be empty for rare item with high ES and resistances"
    );

    let stat_ids: Vec<&str> = stats.iter().filter_map(|s| s["id"].as_str()).collect();
    for id in &stat_ids {
        assert!(
            id.starts_with("explicit.stat_")
                || id.starts_with("crafted.stat_")
                || id.starts_with("implicit.stat_")
        );
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
        "Allflame",
        "Bramble Trail",
        "Two-Toned Boots",
        "Rare",
        "Boots",
        None,
        &explicit_mods,
        &[],
        &[],
        &[],
        &[],
        None,
        None,
        None,
        None,
        None,
        None,
    );

    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    assert_eq!(val["query"]["status"]["option"], "securable");
    let stats = val["query"]["stats"][0]["filters"]
        .as_array()
        .expect("Stats array");
    let stat_ids: Vec<&str> = stats.iter().filter_map(|s| s["id"].as_str()).collect();
    for id in &stat_ids {
        assert!(
            id.starts_with("explicit.stat_")
                || id.starts_with("crafted.stat_")
                || id.starts_with("implicit.stat_")
        );
    }
}

#[test]
fn test_generate_trade_query_unique_item() {
    let (_url, json_str) = generate_trade_search_query(
        "Allflame",
        "The Taming",
        "Prismatic Ring",
        "Unique",
        "Ring",
        None,
        &[],
        &[],
        &[],
        &[],
        &[],
        None,
        None,
        None,
        None,
        None,
        None,
    );

    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    assert_eq!(val["query"]["status"]["option"], "securable");
    assert_eq!(val["query"]["name"], "The Taming");
}

#[test]
fn test_unique_item_trade_query_generation() {
    let (_url, json_str) = generate_trade_search_query(
        "Allflame",
        "The Taming",
        "Prismatic Ring",
        "Unique",
        "Ring",
        None,
        &[],
        &[],
        &[],
        &[],
        &[],
        None,
        None,
        None,
        None,
        None,
        None,
    );
    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    assert_eq!(val["query"]["name"], "The Taming");
    assert_eq!(val["query"]["type"], "Prismatic Ring");
    assert_eq!(
        val["query"]["filters"]["type_filters"]["filters"]["rarity"]["option"],
        "unique"
    );

    let (_url, json_jewel) = generate_trade_search_query(
        "Allflame",
        "Unnatural Instinct",
        "Viridian Jewel",
        "Unique",
        "Jewel",
        None,
        &[],
        &[],
        &[],
        &[],
        &[],
        None,
        None,
        None,
        None,
        None,
        None,
    );
    let val_jewel: Value = serde_json::from_str(&json_jewel).expect("Valid JSON");
    assert_eq!(val_jewel["query"]["name"], "Unnatural Instinct");
    assert_eq!(val_jewel["query"]["type"], "Viridian Jewel");
    assert_eq!(
        val_jewel["query"]["filters"]["type_filters"]["filters"]["rarity"]["option"],
        "unique"
    );
}
