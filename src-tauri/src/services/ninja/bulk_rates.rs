use std::collections::HashMap;

pub fn get_accurate_bulk_rates() -> HashMap<String, f64> {
    let mut map = HashMap::new();
    let currencies = [
        ("Mirror of Kalandra", 95000.0),
        ("Hinekora's Lock", 12000.0),
        ("Divine Orb", 150.0),
        ("Sacred Orb", 80.0),
        ("Awakener's Orb", 350.0),
        ("Crusader's Orb", 80.0),
        ("Redeemer's Orb", 75.0),
        ("Hunter's Orb", 120.0),
        ("Warlord's Orb", 90.0),
        ("Orb of Dominance", 280.0),
        ("Exalted Orb", 18.0),
        ("Ancient Orb", 15.0),
        ("Annulment Orb", 8.0),
        ("Orb of Annulment", 8.0),
        ("Veiled Chaos Orb", 45.0),
        ("Veiled Orb", 1100.0),
        ("Chaos Orb", 1.0),
        ("Orb of Alchemy", 0.5),
        ("Orb of Fusing", 0.35),
        ("Orb of Scouring", 0.8),
        ("Orb of Regret", 0.9),
        ("Orb of Unmaking", 1.2),
        ("Vaal Orb", 1.0),
        ("Gemcutter's Prism", 1.5),
        ("Glassblower's Bauble", 0.5),
        ("Blessed Orb", 0.2),
        ("Chromatic Orb", 0.15),
        ("Orb of Alteration", 0.25),
        ("Orb of Chance", 0.15),
        ("Orb of Augmentation", 0.05),
        ("Orb of Transmutation", 0.03),
        ("Blacksmith's Whetstone", 0.05),
        ("Armourer's Scrap", 0.05),
        ("Portal Scroll", 0.02),
        ("Scroll of Wisdom", 0.01),
        ("Fracturing Orb", 3200.0),
        ("Fracturing Shard", 160.0),
        ("Mirror Shard", 4500.0),
        ("Exalted Shard", 0.9),
    ];
    for (name, val) in currencies {
        map.insert(name.to_string(), val);
    }

    let fragments = [
        ("Simulacrum Splinter", 0.4),
        ("Simulacrum", 60.0),
        ("Unmaking Orb", 1.2),
        ("Timeless Maraketh Splinter", 0.8),
        ("Timeless Templar Splinter", 0.5),
        ("Crescent Splinter", 6.0),
        ("The Maven's Writ", 180.0),
    ];
    for (name, val) in fragments {
        map.insert(name.to_string(), val);
    }

    let uniques = [
        ("Mageblood", 18000.0),
        ("Headhunter", 7500.0),
        ("The Squire", 1200.0),
        ("Nimbi", 800.0),
        ("Nimbleness", 50.0),
        ("Progenesis", 9500.0),
        ("Bottled Faith", 1400.0),
        ("Oriath's End", 1800.0),
        ("Ashes of the Stars", 3500.0),
        ("Crystallised Omniscience", 3200.0),
        ("Kalandra's Touch", 2400.0),
    ];
    for (name, val) in uniques {
        map.insert(name.to_string(), val);
    }

    map
}
