use std::sync::RwLock;
use lazy_static::lazy_static;
use reqwest::header::{HeaderMap, HeaderValue, ACCEPT, COOKIE, USER_AGENT};
use serde_json::Value;
use crate::models::settings::AppSettings;
use crate::models::stash::{StashItem, StashProgress, StashTabMeta, StashTabSummary, TabColor, WealthSnapshot};
use super::ninja::fetch_ninja_prices;
use super::rate_limiter::{acquire_channel_slot, update_rate_limits_from_headers, RequestChannel};
use super::storage::{get_data_dir, read_json_safe, write_json_atomic};

const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

lazy_static! {
    static ref SNAPSHOTS: RwLock<Vec<WealthSnapshot>> = RwLock::new(Vec::new());
    static ref STASH_PROGRESS: RwLock<StashProgress> = RwLock::new(StashProgress::default());
}

pub fn init_stash_service() {
    let snapshot_file = get_data_dir().join("wealth_snapshots.json");
    let loaded: Vec<WealthSnapshot> = read_json_safe(&snapshot_file, Vec::new());
    if let Ok(mut guard) = SNAPSHOTS.write() {
        *guard = loaded;
    }
}

pub fn get_snapshots() -> Vec<WealthSnapshot> {
    SNAPSHOTS.read().map(|g| g.clone()).unwrap_or_default()
}

pub fn clear_snapshots() {
    if let Ok(mut guard) = SNAPSHOTS.write() {
        guard.clear();
        let file = get_data_dir().join("wealth_snapshots.json");
        let _ = write_json_atomic(&file, &*guard);
    }
}

pub fn get_stash_progress() -> StashProgress {
    STASH_PROGRESS.read().map(|g| g.clone()).unwrap_or_default()
}

fn set_stash_progress(p: StashProgress) {
    if let Ok(mut guard) = STASH_PROGRESS.write() {
        *guard = p;
    }
}

fn get_settings() -> AppSettings {
    let path = get_data_dir().join("settings.json");
    read_json_safe(&path, AppSettings::default())
}

pub async fn fetch_user_characters() -> Result<Vec<Value>, String> {
    let settings = get_settings();
    if settings.poesessid.trim().is_empty() {
        return Ok(Vec::new());
    }

    let mut headers = HeaderMap::new();
    let ua = settings.user_agent.as_deref().unwrap_or(DEFAULT_USER_AGENT);
    headers.insert(USER_AGENT, HeaderValue::from_str(ua).unwrap_or_else(|_| HeaderValue::from_static(DEFAULT_USER_AGENT)));
    headers.insert(ACCEPT, HeaderValue::from_static("application/json, text/javascript, */*"));

    let mut cookies = vec![format!("POESESSID={}", settings.poesessid.trim())];
    if let Some(cf) = &settings.cf_clearance {
        if !cf.trim().is_empty() {
            cookies.push(format!("cf_clearance={}", cf.trim()));
        }
    }
    headers.insert(COOKIE, HeaderValue::from_str(&cookies.join("; ")).map_err(|e| e.to_string())?);

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(7))
        .build()
        .map_err(|e| e.to_string())?;

    acquire_channel_slot(RequestChannel::Stash, true).await?;

    let url = if !settings.account_name.trim().is_empty() {
        format!("https://www.pathofexile.com/character-window/get-characters?accountName={}", urlencoding::encode(settings.account_name.trim()))
    } else {
        "https://www.pathofexile.com/character-window/get-characters".to_string()
    };

    let res = client.get(&url).headers(headers).send().await.map_err(|e| e.to_string())?;
    update_rate_limits_from_headers(RequestChannel::Stash, res.headers());

    if res.status().is_success() {
        let chars: Vec<Value> = res.json().await.unwrap_or_default();
        Ok(chars)
    } else {
        Ok(Vec::new())
    }
}

