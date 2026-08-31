use super::listing_parser::parse_single_listing;
use super::search_fallback::handle_search_error;
pub use super::trade_headers::build_trade_headers;
use crate::models::settings::AppSettings;
use crate::models::trade::TradeListing;
use crate::services::rate_limiter::{
    acquire_channel_slot, set_rate_limit_block, update_rate_limits_from_headers, RequestChannel,
};
use serde_json::Value;
use std::time::Duration;

pub async fn execute_search_http(
    client: &reqwest::Client,
    search_payload: &Value,
    target_league: &str,
    settings: &AppSettings,
    has_auth: bool,
) -> Result<(String, Value), String> {
    const MAX_RETRIES: usize = 3;
    let mut last_err = String::new();

    for _attempt in 0..MAX_RETRIES {
        acquire_channel_slot(RequestChannel::Search, has_auth).await?;
        let search_url = format!(
            "https://www.pathofexile.com/api/trade/search/{}",
            urlencoding::encode(target_league)
        );
        let search_headers = build_trade_headers(settings, target_league, None);

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

        update_rate_limits_from_headers(RequestChannel::Search, search_res.headers());

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
            set_rate_limit_block(retry_after);
            last_err = format!("官方請求頻率受限 (429)，將於冷卻後重試");
            continue;
        }

        return handle_search_error(
            client,
            search_payload,
            target_league,
            settings,
            has_auth,
            search_res,
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
) -> Result<(Vec<TradeListing>, Vec<f64>), String> {
    const MAX_RETRIES: usize = 3;

    for _ in 0..MAX_RETRIES {
        acquire_channel_slot(RequestChannel::Fetch, has_auth).await?;
        let fetch_url = format!(
            "https://www.pathofexile.com/api/trade/fetch/{}?query={}",
            fetch_ids, query_id
        );
        let fetch_headers = build_trade_headers(settings, league, Some(query_id));

        let fetch_res = match client.get(&fetch_url).headers(fetch_headers).send().await {
            Ok(res) => res,
            Err(_) => {
                tokio::time::sleep(Duration::from_millis(1000)).await;
                continue;
            }
        };

        update_rate_limits_from_headers(RequestChannel::Fetch, fetch_res.headers());

        let status = fetch_res.status();
        if status.as_u16() == 429 {
            let retry_after = fetch_res
                .headers()
                .get("retry-after")
                .and_then(|v| v.to_str().ok())
                .and_then(|s| s.parse::<u64>().ok())
                .unwrap_or(5);
            set_rate_limit_block(retry_after);
            continue;
        }

        if !status.is_success() {
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
        return Ok((listings, chaos_prices));
    }

    Ok((Vec::new(), Vec::new()))
}
