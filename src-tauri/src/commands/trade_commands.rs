use crate::models::item::ParsedItem;
use crate::models::trade::{TradeQueryRequest, TradeSearchResult};
use crate::services::hotkey::send_in_game_command;
use crate::services::parser::parse_item_text;
use crate::services::trade::{
    search_trade as search_trade_service, send_official_whisper as send_whisper_service,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TravelResult {
    pub success: bool,
    pub game_triggered: bool,
    pub official_whisper_sent: bool,
    pub hideout_cmd: String,
    pub message: String,
}

#[tauri::command]
pub fn parse_item(item_text: String) -> Result<ParsedItem, String> {
    crate::app_log!(
        "[Tauri Command] 📥 parse_item received (len: {} chars)",
        item_text.len()
    );
    if item_text.trim().is_empty() {
        return Err("裝備文字不可為空".to_string());
    }
    let parsed = parse_item_text(&item_text);
    crate::app_log!("[Tauri Command] 📤 parse_item result: name='{}', base='{}', rarity='{}', implicits={}, explicits={}",
        parsed.name, parsed.base_type, parsed.rarity, parsed.implicits.len(), parsed.explicits.len());
    Ok(parsed)
}

#[tauri::command]
pub async fn search_trade(request: TradeQueryRequest) -> Result<TradeSearchResult, String> {
    crate::app_log!("[Tauri Command] 🔍 search_trade called! League: {:?}, Rarity: {:?}, Base: {:?}, Name: {:?}",
        request.league, request.rarity, request.base_type, request.name);
    search_trade_service(request).await
}

#[tauri::command]
pub async fn send_official_whisper(
    token: String,
    league: Option<String>,
) -> Result<String, String> {
    send_whisper_service(&token, league.as_deref()).await
}

#[tauri::command]
pub async fn travel_to_hideout(
    token: Option<String>,
    character_name: Option<String>,
    league: Option<String>,
) -> Result<TravelResult, String> {
    let hideout_cmd = if let Some(ref char_name) = character_name {
        if !char_name.trim().is_empty() {
            format!("/hideout {}", char_name.trim())
        } else {
            "/hideout".to_string()
        }
    } else {
        "/hideout".to_string()
    };

    let mut official_whisper_sent = false;
    let mut whisper_error = None;

    if let Some(tok) = token {
        if !tok.trim().is_empty() {
            match send_whisper_service(&tok, league.as_deref()).await {
                Ok(_) => {
                    official_whisper_sent = true;
                }
                Err(e) => {
                    whisper_error = Some(e);
                }
            }
        }
    }

    let game_triggered = send_in_game_command(&hideout_cmd).unwrap_or(false);
    let message = if game_triggered && official_whisper_sent {
        format!(
            "⚡ 官方直購 (Travel to Hideout) 已觸發，並在遊戲中執行 {}！",
            hideout_cmd
        )
    } else if official_whisper_sent {
        format!(
            "⚡ 官方直購 (Travel to Hideout) 已觸發！已複製 {}",
            hideout_cmd
        )
    } else if game_triggered {
        format!("⚡ 已在遊戲中執行 {} 前往藏身處！", hideout_cmd)
    } else if let Some(err) = whisper_error {
        format!("已複製 {} ({})", hideout_cmd, err)
    } else {
        format!("已複製 {}", hideout_cmd)
    };

    Ok(TravelResult {
        success: true,
        game_triggered,
        official_whisper_sent,
        hideout_cmd,
        message,
    })
}

pub fn open_browser_url(app: Option<&tauri::AppHandle>, url: &str) {
    crate::app_log!("[System] 🌐 正在開啟外部瀏覽器網址: {}", url);
    let mut opened = false;
    if let Some(app_handle) = app {
        if tauri_plugin_shell::ShellExt::shell(app_handle)
            .open(url, None)
            .is_ok()
        {
            opened = true;
        }
    }
    if !opened {
        open_system_browser_fallback(url);
    }
}

fn open_system_browser_fallback(url: &str) {
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::process::CommandExt;
        const CREATE_NO_WINDOW: u32 = 0x08000000;
        let _ = std::process::Command::new("cmd")
            .args(["/C", "start", "", url])
            .creation_flags(CREATE_NO_WINDOW)
            .spawn();
    }
    #[cfg(target_os = "linux")]
    {
        let _ = std::process::Command::new("xdg-open").arg(url).spawn();
    }
    #[cfg(target_os = "macos")]
    {
        let _ = std::process::Command::new("open").arg(url).spawn();
    }
}

