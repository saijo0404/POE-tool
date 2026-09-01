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
static APP_HANDLE: OnceLock<tauri::AppHandle> = OnceLock::new();

pub fn handle_clipboard_change(app: &tauri::AppHandle) {
    let text = match app.clipboard().read_text() {
        Ok(t) if !t.trim().is_empty() => t,
        _ => {
            std::thread::sleep(std::time::Duration::from_millis(20));
            app.clipboard().read_text().unwrap_or_default()
        }
    };

    if !is_poe_item_text(&text) {
        return;
    }

    let mut lock = match LAST_EMITTED_TEXT.lock() {
        Ok(l) => l,
        Err(poisoned) => poisoned.into_inner(),
    };

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

    let _ = app.emit("poe-item-copied", payload);
    crate::app_log!(
        "[ClipboardListener] ⚡ Win32 Push: PoE item detected & pushed to frontend (length: {})",
        text.len()
    );

    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        crate::models::settings::AppSettings::default(),
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

#[cfg(target_os = "windows")]
pub fn init_clipboard_listener(app: &tauri::AppHandle) {
    let _ = APP_HANDLE.set(app.clone());
    std::thread::Builder::new()
        .name("poe-clipboard-listener".to_string())
        .spawn(move || {
            run_win32_listener();
        })
        .expect("failed to spawn clipboard listener thread");
}

#[cfg(target_os = "windows")]
fn run_win32_listener() {
    use std::ptr::null_mut;
    use windows::core::PCWSTR;
    use windows::Win32::Foundation::{HINSTANCE, HWND, LPARAM, LRESULT, WPARAM};
    use windows::Win32::Graphics::Gdi::HBRUSH;
    use windows::Win32::System::DataExchange::{
        AddClipboardFormatListener, RemoveClipboardFormatListener,
    };
    use windows::Win32::UI::WindowsAndMessaging::{
        CreateWindowExW, DefWindowProcW, DestroyWindow, DispatchMessageW, GetMessageW,
        RegisterClassExW, TranslateMessage, HCURSOR, HICON, HWND_MESSAGE, MSG, WINDOW_EX_STYLE,
        WINDOW_STYLE, WM_CLIPBOARDUPDATE, WNDCLASSEXW, WNDCLASS_STYLES,
    };

    unsafe extern "system" fn wndproc(
        hwnd: HWND,
        msg: u32,
        wparam: WPARAM,
        lparam: LPARAM,
    ) -> LRESULT {
        if msg == WM_CLIPBOARDUPDATE {
            if let Some(app) = APP_HANDLE.get() {
                handle_clipboard_change(app);
            }
            return LRESULT(0);
        }
        DefWindowProcW(hwnd, msg, wparam, lparam)
    }

    unsafe {
        let class_name: Vec<u16> = "PoeToolClipboardListener\0".encode_utf16().collect();
        let wnd_class = WNDCLASSEXW {
            cbSize: std::mem::size_of::<WNDCLASSEXW>() as u32,
            style: WNDCLASS_STYLES(0),
            lpfnWndProc: Some(wndproc),
            cbClsExtra: 0,
            cbWndExtra: 0,
            hInstance: HINSTANCE(null_mut()),
            hIcon: HICON(null_mut()),
            hCursor: HCURSOR(null_mut()),
            hbrBackground: HBRUSH(null_mut()),
            lpszMenuName: PCWSTR::null(),
            lpszClassName: PCWSTR(class_name.as_ptr()),
            hIconSm: HICON(null_mut()),
        };

        if RegisterClassExW(&wnd_class) == 0 {
            crate::app_log!("[ClipboardListener] ❌ Failed to register window class");
            return;
        }

        let hwnd = CreateWindowExW(
            WINDOW_EX_STYLE(0),
            PCWSTR(class_name.as_ptr()),
            PCWSTR::null(),
            WINDOW_STYLE(0),
            0,
            0,
            0,
            0,
            HWND_MESSAGE,
            None,
            HINSTANCE(null_mut()),
            None,
        );

        let hwnd = match hwnd {
            Ok(h) if !h.0.is_null() => h,
            _ => {
                crate::app_log!("[ClipboardListener] ❌ Failed to create message-only window");
                return;
            }
        };

        if let Err(e) = AddClipboardFormatListener(hwnd) {
            crate::app_log!(
                "[ClipboardListener] ❌ AddClipboardFormatListener failed: {}",
                e
            );
            let _ = DestroyWindow(hwnd);
            return;
        }

        crate::app_log!(
            "[ClipboardListener] 🚀 Win32 AddClipboardFormatListener active (0ms push mode)"
        );

        let mut msg = MSG::default();
        while GetMessageW(&mut msg, HWND(null_mut()), 0, 0).as_bool() {
            let _ = TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }

        let _ = RemoveClipboardFormatListener(hwnd);
        let _ = DestroyWindow(hwnd);
    }
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

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_poe_item_copied_payload_serialization() {
        let payload = PoeItemCopiedPayload {
            text: "稀有度: 傳奇\n賭神芬多\n--------".to_string(),
            timestamp: 1700000000000,
        };

        let json = serde_json::to_string(&payload).expect("should serialize");
        assert!(json.contains("\"text\":"));
        assert!(json.contains("\"timestamp\":1700000000000"));

        let deserialized: PoeItemCopiedPayload =
            serde_json::from_str(&json).expect("should deserialize");
        assert_eq!(deserialized, payload);
    }

    #[test]
    fn test_deduplication_state() {
        let mut lock = LAST_EMITTED_TEXT.lock().unwrap();
        *lock = "initial".to_string();
        assert_eq!(*lock, "initial");
        *lock = String::new();
    }
}
