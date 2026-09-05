use crate::models::ninja::{NinjaBuildFlask, PricedItem};
use crate::services::build_calc::query_generator::generate_trade_search_query;

pub fn price_flask_list(
    flasks: &[NinjaBuildFlask],
    league: &str,
    rates: &std::collections::HashMap<String, f64>,
    div_rate: f64,
) -> (Vec<PricedItem>, f64) {
    let mut flask_items = Vec::new();
    let mut total = 0.0;

    for f in flasks {
        let eng_name = crate::services::dictionary::lookup_english_base_type(&f.name)
            .unwrap_or_else(|| f.name.clone());
        let eng_type = crate::services::dictionary::lookup_english_base_type(&f.type_line)
            .unwrap_or_else(|| f.type_line.clone());
        let p = if f.rarity.eq_ignore_ascii_case("unique") {
            rates
                .get(&eng_name)
                .or_else(|| rates.get(&eng_type))
                .copied()
                .unwrap_or(30.0)
        } else {
            25.0
        };

        let p_div = (p / div_rate * 100.0).round() / 100.0;
        total += p;

        let (search_url, query_json) = generate_trade_search_query(
            league,
            &eng_name,
            &eng_type,
            &f.rarity,
            "Flask",
            None,
            &f.explicit_mods,
            &[],
            &[],
            &[],
            &f.enchant_mods,
            None,
            None,
            None,
            None,
            None,
            None,
        );

        let mut all_explicits = f.explicit_mods.clone();
        all_explicits.extend(f.utility_mods.clone());

        let display_name = if !f.name.is_empty() && f.name != f.type_line {
            format!("{} ({})", f.name, f.type_line)
        } else {
            f.type_line.clone()
        };
        flask_items.push(PricedItem {
            name: display_name,
            type_line: f.type_line.clone(),
            category: "flask".to_string(),
            rarity: f.rarity.clone(),
            icon: f.icon.clone(),
            slot: None,
            price_chaos: p,
            price_divine: p_div,
            confidence: "medium".to_string(),
            details: Some("藥劑參考行情".to_string()),
            trade_search_url: search_url,
            trade_query_json: Some(query_json),
            ilvl: None,
            corrupted: None,
            sockets: None,
            explicit_mods: if all_explicits.is_empty() {
                None
            } else {
                Some(all_explicits)
            },
            implicit_mods: None,
            crafted_mods: None,
            fractured_mods: None,
            enchant_mods: if f.enchant_mods.is_empty() {
                None
            } else {
                Some(f.enchant_mods.clone())
            },
            gem_level: None,
            gem_quality: None,
            property_energy_shield: None,
            property_armour: None,
            property_evasion: None,
        });
    }

    (flask_items, total)
}
