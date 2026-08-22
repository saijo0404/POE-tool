use reqwest::header::{HeaderMap, HeaderValue, ACCEPT, CONTENT_TYPE, COOKIE, ORIGIN, REFERER, USER_AGENT};
use serde_json::{json, Value};
use crate::models::trade::{EstimatedPriceSummary, TradeListing, TradeListingItem, TradeQueryRequest, TradeSearchResult};
use super::rate_limiter::{acquire_channel_slot, update_rate_limits_from_headers, RequestChannel};
use super::storage::{get_data_dir, read_json_safe};
use crate::models::settings::AppSettings;

const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

fn get_settings() -> AppSettings {
    let path = get_data_dir().join("settings.json");
    read_json_safe(&path, AppSettings::default())
}

fn build_trade_headers(settings: &AppSettings, league: &str, query_id: Option<&str>) -> HeaderMap {
    let mut headers = HeaderMap::new();
    let ua = settings.user_agent.as_deref().unwrap_or(DEFAULT_USER_AGENT);
    headers.insert(USER_AGENT, HeaderValue::from_str(ua).unwrap_or_else(|_| HeaderValue::from_static(DEFAULT_USER_AGENT)));
    headers.insert(ORIGIN, HeaderValue::from_static("https://www.pathofexile.com"));
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert(ACCEPT, HeaderValue::from_static("application/json"));
    headers.insert(reqwest::header::HeaderName::from_static("x-requested-with"), HeaderValue::from_static("XMLHttpRequest"));
    headers.insert(reqwest::header::HeaderName::from_static("sec-fetch-dest"), HeaderValue::from_static("empty"));
    headers.insert(reqwest::header::HeaderName::from_static("sec-fetch-mode"), HeaderValue::from_static("cors"));
    headers.insert(reqwest::header::HeaderName::from_static("sec-fetch-site"), HeaderValue::from_static("same-origin"));

    let referer = if let Some(qid) = query_id {
        format!("https://www.pathofexile.com/trade/search/{}/{}", urlencoding::encode(league), qid)
    } else {
        format!("https://www.pathofexile.com/trade/search/{}", urlencoding::encode(league))
    };
    if let Ok(ref_val) = HeaderValue::from_str(&referer) {
        headers.insert(REFERER, ref_val);
    }

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

    headers
}

