use crate::models::session::{SessionHealthInfo, SessionState};
use crate::models::settings::AppSettings;
use crate::services::storage::{get_data_dir, read_json_safe};
use std::sync::{OnceLock, RwLock};
use std::time::{SystemTime, UNIX_EPOCH};

static SESSION_CACHE: OnceLock<RwLock<SessionHealthInfo>> = OnceLock::new();

fn get_cache_lock() -> &'static RwLock<SessionHealthInfo> {
    SESSION_CACHE.get_or_init(|| RwLock::new(SessionHealthInfo::default()))
}

pub(crate) fn get_current_epoch_ms() -> u64 {
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