pub async fn fetch_stash_tabs_meta(custom_league: Option<&str>) -> Result<Vec<StashTabMeta>, String> {
    let settings = get_settings();
    if settings.poesessid.trim().is_empty() || settings.account_name.trim().is_empty() {
        return Ok(Vec::new());
    }

    let target_league = custom_league.unwrap_or(&settings.league);
    let active_league = if target_league == "Auto" || target_league.is_empty() { "Standard" } else { target_league };

    let mut headers = HeaderMap::new();
    let ua = settings.user_agent.as_deref().unwrap_or(DEFAULT_USER_AGENT);
    headers.insert(USER_AGENT, HeaderValue::from_str(ua).unwrap_or_else(|_| HeaderValue::from_static(DEFAULT_USER_AGENT)));
    headers.insert(ACCEPT, HeaderValue::from_static("application/json, text/plain, */*"));

    let mut cookies = vec![format!("POESESSID={}", settings.poesessid.trim())];
    if let Some(cf) = &settings.cf_clearance {
        if !cf.trim().is_empty() {
            cookies.push(format!("cf_clearance={}", cf.trim()));
        }
    }
    headers.insert(COOKIE, HeaderValue::from_str(&cookies.join("; ")).map_err(|e| e.to_string())?);

    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(7))
        .build()
        .map_err(|e| e.to_string())?;

    acquire_channel_slot(RequestChannel::Stash, true).await?;
    let url = format!(
        "https://www.pathofexile.com/character-window/get-stash-items?league={}&accountName={}&tabIndex=0&tabs=1",
        urlencoding::encode(active_league),
        urlencoding::encode(settings.account_name.trim())
    );

    let res = client.get(&url).headers(headers).send().await.map_err(|e| e.to_string())?;
    update_rate_limits_from_headers(RequestChannel::Stash, res.headers());

    if res.status().is_success() {
        let val: Value = res.json().await.unwrap_or_default();
        let tabs = val["tabs"].as_array().cloned().unwrap_or_default();
        let mut list = Vec::new();
        for (idx, t) in tabs.iter().enumerate() {
            let color = t["colour"].as_object().or_else(|| t["color"].as_object()).map(|c| TabColor {
                r: c["r"].as_u64().unwrap_or(0) as u8,
                g: c["g"].as_u64().unwrap_or(0) as u8,
                b: c["b"].as_u64().unwrap_or(0) as u8,
            });

            list.push(StashTabMeta {
                i: t["i"].as_u64().unwrap_or(idx as u64) as usize,
                id: t["id"].as_str().unwrap_or(&idx.to_string()).to_string(),
                n: t["n"].as_str().unwrap_or(&format!("Tab {}", idx + 1)).to_string(),
                tab_type: t["type"].as_str().unwrap_or("NormalStash").to_string(),
                color,
                src: t["src"].as_str().map(|s| s.to_string()),
                folder: t["isFolder"].as_bool(),
            });
        }
        Ok(list)
    } else {
        Ok(Vec::new())
    }
}

