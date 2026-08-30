use crate::models::stash::{StashItem, StashTabSummary};
use crate::services::dictionary::lookup_english_base_type;
use serde_json::Value;
use std::collections::HashMap;

pub fn parse_stash_item(
    it: &Value,
    tab_name: &str,
    rates: &HashMap<String, f64>,
    div_rate: f64,
) -> Option<StashItem> {
    let raw_type = it["typeLine"]
        .as_str()
        .or_else(|| it["name"].as_str())
        .unwrap_or("Item");
    let raw_name = it["name"].as_str().unwrap_or(raw_type);
    let stack_size = it["stackSize"].as_i64().unwrap_or(1);
    let icon = it["icon"].as_str().unwrap_or_default().to_string();

    let clean_type = clean_tag(raw_type);
    let clean_name = clean_tag(raw_name);

    let en_type = lookup_english_base_type(&clean_type).unwrap_or_else(|| clean_type.clone());
    let en_name = lookup_english_base_type(&clean_name).unwrap_or_else(|| clean_name.clone());

    let unit_chaos = lookup_unit_chaos(it, &clean_name, &clean_type, &en_name, &en_type, rates);
    let total_chaos = unit_chaos * (stack_size as f64);
    let effective_div_rate = if div_rate > 0.0 { div_rate } else { 150.0 };
    let unit_div = (unit_chaos / effective_div_rate * 100.0).round() / 100.0;
    let total_div = (total_chaos / effective_div_rate * 100.0).round() / 100.0;

    let category = categorize_item(it, &clean_type, &en_type);

    Some(StashItem {
        id: it["id"].as_str().unwrap_or_default().to_string(),
        name: clean_name,
        type_line: clean_type,
        icon,
        stack_size: Some(stack_size),
        tab_name: tab_name.to_string(),
        category: category.to_string(),
        unit_price_chaos: unit_chaos,
        total_price_chaos: total_chaos,
        unit_price_divine: unit_div,
        total_price_divine: total_div,
    })
}

fn clean_tag(raw: &str) -> String {
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

fn lookup_unit_chaos(
    it: &Value,
    clean_name: &str,
    clean_type: &str,
    en_name: &str,
    en_type: &str,
    rates: &HashMap<String, f64>,
) -> f64 {
    let is_six_link = it["sockets"]
        .as_array()
        .map(|s| s.len() >= 6)
        .unwrap_or(false);

    if is_six_link {
        if let Some(&price) = rates.get(&format!("{}:6L", en_name)) {
            return price;
        }
        if let Some(&price) = rates.get(&format!("{}:6L", en_type)) {
            return price;
        }
    }

    if let Some(&price) = rates.get(en_name) {
        return price;
    }
    if let Some(&price) = rates.get(en_type) {
        return price;
    }
    if let Some(&price) = rates.get(clean_name) {
        return price;
    }
    if let Some(&price) = rates.get(clean_type) {
        return price;
    }
    0.0
}

fn categorize_item(it: &Value, clean_type: &str, en_type: &str) -> &'static str {
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

fn is_map_item(it: &Value, clean_type: &str, en_type: &str) -> bool {
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

fn is_fragment_item(clean_type: &str, en_type: &str) -> bool {
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

fn is_currency_item(clean_type: &str, en_type: &str) -> bool {
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

pub fn calculate_tab_summaries(
    all_items: &[StashItem],
    div_rate: f64,
) -> (f64, f64, Vec<StashTabSummary>) {
    let mut tab_map: HashMap<String, (String, i64, f64)> = HashMap::new();
    let mut total_chaos = 0.0;

    for item in all_items {
        total_chaos += item.total_price_chaos;
        let entry = tab_map
            .entry(item.tab_name.clone())
            .or_insert_with(|| (item.category.clone(), 0, 0.0));
        entry.1 += item.stack_size.unwrap_or(1);
        entry.2 += item.total_price_chaos;
    }

    total_chaos = (total_chaos * 100.0).round() / 100.0;
    let effective_div_rate = if div_rate > 0.0 { div_rate } else { 150.0 };
    let total_divine = (total_chaos / effective_div_rate * 100.0).round() / 100.0;

    let mut tab_summaries: Vec<StashTabSummary> = tab_map
        .into_iter()
        .map(|(t_name, (cat, count, val_c))| {
            let chaos_val = (val_c * 100.0).round() / 100.0;
            let div_val = ((val_c / effective_div_rate) * 100.0).round() / 100.0;
            StashTabSummary {
                tab_name: t_name,
                category: Some(cat),
                total_chaos: Some(chaos_val),
                total_divine: Some(div_val),
                total_value_chaos: chaos_val,
                total_value_divine: div_val,
                item_count: count,
            }
        })
        .collect();
    tab_summaries.sort_by(|a, b| {
        b.total_value_chaos
            .partial_cmp(&a.total_value_chaos)
            .unwrap_or(std::cmp::Ordering::Equal)
    });

    (total_chaos, total_divine, tab_summaries)
}
