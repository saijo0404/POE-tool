use super::auth_ops::{handle_auto_login_success, LoginAuthResult};
use super::cookie_extractor::extract_poe_cookies_from_webview;
use tauri::Manager;

const LOGIN_INIT_SCRIPT: &str = r#"
    (function() {
        if (window.top !== window) return;
        var syncTriggered = false;
        function doAutoBind(accountName) {
            if (syncTriggered || !accountName) return;
            syncTriggered = true;
            try {
                var ua = encodeURIComponent(navigator.userAgent || '');
                window.location.hash = 'poe_auth=' + encodeURIComponent(accountName) + '&ua=' + ua;
            } catch (e) {}
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

    let win_builder = tauri::WebviewWindowBuilder::new(
        &app,
        "poe_login_window",
        tauri::WebviewUrl::External(login_url),
    )
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
                message: "已為您開啟官方專用登入視窗！登入完成後將全自動綁定並關閉視窗。"
                    .to_string(),
                error: None,
            })
        }
        Err(e) => {
            let _ = tauri_plugin_shell::ShellExt::shell(&app)
                .open("https://www.pathofexile.com/login", None);
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
            if let Some((acc_name, ua_opt)) = detect_account_from_window(&current_win) {
                let (poesessid_opt, cf_opt) = extract_poe_cookies_from_webview(&current_win)
                    .await
                    .unwrap_or((None, None));
                let _ = handle_auto_login_success(
                    app.clone(),
                    acc_name,
                    poesessid_opt,
                    cf_opt,
                    ua_opt,
                    Vec::new(),
                )
                .await;
                tokio::time::sleep(tokio::time::Duration::from_millis(800)).await;
                if let Some(w) = app.get_webview_window("poe_login_window") {
                    let _ = w.close();
                }
                break;
            }
        }
    });
}

fn detect_account_from_window(win: &tauri::WebviewWindow) -> Option<(String, Option<String>)> {
    if let Ok(url) = win.url() {
        let url_str = url.as_str();
        if let Some(pos) = url_str.find("poe_auth=") {
            let encoded = &url_str[pos + "poe_auth=".len()..];
            let acc = encoded.split('&').next().unwrap_or("");
            let decoded_acc = urlencoding::decode(acc).unwrap_or_default().to_string();

            let mut ua_opt = None;
            if let Some(ua_pos) = url_str.find("&ua=") {
                let ua_encoded = &url_str[ua_pos + "&ua=".len()..];
                let raw_ua = ua_encoded.split('&').next().unwrap_or("");
                let decoded_ua = urlencoding::decode(raw_ua).unwrap_or_default().to_string();
                if !decoded_ua.is_empty() {
                    ua_opt = Some(decoded_ua);
                }
            }

            if !decoded_acc.is_empty() {
                return Some((decoded_acc, ua_opt));
            }
        }
    }
    if let Ok(title) = win.title() {
        if let Some(acc) = title.strip_prefix("AUTH_OK:") {
            let acc = acc.trim().to_string();
            if !acc.is_empty() {
                return Some((acc, None));
            }
        }
    }
    None
}
