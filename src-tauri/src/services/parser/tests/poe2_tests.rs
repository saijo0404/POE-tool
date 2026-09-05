use crate::services::parser::parse_item_text;

#[test]
fn test_parse_poe2_body_armour_with_spirit() {
    let text = r#"Item Class: Body Armours
Rarity: Rare
Doom Shell
Golden Plate
--------
Armour: 450
Energy Shield: 120
Spirit: 60
--------
Requirements:
Level: 65
--------
Sockets: S S
--------
Item Level: 78
--------
+85 to maximum Life
+35% to Fire Resistance"#;

    let parsed = parse_item_text(text);
    assert_eq!(parsed.engine.as_deref(), Some("poe2"));
    assert_eq!(parsed.name, "Doom Shell");
    assert_eq!(parsed.base_type, "Golden Plate");
    assert_eq!(parsed.spirit, Some(60));
    assert_eq!(parsed.item_level, Some(78));
}

#[test]
fn test_parse_poe2_waystone() {
    let text = r#"Item Class: Waystones
Rarity: Rare
Sulphur Vents Waystone
Waystone Tier: 14
--------
Item Level: 79
--------
Monsters have 40% increased Area of Effect"#;

    let parsed = parse_item_text(text);
    assert_eq!(parsed.engine.as_deref(), Some("poe2"));
    assert_eq!(parsed.name, "Sulphur Vents Waystone");
    assert_eq!(parsed.waystone_tier, Some(14));
}
