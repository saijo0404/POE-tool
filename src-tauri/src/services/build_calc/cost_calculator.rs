use crate::models::ninja::{
    BuildCategories, BuildCategoryTotal, BuildCharacterMeta, BuildCostResult,
    NinjaBuildData, NinjaPricesResult, PricedItem
};
use super::query_generator::generate_trade_search_query;
use super::category_pricer::{price_flask_list, price_gem_list, price_jewel_list};

pub async fn calculate_build_cost(build_data: NinjaBuildData) -> Result<BuildCostResult, String> {
    crate::app_log!("[BuildCalc] 📊 開始計算 Build 成本: 角色='{}', 聯盟='{}', 等級={}, 職業='{}'",
        build_data.character_name, build_data.league, build_data.level, build_data.class_name);
    crate::app_log!("[BuildCalc] 📦 角色物品清單: 裝備共 {} 件, 珠寶 {} 顆, 藥劑 {} 瓶, 技能寶石 {} 顆",
        build_data.equipment.len(), build_data.jewels.len(), build_data.flasks.len(), build_data.gems.len());

    let ninja_data = crate::services::ninja::fetch_ninja_prices(&build_data.league, false).await.unwrap_or_else(|_| {
        NinjaPricesResult {
            rates: crate::services::ninja::get_accurate_bulk_rates(),
            divine_chaos_rate: 150.0,
            league: build_data.league.clone(),
        }
    });

    let div_rate = ninja_data.divine_chaos_rate;
    let (eq_items, eq_chaos) = price_equipment_list(&build_data.equipment, &build_data.league, &ninja_data.rates, div_rate);
    let (jewel_items, jewel_chaos) = price_jewel_list(&build_data.jewels, &build_data.league, &ninja_data.rates, div_rate);
    let (flask_items, flask_chaos) = price_flask_list(&build_data.flasks, &build_data.league, &ninja_data.rates, div_rate);
    let (gem_items, gem_chaos) = price_gem_list(&build_data.gems, &build_data.league, &ninja_data.rates, div_rate);

    let total_chaos = ((eq_chaos + jewel_chaos + flask_chaos + gem_chaos) * 100.0).round() / 100.0;
    let total_divine = (total_chaos / div_rate * 100.0).round() / 100.0;

    crate::app_log!("[BuildCalc] 🎯 造價計算完成: 總計 {} Divine ({} Chaos), 匯率基準: 1 div = {} c",
        total_divine, total_chaos, div_rate);

    Ok(BuildCostResult {
        character: BuildCharacterMeta {
            account: build_data.account, name: build_data.character_name, league: build_data.league,
            level: build_data.level, class: build_data.class_name, ascendancy: build_data.ascendancy,
        },
        total_chaos, total_divine, divine_chaos_rate: div_rate,
        categories: BuildCategories {
            equipment: BuildCategoryTotal { items: eq_items, total_chaos: (eq_chaos * 100.0).round() / 100.0, total_divine: (eq_chaos / div_rate * 100.0).round() / 100.0 },
            gems: BuildCategoryTotal { items: gem_items, total_chaos: (gem_chaos * 100.0).round() / 100.0, total_divine: (gem_chaos / div_rate * 100.0).round() / 100.0 },
            flasks: BuildCategoryTotal { items: flask_items, total_chaos: (flask_chaos * 100.0).round() / 100.0, total_divine: (flask_chaos / div_rate * 100.0).round() / 100.0 },
            jewels: BuildCategoryTotal { items: jewel_items, total_chaos: (jewel_chaos * 100.0).round() / 100.0, total_divine: (jewel_chaos / div_rate * 100.0).round() / 100.0 },
        },
    })
}

fn price_equipment_list(
    items: &[crate::models::ninja::NinjaBuildItem],
    league: &str,
    rates: &std::collections::HashMap<String, f64>,
    div_rate: f64
) -> (Vec<PricedItem>, f64) {
    let mut eq_items = Vec::new();
    let mut total = 0.0;

    for it in items {
        let eng_name = crate::services::dictionary::lookup_english_base_type(&it.name).unwrap_or_else(|| it.name.clone());
        let eng_type = crate::services::dictionary::lookup_english_base_type(&it.type_line).unwrap_or_else(|| it.type_line.clone());
        let (price_chaos, conf, details) = evaluate_equipment_price(it, &eng_name, &eng_type, rates, div_rate);

        let price_div = (price_chaos / div_rate * 100.0).round() / 100.0;
        total += price_chaos;

        let (search_url, query_json) = generate_trade_search_query(
            league, &eng_name, &eng_type, &it.rarity, &it.slot, it.links,
            &it.explicit_mods, &it.implicit_mods, &it.crafted_mods, &it.fractured_mods, &it.enchant_mods,
            it.property_energy_shield, it.property_armour, it.property_evasion, None, None, None,
        );

        let display_name = if !it.name.is_empty() && it.name != it.type_line { format!("{} ({})", it.name, it.type_line) } else { it.type_line.clone() };
        crate::app_log!("[BuildCalc] 🛡️ 裝備 [{}] name='{}' (基底: '{}' -> '{}'), 稀有度={}, 行情估算: {} Chaos ({})",
            it.slot, it.name, it.type_line, eng_type, it.rarity, price_chaos, conf);

        eq_items.push(PricedItem {
            name: display_name, type_line: it.type_line.clone(), category: "equipment".to_string(),
            rarity: it.rarity.clone(), icon: it.icon.clone(), slot: Some(it.slot.clone()),
            price_chaos, price_divine: price_div, confidence: conf.to_string(), details: Some(details),
            trade_search_url: search_url, trade_query_json: Some(query_json),
        });
    }

    (eq_items, total)
}

fn evaluate_equipment_price(
    it: &crate::models::ninja::NinjaBuildItem,
    eng_name: &str,
    eng_type: &str,
    rates: &std::collections::HashMap<String, f64>,
    div_rate: f64
) -> (f64, &'static str, String) {
    if it.rarity.eq_ignore_ascii_case("unique") {
        let is_6l = it.links.unwrap_or(0) >= 6;
        let mut p_opt = None;
        if is_6l {
            p_opt = rates.get(&format!("{}:6L", eng_name)).copied()
                .or_else(|| rates.get(&format!("{}:6L", it.name)).copied());
        }
        if p_opt.is_none() {
            p_opt = rates.get(eng_name).copied()
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
        if es_val >= 900.0 { estimated_div += 15.0; } else if es_val >= 700.0 { estimated_div += 6.0; }
        if it.links.unwrap_or(0) >= 6 { estimated_div += 2.0; }
        let calc_chaos = (estimated_div * div_rate).round();
        (calc_chaos, "medium", "黃裝詞綴市場估算價".to_string())
    }
}
