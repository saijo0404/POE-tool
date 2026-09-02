use serde_json::Value;
use std::collections::HashMap;

pub async fn fetch_exchange_overview(
    client: &reqwest::Client,
    league: &str,
    category: &str,
    rates: &mut HashMap<String, f64>,
    divine_chaos_rate: &mut f64,
    has_live_rate: bool,
) {
    let url = format!(
        "https://poe.ninja/poe1/api/economy/exchange/current/overview?league={}&type={}",
        urlencoding::encode(league),
        urlencoding::encode(category)
    );

    let res = match client
        .get(&url)
        .header("Referer", "https://poe.ninja/")
        .header("Accept", "application/json")
        .send()
        .await
    {
        Ok(r) => r,
        Err(_) => return,
    };
    if !res.status().is_success() {
        return;
    }

    let data: Value = match res.json().await {
        Ok(d) => d,
        Err(_) => return,
    };

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
                        *divine_chaos_rate = price;
                    }
                }
            }
        }
        crate::app_log!(
            "[poe.ninja] ✅ 成功載入 Exchange ({}): {} 項商品行情",
            category,
            lines.len()
        );
    }
}

pub async fn fetch_item_overview(
    client: &reqwest::Client,
    league: &str,
    category: &str,
    rates: &mut HashMap<String, f64>,
) {
    let url = format!(
        "https://poe.ninja/poe1/api/economy/stash/current/item/overview?league={}&type={}",
        urlencoding::encode(league),
        urlencoding::encode(category)
    );

    let res = match client
        .get(&url)
        .header("Referer", "https://poe.ninja/")
        .header("Accept", "application/json")
        .send()
        .await
    {
        Ok(r) => r,
        Err(_) => return,
    };
    if !res.status().is_success() {
        return;
    }

    let data: Value = match res.json().await {
        Ok(d) => d,
        Err(_) => return,
    };
    let lines = match data["lines"].as_array() {
        Some(l) => l,
        None => return,
    };

    for line in lines {
        let name = line["name"]
            .as_str()
            .or_else(|| line["baseType"].as_str())
            .unwrap_or("")
            .to_string();
        let chaos_val = line["chaosValue"].as_f64().unwrap_or(0.0);
        let links = line["links"].as_i64().unwrap_or(0);
        let variant = line["variant"].as_str().unwrap_or("");

        if !name.is_empty() && chaos_val > 0.0 {
            if links == 6 {
                rates.insert(format!("{}:6L", name), chaos_val);
            }
            if !variant.is_empty() {
                rates.insert(format!("{} ({})", name, variant), chaos_val);
                rates.insert(format!("{}:{}", name, variant), chaos_val);
            }
            if let Some(lvl) = line["levelRequired"]
                .as_i64()
                .or_else(|| line["itemLevel"].as_i64())
            {
                rates.insert(format!("{} (ilvl {})", name, lvl), chaos_val);
            }
            if let (Some(g_lvl), Some(g_q)) =
                (line["gemLevel"].as_i64(), line["gemQuality"].as_i64())
            {
                rates.insert(format!("{} ({}/{})", name, g_lvl, g_q), chaos_val);
            }
            rates
                .entry(name.clone())
                .and_modify(|e| {
                    if links == 0 && *e < chaos_val {
                        *e = chaos_val;
                    }
                })
                .or_insert(chaos_val);
        }
    }
    crate::app_log!(
        "[poe.ninja] ✅ 成功載入 Stash ({}): {} 筆商品即時物價",
        category,
        lines.len()
    );
}
