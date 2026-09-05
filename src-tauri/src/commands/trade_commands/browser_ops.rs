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
    engine: Option<String>,
) -> Result<String, String> {
    use crate::services::trade::trade_urls::{
        get_trade_search_api_url, get_trade_search_web_query_url, get_trade_search_web_url,
        is_poe2_engine,
    };

    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        crate::models::settings::AppSettings::default(),
    );

    let is_poe2 = is_poe2_engine(engine.as_deref());
    let default_league = if is_poe2 { "Standard" } else { "Settlers" };

    let active_league = if !league.is_empty() && league != "Auto" {
        league
    } else if !settings.league.is_empty() && settings.league != "Auto" {
        settings.league.clone()
    } else {
        default_league.to_string()
    };

    crate::app_log!(
        "[Trade] 🔍 正在向 GGG 官方市集註冊搜尋條件 (聯盟: {}, engine: {:?})...",
        active_league,
        engine
    );
    crate::app_log!("[Trade] 📤 搜尋條件 Payload:\n{}", query_json);

    let client = reqwest::Client::builder()
        .user_agent(crate::services::ninja::DEFAULT_USER_AGENT)
        .timeout(std::time::Duration::from_secs(8))
        .build()
        .map_err(|e| e.to_string())?;

    let api_url = get_trade_search_api_url(is_poe2, false, &active_league);
    let mut req = client
        .post(&api_url)
        .header("Origin", "https://www.pathofexile.com")
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
                        let full_url = get_trade_search_web_url(is_poe2, false, &active_league, id);
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

    let fallback_url = get_trade_search_web_query_url(is_poe2, false, &active_league, &query_json);
    crate::app_log!("[Trade] ↩️ 使用回退市集首頁: {}", fallback_url);
    open_browser_url(Some(&app), &fallback_url);
    Ok(fallback_url)
}
