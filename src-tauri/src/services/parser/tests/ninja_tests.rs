use super::super::*;

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
    assert_eq!(
        parsed.explicits[0].text,
        "Magic Utility Flask Effects cannot be removed"
    );
    assert_eq!(
        parsed.explicits[1].text,
        "Leftmost 4 Magic Utility Flasks constantly apply their Flask Effects to you"
    );
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
