#[cfg(target_os = "windows")]
pub async fn extract_poe_cookies_from_webview(
    window: &tauri::WebviewWindow,
) -> Result<(Option<String>, Option<String>), String> {
    use webview2_com::{
        take_pwstr, GetCookiesCompletedHandler, Microsoft::Web::WebView2::Win32::ICoreWebView2_2,
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
            let _ = GetCookiesCompletedHandler::wait_for_async_operation(
                Box::new(move |handler| {
                    cookie_manager
                        .GetCookies(uri, &handler)
                        .map_err(|e| e.into())
                }),
                Box::new(move |_hresult, cookie_list| {
                    let (mut found_poesessid, mut found_cf) = (None, None);
                    if let Some(list) = cookie_list {
                        let mut count = 0u32;
                        if list.Count(&mut count).is_ok() {
                            for i in 0..count {
                                if let Ok(c) = list.GetValueAtIndex(i) {
                                    let (mut name_pwstr, mut val_pwstr) =
                                        (windows_core::PWSTR::null(), windows_core::PWSTR::null());
                                    if c.Name(&mut name_pwstr).is_ok()
                                        && c.Value(&mut val_pwstr).is_ok()
                                    {
                                        let (name, val) =
                                            (take_pwstr(name_pwstr), take_pwstr(val_pwstr));
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
