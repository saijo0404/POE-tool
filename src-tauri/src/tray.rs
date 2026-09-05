use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    App, Manager,
};

pub fn setup_tray(
    app: &App,
    app_should_exit: &'static AtomicBool,
) -> Result<(), Box<dyn std::error::Error>> {
    let show_item = MenuItem::with_id(app, "show", "開啟查價工具 (Show)", true, None::<&str>)?;
    let hide_item = MenuItem::with_id(app, "hide", "最小化至背景 (Hide)", true, None::<&str>)?;
    let pin_item = MenuItem::with_id(app, "pin", "切換置頂 (Always on Top)", true, None::<&str>)?;
    let quit_item = MenuItem::with_id(app, "quit", "結束應用程式 (Quit)", true, None::<&str>)?;

    let tray_menu = Menu::with_items(app, &[&show_item, &hide_item, &pin_item, &quit_item])?;

    if let Some(icon) = app.default_window_icon() {
        let _tray = TrayIconBuilder::new()
            .icon(icon.clone())
            .menu(&tray_menu)
            .show_menu_on_left_click(false)
            .on_menu_event(move |app, event| match event.id.as_ref() {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "hide" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.hide();
                    }
                }
                "pin" => {
                    if let Some(window) = app.get_webview_window("main") {
                        if let Ok(is_pinned) = window.is_always_on_top() {
                            let _ = window.set_always_on_top(!is_pinned);
                        }
                    }
                }
                "quit" => {
                    app_should_exit.store(true, Ordering::SeqCst);
                    app.exit(0);
                }
                _ => {}
            })
            .on_tray_icon_event(|tray, event| {
                if let TrayIconEvent::Click {
                    button: MouseButton::Left,
                    button_state: MouseButtonState::Up,
                    ..
                } = event
                {
                    let app = tray.app_handle();
                    if let Some(window) = app.get_webview_window("main") {
                        if let Ok(visible) = window.is_visible() {
                            if visible {
                                let _ = window.hide();
                            } else {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                    }
                }
            })
            .build(app)?;
    }
    Ok(())
}
