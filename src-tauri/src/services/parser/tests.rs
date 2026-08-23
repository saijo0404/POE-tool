use super::*;

#[test]
fn test_parse_ventors_gamble() {
    let text = r#"物品種類: 戒指
稀有度: 傳奇
賭神芬多
金光戒指
--------
需求:
等級: 65
--------
物品等級: 78
--------
{ 固定詞綴— 丟置 }
增加 15(6-15)% 物品稀有度
--------
{ 傳奇詞綴— 生命 }
+19(0-60) 最大生命
{ 傳奇詞綴— 元素,火焰,抗性 }
+25(-25-50)% 火焰抗性
{ 傳奇詞綴— 元素,冰冷,抗性 }
-6(-25-50)% 冰冷抗性
{ 傳奇詞綴— 元素,閃電,抗性 }
-2(-25-50)% 閃電抗性
{ 傳奇詞綴— 魔力 }
減少 10(15--15)% 技能的魔力保留效用
--------
至輝榮耀，劣境克敵
「不敗」怪物終遭天譴
芬多取得畢生最後勝績
--------
備註: ~b/o 5 chaos"#;

    let parsed = parse_item_text(text);
    assert_eq!(parsed.name, "賭神芬多");
    assert_eq!(parsed.base_type, "Gold Ring");
    assert_eq!(parsed.rarity, "Unique");
    assert_eq!(parsed.item_level, Some(78));

    assert_eq!(parsed.implicits.len(), 1);
    assert_eq!(parsed.implicits[0].value, Some(15.0));
    assert_eq!(parsed.implicits[0].text, "增加 15% 物品稀有度");

    assert_eq!(parsed.explicits.len(), 5);
    assert_eq!(parsed.explicits[0].value, Some(19.0));
    assert_eq!(parsed.explicits[0].text, "+19 最大生命");
    assert_eq!(parsed.explicits[1].value, Some(25.0));
    assert_eq!(parsed.explicits[1].text, "+25% 火焰抗性");
    assert_eq!(parsed.explicits[2].value, Some(-6.0));
    assert_eq!(parsed.explicits[2].text, "-6% 冰冷抗性");
    assert_eq!(parsed.explicits[3].value, Some(-2.0));
    assert_eq!(parsed.explicits[3].text, "-2% 閃電抗性");
    assert_eq!(parsed.explicits[4].value, Some(10.0));
    assert_eq!(parsed.explicits[4].text, "減少 10% 技能的魔力保留效用");
    assert!(parsed.explicits[0].id.starts_with("explicit."));
}

#[test]
fn test_parse_crlf_pasted_item() {
    let text_with_crlf = "物品種類: 戒指\r\n稀有度: 傳奇\r\n賭神芬多\r\n金光戒指\r\n--------\r\n需求:\r\n等級: 65\r\n--------\r\n物品等級: 78\r\n--------\r\n{ 固定詞綴— 丟置 }\r\n增加 15(6-15)% 物品稀有度\r\n--------\r\n{ 傳奇詞綴— 生命 }\r\n+19(0-60) 最大生命\r\n--------\r\n";
    let parsed = parse_item_text(text_with_crlf);
    assert_eq!(parsed.name, "賭神芬多");
    assert_eq!(parsed.base_type, "Gold Ring");
    assert_eq!(parsed.implicits.len(), 1);
    assert_eq!(parsed.explicits.len(), 1);
    assert!(parsed.explicits[0].id.starts_with("explicit."));
}

#[test]
fn test_parse_the_immortal_will() {
    let text = r#"物品種類: 盾
稀有度: 傳奇
不朽之意志
威能鳶盾
--------
格擋率: 27% (augmented)
護甲: 166
能量護盾: 34
--------
需求:
等級: 68
力量: 85
智慧: 85
--------
插槽: W-B W 
--------
物品等級: 79
--------
{ 固定詞綴— 元素,抗性 }
+12% 全部元素抗性
--------
{ 傳奇詞綴— 魔力 }
當你格擋時獲得 43(30-50) 魔力
{ 傳奇詞綴— 生命 }
+76(60-80) 最大生命
{ 傳奇詞綴— 元素,抗性 }
+12(10-15)% 全部元素抗性
{ 傳奇詞綴 }
+5% 格擋率
{ 傳奇詞綴 }
獲得召喚高階專注神諭技能 — 無法使用的值
{ 傳奇詞綴— 傷害 }
引導施放技能增加 54(50-70)% 傷害
--------
備註: ~b/o 20 chaos"#;

    let parsed = parse_item_text(text);
    assert_eq!(parsed.name, "不朽之意志");
    assert_eq!(parsed.base_type, "Archon Kite Shield");
    assert_eq!(parsed.implicits.len(), 1);
    assert_eq!(parsed.implicits[0].text, "+12% 全部元素抗性");
    assert!(parsed.implicits[0].id.starts_with("implicit."));
    assert!(parsed.explicits.len() >= 5);
    for m in &parsed.explicits {
        assert!(m.id.starts_with("explicit.") || m.id.starts_with("pseudo.") || m.id.starts_with("custom."));
    }
}