pub async fn create_snapshot() -> Result<WealthSnapshot, String> {
    let settings = get_settings();
    let characters = fetch_user_characters().await.unwrap_or_default();

    let mut target_league = settings.league.clone();
    if target_league == "Auto" || target_league.is_empty() {
        if let Some(first) = characters.first() {
            target_league = first["league"].as_str().unwrap_or("Standard").to_string();
        } else {
            target_league = "Standard".to_string();
        }
    }

    let ninja_data = fetch_ninja_prices(&target_league, false).await.unwrap_or_else(|_| {
        crate::models::ninja::NinjaPricesResult {
            rates: super::ninja::get_accurate_bulk_rates(),
            divine_chaos_rate: 150.0,
            league: target_league.clone(),
        }
    });

    let mut all_items: Vec<StashItem> = Vec::new();

    if !settings.poesessid.trim().is_empty() && !settings.account_name.trim().is_empty() {
        // 1. Fetch Character Inventory
        let char_opt = characters.iter().find(|c| c["league"].as_str() == Some(&target_league)).or_else(|| characters.first());
        if let Some(char_obj) = char_opt {
            if let Some(c_name) = char_obj["name"].as_str() {
                set_stash_progress(StashProgress {
                    active: true,
                    current_tab: 0,
                    total_tabs: 10,
                    current_tab_name: format!("角色: {}", c_name),
                    stage: "inventory".to_string(),
                });

                let mut headers = HeaderMap::new();
                let ua = settings.user_agent.as_deref().unwrap_or(DEFAULT_USER_AGENT);
                headers.insert(USER_AGENT, HeaderValue::from_str(ua).unwrap_or_else(|_| HeaderValue::from_static(DEFAULT_USER_AGENT)));
                let cookies = vec![format!("POESESSID={}", settings.poesessid.trim())];
                if let Ok(cv) = HeaderValue::from_str(&cookies.join("; ")) {
                    headers.insert(COOKIE, cv);
                }

                let client = reqwest::Client::builder()
                    .timeout(std::time::Duration::from_secs(8))
                    .build()
                    .unwrap_or_default();
                let char_url = format!(
                    "https://www.pathofexile.com/character-window/get-items?accountName={}&character={}",
                    urlencoding::encode(settings.account_name.trim()),
                    urlencoding::encode(c_name)
                );

                if let Ok(res) = client.get(&char_url).headers(headers).send().await {
                    if res.status().is_success() {
                        if let Ok(data) = res.json::<Value>().await {
                            if let Some(raw_items) = data["items"].as_array() {
                                for it in raw_items {
                                    if let Some(stash_it) = parse_stash_item(it, &format!("角色裝備與身上 ({})", c_name), &ninja_data.rates, ninja_data.divine_chaos_rate) {
                                        all_items.push(stash_it);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // 2. Fetch Stash Tabs
        let tabs_meta = fetch_stash_tabs_meta(Some(&target_league)).await.unwrap_or_default();
        let max_tabs = settings.max_stash_tabs.unwrap_or(60);
        let selected_tabs = settings.selected_stash_tabs.clone();

        let tabs_to_fetch: Vec<&StashTabMeta> = tabs_meta.iter()
            .take(max_tabs)
            .filter(|t| if let Some(ref sel) = selected_tabs { sel.contains(&t.i) } else { true })
            .collect();

        let total_tabs = tabs_to_fetch.len();
        for (processed, tab) in tabs_to_fetch.iter().enumerate() {
            set_stash_progress(StashProgress {
                active: true,
                current_tab: processed + 1,
                total_tabs,
                current_tab_name: tab.n.clone(),
                stage: "tabs".to_string(),
            });

            let mut headers = HeaderMap::new();
            let ua = settings.user_agent.as_deref().unwrap_or(DEFAULT_USER_AGENT);
            headers.insert(USER_AGENT, HeaderValue::from_str(ua).unwrap_or_else(|_| HeaderValue::from_static(DEFAULT_USER_AGENT)));
            let cookies = vec![format!("POESESSID={}", settings.poesessid.trim())];
            if let Ok(cv) = HeaderValue::from_str(&cookies.join("; ")) {
                headers.insert(COOKIE, cv);
            }

            let client = reqwest::Client::builder()
                .timeout(std::time::Duration::from_secs(8))
                .build()
                .unwrap_or_default();
            let tab_url = format!(
                "https://www.pathofexile.com/character-window/get-stash-items?league={}&accountName={}&tabIndex={}&tabs=0",
                urlencoding::encode(&target_league),
                urlencoding::encode(settings.account_name.trim()),
                tab.i
            );

            if let Ok(_) = acquire_channel_slot(RequestChannel::Stash, true).await {
                if let Ok(res) = client.get(&tab_url).headers(headers).send().await {
                    if res.status().is_success() {
                        if let Ok(data) = res.json::<Value>().await {
                            if let Some(items) = data["items"].as_array() {
                                for it in items {
                                    if let Some(stash_it) = parse_stash_item(it, &format!("倉庫: {}", tab.n), &ninja_data.rates, ninja_data.divine_chaos_rate) {
                                        all_items.push(stash_it);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    set_stash_progress(StashProgress::default());

    // Summarize Tab Values
    let mut tab_map: std::collections::HashMap<String, (String, i64, f64)> = std::collections::HashMap::new();
    let mut total_chaos = 0.0;

    for item in &all_items {
        total_chaos += item.total_price_chaos;
        let entry = tab_map.entry(item.tab_name.clone()).or_insert_with(|| (item.category.clone(), 0, 0.0));
        entry.1 += item.stack_size.unwrap_or(1);
        entry.2 += item.total_price_chaos;
    }

    total_chaos = (total_chaos * 100.0).round() / 100.0;
    let total_divine = (total_chaos / ninja_data.divine_chaos_rate * 100.0).round() / 100.0;

    let mut tab_summaries: Vec<StashTabSummary> = tab_map.into_iter().map(|(t_name, (cat, count, val_c))| {
        StashTabSummary {
            tab_name: t_name,
            category: Some(cat),
            total_chaos: Some((val_c * 100.0).round() / 100.0),
            total_divine: Some(((val_c / ninja_data.divine_chaos_rate) * 100.0).round() / 100.0),
            total_value_chaos: (val_c * 100.0).round() / 100.0,
            total_value_divine: ((val_c / ninja_data.divine_chaos_rate) * 100.0).round() / 100.0,
            item_count: count,
        }
    }).collect();
    tab_summaries.sort_by(|a, b| b.total_value_chaos.partial_cmp(&a.total_value_chaos).unwrap_or(std::cmp::Ordering::Equal));

    let mut top_items = all_items.clone();
    top_items.sort_by(|a, b| b.total_price_chaos.partial_cmp(&a.total_price_chaos).unwrap_or(std::cmp::Ordering::Equal));
    top_items.truncate(20);

    let prev_snapshot = SNAPSHOTS.read().ok().and_then(|g| g.last().cloned());
    let mut hourly_change_chaos = None;
    let mut hourly_change_divine = None;
    if let Some(prev) = prev_snapshot {
        hourly_change_chaos = Some(((total_chaos - prev.total_chaos) * 100.0).round() / 100.0);
        hourly_change_divine = Some(((total_divine - prev.total_divine) * 100.0).round() / 100.0);
    }

    let new_snapshot = WealthSnapshot {
        timestamp: chrono::Utc::now().to_rfc3339(),
        league: target_league,
        total_chaos,
        total_divine,
        chaos_rate: ninja_data.divine_chaos_rate,
        hourly_change_chaos,
        hourly_change_divine,
        tab_summaries,
        top_items,
        all_items: Some(all_items),
    };

    if let Ok(mut guard) = SNAPSHOTS.write() {
        guard.push(new_snapshot.clone());
        if guard.len() > 300 {
            let start = guard.len() - 300;
            *guard = guard[start..].to_vec();
        }
        let file = get_data_dir().join("wealth_snapshots.json");
        let _ = write_json_atomic(&file, &*guard);
    }

    Ok(new_snapshot)
}

fn parse_stash_item(it: &Value, tab_name: &str, rates: &std::collections::HashMap<String, f64>, div_rate: f64) -> Option<StashItem> {
    let type_line = it["typeLine"].as_str().or_else(|| it["name"].as_str()).unwrap_or("Item");
    let name = it["name"].as_str().unwrap_or(type_line);
    let stack_size = it["stackSize"].as_i64().unwrap_or(1);
    let icon = it["icon"].as_str().unwrap_or_default().to_string();

    let unit_chaos = rates.get(type_line).or_else(|| rates.get(name)).copied().unwrap_or(0.0);
    let total_chaos = unit_chaos * (stack_size as f64);
    let unit_div = (unit_chaos / div_rate * 100.0).round() / 100.0;
    let total_div = (total_chaos / div_rate * 100.0).round() / 100.0;

    let category = if it["frameType"].as_i64() == Some(5) || type_line.contains("Orb") || type_line.contains("Chisel") || type_line.contains("Mirror") {
        "Currency"
    } else if type_line.contains("Fragment") || type_line.contains("Key") || type_line.contains("Simulacrum") {
        "Fragment"
    } else if type_line.contains("Essence") {
        "Essence"
    } else if type_line.contains("Card") || type_line.contains("Doctor") || type_line.contains("Fiend") {
        "DivCard"
    } else if type_line.contains("Scarab") {
        "Scarab"
    } else if type_line.contains("Map") {
        "Map"
    } else {
        "Equipment"
    };

    Some(StashItem {
        id: it["id"].as_str().unwrap_or_default().to_string(),
        name: name.to_string(),
        type_line: type_line.to_string(),
        icon,
        stack_size: Some(stack_size),
        tab_name: tab_name.to_string(),
        category: category.to_string(),
        unit_price_chaos: unit_chaos,
        total_price_chaos: total_chaos,
        unit_price_divine: unit_div,
        total_price_divine: total_div,
    })
}
