use super::super::*;

#[test]
fn test_parse_gem_with_level_and_quality() {
    let text = r#"Item Class: Skill Gems
Rarity: Gem
Righteous Fire
--------
Level: 21 (Max)
Quality: +20% (augmented)
--------
Requirements:
Level: 72
Str: 155
--------
Deals 2500 Base Fire Damage per second"#;

    let parsed = parse_item_text(text);
    assert_eq!(parsed.rarity, "Gem");
    assert_eq!(parsed.quality, Some(20));
    assert_eq!(parsed.name, "Righteous Fire");
}

#[test]
fn test_parse_map_item() {
    let text = r#"Item Class: Maps
Rarity: Rare
Dungeon Map
Map Tier: 16
Item Quantity: +75% (augmented)
Item Rarity: +45% (augmented)
Monster Pack Size: +25% (augmented)
--------
Item Level: 83
--------
Monsters reflect 18% of Elemental Damage
Monsters have 60% chance to Avoid Elemental Ailments"#;

    let parsed = parse_item_text(text);
    assert_eq!(parsed.rarity, "Rare");
    assert_eq!(parsed.name, "Dungeon Map");
    assert_eq!(parsed.item_level, Some(83));
    assert_eq!(parsed.explicits.len(), 2);
}

#[test]
fn test_parse_unidentified_item() {
    let text = r#"Item Class: Boots
Rarity: Rare
Unidentified
Two-Toned Boots
--------
Item Level: 84
--------
Corrupted"#;

    let parsed = parse_item_text(text);
    assert_eq!(parsed.name, "Two-Toned Boots");
    assert_eq!(parsed.base_type, "Two-Toned Boots");
    assert_eq!(parsed.rarity, "Rare");
    assert_eq!(parsed.corrupted, Some(true));
}

#[test]
fn test_parse_scarab_and_map_item_format() {
    let scarab_text = r#"物品種類: 聖甲蟲
稀有度: 通貨
精髓甲蟲
--------
堆疊數量: 40
--------"#;
    let parsed_scarab = parse_item_text(scarab_text);
    assert_eq!(parsed_scarab.rarity, "Currency");
    assert_eq!(parsed_scarab.name, "Essence Scarab");
    assert_eq!(parsed_scarab.base_type, "Essence Scarab");
    assert_eq!(parsed_scarab.explicits.len(), 0);
    assert_eq!(parsed_scarab.implicits.len(), 0);

    let map_text = r#"物品種類: 地圖
稀有度: 普通
幽閉墓穴
--------
地圖階級: 16
--------
物品等級: 83
--------"#;
    let parsed_map = parse_item_text(map_text);
    assert_eq!(parsed_map.rarity, "Normal");
    assert_eq!(parsed_map.name, "Dunes Map");
    assert_eq!(parsed_map.base_type, "Dunes Map");
    assert_eq!(parsed_map.item_level, Some(83));

    let generic_map_text = r#"物品種類: 地圖
稀有度: 普通
地圖
--------
地圖階級: 16
--------
物品等級: 83
--------"#;
    let parsed_generic = parse_item_text(generic_map_text);
    assert_eq!(parsed_generic.rarity, "Normal");
    assert_eq!(parsed_generic.name, "Map");
    assert_eq!(parsed_generic.base_type, "Map");
    assert_eq!(parsed_generic.item_level, Some(83));

    let req = crate::models::trade::TradeQueryRequest {
        league: Some("Settlers".to_string()),
        trade_status: Some("online".to_string()),
        rarity: Some(parsed_generic.rarity.clone()),
        base_type: Some(parsed_generic.base_type.clone()),
        name: Some(parsed_generic.name.clone()),
        item_level_min: None,
        links_min: None,
        corrupted: None,
        filters: None,
        selected_mods: None,
        item: Some(parsed_generic),
        poesessid: None,
        sort: None,
        fetch_offset: None,
        search_id: None,
    };
    let query_val = crate::services::trade::query_builder::build_search_query_payload(&req);
    assert_eq!(query_val["query"]["type"], serde_json::Value::Null);
    assert_eq!(
        query_val["query"]["filters"]["type_filters"]["filters"]["category"]["option"],
        "map"
    );
    assert_eq!(
        query_val["query"]["filters"]["type_filters"]["filters"]["rarity"]["option"],
        "normal"
    );
    assert_eq!(
        query_val["query"]["filters"]["map_filters"]["filters"]["map_tier"]["min"],
        16
    );
    assert_eq!(
        query_val["query"]["filters"]["map_filters"]["filters"]["map_tier"]["max"],
        16
    );

    let scarab_req = crate::models::trade::TradeQueryRequest {
        league: Some("Settlers".to_string()),
        trade_status: Some("online".to_string()),
        rarity: Some(parsed_scarab.rarity.clone()),
        base_type: Some(parsed_scarab.base_type.clone()),
        name: Some(parsed_scarab.name.clone()),
        item_level_min: None,
        links_min: None,
        corrupted: None,
        filters: None,
        selected_mods: None,
        item: Some(parsed_scarab),
        poesessid: None,
        sort: None,
        fetch_offset: None,
        search_id: None,
    };
    let scarab_query_val =
        crate::services::trade::query_builder::build_search_query_payload(&scarab_req);
    assert_eq!(scarab_query_val["query"]["type"], "Essence Scarab");
    assert_eq!(
        scarab_query_val["query"]["filters"],
        serde_json::Value::Null
    );
}
