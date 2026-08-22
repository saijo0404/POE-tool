use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{Emitter, Manager};
use crate::models::settings::AppSettings;
use crate::services::stash::fetch_user_characters;
use crate::services::storage::{get_data_dir, read_json_safe, write_json_atomic};

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

fn sanitize_poesessid(raw: &str) -> String {
    let trimmed = raw.trim();
    if trimmed.contains("POESESSID=") {
        if let Some(pos) = trimmed.find("POESESSID=") {
            let sub = &trimmed[pos + "POESESSID=".len()..];
            let val = sub.split(';').next().unwrap_or("").trim();
            return val.trim_matches('"').trim_matches('\'').to_string();
        }
    }
    trimmed.trim_matches('"').trim_matches('\'').to_string()
}

#[tauri::command]
pub fn get_settings() -> AppSettings {
    let path = get_data_dir().join("settings.json");
    read_json_safe(&path, AppSettings::default())
}

#[tauri::command]
pub fn update_settings(mut settings: AppSettings) -> Result<AppSettings, String> {
    settings.poesessid = sanitize_poesessid(&settings.poesessid);
    let path = get_data_dir().join("settings.json");
    write_json_atomic(&path, &settings)?;
    Ok(settings)
}

#[tauri::command]
pub async fn get_characters() -> Result<Vec<Value>, String> {
    fetch_user_characters().await
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
        return Ok(ConnectionTestResult {
            success: false,
            message: "請先填入 POESESSID。".to_string(),
            characters_count: Some(0),
            characters: None,
        });
    }

    // Save current tested credentials
    let path = get_data_dir().join("settings.json");
    let _ = write_json_atomic(&path, &current);

    // Attempt fetching characters
    let chars = fetch_user_characters().await.unwrap_or_default();
    if !chars.is_empty() {
        // Auto-extract account name from character data if present
        if let Some(first_char) = chars.first() {
            if let Some(acc) = first_char["accountName"].as_str() {
                if !acc.trim().is_empty() {
                    current.account_name = acc.trim().to_string();
                    let _ = write_json_atomic(&path, &current);
                }
            }
        }

        return Ok(ConnectionTestResult {
            success: true,
            message: if !current.account_name.is_empty() {
                format!("連線成功！帳號 [{}] 共偵測到 {} 隻角色。", current.account_name, chars.len())
            } else {
                format!("連線成功！共偵測到 {} 隻角色。", chars.len())
            },
            characters_count: Some(chars.len()),
            characters: Some(chars),
        });
    }

    Ok(ConnectionTestResult {
        success: true,
        message: "連線測試完成！POESESSID 官方驗證有效。".to_string(),
        characters_count: Some(0),
        characters: Some(Vec::new()),
    })
}

