use super::super::*;

#[test]
fn test_parse_mod_tier_range_min() {
    let text = r#"Item Class: Rings
Rarity: Rare
Rift Circle
Two-Stone Ring
--------
Item Level: 84
--------
+55(50-59) to maximum Life
+40(36-41)% to Fire Resistance"#;

    let parsed = parse_item_text(text);
    assert_eq!(parsed.explicits.len(), 2);
    assert_eq!(parsed.explicits[0].value, Some(55.0));
    assert_eq!(parsed.explicits[0].min_value, Some(50.0));
    assert_eq!(parsed.explicits[0].max_value, Some(59.0));
    assert_eq!(parsed.explicits[1].value, Some(40.0));
    assert_eq!(parsed.explicits[1].min_value, Some(36.0));
    assert_eq!(parsed.explicits[1].max_value, Some(41.0));
}

#[test]
fn test_parse_mod_tier_from_tags() {
    let text = r#"物品種類: 頭部
稀有度: 稀有
暴怒 避難所
罪魔邪冠
--------
護甲: 195
能量護盾: 40
--------
物品等級: 85
--------
{ 固定詞綴 }
此物品插槽中技能寶石等級 +2
--------
{ 前綴 "龍膽的"(階層：5)— 魔力 }
+54(50-54) 最大魔力
{ 前綴 "健壯之"(階層：10)— 生命 }
+5(3-9) 最大生命
{ 後綴 "精髓之"— 傷害,元素,寶石 }
插槽中的寶石造成 30% 更多元素傷害
{ 後綴 "暴風雨之"(階層：4)— 元素,閃電,抗性 }
+30(30-35)% 閃電抗性
{ 後綴 "火龍之"(階層：6)— 元素,火焰,抗性 }
+22(18-23)% 火焰抗性
--------
塑者之物"#;

    let parsed = parse_item_text(text);
    assert_eq!(parsed.name, "暴怒 避難所");
    assert_eq!(parsed.implicits.len(), 1);
    assert_eq!(parsed.explicits.len(), 5);

    assert_eq!(parsed.explicits[0].tier, Some(5));
    assert_eq!(parsed.explicits[0].value, Some(54.0));

    assert_eq!(parsed.explicits[1].tier, Some(10));
    assert_eq!(parsed.explicits[1].value, Some(5.0));

    assert_eq!(parsed.explicits[2].tier, None); // essence mod
    assert_eq!(parsed.explicits[2].value, Some(30.0));

    assert_eq!(parsed.explicits[3].tier, Some(4));
    assert_eq!(parsed.explicits[3].value, Some(30.0));

    assert_eq!(parsed.explicits[4].tier, Some(6));
    assert_eq!(parsed.explicits[4].value, Some(22.0));
}
