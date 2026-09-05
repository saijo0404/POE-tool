use super::item_classifier::{categorize_item, clean_tag};
use super::price_lookup::lookup_unit_chaos;
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
