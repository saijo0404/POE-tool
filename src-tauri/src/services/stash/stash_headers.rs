use crate::models::settings::AppSettings;
use crate::services::storage::{get_data_dir, read_json_safe};
use reqwest::header::{HeaderMap, HeaderValue, ACCEPT, COOKIE, USER_AGENT};

pub const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

pub fn get_settings() -> AppSettings {
    let path = get_data_dir().join("settings.json");
    read_json_safe(&path, AppSettings::default())
}

pub fn build_stash_headers(settings: &AppSettings) -> Result<HeaderMap, String> {
    let mut headers = HeaderMap::new();
    let ua = settings.user_agent.as_deref().unwrap_or(DEFAULT_USER_AGENT);
    headers.insert(
        USER_AGENT,
        HeaderValue::from_str(ua).unwrap_or_else(|_| HeaderValue::from_static(DEFAULT_USER_AGENT)),
    );
    headers.insert(
        ACCEPT,
        HeaderValue::from_static("application/json, text/javascript, */*"),
    );

    let mut cookies = vec![format!("POESESSID={}", settings.poesessid.trim())];
    if let Some(cf) = &settings.cf_clearance {
        if !cf.trim().is_empty() {
            cookies.push(format!("cf_clearance={}", cf.trim()));
        }
    }
    headers.insert(
        COOKIE,
        HeaderValue::from_str(&cookies.join("; ")).map_err(|e| e.to_string())?,
    );
    Ok(headers)
}
