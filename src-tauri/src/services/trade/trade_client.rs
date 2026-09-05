use super::listing_parser::parse_single_listing;
use super::search_fallback::handle_search_error;
pub use super::trade_headers::build_trade_headers;
use super::trade_urls::{get_trade_fetch_api_url, get_trade_search_api_url, is_poe2_engine};
use crate::models::settings::AppSettings;
use crate::models::trade::TradeListing;
use crate::services::rate_limiter::{
    acquire_channel_slot, set_channel_rate_limit_block, update_rate_limits_from_headers,
    RequestChannel,
};
use serde_json::Value;
use std::time::Duration;

pub async fn execute_search_http(
    client: &reqwest::Client,
    search_payload: &Value,
    target_league: &str,
    settings: &AppSettings,
    has_auth: bool,
    engine: Option<&str>,
) -> Result<(String, Value), String> {
    let is_poe2 = is_poe2_engine(engine);
    let channel = if is_poe2 {
        RequestChannel::SearchPoe2
    } else {
        RequestChannel::Search
    };
    const MAX_RETRIES: usize = 3;
    let mut last_err = String::new();

    for _attempt in 0..MAX_RETRIES {
        acquire_channel_slot(channel, has_auth).await?;
        let search_url = get_trade_search_api_url(is_poe2, false, target_league);
        let search_headers = build_trade_headers(settings, target_league, None, is_poe2);

        let search_res = match client
            .post(&search_url)
            .headers(search_headers)
            .json(search_payload)
            .send()
            .await
        {
            Ok(res) => res,
            Err(e) => {
                last_err = format!("PoE Trade API 連線失敗: {}", e);
                tokio::time::sleep(Duration::from_millis(1000)).await;
                continue;
            }
        };

        update_rate_limits_from_headers(channel, search_res.headers());

        let status = search_res.status();
        if status.is_success() {
            let data: Value = search_res.json().await.map_err(|e| e.to_string())?;
            return Ok((target_league.to_string(), data));
        }

        if status.as_u16() == 429 {
            let retry_after = search_res
                .headers()
                .get("retry-after")
                .and_then(|v| v.to_str().ok())
                .and_then(|s| s.parse::<u64>().ok())
                .unwrap_or(5);
            set_channel_rate_limit_block(channel, retry_after);
            last_err = "官方請求頻率受限 (429)，將於冷卻後重試".to_string();
            continue;
        }

        return handle_search_error(
            client,
            search_payload,
            target_league,
            settings,
            has_auth,
            search_res,
            is_poe2,
        )
        .await;
    }

    Err(last_err)
}

pub async fn fetch_listings_http(
    client: &reqwest::Client,
    fetch_ids: &str,
    query_id: &str,
    league: &str,
    settings: &AppSettings,
    has_auth: bool,
    div_rate: f64,
    engine: Option<&str>,
) -> Result<(Vec<TradeListing>, Vec<f64>), String> {
    let is_poe2 = is_poe2_engine(engine);
    let channel = if is_poe2 {
        RequestChannel::FetchPoe2
    } else {
        RequestChannel::Fetch
    };
    const MAX_RETRIES: usize = 3;

    for _ in 0..MAX_RETRIES {
        acquire_channel_slot(channel, has_auth).await?;
        let fetch_url = get_trade_fetch_api_url(is_poe2, false, fetch_ids, query_id);
        let fetch_headers = build_trade_headers(settings, league, Some(query_id), is_poe2);

        let fetch_res = match client.get(&fetch_url).headers(fetch_headers).send().await {
            Ok(res) => res,
            Err(_) => {
                tokio::time::sleep(Duration::from_millis(1000)).await;
                continue;
            }
        };

        update_rate_limits_from_headers(channel, fetch_res.headers());

        let status = fetch_res.status();
        if status.as_u16() == 429 {
            let retry_after = fetch_res
                .headers()
                .get("retry-after")
                .and_then(|v| v.to_str().ok())
                .and_then(|s| s.parse::<u64>().ok())
                .unwrap_or(5);
            set_channel_rate_limit_block(channel, retry_after);
            continue;
        }

        if !status.is_success() {
            let res_headers = fetch_res.headers().clone();
            let body = fetch_res.text().await.unwrap_or_default();
            let (state, msg) = crate::services::session::classify_http_trade_error(
                status.as_u16(),
                &res_headers,
                &body,
            );
            if state == crate::models::session::SessionState::Expired {
                crate::services::session::mark_session_expired(&msg);
            } else if state == crate::models::session::SessionState::CloudflareBlocked {
                crate::services::session::mark_cloudflare_blocked(&msg);
            }
            return Err(msg);
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
        return Ok((listings, chaos_prices));
    }

    Ok((Vec::new(), Vec::new()))
}
