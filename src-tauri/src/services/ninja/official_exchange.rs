use crate::services::trade::trade_client::build_trade_headers;
use serde_json::{json, Value};

pub async fn fetch_ggg_live_divine_rate(client: &reqwest::Client, league: &str) -> Option<f64> {
    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        crate::models::settings::AppSettings::default(),
    );

    let exchange_url = format!(
        "https://www.pathofexile.com/api/trade/exchange/{}",
        urlencoding::encode(league)
    );
    let headers = build_trade_headers(&settings, league, None);

    let payload = json!({
        "exchange": {
            "status": { "option": "online" },
            "have": ["chaos"],
            "want": ["divine"]
        }
    });

    let res = client
        .post(&exchange_url)
        .headers(headers.clone())
        .json(&payload)
        .send()
        .await
        .ok()?;
    if !res.status().is_success() {
        return None;
    }

    let data: Value = res.json().await.ok()?;
    let result_obj = &data["result"];
    let divine_obj = &result_obj["divine"];

    if let Some(entries) = divine_obj.as_object() {
        let mut prices = Vec::new();
        for (_, entry) in entries {
            if let Some(listing) = entry.get("listing") {
                if let (Some(amount), Some(currency)) =
                    (listing["amount"].as_f64(), listing["currency"].as_str())
                {
                    if currency == "chaos" && amount > 10.0 && amount < 2000.0 {
                        prices.push(amount);
                    }
                }
            }
        }
        if !prices.is_empty() {
            prices.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
            return Some(prices[prices.len() / 2]);
        }
    }
    None
}
