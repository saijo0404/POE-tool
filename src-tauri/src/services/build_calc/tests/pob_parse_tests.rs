use super::super::*;
use serde_json::Value;

#[test]
fn test_parse_pob_xml_items_and_mods() {
    let xml = r#"<PathOfBuilding>
        <Build level="95" className="Witch" ascendClassName="Elementalist" league="Allflame" />
        <Items>
            <Item id="1">
Rarity: RARE
Empyrean Coat
Twilight Regalia
Energy Shield: 750
Item Level: 86
Quality: 20
Sockets: B-B-B-B-B-B
LevelReq: 72
Implicits: 0
{range:0.8}+90 to maximum Energy Shield
{range:0.6}126% increased Energy Shield
{range:0.7}+46% to Cold Resistance
{range:0.5}+27% to Chaos Resistance
            </Item>
            <ItemSet useSecondWeaponSet="false" id="1">
                <Slot name="Body Armour" itemId="1" />
            </ItemSet>
        </Items>
    </PathOfBuilding>"#;

    let build = parse_pob_xml(xml, "test_build").expect("Parse PoB XML");
    assert_eq!(build.equipment.len(), 1);
    let item = &build.equipment[0];
    assert_eq!(item.name, "Empyrean Coat");
    assert_eq!(item.type_line, "Twilight Regalia");
    assert_eq!(item.slot, "BodyArmour");
    assert_eq!(item.links, Some(6));
    assert_eq!(item.property_energy_shield, Some(750.0));
    assert_eq!(item.explicit_mods.len(), 4);
    assert_eq!(item.explicit_mods[0], "+90 to maximum Energy Shield");

    let (_url, json_str) = generate_trade_search_query(
        &build.league,
        &item.name,
        &item.type_line,
        &item.rarity,
        &item.slot,
        item.links,
        &item.explicit_mods,
        &item.implicit_mods,
        &item.crafted_mods,
        &item.fractured_mods,
        &item.enchant_mods,
        item.property_energy_shield,
        item.property_armour,
        item.property_evasion,
        None,
        None,
        None,
    );
    let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
    let stats = val["query"]["stats"][0]["filters"]
        .as_array()
        .expect("Stats array");
    assert!(
        !stats.is_empty(),
        "Stats must be generated for parsed PoB item with mods"
    );
}

#[tokio::test]
async fn test_fetch_pob_or_ninja_build_raw_xml() {
    let xml = r#"<PathOfBuilding>
        <Build level="92" className="Shadow" ascendClassName="Trickster" league="Settlers" />
        <Items>
            <Item id="1">
Rarity: UNIQUE
Shavronne's Wrappings
Occultist's Vestment
Item Level: 80
Quality: 20
Sockets: B-B-B-B-B-B
Implicits: 0
10% increased Spell Damage
+140 to maximum Energy Shield
10% increased maximum Energy Shield
10% increased Lightning Resistance
Reflects 1 to 250 Lightning Damage to Attackers on Block
Chaos Damage does not bypass Energy Shield
            </Item>
            <ItemSet useSecondWeaponSet="false" id="1">
                <Slot name="Body Armour" itemId="1" />
            </ItemSet>
        </Items>
    </PathOfBuilding>"#;

    let result = fetch_pob_or_ninja_build(xml).await;
    assert!(
        result.is_ok(),
        "Raw PoB XML should be parsed successfully without network request"
    );
    let build = result.unwrap();
    assert_eq!(build.class_name, "Shadow");
    assert_eq!(build.ascendancy, "Trickster");
    assert_eq!(build.level, 92);
    assert_eq!(build.equipment.len(), 1);
    assert_eq!(build.equipment[0].name, "Shavronne's Wrappings");
}

#[tokio::test]
async fn test_fetch_pob_or_ninja_build_raw_base64() {
    use base64::Engine;
    use flate2::write::ZlibEncoder;
    use flate2::Compression;
    use std::io::Write;

    let xml = r#"<PathOfBuilding>
        <Build level="95" className="Witch" ascendClassName="Necromancer" league="Settlers" />
        <Items>
            <Item id="1">
Rarity: UNIQUE
Midnight Bargain
Engraved Wand
Item Level: 75
Quality: 20
Implicits: 1
22% increased Spell Damage
+10 to Intelligence
Cannot be used with Chaos Inoculation
Minions have 20% increased Movement Speed
Minions deal 30% increased Damage
+1 to Maximum number of Raised Zombies
+1 to Maximum number of Spectres
+1 to Maximum number of Skeletons
Reserves 30% of Life
            </Item>
            <ItemSet useSecondWeaponSet="false" id="1">
                <Slot name="Weapon 1" itemId="1" />
            </ItemSet>
        </Items>
    </PathOfBuilding>"#;

    let mut encoder = ZlibEncoder::new(Vec::new(), Compression::best());
    encoder.write_all(xml.as_bytes()).unwrap();
    let compressed = encoder.finish().unwrap();
    let base64_str = base64::engine::general_purpose::STANDARD.encode(&compressed);
    assert!(
        base64_str.starts_with("eN"),
        "PoB compressed base64 should start with eN"
    );

    let result = fetch_pob_or_ninja_build(&base64_str).await;
    assert!(
        result.is_ok(),
        "Raw PoB Base64 should be decoded and parsed in-memory without network request: {:?}",
        result.err()
    );
    let build = result.unwrap();
    assert_eq!(build.class_name, "Witch");
    assert_eq!(build.ascendancy, "Necromancer");
    assert_eq!(build.level, 95);
    assert_eq!(build.equipment.len(), 1);
    assert_eq!(build.equipment[0].name, "Midnight Bargain");
}

#[test]
fn test_decompress_pob_base64_with_newlines_and_url_safe() {
    use base64::Engine;
    use flate2::write::ZlibEncoder;
    use flate2::Compression;
    use std::io::Write;

    let xml = r#"<PathOfBuilding><Build level="90" className="Ranger" ascendClassName="Deadeye" league="Standard" /></PathOfBuilding>"#;
    let mut encoder = ZlibEncoder::new(Vec::new(), Compression::default());
    encoder.write_all(xml.as_bytes()).unwrap();
    let compressed = encoder.finish().unwrap();
    let base64_str = base64::engine::general_purpose::URL_SAFE.encode(&compressed);

    // Add extra spaces and newlines
    let wrapped_str = format!("  \n {} \r\n\t ", base64_str);
    let decompressed = decompress_pob_base64(&wrapped_str)
        .expect("Decompress with whitespace and URL-safe base64");
    assert_eq!(decompressed, xml);
}