pub fn build_search_query_payload(req: &TradeQueryRequest) -> Value {
    let mut query_obj = json!({});

    // Status option for PoE 1 / PoE 2 official trade API ("securable", "available", "online", "onlineleague", "any")
    let status_option = match req.trade_status.as_deref().unwrap_or("securable") {
        "instant" | "securable" => "securable",
        "any_buyout" | "available" => "available",
        "onlineleague" => "onlineleague",
        "online" => "online",
        "any" => "any",
        other => other,
    };
    query_obj["status"] = json!({ "option": status_option });

    // Item Rarity, Name, and Base Type resolution
    let item_rarity = req.rarity.as_deref()
        .or_else(|| req.item.as_ref().map(|i| i.rarity.as_str()))
        .unwrap_or("Rare");
    let is_unique = item_rarity.eq_ignore_ascii_case("unique");

    let raw_name = req.name.as_deref()
        .or_else(|| req.item.as_ref().map(|i| i.name.as_str()))
        .unwrap_or("");
    let raw_base_type = req.base_type.as_deref()
        .or_else(|| req.item.as_ref().map(|i| i.base_type.as_str()))
        .unwrap_or("");

    let translated_name = if !raw_name.is_empty() {
        super::dictionary::lookup_english_base_type(raw_name).unwrap_or_else(|| raw_name.to_string())
    } else {
        String::new()
    };

    let translated_base_type = if !raw_base_type.is_empty() {
        super::dictionary::lookup_english_base_type(raw_base_type).unwrap_or_else(|| raw_base_type.to_string())
    } else {
        String::new()
    };

    if is_unique {
        if !translated_name.is_empty() {
            if translated_name.is_ascii() {
                query_obj["name"] = json!(translated_name);
            } else {
                crate::app_log!(
                    "[Trade Service] [WARN] 傳奇物品名稱 '{}' 未找到英文對照，略過名稱欄位改以基底/詞綴搜尋避免 400 錯誤",
                    translated_name
                );
            }
        }
        if !translated_base_type.is_empty() && translated_base_type != translated_name {
            if translated_base_type.is_ascii() {
                query_obj["type"] = json!(translated_base_type);
            }
        }
    } else {
        // For Rare / Normal / Magic items: NEVER put random rare name into "name"
        if !translated_base_type.is_empty() && translated_base_type.is_ascii() {
            query_obj["type"] = json!(translated_base_type);
        }
    }

    // Stats Filters
    let mut stat_filters = Vec::new();

    // 1. Process explicit filters if provided
    if let Some(filters) = &req.filters {
        for f in filters {
            if f.disabled.unwrap_or(false) {
                continue;
            }
            let mut filter_entry = json!({ "id": f.stat_id });
            let mut val_obj = json!({});
            if let Some(min) = f.min {
                val_obj["min"] = json!(min);
            }
            if let Some(max) = f.max {
                val_obj["max"] = json!(max);
            }
            if val_obj.as_object().map_or(false, |o| !o.is_empty()) {
                filter_entry["value"] = val_obj;
            }
            stat_filters.push(filter_entry);
        }
    }

    // 2. Process selected_mods from price checker
    if let Some(mods) = &req.selected_mods {
        for m in mods {
            if !m.enabled {
                continue;
            }
            let mut stat_id = m.id.clone();
            if stat_id.starts_with("custom") || !stat_id.contains('.') {
                let is_armour = req.item.as_ref().map(|i| {
                    let class_str = i.item_class.as_deref().unwrap_or("");
                    class_str.contains("Armour") || class_str.contains("Body") || class_str.contains("Boots") || class_str.contains("Gloves") || class_str.contains("Helmet") || class_str.contains("Shield")
                        || class_str.contains("胸甲") || class_str.contains("鞋") || class_str.contains("手套") || class_str.contains("頭部") || class_str.contains("盾")
                        || i.base_type.contains("Regalia") || i.base_type.contains("Plate") || i.base_type.contains("Robe") || i.base_type.contains("Crown") || i.base_type.contains("Boots") || i.base_type.contains("Gloves") || i.base_type.contains("Shield")
                }).unwrap_or(false);

                let is_weapon = req.item.as_ref().map(|i| {
                    let class_str = i.item_class.as_deref().unwrap_or("");
                    class_str.contains("Weapon") || class_str.contains("Bow") || class_str.contains("Wand") || class_str.contains("Sword") || class_str.contains("Axe") || class_str.contains("Mace") || class_str.contains("Dagger") || class_str.contains("Claw")
                        || class_str.contains("武器") || class_str.contains("弓") || class_str.contains("杖") || class_str.contains("劍") || class_str.contains("斧") || class_str.contains("槌") || class_str.contains("匕首") || class_str.contains("爪")
                        || i.base_type.contains("Wand") || i.base_type.contains("Bow") || i.base_type.contains("Sword") || i.base_type.contains("Axe") || i.base_type.contains("Mace") || i.base_type.contains("Dagger") || i.base_type.contains("Claw") || i.base_type.contains("Staff") || i.base_type.contains("Sceptre")
                }).unwrap_or(false);

                let matched_opt = if is_armour {
                    super::dictionary::lookup_stat_for_armour(&m.text).or_else(|| super::dictionary::lookup_stat_for_armour(&m.english_text))
                } else if is_weapon {
                    super::dictionary::lookup_stat_for_weapon(&m.text).or_else(|| super::dictionary::lookup_stat_for_weapon(&m.english_text))
                } else {
                    super::dictionary::lookup_stat_by_text(&m.text).or_else(|| super::dictionary::lookup_stat_by_text(&m.english_text))
                };

                if let Some(matched) = matched_opt {
                    stat_id = super::parser::normalize_stat_id_for_mod_type(&matched.id, &m.mod_type);
                } else {
                    continue;
                }
            } else {
                stat_id = super::parser::normalize_stat_id_for_mod_type(&stat_id, &m.mod_type);
            }

            if stat_filters.iter().any(|f| f.get("id").and_then(|v| v.as_str()) == Some(&stat_id)) {
                continue;
            }

            let mut filter_entry = json!({ "id": stat_id });
            let mut val_obj = json!({});
            if let Some(min) = m.min_value.or(m.value) {
                val_obj["min"] = json!(min);
            }
            if let Some(max) = m.max_value {
                val_obj["max"] = json!(max);
            }
            if val_obj.as_object().map_or(false, |o| !o.is_empty()) {
                filter_entry["value"] = val_obj;
            }
            stat_filters.push(filter_entry);
        }
    }

    if !stat_filters.is_empty() {
        println!("[Trade Service] 🎯 Total stat filters included in GGG query: {}", stat_filters.len());
        for (i, f) in stat_filters.iter().enumerate() {
            println!("   - StatFilter [{}]: {}", i, f);
        }
        query_obj["stats"] = json!([{ "type": "and", "filters": stat_filters }]);
    } else {
        println!("[Trade Service] ℹ️ No stat filters included in this query.");
    }

    // Top Level Filters (Type, Sockets, Misc)
    let mut top_filters = json!({});

    // Type filters (Rarity)
    let rarity_option = match item_rarity.to_lowercase().as_str() {
        "rare" => Some("rare"),
        "unique" => Some("unique"),
        "magic" => Some("magic"),
        "normal" => Some("normal"),
        "currency" => Some("currency"),
        "gem" => Some("gem"),
        _ => None,
    };
    if let Some(opt) = rarity_option {
        top_filters["type_filters"] = json!({
            "filters": {
                "rarity": { "option": opt }
            }
        });
    }

    // Socket filters (Links)
    if let Some(links_min) = req.links_min {
        if links_min > 0 {
            top_filters["socket_filters"] = json!({
                "filters": {
                    "links": { "min": links_min }
                }
            });
        }
    }

    // Misc Filters (Corrupted, Item Level)
    let mut misc_filters = json!({});
    if let Some(corrupted) = req.corrupted {
        misc_filters["corrupted"] = json!({ "option": if corrupted { "true" } else { "false" } });
    }
    if let Some(ilvl_min) = req.item_level_min {
        if ilvl_min > 0 {
            misc_filters["ilvl"] = json!({ "min": ilvl_min });
        }
    }
    if misc_filters.as_object().map_or(false, |o| !o.is_empty()) {
        top_filters["misc_filters"] = json!({ "filters": misc_filters });
    }

    if top_filters.as_object().map_or(false, |o| !o.is_empty()) {
        query_obj["filters"] = top_filters;
    }

    let sort_obj = if let Some(s) = &req.sort {
        let mut obj = json!({});
        if let Some(p) = &s.price {
            obj["price"] = json!(p);
        }
        if let Some(i) = &s.indexed {
            obj["indexed"] = json!(i);
        }
        if obj.as_object().map_or(false, |o| !o.is_empty()) {
            obj
        } else {
            json!({ "price": "asc" })
        }
    } else {
        json!({ "price": "asc" })
    };

    let final_payload = json!({
        "query": query_obj,
        "sort": sort_obj
    });
    crate::app_log!("[Trade Service] 📦 Generated GGG Query JSON:\n{}", serde_json::to_string_pretty(&final_payload).unwrap_or_default());
    final_payload
}