#[test]
fn test_parse_fractured_and_crafted_mods() {
    let text = r#"Item Class: Helmets
Rarity: Rare
Gloom Crown
Archdemon Crown
--------
Requirements:
Level: 75
Str: 108
Int: 108
--------
Sockets: R-B-B-G
--------
Item Level: 85
--------
{ Fractured }
+45% to Fire Resistance
--------
+85 to maximum Life
+42% to Cold Resistance
{ Crafted }
+20 to Strength and Intelligence"#;

    let parsed = parse_item_text(text);
    assert_eq!(parsed.name, "Gloom Crown");
    assert_eq!(parsed.base_type, "Archdemon Crown");
    assert_eq!(parsed.rarity, "Rare");
    assert_eq!(parsed.item_level, Some(85));
    assert_eq!(parsed.sockets, Some("R-B-B-G".to_string()));

    assert_eq!(parsed.explicits.len(), 4);
    assert_eq!(parsed.explicits[0].mod_type, ModType::Fractured);
    assert!(parsed.explicits[0].id.starts_with("fractured."));
    assert_eq!(parsed.explicits[3].mod_type, ModType::Crafted);
    assert!(parsed.explicits[3].id.starts_with("crafted."));
}

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
fn test_parse_empty_and_whitespace_text() {
    let parsed = parse_item_text("");
    assert_eq!(parsed.name, "");
    assert_eq!(parsed.implicits.len(), 0);
    assert_eq!(parsed.explicits.len(), 0);

    let parsed_spaces = parse_item_text("   \n\r\n   ");
    assert_eq!(parsed_spaces.name, "");
}

#[test]
fn test_parse_poe_ninja_mageblood_format() {
    let text = r#"Rarity: UNIQUE
Mageblood
Heavy Belt
Unique ID: 191490289196b010c73797686ec9a6d36e2f18375a5e31737be74ad08f86feaa
Item Level: 85
Quality: 20
Sockets: B-B-B-B
LevelReq: 44
Implicits: 1
{tags:jewellery_attribute}+30 to Strength
Magic Utility Flask Effects cannot be removed
Leftmost 4 Magic Utility Flasks constantly apply their Flask Effects to you
Magic Utility Flask Effects are not removed when Unreserved Mana is Filled
Corrupted"#;

    let parsed = parse_item_text(text);
    assert_eq!(parsed.name, "Mageblood");
    assert_eq!(parsed.base_type, "Heavy Belt");
    assert_eq!(parsed.rarity, "Unique");
    assert_eq!(parsed.item_level, Some(85));
    assert_eq!(parsed.quality, Some(20));
    assert_eq!(parsed.sockets, Some("B-B-B-B".to_string()));
    assert_eq!(parsed.corrupted, Some(true));

    assert_eq!(parsed.implicits.len(), 1);
    assert_eq!(parsed.implicits[0].text, "+30 to Strength");
    assert_eq!(parsed.implicits[0].value, Some(30.0));
    assert!(parsed.implicits[0].id.starts_with("implicit."));

    assert_eq!(parsed.explicits.len(), 3);
    assert_eq!(parsed.explicits[0].text, "Magic Utility Flask Effects cannot be removed");
    assert_eq!(parsed.explicits[1].text, "Leftmost 4 Magic Utility Flasks constantly apply their Flask Effects to you");
}

#[test]
fn test_parse_poe_ninja_rare_item_with_tags_and_ranges() {
    let text = r#"Rarity: RARE
Doom Sanctuary
Hubris Circlet
Item Level: 85
Quality: 20
Sockets: B-B-B-B
LevelReq: 68
Implicits: 1
{tags:mana}+25 to maximum Mana
{fractured}{tags:life}{range:0.8}+ (100-110) to maximum Life
{tags:elemental,fire,resistance}+45% to Fire Resistance
{tags:elemental,cold,resistance}+42% to Cold Resistance
{crafted}{range:0.5}+ (15-20) to Strength"#;

    let parsed = parse_item_text(text);
    assert_eq!(parsed.name, "Doom Sanctuary");
    assert_eq!(parsed.base_type, "Hubris Circlet");
    assert_eq!(parsed.rarity, "Rare");
    assert_eq!(parsed.item_level, Some(85));

    assert_eq!(parsed.implicits.len(), 1);
    assert_eq!(parsed.implicits[0].text, "+25 to maximum Mana");

    assert_eq!(parsed.explicits.len(), 4);
    assert_eq!(parsed.explicits[0].mod_type, ModType::Fractured);
    assert_eq!(parsed.explicits[0].text, "+108 to maximum Life");
    assert_eq!(parsed.explicits[0].value, Some(108.0));
    assert_eq!(parsed.explicits[0].min_value, Some(100.0));
    assert_eq!(parsed.explicits[0].max_value, Some(110.0));

    assert_eq!(parsed.explicits[1].text, "+45% to Fire Resistance");
    assert_eq!(parsed.explicits[2].text, "+42% to Cold Resistance");

    assert_eq!(parsed.explicits[3].mod_type, ModType::Crafted);
    assert_eq!(parsed.explicits[3].text, "+17.5 to Strength");
    assert_eq!(parsed.explicits[3].min_value, Some(15.0));
    assert_eq!(parsed.explicits[3].max_value, Some(20.0));
}

#[test]
fn test_parse_poe_ninja_short_item_name() {
    let text = "Mageblood\nHeavy Belt";
    let parsed = parse_item_text(text);
    assert_eq!(parsed.name, "Mageblood");
    assert_eq!(parsed.base_type, "Heavy Belt");

    let text_single = "Headhunter";
    let parsed_single = parse_item_text(text_single);
    assert_eq!(parsed_single.name, "Headhunter");
}

