use crate::models::ninja::{NinjaPriceMap, NinjaPricesResult};
use lazy_static::lazy_static;
use std::collections::HashMap;
use std::sync::RwLock;

lazy_static! {
    static ref NINJA_CACHE: RwLock<HashMap<String, (NinjaPriceMap, f64, u64)>> =
        RwLock::new(HashMap::new());
}

pub fn now_secs() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

pub fn resolve_active_league(league: &str) -> String {
    if !league.is_empty() && league != "Auto" {
        return league.to_string();
    }
    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        crate::models::settings::AppSettings::default(),
    );
    if !settings.league.is_empty() && settings.league != "Auto" {
        settings.league
    } else {
        "Settlers".to_string()
    }
}

pub fn get_cached_divine_rate(league: &str) -> f64 {
    let active_league = resolve_active_league(league);
    if let Ok(guard) = NINJA_CACHE.read() {
        if let Some((_, rate, _)) = guard.get(&active_league) {
            if *rate > 0.0 {
                return *rate;
            }
        }
        if let Some((_, rate, _)) = guard.get("Standard") {
            if *rate > 0.0 {
                return *rate;
            }
        }
    }
    150.0
}

pub fn get_valid_cached_prices(active_league: &str) -> Option<NinjaPricesResult> {
    let guard = NINJA_CACHE.read().ok()?;
    let (rates, div_rate, ts) = guard.get(active_league)?;
    if now_secs() - ts < 1800 {
        Some(NinjaPricesResult {
            rates: rates.clone(),
            divine_chaos_rate: *div_rate,
            league: active_league.to_string(),
        })
    } else {
        None
    }
}

pub fn store_cached_prices(active_league: &str, rates: NinjaPriceMap, divine_chaos_rate: f64) {
    if let Ok(mut guard) = NINJA_CACHE.write() {
        guard.insert(
            active_league.to_string(),
            (rates, divine_chaos_rate, now_secs()),
        );
    }
}