pub async fn search_trade(req: TradeQueryRequest) -> Result<TradeSearchResult, String> {
    let settings = get_settings();
    let target_league = req.league.clone()
        .or_else(|| if settings.league != "Auto" && !settings.league.is_empty() { Some(settings.league.clone()) } else { None })
        .unwrap_or_else(|| "Standard".to_string());

    let search_payload = build_search_query_payload(&req);
    execute_trade_search_payload(search_payload, &target_league).await
}

pub async fn search_trade_raw_json(league: &str, query_json: &str) -> Result<TradeSearchResult, String> {
    let settings = get_settings();
    let target_league = if !league.is_empty() && league != "Auto" {
        league.to_string()
    } else if settings.league != "Auto" && !settings.league.is_empty() {
        settings.league.clone()
    } else {
        "Standard".to_string()
    };

    let search_payload: Value = serde_json::from_str(query_json)
        .map_err(|e| format!("無效的市集搜尋條件 JSON: {}", e))?;

    execute_trade_search_payload(search_payload, &target_league).await
}

pub async fn execute_trade_search_payload(search_payload: Value, target_league: &str) -> Result<TradeSearchResult, String> {
    let settings = get_settings();
    let has_auth = !settings.poesessid.trim().is_empty();

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    // 2. Perform Search Request
    acquire_channel_slot(RequestChannel::Search, has_auth).await?;
    let search_url = format!("https://www.pathofexile.com/api/trade/search/{}", urlencoding::encode(target_league));
    let search_headers = build_trade_headers(&settings, target_league, None);

    crate::app_log!("[Trade Service] 🚀 Sending POST to {} (has_auth={})", search_url, has_auth);
    let search_res = client.post(&search_url)
        .headers(search_headers.clone())
        .json(&search_payload)
        .send()
        .await
        .map_err(|e| format!("PoE Trade API 連線失敗: {}", e))?;

    update_rate_limits_from_headers(RequestChannel::Search, search_res.headers());
    crate::app_log!("[Trade Service] 📨 Search response status: {}", search_res.status());

    let (final_league, search_data) = if search_res.status().is_success() {
        let data: Value = search_res.json().await.map_err(|e| e.to_string())?;
        (target_league.to_string(), data)
    } else {
        let status_code = search_res.status();
        let err_text = search_res.text().await.unwrap_or_default();
        crate::app_log!("[Trade Service] ❌ GGG Search Error on '{}' (HTTP {}): {}", target_league, status_code, err_text);

        // 1. If GGG reports an unknown stat ID, strip that stat and retry immediately
        if status_code.as_u16() == 400 && err_text.contains("Unknown stat provided:") {
            if let Some(bad_stat) = err_text.split("Unknown stat provided:").nth(1) {
                let bad_stat = bad_stat.trim().trim_matches(|c| c == '"' || c == '}' || c == ' ' || c == '\n');
                crate::app_log!("[Trade Service] ⚠️ GGG reported unknown stat: '{}'. Stripping it from query and retrying...", bad_stat);
                let mut retry_payload = search_payload.clone();
                if let Some(stats_arr) = retry_payload["query"]["stats"].as_array_mut() {
                    for group in stats_arr.iter_mut() {
                        if let Some(filters) = group["filters"].as_array_mut() {
                            filters.retain(|f| f["id"].as_str() != Some(bad_stat));
                        }
                    }
                    stats_arr.retain(|g| g["filters"].as_array().map_or(false, |f| !f.is_empty()));
                }
                if retry_payload["query"]["stats"].as_array().map_or(true, |s| s.is_empty()) {
                    if let Some(q_obj) = retry_payload["query"].as_object_mut() {
                        q_obj.remove("stats");
                    }
                }
                acquire_channel_slot(RequestChannel::Search, has_auth).await?;
                let retry_res = client.post(&search_url)
                    .headers(search_headers.clone())
                    .json(&retry_payload)
                    .send()
                    .await
                    .map_err(|e| format!("PoE Trade API 連線失敗: {}", e))?;

                if retry_res.status().is_success() {
                    crate::app_log!("[Trade Service] ✅ Retry without '{}' succeeded!", bad_stat);
                    let data: Value = retry_res.json().await.map_err(|e| e.to_string())?;
                    (target_league.to_string(), data)
                } else {
                    let retry_err = retry_res.text().await.unwrap_or_default();
                    return Err(format!("官方市集搜尋回傳錯誤: {}", retry_err));
                }
            } else {
                return Err(format!("官方市集搜尋回傳錯誤 ({}): {}", status_code, err_text));
            }
        } else if target_league != "Standard" && status_code.as_u16() == 400 {
            crate::app_log!("[Trade Service] 🔄 League '{}' is not an active GGG trade league. Retrying fallback search on 'Standard'...", target_league);
            acquire_channel_slot(RequestChannel::Search, has_auth).await?;
            let fallback_url = "https://www.pathofexile.com/api/trade/search/Standard";
            let fallback_headers = build_trade_headers(&settings, "Standard", None);
            let fallback_res = client.post(fallback_url)
                .headers(fallback_headers)
                .json(&search_payload)
                .send()
                .await
                .map_err(|e| format!("PoE Trade API 連線失敗: {}", e))?;

            if fallback_res.status().is_success() {
                crate::app_log!("[Trade Service] ✅ Fallback search on 'Standard' succeeded!");
                let data: Value = fallback_res.json().await.map_err(|e| e.to_string())?;
                ("Standard".to_string(), data)
            } else {
                let fb_err = fallback_res.text().await.unwrap_or_default();
                return Err(format!("官方市集搜尋回傳錯誤: {}", fb_err));
            }
        } else {
            return Err(format!("官方市集搜尋回傳錯誤 ({}): {}", status_code, err_text));
        }
    };

    let query_id = search_data["id"].as_str().unwrap_or_default().to_string();
    let total = search_data["total"].as_u64().unwrap_or(0) as usize;
    let result_ids: Vec<String> = search_data["result"].as_array()
        .map(|arr| arr.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect())
        .unwrap_or_default();

    let search_url_display = if !query_id.is_empty() {
        Some(format!("https://www.pathofexile.com/trade/search/{}/{}", urlencoding::encode(&final_league), query_id))
    } else {
        None
    };

    if result_ids.is_empty() {
        return Ok(TradeSearchResult {
            id: query_id.clone(),
            search_id: Some(query_id.clone()),
            trade_url: search_url_display.clone(),
            search_url: search_url_display,
            total: 0,
            estimated_min_price_chaos: 0.0,
            estimated_min_price_divine: 0.0,
            estimated_median_price_chaos: 0.0,
            estimated_median_price_divine: 0.0,
            estimated_price: None,
            listings: Vec::new(),
        });
    }

    // 3. Fetch Top 10 Listings
    let fetch_ids = result_ids.iter().take(10).cloned().collect::<Vec<_>>().join(",");
    acquire_channel_slot(RequestChannel::Fetch, has_auth).await?;
    let fetch_url = format!("https://www.pathofexile.com/api/trade/fetch/{}?query={}", fetch_ids, query_id);
    let fetch_headers = build_trade_headers(&settings, &final_league, Some(&query_id));

    crate::app_log!("[Trade Service] 📥 Fetching top {} item listings from GGG (query: {})...", result_ids.len().min(10), query_id);
    let fetch_res = client.get(&fetch_url)
        .headers(fetch_headers)
        .send()
        .await
        .map_err(|e| format!("PoE Trade Fetch 失敗: {}", e))?;

    update_rate_limits_from_headers(RequestChannel::Fetch, fetch_res.headers());
    crate::app_log!("[Trade Service] 📨 Fetch response status: {}", fetch_res.status());

    let mut listings = Vec::new();
    let mut chaos_prices = Vec::new();
    let div_rate = super::ninja::get_cached_divine_rate(target_league);

    if fetch_res.status().is_success() {
        let fetch_data: Value = fetch_res.json().await.unwrap_or_default();
        if let Some(items) = fetch_data["result"].as_array() {
            for it in items {
                let listing_obj = &it["listing"];
                let price_obj = &listing_obj["price"];
                let item_obj = &it["item"];
                let account_obj = &listing_obj["account"];

                let amount = price_obj["amount"].as_f64().unwrap_or(0.0);
                let currency = price_obj["currency"].as_str().unwrap_or("chaos").to_string();

                let price_in_chaos = match currency.to_lowercase().as_str() {
                    "divine" => amount * div_rate,
                    "mirror" => amount * 95000.0,
                    "exalted" => amount * 18.0,
                    _ => amount,
                };
                let price_in_divine = (price_in_chaos / div_rate * 100.0).round() / 100.0;
                chaos_prices.push(price_in_chaos);

                let raw_whisper = listing_obj["whisper"].as_str().or_else(|| it["whisper"].as_str()).unwrap_or("").to_string();
                let account_name = account_obj["name"].as_str().map(|s| s.to_string());
                let char_name = account_obj["lastCharacterName"].as_str().map(|s| s.to_string());

                let token = listing_obj["hideout_token"].as_str().or_else(|| listing_obj["whisper_token"].as_str()).map(|s| s.to_string());
                let is_instant = listing_obj["hideout_token"].is_string() || listing_obj["method"].as_str() == Some("merchant");

                listings.push(TradeListing {
                    id: it["id"].as_str().unwrap_or_default().to_string(),
                    indexed: listing_obj["indexed"].as_str().unwrap_or_default().to_string(),
                    indexed_age: None,
                    account_name: account_name.clone(),
                    seller_account: account_name,
                    character_name: char_name.clone(),
                    seller_ign: char_name,
                    online_status: account_obj["online"]["status"].as_str().unwrap_or("online").to_string(),
                    is_instant: Some(is_instant),
                    price_amount: amount,
                    price_currency: currency,
                    price_in_chaos,
                    price_in_divine,
                    whisper: raw_whisper,
                    whisper_token: token.clone(),
                    hideout_token: token,
                    is_instant_buyout: Some(is_instant),
                    method: listing_obj["method"].as_str().map(|s| s.to_string()),
                    item: TradeListingItem {
                        name: item_obj["name"].as_str().unwrap_or_default().to_string(),
                        type_line: item_obj["typeLine"].as_str().unwrap_or_default().to_string(),
                        icon: item_obj["icon"].as_str().unwrap_or_default().to_string(),
                        ilvl: item_obj["ilvl"].as_i64(),
                        corrupted: item_obj["corrupted"].as_bool(),
                        implicit_mods: item_obj["implicitMods"].as_array().map(|a| a.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect()),
                        explicit_mods: item_obj["explicitMods"].as_array().map(|a| a.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect()),
                    },
                });
            }
        }
    } else {
        let err_text = fetch_res.text().await.unwrap_or_default();
        println!("[Trade Service] ⚠️ GGG Fetch error: {}", err_text);
    }

    chaos_prices.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    let min_chaos = chaos_prices.first().copied().unwrap_or(0.0);
    let max_chaos = chaos_prices.last().copied().unwrap_or(0.0);
    let median_chaos = if !chaos_prices.is_empty() { chaos_prices[chaos_prices.len() / 2] } else { 0.0 };

    let min_div = (min_chaos / div_rate * 100.0).round() / 100.0;
    let median_div = (median_chaos / div_rate * 100.0).round() / 100.0;

    println!("[Trade Service] 🎉 Completed search_trade! Found {} listings (total items indexed: {})", listings.len(), total);

    Ok(TradeSearchResult {
        id: query_id.clone(),
        search_id: Some(query_id),
        trade_url: search_url_display.clone(),
        search_url: search_url_display,
        total,
        estimated_min_price_chaos: min_chaos,
        estimated_min_price_divine: min_div,
        estimated_median_price_chaos: median_chaos,
        estimated_median_price_divine: median_div,
        estimated_price: Some(EstimatedPriceSummary { min: min_chaos, median: median_chaos, max: max_chaos }),
        listings,
    })
}

