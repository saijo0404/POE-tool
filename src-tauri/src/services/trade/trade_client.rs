use super::listing_parser::parse_single_listing;
use crate::models::settings::AppSettings;
use crate::models::trade::TradeListing;
use crate::services::rate_limiter::{
    acquire_channel_slot, update_rate_limits_from_headers, RequestChannel,
};
use reqwest::header::{
    HeaderMap, HeaderValue, ACCEPT, CONTENT_TYPE, COOKIE, ORIGIN, REFERER, USER_AGENT,
};
use serde_json::Value;

const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

pub fn build_trade_headers(
    settings: &AppSettings,
    league: &str,
    query_id: Option<&str>,
) -> HeaderMap {
    let mut headers = HeaderMap::new();
    let ua = settings.user_agent.as_deref().unwrap_or(DEFAULT_USER_AGENT);
    headers.insert(
        USER_AGENT,
        HeaderValue::from_str(ua).unwrap_or_else(|_| HeaderValue::from_static(DEFAULT_USER_AGENT)),
    );
    headers.insert(
        ORIGIN,
        HeaderValue::from_static("https://www.pathofexile.com"),
    );
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert(ACCEPT, HeaderValue::from_static("application/json"));
    headers.insert(
        reqwest::header::HeaderName::from_static("x-requested-with"),
        HeaderValue::from_static("XMLHttpRequest"),
    );
    headers.insert(
        reqwest::header::HeaderName::from_static("sec-fetch-dest"),
        HeaderValue::from_static("empty"),
    );
    headers.insert(
        reqwest::header::HeaderName::from_static("sec-fetch-mode"),
        HeaderValue::from_static("cors"),
    );
    headers.insert(
        reqwest::header::HeaderName::from_static("sec-fetch-site"),
        HeaderValue::from_static("same-origin"),
    );

    let referer = if let Some(qid) = query_id {
        format!(
            "https://www.pathofexile.com/trade/search/{}/{}",
            urlencoding::encode(league),
            qid
        )
    } else {
        format!(
            "https://www.pathofexile.com/trade/search/{}",
            urlencoding::encode(league)
        )
    };
    if let Ok(ref_val) = HeaderValue::from_str(&referer) {
        headers.insert(REFERER, ref_val);
    }
    attach_cookies(&mut headers, settings);
    headers
}

fn attach_cookies(headers: &mut HeaderMap, settings: &AppSettings) {
    let mut cookies = Vec::new();
    if !settings.poesessid.trim().is_empty() {
        cookies.push(format!("POESESSID={}", settings.poesessid.trim()));
    }
    if let Some(cf) = &settings.cf_clearance {
        if !cf.trim().is_empty() {
            cookies.push(format!("cf_clearance={}", cf.trim()));
        }
    }
    if !cookies.is_empty() {
        if let Ok(c_val) = HeaderValue::from_str(&cookies.join("; ")) {
            headers.insert(COOKIE, c_val);
        }
    }
}

pub async fn execute_search_http(
    client: &reqwest::Client,
    search_payload: &Value,
    target_league: &str,
    settings: &AppSettings,
    has_auth: bool,
) -> Result<(String, Value), String> {
    acquire_channel_slot(RequestChannel::Search, has_auth).await?;
    let search_url = format!(
        "https://www.pathofexile.com/api/trade/search/{}",
        urlencoding::encode(target_league)
    );
    let search_headers = build_trade_headers(settings, target_league, None);

    let search_res = client
        .post(&search_url)
        .headers(search_headers)
        .json(search_payload)
        .send()
        .await
        .map_err(|e| format!("PoE Trade API 連線失敗: {}", e))?;

    update_rate_limits_from_headers(RequestChannel::Search, search_res.headers());
    if search_res.status().is_success() {
        let data: Value = search_res.json().await.map_err(|e| e.to_string())?;
        return Ok((target_league.to_string(), data));
    }

    handle_search_error(
        client,
        search_payload,
        target_league,
        settings,
        has_auth,
        search_res,
    )
    .await
}

async fn handle_search_error(
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

pub async fn fetch_listings_http(
    client: &reqwest::Client,
    fetch_ids: &str,
    query_id: &str,
    league: &str,
    settings: &AppSettings,
    has_auth: bool,
    div_rate: f64,
) -> Result<(Vec<TradeListing>, Vec<f64>), String> {
    acquire_channel_slot(RequestChannel::Fetch, has_auth).await?;
    let fetch_url = format!(
        "https://www.pathofexile.com/api/trade/fetch/{}?query={}",
        fetch_ids, query_id
    );
    let fetch_headers = build_trade_headers(settings, league, Some(query_id));

    let fetch_res = client
        .get(&fetch_url)
        .headers(fetch_headers)
        .send()
        .await
        .map_err(|e| format!("PoE Trade Fetch 失敗: {}", e))?;
    update_rate_limits_from_headers(RequestChannel::Fetch, fetch_res.headers());

    if !fetch_res.status().is_success() {
        return Ok((Vec::new(), Vec::new()));
    }

    let fetch_data: Value = fetch_res.json().await.unwrap_or_default();
    let mut listings = Vec::new();
    let mut chaos_prices = Vec::new();
    if let Some(items) = fetch_data["result"].as_array() {
        for it in items {
            if let Some(listing) = parse_single_listing(it, div_rate) {
                chaos_prices.push(listing.price_in_chaos);
                listings.push(listing);
            }
        }
    }
    Ok((listings, chaos_prices))
}