#[tauri::command]
pub fn open_external_url(app: tauri::AppHandle, url: String) -> Result<(), String> {
    open_browser_url(Some(&app), &url);
    Ok(())
}

#[tauri::command]
pub fn open_atlas_tree_window(
    app: tauri::AppHandle,
    url: String,
    _title: Option<String>,
) -> Result<(), String> {
    let target_url_str = if url.trim().is_empty() {
        "https://poeplanner.com/atlas-tree".to_string()
    } else {
        url.trim().to_string()
    };

    crate::app_log!(
        "[Atlas Tree] 🌐 正在為使用者開啟輿圖天賦樹: {}",
        target_url_str
    );
    open_browser_url(Some(&app), &target_url_str);
    Ok(())
}

#[tauri::command]
pub async fn create_trade_search_url(
    app: tauri::AppHandle,
    league: String,
    query_json: String,
) -> Result<String, String> {
    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        crate::models::settings::AppSettings::default(),
    );

    let active_league = if !league.is_empty() && league != "Auto" {
        league
    } else if !settings.league.is_empty() && settings.league != "Auto" {
        settings.league.clone()
    } else {
        "Settlers".to_string()
    };

    crate::app_log!(
        "[Trade] 🔍 正在向 GGG 官方市集註冊搜尋條件 (聯盟: {})...",
        active_league
    );
    crate::app_log!("[Trade] 📤 搜尋條件 Payload:\n{}", query_json);

    let client = reqwest::Client::builder()
        .user_agent(crate::services::ninja::DEFAULT_USER_AGENT)
        .timeout(std::time::Duration::from_secs(8))
        .build()
        .map_err(|e| e.to_string())?;

    let api_url = format!(
        "https://www.pathofexile.com/api/trade/search/{}",
        urlencoding::encode(&active_league)
    );
    let mut req = client
        .post(&api_url)
        .header("Origin", "https://www.pathofexile.com")
        .header(
            "Referer",
            format!(
                "https://www.pathofexile.com/trade/search/{}",
                urlencoding::encode(&active_league)
            ),
        )
        .header("Content-Type", "application/json")
        .header("Accept", "application/json")
        .header("X-Requested-With", "XMLHttpRequest");

    if !settings.poesessid.trim().is_empty() {
        req = req.header("Cookie", format!("POESESSID={}", settings.poesessid.trim()));
    }

    if let Ok(val) = serde_json::from_str::<serde_json::Value>(&query_json) {
        if let Ok(res) = req.json(&val).send().await {
            let status = res.status();
            if status.is_success() {
                if let Ok(resp_json) = res.json::<serde_json::Value>().await {
                    if let Some(id) = resp_json["id"].as_str() {
                        let full_url = format!(
                            "https://www.pathofexile.com/trade/search/{}/{}",
                            urlencoding::encode(&active_league),
                            id
                        );
                        crate::app_log!(
                            "[Trade] ✅ 成功建立 GGG 官方市集搜尋 ID: {} -> {}",
                            id,
                            full_url
                        );
                        open_browser_url(Some(&app), &full_url);
                        return Ok(full_url);
                    }
                }
            } else {
                let err_text = res.text().await.unwrap_or_default();
                crate::app_log!(
                    "[Trade] ⚠️ GGG 官方市集註冊查詢回傳狀態 {}: {}",
                    status,
                    err_text
                );
            }
        }
    }

    let fallback_url = format!(
        "https://www.pathofexile.com/trade/search/{}?q={}",
        urlencoding::encode(&active_league),
        urlencoding::encode(&query_json)
    );
    crate::app_log!("[Trade] ↩️ 使用回退市集首頁: {}", fallback_url);
    open_browser_url(Some(&app), &fallback_url);
    Ok(fallback_url)
}
