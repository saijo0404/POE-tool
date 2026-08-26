use super::stash_api::{
    fetch_character_items_raw, fetch_stash_tabs_meta, fetch_tab_items_raw, fetch_user_characters,
};
use super::valuation::{calculate_tab_summaries, parse_stash_item};
use crate::models::settings::AppSettings;
use crate::models::stash::{StashItem, StashProgress, WealthSnapshot};
use crate::services::storage::{get_data_dir, read_json_safe, write_json_atomic};
use lazy_static::lazy_static;
use std::sync::RwLock;

lazy_static! {
    static ref SNAPSHOTS: RwLock<Vec<WealthSnapshot>> = RwLock::new(Vec::new());
    static ref STASH_PROGRESS: RwLock<StashProgress> = RwLock::new(StashProgress::default());
}

pub fn init_stash_service() {
    let snapshot_file = get_data_dir().join("wealth_snapshots.json");
    let loaded: Vec<WealthSnapshot> = read_json_safe(&snapshot_file, Vec::new());
    if let Ok(mut guard) = SNAPSHOTS.write() {
        *guard = loaded;
    }
}

pub fn get_snapshots() -> Vec<WealthSnapshot> {
    SNAPSHOTS.read().map(|g| g.clone()).unwrap_or_default()
}

pub fn clear_snapshots() {
    if let Ok(mut guard) = SNAPSHOTS.write() {
        guard.clear();
        let file = get_data_dir().join("wealth_snapshots.json");
        let _ = write_json_atomic(&file, &*guard);
    }
}

pub fn get_stash_progress() -> StashProgress {
    STASH_PROGRESS.read().map(|g| g.clone()).unwrap_or_default()
}

fn set_stash_progress(p: StashProgress) {
    if let Ok(mut guard) = STASH_PROGRESS.write() {
        *guard = p;
    }
}

fn get_settings() -> AppSettings {
    let path = get_data_dir().join("settings.json");
    read_json_safe(&path, AppSettings::default())
}

pub async fn create_snapshot() -> Result<WealthSnapshot, String> {
    let settings = get_settings();
    let characters = fetch_user_characters().await.unwrap_or_default();
    let target_league = determine_target_league(&settings, &characters);

    let ninja_data = crate::services::ninja::fetch_ninja_prices(&target_league, false)
        .await
        .unwrap_or_else(|_| crate::models::ninja::NinjaPricesResult {
            rates: crate::services::ninja::get_accurate_bulk_rates(),
            divine_chaos_rate: 150.0,
            league: target_league.clone(),
        });

    let mut all_items: Vec<StashItem> = Vec::new();
    if !settings.poesessid.trim().is_empty() && !settings.account_name.trim().is_empty() {
        collect_inventory_items(
            &mut all_items,
            &settings,
            &target_league,
            &characters,
            &ninja_data.rates,
            ninja_data.divine_chaos_rate,
        )
        .await;
        collect_stash_tab_items(
            &mut all_items,
            &settings,
            &target_league,
            &ninja_data.rates,
            ninja_data.divine_chaos_rate,
        )
        .await;
    }
    set_stash_progress(StashProgress::default());

    let (total_chaos, total_divine, tab_summaries) =
        calculate_tab_summaries(&all_items, ninja_data.divine_chaos_rate);

    let mut top_items = all_items.clone();
    top_items.sort_by(|a, b| {
        b.total_price_chaos
            .partial_cmp(&a.total_price_chaos)
            .unwrap_or(std::cmp::Ordering::Equal)
    });
    top_items.truncate(20);

    let (hourly_chaos, hourly_divine) = calculate_hourly_changes(total_chaos, total_divine);

    let new_snapshot = WealthSnapshot {
        timestamp: chrono::Utc::now().to_rfc3339(),
        league: target_league,
        total_chaos,
        total_divine,
        chaos_rate: ninja_data.divine_chaos_rate,
        hourly_change_chaos: hourly_chaos,
        hourly_change_divine: hourly_divine,
        tab_summaries,
        top_items,
        all_items: Some(all_items),
    };

    save_snapshot_to_history(&new_snapshot);
    Ok(new_snapshot)
}

fn determine_target_league(settings: &AppSettings, characters: &[serde_json::Value]) -> String {
    if settings.league != "Auto" && !settings.league.is_empty() {
        return settings.league.clone();
    }
    characters
        .first()
        .and_then(|c| c["league"].as_str())
        .unwrap_or("Standard")
        .to_string()
}

async fn collect_inventory_items(
    all_items: &mut Vec<StashItem>,
    settings: &AppSettings,
    target_league: &str,
    characters: &[serde_json::Value],
    rates: &std::collections::HashMap<String, f64>,
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

async fn collect_stash_tab_items(
    all_items: &mut Vec<StashItem>,
    settings: &AppSettings,
    target_league: &str,
    rates: &std::collections::HashMap<String, f64>,
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

fn calculate_hourly_changes(total_chaos: f64, total_divine: f64) -> (Option<f64>, Option<f64>) {
    let prev = SNAPSHOTS.read().ok().and_then(|g| g.last().cloned());
    if let Some(p) = prev {
        (
            Some(((total_chaos - p.total_chaos) * 100.0).round() / 100.0),
            Some(((total_divine - p.total_divine) * 100.0).round() / 100.0),
        )
    } else {
        (None, None)
    }
}

fn save_snapshot_to_history(new_snapshot: &WealthSnapshot) {
    if let Ok(mut guard) = SNAPSHOTS.write() {
        guard.push(new_snapshot.clone());
        if guard.len() > 300 {
            let start = guard.len() - 300;
            *guard = guard[start..].to_vec();
        }
        let file = get_data_dir().join("wealth_snapshots.json");
        let _ = write_json_atomic(&file, &*guard);
    }
}
