#![allow(
    deprecated,
    clippy::too_many_arguments,
    clippy::permissions_set_readonly_false
)]

pub mod commands;
pub mod models;
pub mod services;
pub mod tray;

use std::sync::atomic::{AtomicBool, Ordering};
use tauri::{Manager, WindowEvent};

static APP_SHOULD_EXIT: AtomicBool = AtomicBool::new(false);

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
            commands::toggle_always_on_top,
            commands::show_main_window,
            commands::hide_main_window,
            commands::get_app_version,
            commands::get_foreground_window_info,
            // Logger Commands
            commands::get_log_contents,
            commands::get_log_file_path,
            // Trade & Parser Commands
            commands::parse_item,
            commands::search_trade,
            commands::get_trade_leagues,
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
            commands::get_pending_overlay_item,
        ])
        .setup(|app| {
            tray::setup_tray(app, &APP_SHOULD_EXIT)?;

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

            // Start Client.txt log watcher service
            services::client_log_watcher::init_client_log_watcher(app.handle());

            // Register Global Hotkeys (e.g. Ctrl+D / Alt+D for in-game Awakened price check)
            use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};
            let shortcuts = ["ctrl+d", "alt+d"];
            for sc_str in shortcuts {
                if let Ok(sc) = sc_str.parse::<Shortcut>() {
                    let app_h = app.handle().clone();
                    let _ = app
                        .global_shortcut()
                        .on_shortcut(sc, move |_app, _shortcut, event| {
                            if event.state == ShortcutState::Pressed {
                                crate::app_log!("[GlobalShortcut] ⚡ Hotkey triggered: {}", sc_str);
                                services::hotkey::trigger_in_game_price_check(&app_h);
                            }
                        });
                }
            }

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
