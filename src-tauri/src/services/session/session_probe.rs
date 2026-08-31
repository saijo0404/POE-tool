use super::error_classifier::classify_http_trade_error;
use crate::models::session::{SessionHealthInfo, SessionState};
use crate::models::settings::AppSettings;
use crate::services::storage::{get_data_dir, read_json_safe};
use reqwest::header::{HeaderMap, HeaderValue, ACCEPT, COOKIE, USER_AGENT};
use std::sync::{OnceLock, RwLock};
use std::time::{SystemTime, UNIX_EPOCH};

const PROBE_CACHE_TTL_MS: u64 = 180_000; // 3 minutes
const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

static SESSION_CACHE: OnceLock<RwLock<SessionHealthInfo>> = OnceLock::new();

fn get_cache_lock() -> &'static RwLock<SessionHealthInfo> {
    SESSION_CACHE.get_or_init(|| RwLock::new(SessionHealthInfo::default()))
}

fn get_current_epoch_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_millis() as u64)
        .unwrap_or(0)
}

pub fn get_cached_session_health() -> SessionHealthInfo {
    let settings = read_json_safe(
        &get_data_dir().join("settings.json"),
        AppSettings::default(),
    );
    let mut cached = get_cache_lock().read().unwrap().clone();
    let has_poesessid_in_settings = !settings.poesessid.trim().is_empty();
    cached.has_poesessid = has_poesessid_in_settings || cached.has_poesessid;
    cached.has_cf_clearance = settings
        .cf_clearance
        .as_ref()
        .map(|c| !c.trim().is_empty())
        .unwrap_or(cached.has_cf_clearance);
    if cached.account_name.is_none() && !settings.account_name.trim().is_empty() {
        cached.account_name = Some(settings.account_name.clone());
    }
    if !cached.has_poesessid && cached.state == SessionState::Valid {
        cached.state = SessionState::Unconfigured;
        cached.message = "尚未設定 POESESSID 官方憑證".to_string();
    }
    cached
}

pub fn update_session_health(
    state: SessionState,
    message: String,
    account_name: Option<String>,
) -> SessionHealthInfo {
    let mut cache = get_cache_lock().write().unwrap();
    let settings = read_json_safe(
        &get_data_dir().join("settings.json"),
        AppSettings::default(),
    );
    cache.state = state;
    cache.message = message;
    if account_name.is_some() {
        cache.account_name = account_name;
    } else if cache.account_name.is_none() && !settings.account_name.trim().is_empty() {
        cache.account_name = Some(settings.account_name.clone());
    }
    cache.last_checked_epoch_ms = get_current_epoch_ms();
    cache.has_poesessid = !settings.poesessid.trim().is_empty()
        || state == SessionState::Valid
        || state == SessionState::Expired
        || state == SessionState::CloudflareBlocked;
    cache.has_cf_clearance = settings
        .cf_clearance
        .as_ref()
        .map(|c| !c.trim().is_empty())
        .unwrap_or(false);
    cache.clone()
}

pub fn mark_session_valid(account_name: &str) -> SessionHealthInfo {
    update_session_health(
        SessionState::Valid,
        "官方憑證驗證有效，連線正常。".to_string(),
        if account_name.is_empty() {
            None
        } else {
            Some(account_name.to_string())
        },
    )
}

pub fn mark_session_expired(msg: &str) -> SessionHealthInfo {
    update_session_health(
        SessionState::Expired,
        if msg.is_empty() {
            "[AUTH_SESSION_EXPIRED] 官方 POESESSID 憑證已過期或失效 (403)，請點擊【一鍵重新授權登入】。".to_string()
        } else {
            msg.to_string()
        },
        None,
    )
}

pub fn mark_cloudflare_blocked(msg: &str) -> SessionHealthInfo {
    update_session_health(
        SessionState::CloudflareBlocked,
        if msg.is_empty() {
            "[CLOUDFLARE_CHALLENGE] 遭遇官方 Cloudflare WAF / Turnstile 安全驗證 (403)，請點擊【一鍵重新授權登入】。".to_string()
        } else {
            msg.to_string()
        },
        None,
    )
}

fn build_probe_headers(settings: &AppSettings) -> HeaderMap {
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
    if let Ok(c_val) = HeaderValue::from_str(&cookies.join("; ")) {
        headers.insert(COOKIE, c_val);
    }
    headers
}

pub async fn probe_session_health(force: bool) -> SessionHealthInfo {
    let settings = read_json_safe(
        &get_data_dir().join("settings.json"),
        AppSettings::default(),
    );
    if settings.poesessid.trim().is_empty() {
        return update_session_health(
            SessionState::Unconfigured,
            "尚未設定 POESESSID 官方憑證".to_string(),
            None,
        );
    }

    let now = get_current_epoch_ms();
    let cached = get_cached_session_health();
    if !force
        && cached.state == SessionState::Valid
        && (now.saturating_sub(cached.last_checked_epoch_ms) < PROBE_CACHE_TTL_MS)
    {
        return cached;
    }

    let client = match reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(6))
        .build()
    {
        Ok(c) => c,
        Err(e) => {
            return update_session_health(
                SessionState::NetworkError,
                format!("網路客戶端初始化失敗: {}", e),
                None,
            );
        }
    };

    let headers = build_probe_headers(&settings);
    let probe_url = if !settings.account_name.trim().is_empty() {
        format!(
            "https://www.pathofexile.com/character-window/get-characters?accountName={}",
            urlencoding::encode(settings.account_name.trim())
        )
    } else {
        "https://www.pathofexile.com/character-window/get-characters".to_string()
    };

    let res = match client.get(&probe_url).headers(headers).send().await {
        Ok(r) => r,
        Err(e) => {
            return update_session_health(
                SessionState::NetworkError,
                format!("無法連線至官方伺服器: {}", e),
                None,
            );
        }
    };

    let status = res.status();
    let res_headers = res.headers().clone();
    let body = res.text().await.unwrap_or_default();

    if status.is_success() {
        let account_opt = if let Ok(val) = serde_json::from_str::<serde_json::Value>(&body) {
            val.as_array()
                .and_then(|arr| arr.first())
                .and_then(|c| c["accountName"].as_str())
                .map(|s| s.to_string())
        } else {
            None
        };
        return update_session_health(
            SessionState::Valid,
            "官方憑證有效，連線正常。".to_string(),
            account_opt.or_else(|| {
                if !settings.account_name.is_empty() {
                    Some(settings.account_name.clone())
                } else {
                    None
                }
            }),
        );
    }

    let (state, message) = classify_http_trade_error(status.as_u16(), &res_headers, &body);
    update_session_health(state, message, None)
}
