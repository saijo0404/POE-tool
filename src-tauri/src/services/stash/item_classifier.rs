use serde_json::Value;

pub fn clean_tag(raw: &str) -> String {
    let mut cleaned = String::with_capacity(raw.len());
    let mut depth = 0;
    for ch in raw.chars() {
        match ch {
            '<' => depth += 1,
            '>' => {
                if depth > 0 {
                    depth -= 1;
                }
            }
            _ => {
                if depth == 0 {
                    cleaned.push(ch);
                }
            }
        }
    }
    cleaned.trim().to_string()
}

pub fn categorize_item(it: &Value, clean_type: &str, en_type: &str) -> &'static str {
    let frame_type = it["frameType"].as_i64();

    if frame_type == Some(6)
        || en_type.contains("Card")
        || clean_type.contains("命運卡")
        || clean_type.contains("卡片")
    {
        return "DivCard";
    }

    if en_type.contains("Scarab") || clean_type.contains("聖甲蟲") || clean_type.contains("甲蟲")
    {
        return "Scarab";
    }

    if en_type.contains("Essence")
        || en_type.contains("Remnant of")
        || clean_type.contains("精髓")
        || clean_type.contains("精華")
        || clean_type.contains("遺存")
    {
        return "Essence";
    }

    if frame_type == Some(8) || is_map_item(it, clean_type, en_type) {
        return "Map";
    }

    if frame_type == Some(5) {
        return "Currency";
    }

    if is_fragment_item(clean_type, en_type) {
        return "Fragment";
    }

    if is_currency_item(clean_type, en_type) {
        return "Currency";
    }

    "Equipment"
}

pub fn is_map_item(it: &Value, clean_type: &str, en_type: &str) -> bool {
    en_type.contains("Map")
        || en_type.contains("Waystone")
        || clean_type.contains("地圖")
        || clean_type.contains("路標石")
        || it
            .get("properties")
            .and_then(|p| p.as_array())
            .map(|props| {
                props.iter().any(|p| {
                    p["name"].as_str().is_some_and(|n| {
                        n.contains("Map Tier") || n.contains("地圖階級") || n.contains("階級")
                    })
                })
            })
            .unwrap_or(false)
}

pub fn is_fragment_item(clean_type: &str, en_type: &str) -> bool {
    en_type.contains("Fragment")
        || en_type.contains("Key")
        || en_type.contains("Simulacrum")
        || en_type.contains("Splinter")
        || en_type.contains("Emblem")
        || en_type.contains("Sacrifice at")
        || en_type.contains("Mortal")
        || en_type.contains("Writ")
        || en_type.contains("Vessel")
        || en_type.contains("Breachstone")
        || en_type.contains("Invitation")
        || clean_type.contains("碎片")
        || clean_type.contains("血器")
        || clean_type.contains("奉獻")
        || clean_type.contains("裂痕石")
        || clean_type.contains("軍團印記")
        || clean_type.contains("虛空之鑰")
        || clean_type.contains("邀請函")
        || clean_type.contains("祭品")
        || clean_type.contains("幻象異界")
}

pub fn is_currency_item(clean_type: &str, en_type: &str) -> bool {
    en_type.contains("Orb")
        || en_type.contains("Chisel")
        || en_type.contains("Mirror")
        || en_type.contains("Scroll")
        || en_type.contains("Bauble")
        || en_type.contains("Prism")
        || en_type.contains("Whetstone")
        || en_type.contains("Scrap")
        || en_type.contains("Catalyst")
        || en_type.contains("Oil")
        || en_type.contains("Fossil")
        || en_type.contains("Resonator")
        || en_type.contains("Lifeforce")
        || en_type.contains("Tattoo")
        || en_type.contains("Omen")
        || en_type.contains("Sextant")
        || en_type.contains("Shard")
        || en_type.contains("Lock")
        || clean_type.contains("石")
        || clean_type.contains("寶珠")
        || clean_type.contains("製圖釘")
        || clean_type.contains("釘")
        || clean_type.contains("魔鏡")
        || clean_type.contains("卷軸")
        || clean_type.contains("彈珠")
        || clean_type.contains("稜鏡")
        || clean_type.contains("磨刀石")
        || clean_type.contains("護甲片")
        || clean_type.contains("催化劑")
        || clean_type.contains("聖油")
        || clean_type.contains("化石")
        || clean_type.contains("鑄新儀")
        || clean_type.contains("命力")
        || clean_type.contains("文身")
        || clean_type.contains("預兆")
        || clean_type.contains("六分儀")
        || clean_type.contains("卡蘭德")
}
