use super::snapshot_manager::set_stash_progress;
use super::stash_api::{fetch_character_items_raw, fetch_stash_tabs_meta, fetch_tab_items_raw};
use super::valuation::parse_stash_item;
use crate::models::settings::AppSettings;
use crate::models::stash::{StashItem, StashProgress};
use serde_json::Value;
use std::collections::HashMap;

pub async fn collect_inventory_items(
    all_items: &mut Vec<StashItem>,
    settings: &AppSettings,
    target_league: &str,
    characters: &[Value],
    rates: &HashMap<String, f64>,
    div_rate: f64,
) {
    let char_opt = characters
        .iter()
        .find(|c| c["league"].as_str() == Some(target_league))
        .or_else(|| characters.first());
    if let Some(char_obj) = char_opt {
        if let Some(c_name) = char_obj["name"].as_str() {
            set_stash_progress(StashProgress {
                active: true,
                current_tab: 0,
                total_tabs: 10,
                current_tab_name: format!("角色: {}", c_name),
                stage: "inventory".to_string(),
            });
            let items =
                fetch_character_items_raw(settings.account_name.trim(), c_name, settings).await;
            for it in &items {
                if let Some(stash_it) =
                    parse_stash_item(it, &format!("角色裝備與身上 ({})", c_name), rates, div_rate)
                {
                    all_items.push(stash_it);
                }
            }
        }
    }
}

pub async fn collect_stash_tab_items(
    all_items: &mut Vec<StashItem>,
    settings: &AppSettings,
    target_league: &str,
    rates: &HashMap<String, f64>,
    div_rate: f64,
) {
    let tabs_meta = fetch_stash_tabs_meta(Some(target_league))
        .await
        .unwrap_or_default();
    let max_tabs = settings.max_stash_tabs.unwrap_or(60);
    let selected_tabs = settings.selected_stash_tabs.clone();

    let tabs_to_fetch: Vec<&crate::models::stash::StashTabMeta> = tabs_meta
        .iter()
        .take(max_tabs)
        .filter(|t| {
            if let Some(ref sel) = selected_tabs {
                sel.contains(&t.i)
            } else {
                true
            }
        })
        .collect();

    let total_tabs = tabs_to_fetch.len();
    for (processed, tab) in tabs_to_fetch.iter().enumerate() {
        set_stash_progress(StashProgress {
            active: true,
            current_tab: processed + 1,
            total_tabs,
            current_tab_name: tab.n.clone(),
            stage: "tabs".to_string(),
        });
        let items =
            fetch_tab_items_raw(settings.account_name.trim(), target_league, tab.i, settings).await;
        for it in &items {
            if let Some(stash_it) =
                parse_stash_item(it, &format!("倉庫: {}", tab.n), rates, div_rate)
            {
                all_items.push(stash_it);
            }
        }
    }
}
