use super::trade_headers::build_trade_headers;
use crate::models::settings::AppSettings;
use crate::services::rate_limiter::{acquire_channel_slot, RequestChannel};
use serde_json::Value;

pub async fn handle_search_error(
    client: &reqwest::Client,
    search_payload: &Value,
    target_league: &str,
    settings: &AppSettings,
    has_auth: bool,
    search_res: reqwest::Response,
) -> Result<(String, Value), String> {
    let status_code = search_res.status();
    let err_text = search_res.text().await.unwrap_or_default();

    if status_code.as_u16() == 400 && err_text.contains("Unknown stat provided:") {
        return retry_without_unknown_stat(
            client,
            search_payload,
            target_league,
            settings,
            has_auth,
            &err_text,
        )
        .await;
    }
    if target_league != "Standard" && status_code.as_u16() == 400 {
        return execute_standard_fallback(client, search_payload, settings, has_auth).await;
    }
    Err(format!(
        "官方市集搜尋回傳錯誤 ({}): {}",
        status_code, err_text
    ))
}

async fn retry_without_unknown_stat(
    client: &reqwest::Client,
    search_payload: &Value,
    target_league: &str,
    settings: &AppSettings,
    has_auth: bool,
    err_text: &str,
) -> Result<(String, Value), String> {
    let bad_stat = err_text
        .split("Unknown stat provided:")
        .nth(1)
        .map(|s| {
            s.trim()
                .trim_matches(|c| c == '"' || c == '}' || c == ' ' || c == '\n')
        })
        .unwrap_or("");

    let mut retry_payload = search_payload.clone();
    if let Some(stats_arr) = retry_payload["query"]["stats"].as_array_mut() {
        for group in stats_arr.iter_mut() {
            if let Some(filters) = group["filters"].as_array_mut() {
                filters.retain(|f| f["id"].as_str() != Some(bad_stat));
            }
        }
        stats_arr.retain(|g| g["filters"].as_array().is_some_and(|f| !f.is_empty()));
    }

    acquire_channel_slot(RequestChannel::Search, has_auth).await?;
    let search_url = format!(
        "https://www.pathofexile.com/api/trade/search/{}",
        urlencoding::encode(target_league)
    );
    let search_headers = build_trade_headers(settings, target_league, None);
    let retry_res = client
        .post(&search_url)
        .headers(search_headers)
        .json(&retry_payload)
        .send()
        .await
        .map_err(|e| format!("PoE Trade API 連線失敗: {}", e))?;

    if retry_res.status().is_success() {
        let data: Value = retry_res.json().await.map_err(|e| e.to_string())?;
        Ok((target_league.to_string(), data))
    } else {
        Err(format!(
            "官方市集搜尋回傳錯誤: {}",
            retry_res.text().await.unwrap_or_default()
        ))
    }
}

async fn execute_standard_fallback(
    client: &reqwest::Client,
    search_payload: &Value,
    settings: &AppSettings,
    has_auth: bool,
) -> Result<(String, Value), String> {
    acquire_channel_slot(RequestChannel::Search, has_auth).await?;
    let fallback_url = "https://www.pathofexile.com/api/trade/search/Standard";
    let fallback_headers = build_trade_headers(settings, "Standard", None);
    let fallback_res = client
        .post(fallback_url)
        .headers(fallback_headers)
        .json(search_payload)
        .send()
        .await
        .map_err(|e| format!("PoE Trade API 連線失敗: {}", e))?;

    if fallback_res.status().is_success() {
        let data: Value = fallback_res.json().await.map_err(|e| e.to_string())?;
        Ok(("Standard".to_string(), data))
    } else {
        Err(format!(
            "官方市集搜尋回傳錯誤: {}",
            fallback_res.text().await.unwrap_or_default()
        ))
    }
}
