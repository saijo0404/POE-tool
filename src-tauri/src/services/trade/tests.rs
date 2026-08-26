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
        links_min: None,
        corrupted: Some(false),
        filters: None,
        selected_mods: Some(vec![
            ParsedItemMod {
                id: "explicit.stat_1050105434".to_string(),
                text: "+54 最大魔力".to_string(),
                english_text: "+# to maximum Mana".to_string(),
                mod_type: ModType::Explicit,
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
                value: Some(22.0),
                min_value: Some(20.0),
                max_value: None,
                enabled: false,
            },
        ]),
        item: None,
        poesessid: None,
        sort: None,
        fetch_offset: None,
        search_id: None,
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
        item_level_min: None,
        links_min: None,
        corrupted: None,
        filters: None,
        selected_mods: None,
        item: None,
        poesessid: None,
        sort: None,
        fetch_offset: None,
        search_id: None,
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
fn test_calculate_price_metrics() {
    let prices = vec![100.0, 50.0, 150.0, 200.0, 80.0];
    let metrics = price_estimator::calculate_price_metrics(prices, 150.0);
    assert_eq!(metrics.min_chaos, 50.0);
    assert_eq!(metrics.median_chaos, 100.0);
    assert_eq!(metrics.min_divine, 0.33);
    assert_eq!(metrics.median_divine, 0.67);
}
