use serde_json::Value;
use crate::models::settings::AppSettings;
use crate::models::trade::{TradeQueryRequest, TradeSearchResult};
use crate::services::ninja::get_cached_divine_rate;
use super::query_builder::build_search_query_payload;
use super::price_estimator::calculate_price_metrics;
use super::trade_client::{build_trade_headers, execute_search_http, fetch_listings_http};

pub async fn search_trade(req: TradeQueryRequest) -> Result<TradeSearchResult, String> {
    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        AppSettings::default()
    );
    let target_league = match req.league.as_deref() {
        Some(l) if !l.is_empty() && l != "Auto" => l.to_string(),
        _ => if !settings.league.is_empty() && settings.league != "Auto" { settings.league.clone() } else { "Settlers".to_string() }
    };

    let search_payload = build_search_query_payload(&req);
    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(12)).build().map_err(|e| e.to_string())?;
    let has_auth = !settings.poesessid.trim().is_empty();

    let (active_league, search_data) = execute_search_http(&client, &search_payload, &target_league, &settings, has_auth).await?;
    let query_id = search_data["id"].as_str().unwrap_or_default().to_string();
    let total = search_data["total"].as_u64().unwrap_or(0) as usize;
    let result_ids = search_data["result"].as_array().cloned().unwrap_or_default();

    let offset = req.fetch_offset.unwrap_or(0);
    let fetch_batch: Vec<String> = result_ids.iter().skip(offset).take(10).filter_map(|v| v.as_str().map(|s| s.to_string())).collect();
    let div_rate = get_cached_divine_rate(&active_league);

    let (listings, chaos_prices) = if !fetch_batch.is_empty() && !query_id.is_empty() {
        let fetch_ids = fetch_batch.join(",");
        fetch_listings_http(&client, &fetch_ids, &query_id, &active_league, &settings, has_auth, div_rate).await?
    } else {
        (Vec::new(), Vec::new())
    };

    let metrics = calculate_price_metrics(chaos_prices, div_rate);
    let trade_url = format!("https://www.pathofexile.com/trade/search/{}/{}", urlencoding::encode(&active_league), query_id);

    Ok(TradeSearchResult {
        id: query_id.clone(), search_id: Some(query_id), trade_url: Some(trade_url.clone()),
        search_url: Some(trade_url), total, estimated_min_price_chaos: metrics.min_chaos,
        estimated_min_price_divine: metrics.min_divine, estimated_median_price_chaos: metrics.median_chaos,
        estimated_median_price_divine: metrics.median_divine, estimated_price: metrics.summary, listings,
    })
}

pub async fn search_trade_raw_json(league: &str, query_json: &str) -> Result<TradeSearchResult, String> {
    crate::app_log!("[Trade LiveSync] 🔍 正在向官方市集查詢現貨 (聯盟: '{}')...", league);
    let payload: Value = serde_json::from_str(query_json).map_err(|e| format!("無效的搜尋條件 JSON: {}", e))?;
    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        AppSettings::default()
    );
    let target_league = if league.is_empty() || league == "Auto" {
        if !settings.league.is_empty() && settings.league != "Auto" { settings.league.clone() } else { "Settlers".to_string() }
    } else {
        league.to_string()
    };

    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(12)).build().map_err(|e| e.to_string())?;
    let has_auth = !settings.poesessid.trim().is_empty();

    let (active_league, search_data) = execute_search_http(&client, &payload, &target_league, &settings, has_auth).await?;
    let query_id = search_data["id"].as_str().unwrap_or_default().to_string();
    let total = search_data["total"].as_u64().unwrap_or(0) as usize;
    let result_ids = search_data["result"].as_array().cloned().unwrap_or_default();

    let fetch_batch: Vec<String> = result_ids.iter().take(10).filter_map(|v| v.as_str().map(|s| s.to_string())).collect();
    let div_rate = get_cached_divine_rate(&active_league);

    let (listings, chaos_prices) = if !fetch_batch.is_empty() && !query_id.is_empty() {
        let fetch_ids = fetch_batch.join(",");
        fetch_listings_http(&client, &fetch_ids, &query_id, &active_league, &settings, has_auth, div_rate).await?
    } else {
        (Vec::new(), Vec::new())
    };

    let metrics = calculate_price_metrics(chaos_prices, div_rate);
    let trade_url = format!("https://www.pathofexile.com/trade/search/{}/{}", urlencoding::encode(&active_league), query_id);

    crate::app_log!("[Trade LiveSync] 🎯 現貨查詢結果: ID='{}', 共 {} 筆刊登, 底價: {} div ({} c), 中位數: {} div ({} c)",
        query_id, total, metrics.min_divine, metrics.min_chaos, metrics.median_divine, metrics.median_chaos);

    Ok(TradeSearchResult {
        id: query_id.clone(), search_id: Some(query_id), trade_url: Some(trade_url.clone()),
        search_url: Some(trade_url), total, estimated_min_price_chaos: metrics.min_chaos,
        estimated_min_price_divine: metrics.min_divine, estimated_median_price_chaos: metrics.median_chaos,
        estimated_median_price_divine: metrics.median_divine, estimated_price: metrics.summary, listings,
    })
}

pub async fn send_official_whisper(token: &str, league: Option<&str>) -> Result<String, String> {
    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        AppSettings::default()
    );
    if settings.poesessid.trim().is_empty() {
        return Err("請先於設定中填寫 POESESSID 或完成官方授權登入".to_string());
    }

    let default_league = if !settings.league.is_empty() && settings.league != "Auto" { &settings.league } else { "Settlers" };
    let target_league = league.unwrap_or(default_league);
    let whisper_url = format!("https://www.pathofexile.com/api/trade/whisper");
    let headers = build_trade_headers(&settings, target_league, None);
    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(8)).build().map_err(|e| e.to_string())?;

    let payload = serde_json::json!({ "token": token });
    let res = client.post(&whisper_url).headers(headers).json(&payload).send().await.map_err(|e| format!("發送密語失敗: {}", e))?;

    if res.status().is_success() {
        Ok("密語發送成功".to_string())
    } else {
        Err(format!("官方伺服器拒絕密語請求 ({})", res.status()))
    }
}
