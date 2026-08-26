use crate::services::hotkey::{is_poe_item_text, send_in_game_command};
use serde::{Deserialize, Serialize};
use tauri_plugin_clipboard_manager::ClipboardExt;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClipboardReadResult {
    pub text: String,
    pub is_poe_item: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LatestClipboardResult {
    pub text: Option<String>,
    pub timestamp: u64,
}

use lazy_static::lazy_static;
use std::sync::Mutex;

lazy_static! {
    static ref LAST_CLIPBOARD: Mutex<(String, u64)> = Mutex::new((String::new(), 0));
}

#[tauri::command]
pub fn read_clipboard(app: tauri::AppHandle) -> Result<ClipboardReadResult, String> {
    let text = app.clipboard().read_text().unwrap_or_default();
    let is_poe = is_poe_item_text(&text);
    Ok(ClipboardReadResult {
        text,
        is_poe_item: is_poe,
    })
}

#[tauri::command]
pub fn get_latest_clipboard(app: tauri::AppHandle) -> Result<LatestClipboardResult, String> {
    let text = app.clipboard().read_text().ok().unwrap_or_default();
    let is_poe = is_poe_item_text(&text);

    if !is_poe || text.trim().is_empty() {
        return Ok(LatestClipboardResult {
            text: None,
            timestamp: 0,
        });
    }

    let mut lock = LAST_CLIPBOARD.lock().unwrap();
    if lock.0 != text {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis() as u64;
        lock.0 = text.clone();
        lock.1 = now;
        crate::app_log!(
            "[Clipboard] 📋 New PoE item copied to clipboard! (length: {} chars)",
            text.len()
        );
        Ok(LatestClipboardResult {
            text: Some(text),
            timestamp: now,
        })
    } else {
        // Text is identical to last read, return the SAME timestamp to prevent continuous re-pasting
        Ok(LatestClipboardResult {
            text: Some(text),
            timestamp: lock.1,
        })
    }
}

#[tauri::command]
pub fn trigger_in_game_command(command: String) -> Result<bool, String> {
    send_in_game_command(&command)
}
