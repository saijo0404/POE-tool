use std::collections::HashMap;

pub fn get_poe2_canonical_pairs() -> Vec<(String, String)> {
    let mut pairs = Vec::new();
    let static_pairs = [
        // Waystones (尋路石)
        ("尋路石", "Waystone"),
        ("銘刻尋路石", "Inscribed Waystone"),
        ("塔樓尋路石", "Tower Waystone"),
        // Uncut Gems (未切割寶石)
        ("未切割技能寶石", "Uncut Skill Gem"),
        ("未切割精魂寶石", "Uncut Spirit Gem"),
        ("未切割輔助寶石", "Uncut Support Gem"),
        // Runes (符文)
        ("符文", "Rune"),
        ("太陽符文", "Sun Rune"),
        ("鐵符文", "Iron Rune"),
        ("心靈符文", "Mind Rune"),
        ("石之符文", "Stone Rune"),
        ("風暴符文", "Storm Rune"),
        ("冰川符文", "Glacial Rune"),
        ("沙漠符文", "Desert Rune"),
        ("劇毒符文", "Poison Rune"),
        // Currencies & Gold
        ("金幣", "Gold"),
        ("高階重鑄石", "Greater Orb of Scouring"),
        ("次級重鑄石", "Lesser Orb of Scouring"),
        ("高階點金石", "Greater Orb of Alchemy"),
        ("次級點金石", "Lesser Orb of Alchemy"),
        ("重挫石", "Orb of Annulment"),
        ("神聖石", "Divine Orb"),
        ("崇高石", "Exalted Orb"),
        ("混沌石", "Chaos Orb"),
        ("瓦爾寶珠", "Vaal Orb"),
        ("機會石", "Orb of Chance"),
    ];

    for (zh, en) in static_pairs {
        pairs.push((zh.to_string(), en.to_string()));
    }

    for tier in 1..=16 {
        pairs.push((
            format!("尋路石 (階級 {})", tier),
            format!("Waystone (Tier {})", tier),
        ));
    }

    for tier in 1..=20 {
        pairs.push((
            format!("未切割寶石 (階級 {})", tier),
            format!("Uncut Gem (Tier {})", tier),
        ));
    }

    pairs
}

pub fn get_poe2_item_map() -> HashMap<String, String> {
    let mut map = HashMap::new();

    for (zh, en) in get_poe2_canonical_pairs() {
        map.insert(zh.clone(), en.clone());
        map.insert(en.clone(), en);
    }

    // Shorthand aliases for Waystones and Uncut Gems
    for tier in 1..=16 {
        let en_tier = format!("Waystone (Tier {})", tier);
        map.insert(format!("尋路石 T{}", tier), en_tier.clone());
        map.insert(format!("尋路石 (T{})", tier), en_tier);
    }

    for tier in 1..=20 {
        let en_gem = format!("Uncut Gem (Tier {})", tier);
        map.insert(format!("未切割寶石 T{}", tier), en_gem);
    }

    map
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_poe2_item_map_lookups() {
        let map = get_poe2_item_map();
        assert_eq!(map.get("尋路石"), Some(&"Waystone".to_string()));
        assert_eq!(
            map.get("未切割技能寶石"),
            Some(&"Uncut Skill Gem".to_string())
        );
        assert_eq!(
            map.get("尋路石 (階級 15)"),
            Some(&"Waystone (Tier 15)".to_string())
        );
        assert_eq!(
            map.get("未切割寶石 (階級 19)"),
            Some(&"Uncut Gem (Tier 19)".to_string())
        );
        assert_eq!(map.get("太陽符文"), Some(&"Sun Rune".to_string()));
    }
}
