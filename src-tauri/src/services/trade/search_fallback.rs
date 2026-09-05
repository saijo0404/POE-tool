use super::trade_headers::build_trade_headers;
use super::trade_urls::get_trade_search_api_url;
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
    is_poe2: bool,
) -> Result<(String, Value), String> {
    let res_headers = search_res.headers().clone();
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
            is_poe2,
        )
        .await;
    }
    if target_league != "Standard" && status_code.as_u16() == 400 {
        return execute_standard_fallback(client, search_payload, settings, has_auth, is_poe2)
            .await;
    }

    let (state, msg) = crate::services::session::classify_http_trade_error(
        status_code.as_u16(),
        &res_headers,
        &err_text,
    );
    if state == crate::models::session::SessionState::Expired {
        crate::services::session::mark_session_expired(&msg);
    } else if state == crate::models::session::SessionState::CloudflareBlocked {
        crate::services::session::mark_cloudflare_blocked(&msg);
    }
    Err(msg)
}

async fn retry_without_unknown_stat(
    client: &reqwest::Client,
    search_payload: &Value,
    target_league: &str,
    settings: &AppSettings,
    has_auth: bool,
    err_text: &str,
    is_poe2: bool,
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

    let channel = if is_poe2 {
        RequestChannel::SearchPoe2
    } else {
        RequestChannel::Search
    };
    acquire_channel_slot(channel, has_auth).await?;
    let search_url = get_trade_search_api_url(is_poe2, false, target_league);
    let search_headers = build_trade_headers(settings, target_league, None, is_poe2);
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
    is_poe2: bool,
) -> Result<(String, Value), String> {
    let channel = if is_poe2 {
        RequestChannel::SearchPoe2
    } else {
        RequestChannel::Search
    };
    acquire_channel_slot(channel, has_auth).await?;
    let fallback_url = get_trade_search_api_url(is_poe2, false, "Standard");
    let fallback_headers = build_trade_headers(settings, "Standard", None, is_poe2);
    let fallback_res = client
        .post(&fallback_url)
        .headers(fallback_headers)
        .json(search_payload)
        .send()
        .await
        .map_err(|e| format!("PoE Trade API 連線失敗: {}", e))?;

    if fallback_res.status().is_success() {
        let data: Value = fallback_res.json().await.map_err(|e| e.to_string())?;
        crate::app_log!(
            "[Trade LiveSync] ⚠️ 當前聯盟查詢 400 錯誤，已自動切換回退至 Standard 聯盟重試成功！"
        );
        Ok(("Standard".to_string(), data))
    } else {
        Err("查詢條件無效且 Standard 聯盟亦查無資料".to_string())
    }
}
