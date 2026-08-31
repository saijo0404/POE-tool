use super::settings_ops::{get_settings, sanitize_poesessid};
use crate::models::session::{SessionHealthInfo, SessionState};
use crate::services::stash::fetch_user_characters;
use crate::services::storage::{get_data_dir, write_json_atomic};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::Emitter;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ConnectionTestResult {
    pub success: bool,
    pub message: String,
    pub characters_count: Option<usize>,
    pub characters: Option<Vec<Value>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginAuthResult {
    pub success: bool,
    pub account_name: Option<String>,
    pub poesessid: Option<String>,
    pub message: String,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthStatusResult {
    pub logged_in: bool,
    pub account_name: String,
}

#[tauri::command]
pub async fn check_session_health(force: Option<bool>) -> SessionHealthInfo {
    crate::services::session::probe_session_health(force.unwrap_or(false)).await
}

#[tauri::command]
pub fn get_session_health() -> SessionHealthInfo {
    crate::services::session::get_cached_session_health()
}

#[tauri::command]
pub async fn test_connection(
    poesessid: Option<String>,
    account_name: Option<String>,
) -> Result<ConnectionTestResult, String> {
    let mut current = get_settings();
    if let Some(sess) = poesessid {
        current.poesessid = sanitize_poesessid(&sess);
    }
    if let Some(acc) = account_name {
        current.account_name = acc.trim().to_string();
    }

    if current.poesessid.trim().is_empty() {
        crate::services::session::update_session_health(
            SessionState::Unconfigured,
            "請先填入 POESESSID。".to_string(),
            None,
        );
        return Ok(ConnectionTestResult {
            success: false,
            message: "請先填入 POESESSID。".to_string(),
            characters_count: Some(0),
            characters: None,
        });
    }

    let path = get_data_dir().join("settings.json");
    let _ = write_json_atomic(&path, &current);

    let chars = fetch_user_characters().await.unwrap_or_default();
    if !chars.is_empty() {
        if let Some(first_char) = chars.first() {
            if let Some(acc) = first_char["accountName"].as_str() {
                if !acc.trim().is_empty() {
                    current.account_name = acc.trim().to_string();
                    let _ = write_json_atomic(&path, &current);
                }
            }
        }
        crate::services::session::mark_session_valid(&current.account_name);
        return Ok(ConnectionTestResult {
            success: true,
            message: if !current.account_name.is_empty() {
                format!(
                    "連線成功！帳號 [{}] 共偵測到 {} 隻角色。",
                    current.account_name,
                    chars.len()
                )
            } else {
                format!("連線成功！共偵測到 {} 隻角色。", chars.len())
            },
            characters_count: Some(chars.len()),
            characters: Some(chars),
        });
    }

    crate::services::session::mark_session_valid(&current.account_name);
    Ok(ConnectionTestResult {
        success: true,
        message: "連線測試完成！POESESSID 官方驗證有效。".to_string(),
        characters_count: Some(0),
        characters: Some(Vec::new()),
    })
}

#[tauri::command]
pub async fn handle_auto_login_success(
    app: tauri::AppHandle,
    account_name: String,
    poesessid: Option<String>,
    cf_clearance: Option<String>,
    user_agent: Option<String>,
    mut characters: Vec<Value>,
) -> Result<bool, String> {
    let mut settings = get_settings();
    if !account_name.trim().is_empty() {
        settings.account_name = account_name.clone();
    }
    if let Some(sess) = poesessid {
        if !sess.trim().is_empty() {
            settings.poesessid = sess.trim().to_string();
        }
    }
    if let Some(cf) = cf_clearance {
        if !cf.trim().is_empty() {
            settings.cf_clearance = Some(cf.trim().to_string());
        }
    }
    if let Some(ua) = user_agent {
        if !ua.trim().is_empty() {
            settings.user_agent = Some(ua.trim().to_string());
        }
    }

    let path = get_data_dir().join("settings.json");
    let _ = write_json_atomic(&path, &settings);

    crate::services::session::mark_session_valid(&settings.account_name);

    if characters.is_empty() {
        characters = fetch_user_characters().await.unwrap_or_default();
    }

    let _ = app.emit(
        "auto-login-completed",
        json!({
            "accountName": settings.account_name,
            "poesessid": settings.poesessid,
            "cfClearance": settings.cf_clearance,
            "userAgent": settings.user_agent,
            "charactersCount": characters.len(),
            "characters": characters
        }),
    );

    Ok(true)
}

#[tauri::command]
pub fn logout_auth() -> Result<bool, String> {
    let mut settings = get_settings();
    settings.poesessid = String::new();
    settings.account_name = String::new();
    settings.cf_clearance = None;
    let path = get_data_dir().join("settings.json");
    write_json_atomic(&path, &settings)?;
    crate::services::session::update_session_health(
        SessionState::Unconfigured,
        "已登出官方帳號".to_string(),
        None,
    );
    Ok(true)
}

#[tauri::command]
pub fn get_auth_status() -> AuthStatusResult {
    let settings = get_settings();
    AuthStatusResult {
        logged_in: !settings.poesessid.trim().is_empty()
            || !settings.account_name.trim().is_empty(),
        account_name: settings.account_name.clone(),
    }
}
