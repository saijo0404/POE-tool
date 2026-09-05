use super::*;
use crate::models::item::{ModType, ParsedItemMod};
use crate::models::trade::TradeQueryRequest;

#[test]
fn test_build_search_query_payload_rare_with_affixes() {
    let req = TradeQueryRequest {
        league: Some("Standard".to_string()),
        trade_status: Some("online".to_string()),
        rarity: Some("Rare".to_string()),
        base_type: Some("罪魔邪冠".to_string()),
        name: Some("暴怒 避難所".to_string()),
        item_level_min: Some(85),
        corrupted: Some(false),
        selected_mods: Some(vec![
            ParsedItemMod {
                id: "explicit.stat_1050105434".to_string(),
                text: "+54 最大魔力".to_string(),
                english_text: "+# to maximum Mana".to_string(),
                mod_type: ModType::Explicit,
                tier: None,
                value: Some(54.0),
                min_value: Some(50.0),
                max_value: None,
                enabled: true,
            },
            ParsedItemMod {
                id: "explicit.stat_3299347043".to_string(),
                text: "+5 最大生命".to_string(),
                english_text: "+# to maximum Life".to_string(),
                mod_type: ModType::Explicit,
                tier: None,
                value: Some(5.0),
                min_value: Some(5.0),
                max_value: None,
                enabled: true,
            },
            ParsedItemMod {
                id: "explicit.stat_3372524247".to_string(),
                text: "+22% 火焰抗性".to_string(),
                english_text: "+#% to Fire Resistance".to_string(),
                mod_type: ModType::Explicit,
                tier: None,
                value: Some(22.0),
                min_value: Some(20.0),
                max_value: None,
                enabled: false,
            },
        ]),
        ..Default::default()
    };

    let payload = build_search_query_payload(&req);
    let query = &payload["query"];

    // Rare name must NOT be in query, base type translated to Hubris Circlet
    assert_eq!(query.get("name"), None);
    assert_eq!(query["type"], "Hubris Circlet");

    // Stats should have 2 enabled filters
    let stats = query["stats"].as_array().expect("stats should be array");
    assert_eq!(stats.len(), 1);
    let filters = stats[0]["filters"]
        .as_array()
        .expect("filters should be array");
    assert_eq!(filters.len(), 2);
    assert_eq!(filters[0]["id"], "explicit.stat_1050105434");
    assert_eq!(filters[0]["value"]["min"], 50.0);
    assert_eq!(filters[1]["id"], "explicit.stat_3299347043");
    assert_eq!(filters[1]["value"]["min"], 5.0);

    // Filters: type rarity = rare, misc corrupted = false, ilvl min = 85
    assert_eq!(
        query["filters"]["type_filters"]["filters"]["rarity"]["option"],
        "rare"
    );
    assert_eq!(
        query["filters"]["misc_filters"]["filters"]["corrupted"]["option"],
        "false"
    );
    assert_eq!(
        query["filters"]["misc_filters"]["filters"]["ilvl"]["min"],
        85
    );
}

#[test]
fn test_build_search_query_payload_unique() {
    let req = TradeQueryRequest {
        league: Some("Standard".to_string()),
        trade_status: Some("instant".to_string()),
        rarity: Some("Unique".to_string()),
        base_type: Some("金光戒指".to_string()),
        name: Some("賭神芬多".to_string()),
        ..Default::default()
    };

    let payload = build_search_query_payload(&req);
    let query = &payload["query"];

    // Unique name translated to Ventor's Gamble, base type to Gold Ring
    assert_eq!(query["name"], "Ventor's Gamble");
    assert_eq!(query["type"], "Gold Ring");
    assert_eq!(query["status"]["option"], "securable");
    assert_eq!(
        query["filters"]["type_filters"]["filters"]["rarity"]["option"],
        "unique"
    );
}

#[test]
fn test_build_search_query_payload_poe2_filters() {
    let req = TradeQueryRequest {
        league: Some("Standard".to_string()),
        engine: Some("poe2".to_string()),
        spirit_min: Some(120),
        rune_sockets_min: Some(2),
        waystone_tier_min: Some(16),
        uncut_gem_tier_min: Some(20),
        ..Default::default()
    };

    let payload = build_search_query_payload(&req);
    let query = &payload["query"];

    assert_eq!(
        query["filters"]["equipment_filters"]["filters"]["spirit"]["min"],
        120
    );
    assert_eq!(
        query["filters"]["socket_filters"]["filters"]["rune_sockets"]["min"],
        2
    );
    assert_eq!(
        query["filters"]["map_filters"]["filters"]["waystone_tier"]["min"],
        16
    );
    assert_eq!(
        query["filters"]["misc_filters"]["filters"]["gem_level"]["min"],
        20
    );
}

#[test]
fn test_calculate_price_metrics() {
    let prices = vec![100.0, 50.0, 150.0, 200.0, 80.0];
    let metrics = price_estimator::calculate_price_metrics(prices, 150.0);
    assert_eq!(metrics.min_chaos, 50.0);
    assert_eq!(metrics.median_chaos, 100.0);
    assert_eq!(metrics.min_divine, 0.33);
    assert_eq!(metrics.median_divine, 0.67);
}

#[test]
fn test_apply_poe2_filters_from_item() {
    let mut filters = serde_json::json!({});
    let mut item = crate::models::item::ParsedItem::empty("zh", "");
    item.raw_text = "稀 有 度: 稀有\n高級法杖\n精魂需求: 85\n符文插槽: 3".to_string();

    let req = TradeQueryRequest {
        league: Some("Standard".into()),
        engine: Some("poe2".into()),
        item: Some(item),
        ..Default::default()
    };

    super::poe2_filters::apply_poe2_filters(&mut filters, &req);
    assert_eq!(filters["equipment_filters"]["filters"]["spirit"]["min"], 85);
    assert_eq!(
        filters["socket_filters"]["filters"]["rune_sockets"]["min"],
        3
    );
}

#[test]
fn test_apply_poe2_filters_parsed_item_fields() {
    let mut filters = serde_json::json!({});
    let mut item = crate::models::item::ParsedItem::empty("zh", "");
    item.spirit = Some(110);
    item.waystone_tier = Some(15);
    item.uncut_tier = Some(19);
    item.rune_sockets = Some("S S".to_string());

    let req = TradeQueryRequest {
        league: Some("Standard".into()),
        engine: Some("poe2".into()),
        item: Some(item),
        ..Default::default()
    };

    super::poe2_filters::apply_poe2_filters(&mut filters, &req);
    assert_eq!(
        filters["equipment_filters"]["filters"]["spirit"]["min"],
        110
    );
    assert_eq!(
        filters["socket_filters"]["filters"]["rune_sockets"]["min"],
        2
    );
    assert_eq!(
        filters["map_filters"]["filters"]["waystone_tier"]["min"],
        15
    );
    assert_eq!(filters["misc_filters"]["filters"]["gem_level"]["min"], 19);
}
