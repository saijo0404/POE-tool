use super::mock_rates;
use crate::services::stash::valuation::parse_stash_item;
use serde_json::json;

#[test]
fn test_six_link_detection_and_valuation() {
    let mut rates = mock_rates();
    rates.insert("Astral Plate:6L".to_string(), 45.0);
    rates.insert("Astral Plate".to_string(), 2.0);
    let div_rate = 150.0;

    // True 6-link: all 6 sockets in group 0
    let raw_6l = json!({
        "id": "6l-item",
        "typeLine": "星芒戰鎧",
        "sockets": [
            { "group": 0, "sColour": "R" },
            { "group": 0, "sColour": "R" },
            { "group": 0, "sColour": "R" },
            { "group": 0, "sColour": "R" },
            { "group": 0, "sColour": "R" },
            { "group": 0, "sColour": "R" }
        ],
        "frameType": 2
    });
    let item_6l =
        parse_stash_item(&raw_6l, "裝備頁", &rates, div_rate).expect("Should parse 6L item");
    assert_eq!(item_6l.unit_price_chaos, 45.0);

    // 6 sockets but NOT linked (e.g. 4L and 2L)
    let raw_unlinked = json!({
        "id": "unlinked-item",
        "typeLine": "星芒戰鎧",
        "sockets": [
            { "group": 0, "sColour": "R" },
            { "group": 0, "sColour": "R" },
            { "group": 0, "sColour": "R" },
            { "group": 0, "sColour": "R" },
            { "group": 1, "sColour": "R" },
            { "group": 1, "sColour": "R" }
        ],
        "frameType": 2
    });
    let item_unlinked = parse_stash_item(&raw_unlinked, "裝備頁", &rates, div_rate)
        .expect("Should parse unlinked item");
    assert_eq!(item_unlinked.unit_price_chaos, 2.0);
}

#[test]
fn test_gem_quality_and_level_valuation() {
    let mut rates = mock_rates();
    rates.insert("Gemcutter's Prism".to_string(), 2.0);
    rates.insert("Empower Support (3)".to_string(), 850.0);
    rates.insert("Righteous Fire (21/20)".to_string(), 320.0);
    let div_rate = 150.0;

    // Level 21 / 20% Quality Righteous Fire
    let raw_rf_21_20 = json!({
        "id": "gem-1",
        "typeLine": "正義之火",
        "frameType": 4,
        "properties": [
            { "name": "等級", "values": [["21", 0]] },
            { "name": "品質", "values": [["+20%", 1]] }
        ]
    });
    let gem1 = parse_stash_item(&raw_rf_21_20, "寶石頁", &rates, div_rate)
        .expect("Should parse 21/20 gem");
    assert_eq!(gem1.unit_price_chaos, 320.0);

    // 20% Quality generic gem (fallback to GCP floor)
    let raw_q20_gem = json!({
        "id": "gem-2",
        "typeLine": "冰霜射擊",
        "frameType": 4,
        "properties": [
            { "name": "等級", "values": [["1", 0]] },
            { "name": "品質", "values": [["+20%", 1]] }
        ]
    });
    let gem2 =
        parse_stash_item(&raw_q20_gem, "寶石頁", &rates, div_rate).expect("Should parse 20% gem");
    assert!(gem2.unit_price_chaos >= 2.0);
}

#[test]
fn test_special_base_type_valuation() {
    let mut rates = mock_rates();
    rates.insert("Blizzard Crown (ilvl 86)".to_string(), 120.0);
    rates.insert("Blizzard Crown".to_string(), 15.0);
    let div_rate = 150.0;

    let raw_base = json!({
        "id": "base-1",
        "typeLine": "暴風雪之冠",
        "ilvl": 86,
        "frameType": 0
    });
    let item =
        parse_stash_item(&raw_base, "基底頁", &rates, div_rate).expect("Should parse special base");
    assert_eq!(item.unit_price_chaos, 120.0);
}
