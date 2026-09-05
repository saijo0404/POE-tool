use crate::models::ninja::{NinjaBuildItem, PricedItem};
use crate::services::build_calc::query_generator::generate_trade_search_query;

pub fn price_equipment_list(
    items: &[NinjaBuildItem],
    league: &str,
    rates: &std::collections::HashMap<String, f64>,
    div_rate: f64,
) -> (Vec<PricedItem>, f64) {
    let mut eq_items = Vec::new();
    let mut total = 0.0;

    for it in items {
        let eng_name = crate::services::dictionary::lookup_english_base_type(&it.name)
            .unwrap_or_else(|| it.name.clone());
        let eng_type = crate::services::dictionary::lookup_english_base_type(&it.type_line)
            .unwrap_or_else(|| it.type_line.clone());
        let (price_chaos, conf, details) =
            evaluate_equipment_price(it, &eng_name, &eng_type, rates, div_rate);

        let price_div = (price_chaos / div_rate * 100.0).round() / 100.0;
        total += price_chaos;

        let (search_url, query_json) = generate_trade_search_query(
            league,
            &eng_name,
            &eng_type,
            &it.rarity,
            &it.slot,
            it.links,
            &it.explicit_mods,
            &it.implicit_mods,
            &it.crafted_mods,
            &it.fractured_mods,
            &it.enchant_mods,
            it.property_energy_shield,
            it.property_armour,
            it.property_evasion,
            None,
            None,
            None,
        );

        let display_name = if !it.name.is_empty() && it.name != it.type_line {
            format!("{} ({})", it.name, it.type_line)
        } else {
            it.type_line.clone()
        };
        crate::app_log!("[BuildCalc] 🛡️ 裝備 [{}] name='{}' (基底: '{}' -> '{}'), 稀有度={}, 行情估算: {} Chaos ({})",
            it.slot, it.name, it.type_line, eng_type, it.rarity, price_chaos, conf);

        eq_items.push(PricedItem {
            name: display_name,
            type_line: it.type_line.clone(),
            category: "equipment".to_string(),
            rarity: it.rarity.clone(),
            icon: it.icon.clone(),
            slot: Some(it.slot.clone()),
            price_chaos,
            price_divine: price_div,
            confidence: conf.to_string(),
            details: Some(details),
            trade_search_url: search_url,
            trade_query_json: Some(query_json),
            ilvl: Some(it.ilvl),
            corrupted: if it.corrupted { Some(true) } else { None },
            sockets: it.links.map(|l| format!("{}L", l)),
            explicit_mods: if it.explicit_mods.is_empty() {
                None
            } else {
                Some(it.explicit_mods.clone())
            },
            implicit_mods: if it.implicit_mods.is_empty() {
                None
            } else {
                Some(it.implicit_mods.clone())
            },
            crafted_mods: if it.crafted_mods.is_empty() {
                None
            } else {
                Some(it.crafted_mods.clone())
            },
            fractured_mods: if it.fractured_mods.is_empty() {
                None
            } else {
                Some(it.fractured_mods.clone())
            },
            enchant_mods: if it.enchant_mods.is_empty() {
                None
            } else {
                Some(it.enchant_mods.clone())
            },
            gem_level: None,
            gem_quality: None,
            property_energy_shield: it.property_energy_shield,
            property_armour: it.property_armour,
            property_evasion: it.property_evasion,
        });
    }

    (eq_items, total)
}

fn evaluate_equipment_price(
    it: &NinjaBuildItem,
    eng_name: &str,
    eng_type: &str,
    rates: &std::collections::HashMap<String, f64>,
    div_rate: f64,
) -> (f64, &'static str, String) {
    if it.rarity.eq_ignore_ascii_case("unique") {
        let is_6l = it.links.unwrap_or(0) >= 6;
        let mut p_opt = None;
        if is_6l {
            p_opt = rates
                .get(&format!("{}:6L", eng_name))
                .copied()
                .or_else(|| rates.get(&format!("{}:6L", it.name)).copied());
        }
        if p_opt.is_none() {
            p_opt = rates
                .get(eng_name)
                .copied()
                .or_else(|| rates.get(eng_type).copied())
                .or_else(|| rates.get(&it.name).copied());
        }

        if let Some(p) = p_opt {
            let p_final = if is_6l && !rates.contains_key(&format!("{}:6L", eng_name)) {
                p + (2.0 * div_rate)
            } else {
                p
            };
            (p_final, "high", "poe.ninja 傳奇即時行情".to_string())
        } else {
            (25.0, "medium", "傳奇裝備基礎估算價".to_string())
        }
    } else {
        let es_val = it.property_energy_shield.unwrap_or(0.0);
        let mut estimated_div = 0.5;
        if es_val >= 900.0 {
            estimated_div += 15.0;
        } else if es_val >= 700.0 {
            estimated_div += 6.0;
        }
        if it.links.unwrap_or(0) >= 6 {
            estimated_div += 2.0;
        }
        let calc_chaos = (estimated_div * div_rate).round();
        (calc_chaos, "medium", "黃裝詞綴市場估算價".to_string())
    }
}
