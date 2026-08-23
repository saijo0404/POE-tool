use crate::models::ninja::{NinjaBuildFlask, NinjaBuildGem, NinjaBuildJewel, PricedItem};
use super::query_generator::generate_trade_search_query;

pub fn price_jewel_list(
    jewels: &[NinjaBuildJewel],
    league: &str,
    rates: &std::collections::HashMap<String, f64>,
    div_rate: f64
) -> (Vec<PricedItem>, f64) {
    let mut jewel_items = Vec::new();
    let mut total = 0.0;

    for j in jewels {
        let eng_name = crate::services::dictionary::lookup_english_base_type(&j.name).unwrap_or_else(|| j.name.clone());
        let eng_type = crate::services::dictionary::lookup_english_base_type(&j.type_line).unwrap_or_else(|| j.type_line.clone());
        let p = if j.rarity.eq_ignore_ascii_case("unique") {
            rates.get(&eng_name).or_else(|| rates.get(&eng_type)).copied().unwrap_or(35.0)
        } else {
            50.0
        };

        let p_div = (p / div_rate * 100.0).round() / 100.0;
        total += p;

        let (search_url, query_json) = generate_trade_search_query(
            league, &eng_name, &eng_type, &j.rarity, "Jewel", None,
            &j.explicit_mods, &j.implicit_mods, &j.crafted_mods, &j.fractured_mods, &[], None, None, None, None, None, None,
        );

        let display_name = if !j.name.is_empty() && j.name != j.type_line { format!("{} ({})", j.name, j.type_line) } else { j.type_line.clone() };
        jewel_items.push(PricedItem {
            name: display_name, type_line: j.type_line.clone(), category: "jewel".to_string(),
            rarity: j.rarity.clone(), icon: j.icon.clone(), slot: None,
            price_chaos: p, price_divine: p_div, confidence: "medium".to_string(),
            details: Some("珠寶即時物價估算".to_string()), trade_search_url: search_url, trade_query_json: Some(query_json),
            ilvl: None, corrupted: None, sockets: None,
            explicit_mods: if j.explicit_mods.is_empty() { None } else { Some(j.explicit_mods.clone()) },
            implicit_mods: if j.implicit_mods.is_empty() { None } else { Some(j.implicit_mods.clone()) },
            crafted_mods: if j.crafted_mods.is_empty() { None } else { Some(j.crafted_mods.clone()) },
            fractured_mods: if j.fractured_mods.is_empty() { None } else { Some(j.fractured_mods.clone()) },
            enchant_mods: None,
            gem_level: None, gem_quality: None,
            property_energy_shield: None, property_armour: None, property_evasion: None,
        });
    }

    (jewel_items, total)
}

pub fn price_flask_list(
    flasks: &[NinjaBuildFlask],
    league: &str,
    rates: &std::collections::HashMap<String, f64>,
    div_rate: f64
) -> (Vec<PricedItem>, f64) {
    let mut flask_items = Vec::new();
    let mut total = 0.0;

    for f in flasks {
        let eng_name = crate::services::dictionary::lookup_english_base_type(&f.name).unwrap_or_else(|| f.name.clone());
        let eng_type = crate::services::dictionary::lookup_english_base_type(&f.type_line).unwrap_or_else(|| f.type_line.clone());
        let p = if f.rarity.eq_ignore_ascii_case("unique") {
            rates.get(&eng_name).or_else(|| rates.get(&eng_type)).copied().unwrap_or(30.0)
        } else {
            25.0
        };

        let p_div = (p / div_rate * 100.0).round() / 100.0;
        total += p;

        let (search_url, query_json) = generate_trade_search_query(
            league, &eng_name, &eng_type, &f.rarity, "Flask", None,
            &f.explicit_mods, &[], &[], &[], &f.enchant_mods, None, None, None, None, None, None,
        );

        let mut all_explicits = f.explicit_mods.clone();
        all_explicits.extend(f.utility_mods.clone());

        let display_name = if !f.name.is_empty() && f.name != f.type_line { format!("{} ({})", f.name, f.type_line) } else { f.type_line.clone() };
        flask_items.push(PricedItem {
            name: display_name, type_line: f.type_line.clone(), category: "flask".to_string(),
            rarity: f.rarity.clone(), icon: f.icon.clone(), slot: None,
            price_chaos: p, price_divine: p_div, confidence: "medium".to_string(),
            details: Some("藥劑參考行情".to_string()), trade_search_url: search_url, trade_query_json: Some(query_json),
            ilvl: None, corrupted: None, sockets: None,
            explicit_mods: if all_explicits.is_empty() { None } else { Some(all_explicits) },
            implicit_mods: None,
            crafted_mods: None,
            fractured_mods: None,
            enchant_mods: if f.enchant_mods.is_empty() { None } else { Some(f.enchant_mods.clone()) },
            gem_level: None, gem_quality: None,
            property_energy_shield: None, property_armour: None, property_evasion: None,
        });
    }

    (flask_items, total)
}

pub fn price_gem_list(
    gems: &[NinjaBuildGem],
    league: &str,
    rates: &std::collections::HashMap<String, f64>,
    div_rate: f64
) -> (Vec<PricedItem>, f64) {
    let mut gem_items = Vec::new();
    let mut total = 0.0;

    for g in gems {
        let eng_gem_name = crate::services::dictionary::lookup_english_base_type(&g.name).unwrap_or_else(|| g.name.clone());
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
            league, "", &eng_gem_name, "Gem", "Gem", None,
            &[], &[], &[], &[], &[], None, None, None, Some(g.level), Some(g.quality), Some(g.is_vaal),
        );

        gem_items.push(PricedItem {
            name: format!("{} (Lv.{}/{})", g.name, g.level, g.quality), type_line: g.name.clone(),
            category: "gem".to_string(), rarity: "Gem".to_string(),
            icon: if !g.icon.is_empty() { g.icon.clone() } else { "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvR2Vtcy9TdXBwb3J0R2Vtcy9TaGFyZWQiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/c6a666e5d8/Shared.png".to_string() },
            slot: if !g.socketed_in.is_empty() { Some(g.socketed_in.clone()) } else { None },
            price_chaos: p, price_divine: p_div, confidence: "high".to_string(),
            details: Some("技能寶石行情".to_string()), trade_search_url: search_url, trade_query_json: Some(query_json),
            ilvl: None, corrupted: if g.is_vaal { Some(true) } else { None }, sockets: None,
            explicit_mods: None, implicit_mods: None, crafted_mods: None, fractured_mods: None, enchant_mods: None,
            gem_level: Some(g.level), gem_quality: Some(g.quality),
            property_energy_shield: None, property_armour: None, property_evasion: None,
        });
    }

    (gem_items, total)
}