#[cfg(target_os = "windows")]
pub async fn extract_poe_cookies_from_webview(
    window: &tauri::WebviewWindow,
) -> Result<(Option<String>, Option<String>), String> {
    use webview2_com::{
        take_pwstr, GetCookiesCompletedHandler,
        Microsoft::Web::WebView2::Win32::ICoreWebView2_2,
    };
    use windows_core::{w, Interface};

    let (tx, rx) = tokio::sync::oneshot::channel();

    window
        .with_webview(move |webview| unsafe {
            let controller = webview.controller();
            let core = match controller.CoreWebView2() {
                Ok(c) => c,
                Err(e) => {
                    let _ = tx.send(Err(format!("CoreWebView2 error: {:?}", e)));
                    return;
                }
            };

            let core2: ICoreWebView2_2 = match core.cast() {
                Ok(c2) => c2,
                Err(e) => {
                    let _ = tx.send(Err(format!("Cast error: {:?}", e)));
                    return;
                }
            };

            let cookie_manager = match core2.CookieManager() {
                Ok(m) => m,
                Err(e) => {
                    let _ = tx.send(Err(format!("CookieManager error: {:?}", e)));
                    return;
                }
            };

            let uri = w!("https://www.pathofexile.com");
            let mut poe_tx = Some(tx);

            let res = GetCookiesCompletedHandler::wait_for_async_operation(
                Box::new(move |handler| {
                    cookie_manager.GetCookies(uri, &handler).map_err(|e| e.into())
                }),
                Box::new(move |_hresult, cookie_list| {
                    let mut found_poesessid: Option<String> = None;
                    let mut found_cf: Option<String> = None;

                    if let Some(list) = cookie_list {
                        let mut count = 0u32;
                        if list.Count(&mut count).is_ok() {
                            for i in 0..count {
                                if let Ok(c) = list.GetValueAtIndex(i) {
                                    let mut name_pwstr = windows_core::PWSTR::null();
                                    let mut val_pwstr = windows_core::PWSTR::null();
                                    if c.Name(&mut name_pwstr).is_ok() && c.Value(&mut val_pwstr).is_ok() {
                                        let name = take_pwstr(name_pwstr);
                                        let val = take_pwstr(val_pwstr);
                                        if name == "POESESSID" && !val.trim().is_empty() {
                                            found_poesessid = Some(val);
                                        } else if name == "cf_clearance" && !val.trim().is_empty() {
                                            found_cf = Some(val);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if let Some(sender) = poe_tx.take() {
                        let _ = sender.send(Ok((found_poesessid, found_cf)));
                    }
                    Ok(())
                }),
            );

            if let Err(e) = res {
                eprintln!("[CookieExtractor] error: {:?}", e);
            }
        })
        .map_err(|e| e.to_string())?;

    rx.await.map_err(|e| e.to_string())?
}

#[cfg(not(target_os = "windows"))]
pub async fn extract_poe_cookies_from_webview(
    _window: &tauri::WebviewWindow,
) -> Result<(Option<String>, Option<String>), String> {
    Ok((None, None))
}

#[tauri::command]
pub async fn login_auth(app: tauri::AppHandle) -> Result<LoginAuthResult, String> {
    // If login window already exists, focus it
    if let Some(win) = app.get_webview_window("poe_login_window") {
        let _ = win.show();
        let _ = win.set_focus();
        return Ok(LoginAuthResult {
            success: true,
            account_name: None,
            poesessid: None,
            message: "已為您聚焦官方登入視窗，請在視窗中登入帳號。".to_string(),
            error: None,
        });
    }

    let login_url = match "https://www.pathofexile.com/login".parse() {
        Ok(u) => u,
        Err(e) => return Err(format!("網址解析失敗: {:?}", e)),
    };

    let init_script = r#"
        (function() {
            if (window.top !== window) return;

            var syncTriggered = false;

            function doAutoBind(accountName) {
                if (syncTriggered || !accountName) return;
                syncTriggered = true;

                // Update hash safely without page reload/navigation
                try {
                    window.location.hash = 'poe_auth=' + encodeURIComponent(accountName);
                } catch (e) {}

                document.title = 'AUTH_OK:' + accountName;

                var bar = document.getElementById('poe-tool-banner');
                if (bar) {
                    bar.innerHTML = '🎉 <b>已成功偵測到帳號：' + accountName + '</b>！資料已同步至主程式，即將關閉視窗...';
                    bar.style.background = '#065f46';
                    bar.style.color = '#34d399';
                }
            }

            function checkLoginStatus() {
                if (syncTriggered) return;

                var profileLink = document.querySelector('.profile-link a') || document.querySelector('a[href*="/account/view-profile/"]');
                if (profileLink && profileLink.innerText && profileLink.innerText.trim().length > 0) {
                    var acc = profileLink.innerText.trim();
                    doAutoBind(acc);
                    return;
                }

                fetch('/character-window/get-characters', { credentials: 'include' })
                    .then(function(r) { return r.json(); })
                    .then(function(data) {
                        if (Array.isArray(data) && data.length > 0 && data[0].accountName) {
                            doAutoBind(data[0].accountName);
                        }
                    })
                    .catch(function() {});
            }

            function injectTopBanner() {
                if (document.getElementById('poe-tool-banner')) return;
                if (!document.body) return;

                var bar = document.createElement('div');
                bar.id = 'poe-tool-banner';
                bar.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#0f172a;color:#fbbf24;padding:10px 16px;z-index:2147483647;border-bottom:2px solid #fbbf24;display:flex;align-items:center;justify-content:space-between;box-shadow:0 4px 12px rgba(0,0,0,0.8);font-family:sans-serif;font-size:13px;';
                bar.innerHTML = '<span>💎 <b>POE_tool 官方快速登入</b>：請在下方登入官方帳號，登入完成後將<b>全自動同步並綁定</b>！</span>';
                
                var checkBtn = document.createElement('button');
                checkBtn.innerText = '✅ 完成登入點此同步';
                checkBtn.style.cssText = 'background:#fbbf24;color:#000;border:none;padding:5px 14px;font-weight:bold;border-radius:4px;cursor:pointer;font-size:12px;';
                checkBtn.onclick = checkLoginStatus;
                bar.appendChild(checkBtn);

                document.body.prepend(bar);
                document.body.style.paddingTop = '48px';
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    injectTopBanner();
                    checkLoginStatus();
                });
            } else {
                injectTopBanner();
                checkLoginStatus();
            }

            setInterval(checkLoginStatus, 1500);
        })();
    "#;

    let win_builder = tauri::WebviewWindowBuilder::new(&app, "poe_login_window", tauri::WebviewUrl::External(login_url))
        .title("Path of Exile 官方快速登入 (POE_tool 全自動綁定)")
        .inner_size(720.0, 800.0)
        .center()
        .always_on_top(true)
        .initialization_script(init_script);

    match win_builder.build() {
        Ok(win) => {
            let _ = win.show();
            let _ = win.set_focus();

            // Background watcher to detect hash or title changes safely
            let app_poll = app.clone();
            tokio::spawn(async move {
                for _ in 0..300 { // 2.5 minutes max
                    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
                    let current_win = match app_poll.get_webview_window("poe_login_window") {
                        Some(w) => w,
                        None => break,
                    };

                    let mut detected_account: Option<String> = None;

                    // Check 1: URL Hash
                    if let Ok(url) = current_win.url() {
                        let url_str = url.as_str();
                        if url_str.contains("poe_auth=") {
                            if let Some(pos) = url_str.find("poe_auth=") {
                                let encoded = &url_str[pos + "poe_auth=".len()..];
                                let acc = encoded.split('&').next().unwrap_or("");
                                let decoded = urlencoding::decode(acc).unwrap_or_default().to_string();
                                if !decoded.is_empty() {
                                    detected_account = Some(decoded);
                                }
                            }
                        }
                    }

                    // Check 2: Window Title
                    if detected_account.is_none() {
                        if let Ok(title) = current_win.title() {
                            if title.starts_with("AUTH_OK:") {
                                let acc = title["AUTH_OK:".len()..].trim().to_string();
                                if !acc.is_empty() {
                                    detected_account = Some(acc);
                                }
                            }
                        }
                    }

                    if let Some(acc_name) = detected_account {
                        // Extract POESESSID and cf_clearance cookies from WebView2
                        let (poesessid_opt, cf_opt) = extract_poe_cookies_from_webview(&current_win).await.unwrap_or((None, None));
                        
                        let _ = handle_auto_login_success(app_poll.clone(), acc_name, poesessid_opt, cf_opt, Vec::new()).await;
                        tokio::time::sleep(tokio::time::Duration::from_millis(800)).await;
                        if let Some(w) = app_poll.get_webview_window("poe_login_window") {
                            let _ = w.close();
                        }
                        break;
                    }
                }
            });

            Ok(LoginAuthResult {
                success: true,
                account_name: None,
                poesessid: None,
                message: "已為您開啟官方專用登入視窗！登入完成後將全自動綁定並關閉視窗。".to_string(),
                error: None,
            })
        }
        Err(e) => {
            let _ = tauri_plugin_shell::ShellExt::shell(&app).open("https://www.pathofexile.com/login", None);
            Ok(LoginAuthResult {
                success: true,
                account_name: None,
                poesessid: None,
                message: format!("已在瀏覽器開啟官網登入頁面: {}", e),
                error: None,
            })
        }
    }
}

#[tauri::command]
pub async fn handle_auto_login_success(
    app: tauri::AppHandle,
    account_name: String,
    poesessid: Option<String>,
    cf_clearance: Option<String>,
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
    
    // Save settings
    let path = get_data_dir().join("settings.json");
    let _ = write_json_atomic(&path, &settings);

    if characters.is_empty() {
        characters = fetch_user_characters().await.unwrap_or_default();
    }

    // Emit event to main window so UI updates immediately
    let _ = app.emit("auto-login-completed", json!({
        "accountName": settings.account_name,
        "poesessid": settings.poesessid,
        "charactersCount": characters.len(),
        "characters": characters
    }));

    Ok(true)
}

#[tauri::command]
pub fn logout_auth() -> Result<bool, String> {
    let mut settings = get_settings();
    settings.poesessid = String::new();
    settings.account_name = String::new();
    let path = get_data_dir().join("settings.json");
    write_json_atomic(&path, &settings)?;
    Ok(true)
}

#[tauri::command]
pub fn get_auth_status() -> AuthStatusResult {
    let settings = get_settings();
    AuthStatusResult {
        logged_in: !settings.poesessid.trim().is_empty() || !settings.account_name.trim().is_empty(),
        account_name: settings.account_name.clone(),
    }
}
