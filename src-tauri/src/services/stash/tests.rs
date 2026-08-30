use super::valuation::{calculate_tab_summaries, parse_stash_item};
use serde_json::json;
use std::collections::HashMap;

fn mock_rates() -> HashMap<String, f64> {
    let mut rates = HashMap::new();
    rates.insert("Divine Orb".to_string(), 150.0);
    rates.insert("Chaos Orb".to_string(), 1.0);
    rates.insert("Ambush Scarab".to_string(), 12.0);
    rates.insert("Deafening Essence of Rage".to_string(), 4.0);
    rates.insert("The Doctor".to_string(), 1200.0);
    rates.insert("Dunes Map".to_string(), 5.0);
    rates.insert("Filled Blood Vessel".to_string(), 8.0);
    rates.insert("Headhunter".to_string(), 7500.0);
    rates.insert("Leather Belt".to_string(), 0.5);
    rates
}

#[test]
fn test_tw_currency_valuation_and_category() {
    let rates = mock_rates();
    let div_rate = 150.0;

    let raw_divine = json!({
        "id": "item-1",
        "typeLine": "神聖石",
        "stackSize": 10,
        "icon": "https://web.poecdn.com/gen/image/divine.png",
        "frameType": 5
    });
    let item1 =
        parse_stash_item(&raw_divine, "通貨頁", &rates, div_rate).expect("Should parse divine orb");
    assert_eq!(item1.category, "Currency");
    assert_eq!(item1.unit_price_chaos, 150.0);
    assert_eq!(item1.total_price_chaos, 1500.0);
    assert_eq!(item1.unit_price_divine, 1.0);
    assert_eq!(item1.total_price_divine, 10.0);

    let raw_chaos = json!({
        "id": "item-2",
        "typeLine": "混沌石",
        "stackSize": 25,
        "frameType": 5
    });
    let item2 =
        parse_stash_item(&raw_chaos, "通貨頁", &rates, div_rate).expect("Should parse chaos orb");
    assert_eq!(item2.category, "Currency");
    assert_eq!(item2.unit_price_chaos, 1.0);
    assert_eq!(item2.total_price_chaos, 25.0);
}

#[test]
fn test_tw_scarab_and_essence() {
    let rates = mock_rates();
    let div_rate = 150.0;

    let raw_scarab = json!({
        "id": "item-3",
        "typeLine": "伏擊甲蟲",
        "stackSize": 2
    });
    let item3 =
        parse_stash_item(&raw_scarab, "甲蟲頁", &rates, div_rate).expect("Should parse scarab");
    assert_eq!(item3.category, "Scarab");
    assert_eq!(item3.unit_price_chaos, 12.0);
    assert_eq!(item3.total_price_chaos, 24.0);

    let raw_essence = json!({
        "id": "item-4",
        "typeLine": "肆虐之咆哮精髓",
        "stackSize": 5
    });
    let item4 =
        parse_stash_item(&raw_essence, "精髓頁", &rates, div_rate).expect("Should parse essence");
    assert_eq!(item4.category, "Essence");
    assert_eq!(item4.unit_price_chaos, 4.0);
    assert_eq!(item4.total_price_chaos, 20.0);
}

#[test]
fn test_tw_divcard_and_map_and_fragment() {
    let rates = mock_rates();
    let div_rate = 150.0;

    let raw_card = json!({
        "id": "item-5",
        "name": "瘋醫",
        "typeLine": "命運之卡",
        "frameType": 6,
        "stackSize": 1
    });
    let card = parse_stash_item(&raw_card, "卡片頁", &rates, div_rate).expect("Should parse card");
    assert_eq!(card.category, "DivCard");
    assert_eq!(card.unit_price_chaos, 1200.0);
    assert_eq!(card.total_price_chaos, 1200.0);

    let raw_map = json!({
        "id": "item-6",
        "typeLine": "幽閉墓穴",
        "frameType": 8
    });
    let map = parse_stash_item(&raw_map, "地圖頁", &rates, div_rate).expect("Should parse map");
    assert_eq!(map.category, "Map");
    assert_eq!(map.unit_price_chaos, 5.0);

    let raw_frag = json!({
        "id": "item-7",
        "typeLine": "充能血器",
        "stackSize": 2
    });
    let frag =
        parse_stash_item(&raw_frag, "碎片頁", &rates, div_rate).expect("Should parse fragment");
    assert_eq!(frag.category, "Fragment");
    assert_eq!(frag.unit_price_chaos, 8.0);
    assert_eq!(frag.total_price_chaos, 16.0);
}

#[test]
fn test_tw_unique_item_valuation() {
    let rates = mock_rates();
    let div_rate = 150.0;

    let raw_unique = json!({
        "id": "item-8",
        "name": "獵首",
        "typeLine": "皮革腰帶",
        "frameType": 3
    });
    let item = parse_stash_item(&raw_unique, "傳奇頁", &rates, div_rate)
        .expect("Should parse unique item");
    assert_eq!(item.category, "Equipment");
    assert_eq!(item.unit_price_chaos, 7500.0);
    assert_eq!(item.total_price_chaos, 7500.0);
    assert_eq!(item.total_price_divine, 50.0);
}

#[test]
fn test_formatted_tag_stripping() {
    let rates = mock_rates();
    let div_rate = 150.0;

    let raw_tagged = json!({
        "id": "item-9",
        "typeLine": "<<set:MS>><<set:M>><<set:S>>神聖石",
        "stackSize": 2
    });
    let item = parse_stash_item(&raw_tagged, "通貨頁", &rates, div_rate)
        .expect("Should parse tagged item");
    assert_eq!(item.category, "Currency");
    assert_eq!(item.unit_price_chaos, 150.0);
    assert_eq!(item.total_price_chaos, 300.0);
}

#[test]
fn test_tab_summaries_calculation() {
    let rates = mock_rates();
    let div_rate = 150.0;

    let raw1 = json!({ "id": "1", "typeLine": "神聖石", "stackSize": 2, "frameType": 5 });
    let raw2 = json!({ "id": "2", "typeLine": "伏擊甲蟲", "stackSize": 5 });

    let item1 = parse_stash_item(&raw1, "通貨頁", &rates, div_rate).unwrap();
    let item2 = parse_stash_item(&raw2, "甲蟲頁", &rates, div_rate).unwrap();

    let items = vec![item1, item2];
    let (total_c, total_d, summaries) = calculate_tab_summaries(&items, div_rate);

    assert_eq!(total_c, 360.0); // (2*150) + (5*12) = 300 + 60 = 360
    assert_eq!(total_d, 2.4); // 360 / 150 = 2.4
    assert_eq!(summaries.len(), 2);
    assert_eq!(summaries[0].tab_name, "通貨頁");
    assert_eq!(summaries[0].total_value_chaos, 300.0);
    assert_eq!(summaries[1].tab_name, "甲蟲頁");
    assert_eq!(summaries[1].total_value_chaos, 60.0);
}