pub async fn send_official_whisper(token: &str, league: Option<&str>) -> Result<String, String> {
    let settings = get_settings();
    if settings.poesessid.trim().is_empty() {
        return Err("請先在系統設定中填入 POESESSID。".to_string());
    }

    let target_league = league.unwrap_or("Standard");
    let is_poe2 = target_league.to_lowercase().contains("poe 2") || target_league.to_lowercase().contains("poe2");
    let trade_base = if is_poe2 { "https://www.pathofexile.com/api/trade2" } else { "https://www.pathofexile.com/api/trade" };

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(5))
        .build()
        .map_err(|e| e.to_string())?;
    let url = format!("{}/whisper", trade_base);
    let headers = build_trade_headers(&settings, target_league, None);

    crate::app_log!("[Trade Service] 📨 Sending official whisper/travel to {} (league: {})", url, target_league);
    let res = client.post(&url)
        .headers(headers)
        .json(&json!({ "token": token }))
        .send()
        .await
        .map_err(|e| format!("官方 Whisper API 請求失敗: {}", e))?;

    crate::app_log!("[Trade Service] 📨 Whisper response status: {}", res.status());
    if res.status().is_success() {
        Ok("成功發送官方 Travel to Hideout 直購請求，遊戲中已觸發前往！".to_string())
    } else {
        let err_msg = res.text().await.unwrap_or_default();
        crate::app_log!("[Trade Service] ⚠️ Whisper API error: {}", err_msg);
        Err(format!("官方市集直購失敗: {}", err_msg))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::item::{ModType, ParsedItemMod};

    #[test]
    fn test_build_search_query_payload_rare_with_affixes() {
        let req = TradeQueryRequest {
            league: Some("Standard".to_string()),
            trade_status: Some("online".to_string()),
            rarity: Some("Rare".to_string()),
            base_type: Some("罪魔邪冠".to_string()),
            name: Some("暴怒 避難所".to_string()),
            item_level_min: Some(85),
            links_min: None,
            corrupted: Some(false),
            filters: None,
            selected_mods: Some(vec![
                ParsedItemMod {
                    id: "explicit.stat_1050105434".to_string(),
                    text: "+54 最大魔力".to_string(),
                    english_text: "+# to maximum Mana".to_string(),
                    mod_type: ModType::Explicit,
                    value: Some(54.0),
                    min_value: Some(50.0),
                    max_value: None,
                    enabled: true,
                },
                ParsedItemMod {
                    id: "explicit.stat_3299347043".to_string(),
                    text: "+5 最大生命".to_string(),
                    english_text: "+# to maximum Life".to_string(),
                    mod_type: ModType::Explicit,
                    value: Some(5.0),
                    min_value: Some(5.0),
                    max_value: None,
                    enabled: true,
                },
                ParsedItemMod {
                    id: "explicit.stat_3372524247".to_string(),
                    text: "+22% 火焰抗性".to_string(),
                    english_text: "+#% to Fire Resistance".to_string(),
                    mod_type: ModType::Explicit,
                    value: Some(22.0),
                    min_value: Some(20.0),
                    max_value: None,
                    enabled: false, // Disabled mod should NOT be included
                },
            ]),
            item: None,
            poesessid: None,
            sort: None,
            fetch_offset: None,
            search_id: None,
        };

        let payload = build_search_query_payload(&req);
        let query = &payload["query"];

        // Rare name must NOT be in query, base type translated to Hubris Circlet
        assert_eq!(query.get("name"), None);
        assert_eq!(query["type"], "Hubris Circlet");

        // Stats should have 2 enabled filters
        let stats = query["stats"].as_array().expect("stats should be array");
        assert_eq!(stats.len(), 1);
        let filters = stats[0]["filters"].as_array().expect("filters should be array");
        assert_eq!(filters.len(), 2);
        assert_eq!(filters[0]["id"], "explicit.stat_1050105434");
        assert_eq!(filters[0]["value"]["min"], 50.0);
        assert_eq!(filters[1]["id"], "explicit.stat_3299347043");
        assert_eq!(filters[1]["value"]["min"], 5.0);

        // Filters: type rarity = rare, misc corrupted = false, ilvl min = 85
        assert_eq!(query["filters"]["type_filters"]["filters"]["rarity"]["option"], "rare");
        assert_eq!(query["filters"]["misc_filters"]["filters"]["corrupted"]["option"], "false");
        assert_eq!(query["filters"]["misc_filters"]["filters"]["ilvl"]["min"], 85);
    }

    #[test]
    fn test_build_search_query_payload_unique() {
        let req = TradeQueryRequest {
            league: Some("Standard".to_string()),
            trade_status: Some("instant".to_string()),
            rarity: Some("Unique".to_string()),
            base_type: Some("金光戒指".to_string()),
            name: Some("賭神芬多".to_string()),
            item_level_min: None,
            links_min: None,
            corrupted: None,
            filters: None,
            selected_mods: None,
            item: None,
            poesessid: None,
            sort: None,
            fetch_offset: None,
            search_id: None,
        };

        let payload = build_search_query_payload(&req);
        let query = &payload["query"];

        // Unique name translated to Ventor's Gamble, base type to Gold Ring
        assert_eq!(query["name"], "Ventor's Gamble");
        assert_eq!(query["type"], "Gold Ring");
        assert_eq!(query["status"]["option"], "securable");
        assert_eq!(query["filters"]["type_filters"]["filters"]["rarity"]["option"], "unique");
    }
}

