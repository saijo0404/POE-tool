use std::collections::HashMap;
use std::sync::RwLock;
use lazy_static::lazy_static;
use serde_json::Value;
use crate::models::ninja::{NinjaPriceMap, NinjaPricesResult};
use super::storage::{get_data_dir, write_json_atomic};

pub const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

lazy_static! {
    static ref NINJA_CACHE: RwLock<HashMap<String, (NinjaPriceMap, f64, u64)>> = RwLock::new(HashMap::new());
}

fn now_secs() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

pub fn get_cached_divine_rate(league: &str) -> f64 {
    let active_league = if league.is_empty() || league == "Auto" { "Standard" } else { league };
    if let Ok(guard) = NINJA_CACHE.read() {
        if let Some((_, rate, _)) = guard.get(active_league) {
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

pub async fn fetch_ninja_prices(league: &str, force_refresh: bool) -> Result<NinjaPricesResult, String> {
    let active_league = if league.is_empty() || league == "Auto" { "Standard" } else { league };

    // 1. Check in-memory cache
    if !force_refresh {
        if let Ok(guard) = NINJA_CACHE.read() {
            if let Some((rates, div_rate, ts)) = guard.get(active_league) {
                if now_secs() - ts < 1800 {
                    return Ok(NinjaPricesResult {
                        rates: rates.clone(),
                        divine_chaos_rate: *div_rate,
                        league: active_league.to_string(),
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

    // 2. 優先嘗試直接從 GGG 官方貨幣交易所 (Official Currency Exchange) 取得該聯盟的即時真實現貨匯率
    crate::app_log!("[GGG Exchange] 🔍 正在查詢聯盟 '{}' 官方即時貨幣交易所神聖石匯率...", active_league);
    if let Some(live_rate) = fetch_ggg_live_divine_rate(&client, active_league).await {
        divine_chaos_rate = (live_rate * 100.0).round() / 100.0;
        rates.insert("Divine Orb".to_string(), divine_chaos_rate);
        has_live_rate = true;
        crate::app_log!("[GGG Exchange] ✅ 成功取得 '{}' 官方即時現貨匯率: 1 Divine = {} Chaos", active_league, divine_chaos_rate);
    } else {
        crate::app_log!("[GGG Exchange] ℹ️ 官方交易所無即時掛單或未登入，切換至 poe.ninja 市場價格庫...");
    }

    crate::app_log!("[poe.ninja] 🌐 正在獲取聯盟 '{}' 即時市場物價庫 (PoE1 最新端點)...", active_league);

    // 3. 定義欲抓取的 Exchange 與 Stash 物價類別
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

    let item_types = [
        "UniqueArmour",
        "UniqueWeapon",
        "UniqueAccessory",
        "UniqueFlask",
        "UniqueJewel",
        "SkillGem",
        "ClusterJewel",
    ];

    // 首先測試當前聯盟是否受 poe.ninja 原生支援，若 404 則自動以 Standard 作為基準行情
    let mut query_league = active_league.to_string();
    let test_url = format!("https://poe.ninja/poe1/api/economy/exchange/current/overview?league={}&type=Currency", urlencoding::encode(&query_league));
    let is_league_supported = match client.get(&test_url).header("Referer", "https://poe.ninja/").send().await {
        Ok(res) => res.status().is_success(),
        Err(_) => false,
    };

    if !is_league_supported && query_league != "Standard" {
        crate::app_log!("[poe.ninja] ℹ️ 聯盟 '{}' 在 poe.ninja 無獨立清單，自動切換至 Standard 基準物價庫...", active_league);
        query_league = "Standard".to_string();
    }

    // A. 抓取 Exchange 類別 (通貨、命運卡、甲蟲、精髓、油等)
    for ext in exchange_types {
        let ext_url = format!("https://poe.ninja/poe1/api/economy/exchange/current/overview?league={}&type={}", urlencoding::encode(&query_league), ext);
        if let Ok(res) = client.get(&ext_url).header("Referer", "https://poe.ninja/").header("Accept", "application/json").send().await {
            if res.status().is_success() {
                if let Ok(data) = res.json::<Value>().await {
                    let mut id_to_name = HashMap::new();
                    if let Some(items) = data["items"].as_array() {
                        for it in items {
                            if let (Some(id), Some(name)) = (it["id"].as_str(), it["name"].as_str()) {
                                id_to_name.insert(id.to_string(), name.to_string());
                            }
                        }
                    }

                    if let Some(lines) = data["lines"].as_array() {
                        for line in lines {
                            let id = line["id"].as_str().unwrap_or_default();
                            let price = line["primaryValue"].as_f64().unwrap_or(0.0);
                            if let Some(name) = id_to_name.get(id) {
                                if price > 0.0 {
                                    rates.insert(name.clone(), price);
                                    if name == "Divine Orb" && !has_live_rate {
                                        divine_chaos_rate = price;
                                    }
                                }
                            }
                        }
                        crate::app_log!("[poe.ninja] ✅ 成功載入 Exchange ({}): {} 項商品行情", ext, lines.len());
                    }
                }
            }
        }
    }

    // B. 抓取 Stash 類別 (傳奇防具、傳奇武器、飾品、藥劑、珠寶、技能石、星團)
    for it in item_types {
        let it_url = format!("https://poe.ninja/poe1/api/economy/stash/current/item/overview?league={}&type={}", urlencoding::encode(&query_league), it);
        match client.get(&it_url).header("Referer", "https://poe.ninja/").header("Accept", "application/json").send().await {
            Ok(res) => {
                let status = res.status();
                if status.is_success() {
                    if let Ok(data) = res.json::<Value>().await {
                        if let Some(lines) = data["lines"].as_array() {
                            for line in lines {
                                let name = line["name"].as_str().unwrap_or_default();
                                let chaos_val = line["chaosValue"].as_f64().unwrap_or(0.0);
                                if !name.is_empty() && chaos_val > 0.0 {
                                    rates.insert(name.to_string(), chaos_val);
                                }
                            }
                            crate::app_log!("[poe.ninja] ✅ 成功載入 Stash ({}): {} 筆商品即時物價", it, lines.len());
                        }
                    }
                } else {
                    crate::app_log!("[poe.ninja] ⚠️ {} API 回傳狀態異常: {}", it, status);
                }
            }
            Err(err) => {
                crate::app_log!("[poe.ninja] ❌ {} API 請求失敗: {}", it, err);
            }
        }
    }

    // Cache to memory & disk
    if let Ok(mut guard) = NINJA_CACHE.write() {
        guard.insert(active_league.to_string(), (rates.clone(), divine_chaos_rate, now_secs()));
    }

    let cache_file = get_data_dir().join("ninja_cache.json");
    let _ = write_json_atomic(&cache_file, &rates);

    crate::app_log!("[poe.ninja] 🎯 物價索引完成：已載入 {} 項商品參考價，當前生效匯率: 1 Divine = {} Chaos", rates.len(), divine_chaos_rate);

    Ok(NinjaPricesResult {
        rates,
        divine_chaos_rate,
        league: active_league.to_string(),
    })
}

async fn fetch_ggg_live_divine_rate(client: &reqwest::Client, league: &str) -> Option<f64> {
    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        crate::models::settings::AppSettings::default()
    );

    let url = format!("https://www.pathofexile.com/api/trade/exchange/{}", urlencoding::encode(league));
    let mut req_builder = client.post(&url)
        .header("User-Agent", DEFAULT_USER_AGENT)
        .header("Origin", "https://www.pathofexile.com")
        .header("Referer", format!("https://www.pathofexile.com/trade/exchange/{}", urlencoding::encode(league)))
        .header("Content-Type", "application/json")
        .header("Accept", "application/json")
        .header("X-Requested-With", "XMLHttpRequest");

    if !settings.poesessid.trim().is_empty() {
        req_builder = req_builder.header("Cookie", format!("POESESSID={}", settings.poesessid.trim()));
    }

    let payload = serde_json::json!({
        "exchange": {
            "status": { "option": "online" },
            "have": ["chaos"],
            "want": ["divine"]
        }
    });

    let res = req_builder.json(&payload).send().await.ok()?;
    if !res.status().is_success() {
        return None;
    }

    let data = res.json::<Value>().await.ok()?;
    let query_id = data["id"].as_str().unwrap_or_default();

    // 格式 1: GGG Exchange 回傳 Object Map
    if let Some(result_map) = data["result"].as_object() {
        for (_, val) in result_map {
            if let Some(offers) = val["listing"]["offers"].as_array() {
                for offer in offers {
                    if let Some(rate) = calculate_divine_to_chaos_rate_from_offer(offer) {
                        return Some(rate);
                    }
                }
            }
        }
    }

    // 格式 2: GGG Exchange 回傳 Array of IDs
    if let Some(result_arr) = data["result"].as_array() {
        let ids: Vec<&str> = result_arr.iter().filter_map(|v| v.as_str()).take(3).collect();
        if !ids.is_empty() && !query_id.is_empty() {
            let fetch_url = format!("https://www.pathofexile.com/api/trade/fetch/{}?query={}&exchange", ids.join(","), query_id);
            let mut fetch_req = client.get(&fetch_url)
                .header("User-Agent", DEFAULT_USER_AGENT)
                .header("Origin", "https://www.pathofexile.com")
                .header("Referer", format!("https://www.pathofexile.com/trade/exchange/{}/{}", urlencoding::encode(league), query_id))
                .header("Accept", "application/json")
                .header("X-Requested-With", "XMLHttpRequest");

            if !settings.poesessid.trim().is_empty() {
                fetch_req = fetch_req.header("Cookie", format!("POESESSID={}", settings.poesessid.trim()));
            }

            if let Ok(f_res) = fetch_req.send().await {
                if f_res.status().is_success() {
                    if let Ok(f_data) = f_res.json::<Value>().await {
                        if let Some(items) = f_data["result"].as_array() {
                            for it in items {
                                if let Some(offers) = it["listing"]["offers"].as_array() {
                                    for offer in offers {
                                        if let Some(rate) = calculate_divine_to_chaos_rate_from_offer(offer) {
                                            return Some(rate);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    None
}

fn calculate_divine_to_chaos_rate_from_offer(offer: &Value) -> Option<f64> {
    let mut chaos_amt = 0.0;
    let mut divine_amt = 0.0;

    let ex_curr = offer["exchange"]["currency"].as_str().unwrap_or_default().to_lowercase();
    let ex_val = offer["exchange"]["amount"].as_f64().unwrap_or(0.0);

    let it_curr = offer["item"]["currency"].as_str().unwrap_or_default().to_lowercase();
    let it_val = offer["item"]["amount"].as_f64().unwrap_or(0.0);

    if ex_curr == "chaos" {
        chaos_amt = ex_val;
    } else if ex_curr == "divine" {
        divine_amt = ex_val;
    }

    if it_curr == "chaos" {
        chaos_amt = it_val;
    } else if it_curr == "divine" {
        divine_amt = it_val;
    }

    // 若未標明 currency 字串，則以數值較大者為 Chaos、較小者為 Divine
    if chaos_amt == 0.0 || divine_amt == 0.0 {
        if ex_val > 0.0 && it_val > 0.0 {
            if ex_val > it_val {
                chaos_amt = ex_val;
                divine_amt = it_val;
            } else {
                chaos_amt = it_val;
                divine_amt = ex_val;
            }
        }
    }

    if chaos_amt > 0.0 && divine_amt > 0.0 {
        let rate = (chaos_amt / divine_amt * 100.0).round() / 100.0;
        // 合理市場價格範圍保護 (20 Chaos <= 1 Divine <= 1500 Chaos)
        if rate >= 20.0 && rate <= 1500.0 {
            return Some(rate);
        }
    }

    None
}

pub fn get_accurate_bulk_rates() -> NinjaPriceMap {
    let mut map = HashMap::new();
    let items = [
        ("Mirror of Kalandra", 95000.0),
        ("Divine Orb", 150.0),
        ("Exalted Orb", 18.0),
        ("Sacred Orb", 15.0),
        ("Orb of Annulment", 8.0),
        ("Veiled Orb", 120.0),
        ("Ancient Orb", 12.0),
        ("Awakened Orb", 450.0),
        ("Vaal Orb", 0.8),
        ("Regal Orb", 0.3),
        ("Gemcutter's Prism", 0.8),
        ("Glassblower's Bauble", 0.35),
        ("Cartographer's Chisel", 0.4),
        ("Blessed Orb", 0.2),
        ("Orb of Unmaking", 0.8),
        ("Orb of Regret", 0.5),
        ("Orb of Scouring", 0.33),
        ("Orb of Fusing", 0.25),
        ("Orb of Alchemy", 0.15),
        ("Orb of Alteration", 0.15),
        ("Jeweller's Orb", 0.08),
        ("Chromatic Orb", 0.05),
        ("Orb of Chance", 0.05),
        ("Portal Scroll", 0.01),
        ("Scroll of Wisdom", 0.01),
        ("Blacksmith's Whetstone", 0.02),
        ("Armourer's Scrap", 0.02),
        ("Chaos Orb", 1.0),
    ];

    for (k, v) in items {
        map.insert(k.to_string(), v);
    }
    map
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_divine_to_chaos_rate() {
        let offer1 = serde_json::json!({
            "exchange": { "amount": 165.0, "currency": "chaos" },
            "item": { "amount": 1.0, "currency": "divine" }
        });
        assert_eq!(calculate_divine_to_chaos_rate_from_offer(&offer1), Some(165.0));

        let offer2 = serde_json::json!({
            "exchange": { "amount": 2.0, "currency": "divine" },
            "item": { "amount": 340.0, "currency": "chaos" }
        });
        assert_eq!(calculate_divine_to_chaos_rate_from_offer(&offer2), Some(170.0));

        // Test out of bounds (impossible rate: 0.25)
        let offer_bad = serde_json::json!({
            "exchange": { "amount": 4.0, "currency": "divine" },
            "item": { "amount": 1.0, "currency": "chaos" }
        });
        assert_eq!(calculate_divine_to_chaos_rate_from_offer(&offer_bad), None);
    }
}

