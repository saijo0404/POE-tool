#[cfg(target_os = "windows")]
mod win32_listener;

#[cfg(test)]
mod tests;

use crate::services::hotkey::is_poe_item_text;
use serde::{Deserialize, Serialize};
use std::sync::{Mutex, OnceLock};
use tauri::Emitter;
use tauri_plugin_clipboard_manager::ClipboardExt;

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct PoeItemCopiedPayload {
    pub text: String,
    pub timestamp: u64,
}

static LAST_EMITTED_TEXT: Mutex<String> = Mutex::new(String::new());
pub(crate) static APP_HANDLE: OnceLock<tauri::AppHandle> = OnceLock::new();

pub fn is_poe_trade_whisper(text: &str) -> bool {
    let clean = text.trim();
    if !clean.starts_with("@From") && !clean.starts_with("@來自") && !clean.starts_with("@来自")
    {
        return false;
    }
    clean.contains("buy your")
        || clean.contains("想購買")
        || clean.contains("想购买")
        || clean.contains("想要購買")
        || clean.contains("想要购买")
}

pub fn handle_clipboard_change(app: &tauri::AppHandle) {
    let text = match app.clipboard().read_text() {
        Ok(t) if !t.trim().is_empty() => t,
        _ => {
            std::thread::sleep(std::time::Duration::from_millis(20));
            app.clipboard().read_text().unwrap_or_default()
        }
    };

    let is_item = is_poe_item_text(&text);
    let is_whisper = is_poe_trade_whisper(&text);

    if !is_item && !is_whisper {
        return;
    }

    let mut lock = match LAST_EMITTED_TEXT.lock() {
        Ok(l) => l,
        Err(poisoned) => poisoned.into_inner(),
    };

    if *lock == text {
        return;
    }

    *lock = text.clone();
    drop(lock);

    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;

    let payload = PoeItemCopiedPayload {
        text: text.clone(),
        timestamp: now,
    };

    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        crate::models::settings::AppSettings::default(),
    );

    if is_whisper {
        let _ = app.emit("poe-trade-whisper", payload);
        crate::app_log!(
            "[ClipboardListener] 💬 Win32 Push: Trade whisper detected & pushed to frontend (length: {})",
            text.len()
        );
        if settings.overlay_enabled {
            let _ = crate::commands::overlay_commands::show_overlay_window(
                app.clone(),
                None,
                None,
                None,
            );
        }
    } else {
        let _ = app.emit("poe-item-copied", payload);
        crate::app_log!(
            "[ClipboardListener] ⚡ Win32 Push: PoE item detected & pushed to frontend (length: {})",
            text.len()
        );
        if settings.overlay_enabled {
            let _ = crate::commands::overlay_commands::show_overlay_window(
                app.clone(),
                None,
                None,
                Some(text),
            );
        }
    }
}

#[cfg(target_os = "windows")]
pub fn init_clipboard_listener(app: &tauri::AppHandle) {
    let _ = APP_HANDLE.set(app.clone());
    std::thread::Builder::new()
        .name("poe-clipboard-listener".to_string())
        .spawn(move || {
            win32_listener::run_win32_listener();
        })
        .expect("failed to spawn clipboard listener thread");
}

#[cfg(not(target_os = "windows"))]
pub fn init_clipboard_listener(app: &tauri::AppHandle) {
    let _ = APP_HANDLE.set(app.clone());
    let app_handle = app.clone();
    std::thread::Builder::new()
        .name("poe-clipboard-fallback".to_string())
        .spawn(move || loop {
            std::thread::sleep(std::time::Duration::from_millis(1000));
            handle_clipboard_change(&app_handle);
        })
        .expect("failed to spawn fallback clipboard listener thread");
}
