use crate::models::ninja::{NinjaBuildGem, PricedItem};
use crate::services::build_calc::query_generator::generate_trade_search_query;

pub fn price_gem_list(
    gems: &[NinjaBuildGem],
    league: &str,
    rates: &std::collections::HashMap<String, f64>,
    div_rate: f64,
) -> (Vec<PricedItem>, f64) {
    let mut gem_items = Vec::new();
    let mut total = 0.0;

    for g in gems {
        let eng_gem_name = crate::services::dictionary::lookup_english_base_type(&g.name)
            .unwrap_or_else(|| g.name.clone());
        let p = if let Some(&val) = rates.get(&eng_gem_name).or_else(|| rates.get(&g.name)) {
            val
        } else if g.is_awakened {
            350.0
        } else if g.is_vaal {
            15.0
        } else if g.level >= 21 {
            40.0
        } else {
            5.0
        };

        let p_div = (p / div_rate * 100.0).round() / 100.0;
        total += p;

        let (search_url, query_json) = generate_trade_search_query(
            league,
            "",
            &eng_gem_name,
            "Gem",
            "Gem",
            None,
            &[],
            &[],
            &[],
            &[],
            &[],
            None,
            None,
            None,
            Some(g.level),
            Some(g.quality),
            Some(g.is_vaal),
        );

        gem_items.push(PricedItem {
            name: format!("{} (Lv.{}/{})", g.name, g.level, g.quality),
            type_line: g.name.clone(),
            category: "gem".to_string(),
            rarity: "Gem".to_string(),
            icon: if !g.icon.is_empty() {
                g.icon.clone()
            } else {
                "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvR2Vtcy9TdXBwb3J0R2Vtcy9TaGFyZWQiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/c6a666e5d8/Shared.png".to_string()
            },
            slot: if !g.socketed_in.is_empty() {
                Some(g.socketed_in.clone())
            } else {
                None
            },
            price_chaos: p,
            price_divine: p_div,
            confidence: "high".to_string(),
            details: Some("技能寶石行情".to_string()),
            trade_search_url: search_url,
            trade_query_json: Some(query_json),
            ilvl: None,
            corrupted: if g.is_vaal { Some(true) } else { None },
            sockets: None,
            explicit_mods: None,
            implicit_mods: None,
            crafted_mods: None,
            fractured_mods: None,
            enchant_mods: None,
            gem_level: Some(g.level),
            gem_quality: Some(g.quality),
            property_energy_shield: None,
            property_armour: None,
            property_evasion: None,
        });
    }

    (gem_items, total)
}
