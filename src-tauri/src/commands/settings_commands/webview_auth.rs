use tauri::Manager;
use super::auth_ops::{handle_auto_login_success, LoginAuthResult};

#[cfg(target_os = "windows")]
pub async fn extract_poe_cookies_from_webview(
    window: &tauri::WebviewWindow,
) -> Result<(Option<String>, Option<String>), String> {
    use webview2_com::{take_pwstr, GetCookiesCompletedHandler, Microsoft::Web::WebView2::Win32::ICoreWebView2_2};
    use windows_core::{w, Interface};

    let (tx, rx) = tokio::sync::oneshot::channel();
    window.with_webview(move |webview| unsafe {
        let controller = webview.controller();
        let core = match controller.CoreWebView2() {
            Ok(c) => c,
            Err(e) => { let _ = tx.send(Err(format!("CoreWebView2 error: {:?}", e))); return; }
        };
        let core2: ICoreWebView2_2 = match core.cast() {
            Ok(c2) => c2,
            Err(e) => { let _ = tx.send(Err(format!("Cast error: {:?}", e))); return; }
        };
        let cookie_manager = match core2.CookieManager() {
            Ok(m) => m,
            Err(e) => { let _ = tx.send(Err(format!("CookieManager error: {:?}", e))); return; }
        };

        let uri = w!("https://www.pathofexile.com");
        let mut poe_tx = Some(tx);
        let _ = GetCookiesCompletedHandler::wait_for_async_operation(
            Box::new(move |handler| cookie_manager.GetCookies(uri, &handler).map_err(|e| e.into())),
            Box::new(move |_hresult, cookie_list| {
                let (mut found_poesessid, mut found_cf) = (None, None);
                if let Some(list) = cookie_list {
                    let mut count = 0u32;
                    if list.Count(&mut count).is_ok() {
                        for i in 0..count {
                            if let Ok(c) = list.GetValueAtIndex(i) {
                                let (mut name_pwstr, mut val_pwstr) = (windows_core::PWSTR::null(), windows_core::PWSTR::null());
                                if c.Name(&mut name_pwstr).is_ok() && c.Value(&mut val_pwstr).is_ok() {
                                    let (name, val) = (take_pwstr(name_pwstr), take_pwstr(val_pwstr));
                                    if name == "POESESSID" && !val.trim().is_empty() { found_poesessid = Some(val); }
                                    else if name == "cf_clearance" && !val.trim().is_empty() { found_cf = Some(val); }
                                }
                            }
                        }
                    }
                }
                if let Some(sender) = poe_tx.take() { let _ = sender.send(Ok((found_poesessid, found_cf))); }
                Ok(())
            }),
        );
    }).map_err(|e| e.to_string())?;

    rx.await.map_err(|e| e.to_string())?
}

#[cfg(not(target_os = "windows"))]
pub async fn extract_poe_cookies_from_webview(
    _window: &tauri::WebviewWindow,
) -> Result<(Option<String>, Option<String>), String> {
    Ok((None, None))
}

const LOGIN_INIT_SCRIPT: &str = r#"
    (function() {
        if (window.top !== window) return;
        var syncTriggered = false;
        function doAutoBind(accountName) {
            if (syncTriggered || !accountName) return;
            syncTriggered = true;
            try { window.location.hash = 'poe_auth=' + encodeURIComponent(accountName); } catch (e) {}
            document.title = 'AUTH_OK:' + accountName;
        }
        function checkLoginStatus() {
            if (syncTriggered) return;
            var profileLink = document.querySelector('.profile-link a') || document.querySelector('a[href*="/account/view-profile/"]');
            if (profileLink && profileLink.innerText && profileLink.innerText.trim().length > 0) {
                doAutoBind(profileLink.innerText.trim());
                return;
            }
            fetch('/character-window/get-characters', { credentials: 'include' })
                .then(function(r) { return r.json(); })
                .then(function(data) { if (Array.isArray(data) && data.length > 0 && data[0].accountName) doAutoBind(data[0].accountName); })
                .catch(function() {});
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', checkLoginStatus);
        } else {
            checkLoginStatus();
        }
        setInterval(checkLoginStatus, 1500);
    })();
"#;

#[tauri::command]
pub async fn login_auth(app: tauri::AppHandle) -> Result<LoginAuthResult, String> {
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

    let win_builder = tauri::WebviewWindowBuilder::new(&app, "poe_login_window", tauri::WebviewUrl::External(login_url))
        .title("Path of Exile 官方快速登入 (POE_tool 全自動綁定)")
        .inner_size(720.0, 800.0)
        .center()
        .always_on_top(true)
        .initialization_script(LOGIN_INIT_SCRIPT);

    match win_builder.build() {
        Ok(win) => {
            let _ = win.show();
            let _ = win.set_focus();
            spawn_login_watcher(app);
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

fn spawn_login_watcher(app: tauri::AppHandle) {
    tokio::spawn(async move {
        for _ in 0..300 {
            tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;
            let current_win = match app.get_webview_window("poe_login_window") {
                Some(w) => w,
                None => break,
            };
            if let Some(acc_name) = detect_account_from_window(&current_win) {
                let (poesessid_opt, cf_opt) = extract_poe_cookies_from_webview(&current_win).await.unwrap_or((None, None));
                let _ = handle_auto_login_success(app.clone(), acc_name, poesessid_opt, cf_opt, Vec::new()).await;
                tokio::time::sleep(tokio::time::Duration::from_millis(800)).await;
                if let Some(w) = app.get_webview_window("poe_login_window") { let _ = w.close(); }
                break;
            }
        }
    });
}

fn detect_account_from_window(win: &tauri::WebviewWindow) -> Option<String> {
    if let Ok(url) = win.url() {
        let url_str = url.as_str();
        if let Some(pos) = url_str.find("poe_auth=") {
            let encoded = &url_str[pos + "poe_auth=".len()..];
            let acc = encoded.split('&').next().unwrap_or("");
            let decoded = urlencoding::decode(acc).unwrap_or_default().to_string();
            if !decoded.is_empty() { return Some(decoded); }
        }
    }
    if let Ok(title) = win.title() {
        if title.starts_with("AUTH_OK:") {
            let acc = title["AUTH_OK:".len()..].trim().to_string();
            if !acc.is_empty() { return Some(acc); }
        }
    }
    None
}
