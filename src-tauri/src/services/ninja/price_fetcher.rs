use super::bulk_rates::get_accurate_bulk_rates;
use super::ninja_api::{fetch_exchange_overview, fetch_item_overview};
use super::official_exchange::fetch_ggg_live_divine_rate;
use crate::models::ninja::{NinjaPriceMap, NinjaPricesResult};
use lazy_static::lazy_static;
use std::collections::HashMap;
use std::sync::RwLock;

pub const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

lazy_static! {
    static ref NINJA_CACHE: RwLock<HashMap<String, (NinjaPriceMap, f64, u64)>> =
        RwLock::new(HashMap::new());
}

fn now_secs() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
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

pub async fn fetch_ninja_prices(
    league: &str,
    force_refresh: bool,
) -> Result<NinjaPricesResult, String> {
    let active_league = resolve_active_league(league);

    if !force_refresh {
        if let Ok(guard) = NINJA_CACHE.read() {
            if let Some((rates, div_rate, ts)) = guard.get(&active_league) {
                if now_secs() - ts < 1800 {
                    return Ok(NinjaPricesResult {
                        rates: rates.clone(),
                        divine_chaos_rate: *div_rate,
                        league: active_league,
                    });
                }
            }
        }
    }

    let mut rates = get_accurate_bulk_rates();
    let mut divine_chaos_rate = 150.0;
    let mut has_live_rate = false;

    let client = reqwest::Client::builder()
        .user_agent(DEFAULT_USER_AGENT)
        .timeout(std::time::Duration::from_secs(15))
        .build()
        .map_err(|e| e.to_string())?;

    crate::app_log!(
        "[GGG Exchange] 🔍 正在查詢聯盟 '{}' 官方即時貨幣交易所神聖石匯率...",
        active_league
    );
    if let Some(live_rate) = fetch_ggg_live_divine_rate(&client, &active_league).await {
        divine_chaos_rate = (live_rate * 100.0).round() / 100.0;
        rates.insert("Divine Orb".to_string(), divine_chaos_rate);
        has_live_rate = true;
        crate::app_log!(
            "[GGG Exchange] ✅ 成功取得 '{}' 官方即時現貨匯率: 1 Divine = {} Chaos",
            active_league,
            divine_chaos_rate
        );
    } else {
        crate::app_log!(
            "[GGG Exchange] ℹ️ 官方交易所無即時掛單或未登入，切換至 poe.ninja 市場價格庫..."
        );
    }

    let mut query_league = active_league.clone();
    let test_url = format!(
        "https://poe.ninja/poe1/api/economy/exchange/current/overview?league={}&type=Currency",
        urlencoding::encode(&query_league)
    );
    let is_league_supported = match client
        .get(&test_url)
        .header("Referer", "https://poe.ninja/")
        .send()
        .await
    {
        Ok(res) => res.status().is_success(),
        Err(_) => false,
    };

    if !is_league_supported && query_league != "Standard" {
        crate::app_log!(
            "[poe.ninja] ℹ️ 聯盟 '{}' 在 poe.ninja 無獨立清單，自動切換至 Standard 基準物價庫...",
            active_league
        );
        query_league = "Standard".to_string();
    }

    crate::app_log!(
        "[poe.ninja] 🌐 正在獲取聯盟 '{}' 即時市場物價庫 (PoE1 最新端點)...",
        query_league
    );
    fetch_all_ninja_categories(
        &client,
        &query_league,
        &mut rates,
        &mut divine_chaos_rate,
        has_live_rate,
    )
    .await;

    crate::app_log!(
        "[poe.ninja] 🎯 物價索引完成：已載入 {} 項商品參考價，當前生效匯率: 1 Divine = {} Chaos",
        rates.len(),
        divine_chaos_rate
    );

    if let Ok(mut guard) = NINJA_CACHE.write() {
        guard.insert(
            active_league.clone(),
            (rates.clone(), divine_chaos_rate, now_secs()),
        );
    }

    Ok(NinjaPricesResult {
        rates,
        divine_chaos_rate,
        league: active_league,
    })
}

fn resolve_active_league(league: &str) -> String {
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

async fn fetch_all_ninja_categories(
    client: &reqwest::Client,
    active_league: &str,
    rates: &mut HashMap<String, f64>,
    divine_chaos_rate: &mut f64,
    has_live_rate: bool,
) {
    let exchange_types = [
        "Currency",
        "Fragment",
        "DivinationCard",
        "Scarab",
        "Essence",
        "Oil",
        "Tattoo",
        "Omen",
        "Artifact",
        "DeliriumOrb",
    ];
    for cat in exchange_types {
        fetch_exchange_overview(
            client,
            active_league,
            cat,
            rates,
            divine_chaos_rate,
            has_live_rate,
        )
        .await;
    }

    let item_types = [
        "UniqueArmour",
        "UniqueWeapon",
        "UniqueAccessory",
        "UniqueFlask",
        "UniqueJewel",
        "SkillGem",
        "ClusterJewel",
    ];
    for cat in item_types {
        fetch_item_overview(client, active_league, cat, rates).await;
    }
}
