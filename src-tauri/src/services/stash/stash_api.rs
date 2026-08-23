use reqwest::header::{HeaderMap, HeaderValue, ACCEPT, COOKIE, USER_AGENT};
use serde_json::Value;
use crate::models::settings::AppSettings;
use crate::models::stash::{StashTabMeta, TabColor};
use crate::services::rate_limiter::{acquire_channel_slot, update_rate_limits_from_headers, RequestChannel};
use crate::services::storage::{get_data_dir, read_json_safe};

const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

fn get_settings() -> AppSettings {
    let path = get_data_dir().join("settings.json");
    read_json_safe(&path, AppSettings::default())
}

fn build_stash_headers(settings: &AppSettings) -> Result<HeaderMap, String> {
    let mut headers = HeaderMap::new();
    let ua = settings.user_agent.as_deref().unwrap_or(DEFAULT_USER_AGENT);
    headers.insert(USER_AGENT, HeaderValue::from_str(ua).unwrap_or_else(|_| HeaderValue::from_static(DEFAULT_USER_AGENT)));
    headers.insert(ACCEPT, HeaderValue::from_static("application/json, text/javascript, */*"));

    let mut cookies = vec![format!("POESESSID={}", settings.poesessid.trim())];
    if let Some(cf) = &settings.cf_clearance {
        if !cf.trim().is_empty() { cookies.push(format!("cf_clearance={}", cf.trim())); }
    }
    headers.insert(COOKIE, HeaderValue::from_str(&cookies.join("; ")).map_err(|e| e.to_string())?);
    Ok(headers)
}

pub async fn fetch_user_characters() -> Result<Vec<Value>, String> {
    let settings = get_settings();
    if settings.poesessid.trim().is_empty() { return Ok(Vec::new()); }
    let headers = build_stash_headers(&settings)?;
    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(7)).build().map_err(|e| e.to_string())?;

    acquire_channel_slot(RequestChannel::Stash, true).await?;
    let url = if !settings.account_name.trim().is_empty() {
        format!("https://www.pathofexile.com/character-window/get-characters?accountName={}", urlencoding::encode(settings.account_name.trim()))
    } else {
        "https://www.pathofexile.com/character-window/get-characters".to_string()
    };

    let res = client.get(&url).headers(headers).send().await.map_err(|e| e.to_string())?;
    update_rate_limits_from_headers(RequestChannel::Stash, res.headers());
    if res.status().is_success() {
        Ok(res.json().await.unwrap_or_default())
    } else {
        Ok(Vec::new())
    }
}

pub async fn fetch_stash_tabs_meta(custom_league: Option<&str>) -> Result<Vec<StashTabMeta>, String> {
    let settings = get_settings();
    if settings.poesessid.trim().is_empty() || settings.account_name.trim().is_empty() { return Ok(Vec::new()); }

    let target_league = custom_league.unwrap_or(&settings.league);
    let active_league = if target_league == "Auto" || target_league.is_empty() { "Standard" } else { target_league };
    let headers = build_stash_headers(&settings)?;
    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(7)).build().map_err(|e| e.to_string())?;

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
        let list = tabs.iter().enumerate().map(|(idx, t)| parse_tab_meta(t, idx)).collect();
        Ok(list)
    } else {
        Ok(Vec::new())
    }
}

fn parse_tab_meta(t: &Value, idx: usize) -> StashTabMeta {
    let color = t["colour"].as_object().or_else(|| t["color"].as_object()).map(|c| TabColor {
        r: c["r"].as_u64().unwrap_or(0) as u8,
        g: c["g"].as_u64().unwrap_or(0) as u8,
        b: c["b"].as_u64().unwrap_or(0) as u8,
    });

    StashTabMeta {
        i: t["i"].as_u64().unwrap_or(idx as u64) as usize,
        id: t["id"].as_str().unwrap_or(&idx.to_string()).to_string(),
        n: t["n"].as_str().unwrap_or(&format!("Tab {}", idx + 1)).to_string(),
        tab_type: t["type"].as_str().unwrap_or("NormalStash").to_string(),
        color,
        src: t["src"].as_str().map(|s| s.to_string()),
        folder: t["isFolder"].as_bool(),
    }
}

pub async fn fetch_character_items_raw(account_name: &str, char_name: &str, settings: &AppSettings) -> Vec<Value> {
    let headers = match build_stash_headers(settings) { Ok(h) => h, Err(_) => return Vec::new() };
    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(8)).build().unwrap_or_default();
    let url = format!(
        "https://www.pathofexile.com/character-window/get-items?accountName={}&character={}",
        urlencoding::encode(account_name),
        urlencoding::encode(char_name)
    );
    if let Ok(res) = client.get(&url).headers(headers).send().await {
        if res.status().is_success() {
            if let Ok(data) = res.json::<Value>().await {
                return data["items"].as_array().cloned().unwrap_or_default();
            }
        }
    }
    Vec::new()
}

pub async fn fetch_tab_items_raw(account_name: &str, league: &str, tab_index: usize, settings: &AppSettings) -> Vec<Value> {
    let headers = match build_stash_headers(settings) { Ok(h) => h, Err(_) => return Vec::new() };
    let client = reqwest::Client::builder().timeout(std::time::Duration::from_secs(8)).build().unwrap_or_default();
    let url = format!(
        "https://www.pathofexile.com/character-window/get-stash-items?league={}&accountName={}&tabIndex={}&tabs=0",
        urlencoding::encode(league),
        urlencoding::encode(account_name),
        tab_index
    );
    if acquire_channel_slot(RequestChannel::Stash, true).await.is_ok() {
        if let Ok(res) = client.get(&url).headers(headers).send().await {
            if res.status().is_success() {
                if let Ok(data) = res.json::<Value>().await {
                    return data["items"].as_array().cloned().unwrap_or_default();
                }
            }
        }
    }
    Vec::new()
}
