#![allow(
    deprecated,
    clippy::too_many_arguments,
    clippy::permissions_set_readonly_false
)]

pub mod commands;
pub mod models;
pub mod services;

use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
    Manager, WindowEvent,
};

static APP_SHOULD_EXIT: AtomicBool = AtomicBool::new(false);

#[tauri::command]
fn toggle_always_on_top(window: tauri::Window, enable: bool) -> Result<bool, String> {
    window
        .set_always_on_top(enable)
        .map_err(|e| e.to_string())?;
    Ok(enable)
}

#[tauri::command]
fn show_main_window(window: tauri::Window) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn hide_main_window(window: tauri::Window) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(target_os = "linux")]
    {
        std::env::set_var("LIBGL_ALWAYS_SOFTWARE", "1");
        std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    services::logger::init_logger();
    services::stash::init_stash_service();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            // Window Management
            toggle_always_on_top,
            show_main_window,
            hide_main_window,
            get_app_version,
            // Logger Commands
            commands::get_log_contents,
            commands::get_log_file_path,
            // Trade & Parser Commands
            commands::parse_item,
            commands::search_trade,
            commands::send_official_whisper,
            commands::travel_to_hideout,
            commands::create_trade_search_url,
            commands::open_external_url,
            commands::open_atlas_tree_window,
            // Stash & Wealth Commands
            commands::get_wealth_snapshots,
            commands::take_wealth_snapshot,
            commands::clear_wealth_snapshots,
            commands::get_stash_progress,
            commands::get_stash_tabs,
            // poe.ninja & Build Calculator Commands
            commands::get_ninja_prices,
            commands::calculate_build,
            commands::fetch_build_item_live_price,
            // Settings & Connection Commands
            commands::get_settings,
            commands::update_settings,
            commands::test_connection,
            commands::get_characters,
            commands::login_auth,
            commands::handle_auto_login_success,
            commands::logout_auth,
            commands::get_auth_status,
            commands::check_session_health,
            commands::get_session_health,
            // Hotkey & Clipboard Commands
            commands::read_clipboard,
            commands::get_latest_clipboard,
            commands::trigger_in_game_command,
            // Overlay Commands
            commands::get_cursor_position,
            commands::show_overlay_window,
            commands::hide_overlay_window,
            commands::set_overlay_click_through,
        ])
        .setup(|app| {
            // Build Tray Menu
            let show_item =
                MenuItem::with_id(app, "show", "開啟查價工具 (Show)", true, None::<&str>)?;
            let hide_item =
                MenuItem::with_id(app, "hide", "最小化至背景 (Hide)", true, None::<&str>)?;
            let pin_item =
                MenuItem::with_id(app, "pin", "切換置頂 (Always on Top)", true, None::<&str>)?;
            let quit_item =
                MenuItem::with_id(app, "quit", "結束應用程式 (Quit)", true, None::<&str>)?;

            let tray_menu =
                Menu::with_items(app, &[&show_item, &hide_item, &pin_item, &quit_item])?;

            if let Some(icon) = app.default_window_icon() {
                let _tray = TrayIconBuilder::new()
                    .icon(icon.clone())
                    .menu(&tray_menu)
                    .show_menu_on_left_click(false)
                    .on_menu_event(|app, event| match event.id.as_ref() {
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
                            APP_SHOULD_EXIT.store(true, Ordering::SeqCst);
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

            // Direct exit when main window is closed by user
            if let Some(window) = app.get_webview_window("main") {
                let app_handle = app.handle().clone();
                window.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { .. } = event {
                        APP_SHOULD_EXIT.store(true, Ordering::SeqCst);
                        app_handle.exit(0);
                    }
                });
                let _ = window.show();
            }

            // Handle overlay window lifecycle (prevent destruction, hide on close request)
            if let Some(overlay_win) = app.get_webview_window("overlay") {
                let overlay_clone = overlay_win.clone();
                overlay_win.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = overlay_clone.hide();
                    }
                });
            }

            // Start push-based clipboard listener service
            services::clipboard_listener::init_clipboard_listener(app.handle());

            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app_handle, event| {
            if let tauri::RunEvent::ExitRequested { api, .. } = event {
                if !APP_SHOULD_EXIT.load(Ordering::SeqCst) {
                    api.prevent_exit();
                }
            }
        });
}
