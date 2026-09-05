use crate::models::ninja::{NinjaBuildJewel, PricedItem};
use crate::services::build_calc::query_generator::generate_trade_search_query;

pub fn price_jewel_list(
    jewels: &[NinjaBuildJewel],
    league: &str,
    rates: &std::collections::HashMap<String, f64>,
    div_rate: f64,
) -> (Vec<PricedItem>, f64) {
    let mut jewel_items = Vec::new();
    let mut total = 0.0;

    for j in jewels {
        let eng_name = crate::services::dictionary::lookup_english_base_type(&j.name)
            .unwrap_or_else(|| j.name.clone());
        let eng_type = crate::services::dictionary::lookup_english_base_type(&j.type_line)
            .unwrap_or_else(|| j.type_line.clone());
        let p = if j.rarity.eq_ignore_ascii_case("unique") {
            rates
                .get(&eng_name)
                .or_else(|| rates.get(&eng_type))
                .copied()
                .unwrap_or(35.0)
        } else {
            50.0
        };

        let p_div = (p / div_rate * 100.0).round() / 100.0;
        total += p;

        let (search_url, query_json) = generate_trade_search_query(
            league,
            &eng_name,
            &eng_type,
            &j.rarity,
            "Jewel",
            None,
            &j.explicit_mods,
            &j.implicit_mods,
            &j.crafted_mods,
            &j.fractured_mods,
            &[],
            None,
            None,
            None,
            None,
            None,
            None,
        );

        let display_name = if !j.name.is_empty() && j.name != j.type_line {
            format!("{} ({})", j.name, j.type_line)
        } else {
            j.type_line.clone()
        };
        jewel_items.push(PricedItem {
            name: display_name,
            type_line: j.type_line.clone(),
            category: "jewel".to_string(),
            rarity: j.rarity.clone(),
            icon: j.icon.clone(),
            slot: None,
            price_chaos: p,
            price_divine: p_div,
            confidence: "medium".to_string(),
            details: Some("珠寶即時物價估算".to_string()),
            trade_search_url: search_url,
            trade_query_json: Some(query_json),
            ilvl: None,
            corrupted: None,
            sockets: None,
            explicit_mods: if j.explicit_mods.is_empty() {
                None
            } else {
                Some(j.explicit_mods.clone())
            },
            implicit_mods: if j.implicit_mods.is_empty() {
                None
            } else {
                Some(j.implicit_mods.clone())
            },
            crafted_mods: if j.crafted_mods.is_empty() {
                None
            } else {
                Some(j.crafted_mods.clone())
            },
            fractured_mods: if j.fractured_mods.is_empty() {
                None
            } else {
                Some(j.fractured_mods.clone())
            },
            enchant_mods: None,
            gem_level: None,
            gem_quality: None,
            property_energy_shield: None,
            property_armour: None,
            property_evasion: None,
        });
    }

    (jewel_items, total)
}
