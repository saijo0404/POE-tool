use tauri_plugin_clipboard_manager::ClipboardExt;

/// Standard window titles associated with Path of Exile 1 (Windows desktop clients).
pub const POE_WINDOW_TITLES: &[&str] = &[
    "Path of Exile",
    "PathOfExile",
    "PathOfExileSteam",
    "PathOfExile_x64",
    "PathOfExile_x64Steam",
    "PathOfExile_KG.exe",
    "PathOfExile_x64_KG.exe",
    "流亡黯道",
];

pub fn is_poe_item_text(text: &str) -> bool {
    let clean = text.trim();
    if clean.len() < 10 {
        return false;
    }
    clean.contains("Rarity:")
        || clean.contains("稀有度:")
        || clean.contains("Item Class:")
        || clean.contains("物品種類:")
        || clean.contains("物品類別:")
        || clean.contains("--------")
}

pub fn is_poe_active() -> bool {
    #[cfg(target_os = "windows")]
    {
        use windows::core::HSTRING;
        use windows::Win32::UI::WindowsAndMessaging::FindWindowW;

        for title in POE_WINDOW_TITLES {
            let h_title = HSTRING::from(*title);
            unsafe {
                if let Ok(hwnd) = FindWindowW(None, &h_title) {
                    if !hwnd.0.is_null() {
                        return true;
                    }
                }
            }
        }
        false
    }

    #[cfg(not(target_os = "windows"))]
    {
        true
    }
}

pub fn send_in_game_command(app: Option<&tauri::AppHandle>, command: &str) -> Result<bool, String> {
    let sanitized = command.trim();
    if !sanitized.starts_with('/') {
        return Ok(false);
    }

    #[cfg(target_os = "windows")]
    {
        use windows::core::HSTRING;
        use windows::Win32::UI::Input::KeyboardAndMouse::{
            SendInput, INPUT, INPUT_KEYBOARD, KEYBDINPUT, KEYEVENTF_KEYUP, VK_CONTROL, VK_RETURN,
            VK_V,
        };
        use windows::Win32::UI::WindowsAndMessaging::{FindWindowW, SetForegroundWindow};

        let mut target_hwnd = windows::Win32::Foundation::HWND(std::ptr::null_mut());

        for title in POE_WINDOW_TITLES {
            let h_title = HSTRING::from(*title);
            unsafe {
                if let Ok(hwnd) = FindWindowW(None, &h_title) {
                    if !hwnd.0.is_null() {
                        target_hwnd = hwnd;
                        break;
                    }
                }
            }
        }

        if !target_hwnd.0.is_null() {
            // 1. 讀取並暫存使用者原本的剪貼簿內容以利後續還原
            let prev_clipboard = if let Some(app_handle) = app {
                let prev = app_handle.clipboard().read_text().ok();
                // 2. 將目標遊戲指令寫入系統剪貼簿
                let _ = app_handle.clipboard().write_text(sanitized.to_string());
                prev
            } else {
                None
            };

            unsafe {
                let _ = SetForegroundWindow(target_hwnd);
                std::thread::sleep(std::time::Duration::from_millis(40));

                let make_key = |vk, flags| INPUT {
                    r#type: INPUT_KEYBOARD,
                    Anonymous: windows::Win32::UI::Input::KeyboardAndMouse::INPUT_0 {
                        ki: KEYBDINPUT {
                            wVk: vk,
                            wScan: 0,
                            dwFlags: flags,
                            time: 0,
                            dwExtraInfo: 0,
                        },
                    },
                };

                // Enter down + up (開啟聊天室)
                let mut inputs = vec![
                    make_key(
                        VK_RETURN,
                        windows::Win32::UI::Input::KeyboardAndMouse::KEYBD_EVENT_FLAGS(0),
                    ),
                    make_key(VK_RETURN, KEYEVENTF_KEYUP),
                ];
                let _ = SendInput(&inputs, std::mem::size_of::<INPUT>() as i32);
                std::thread::sleep(std::time::Duration::from_millis(25));

                // Ctrl+V down + up (貼上指令)
                inputs = vec![
                    make_key(
                        VK_CONTROL,
                        windows::Win32::UI::Input::KeyboardAndMouse::KEYBD_EVENT_FLAGS(0),
                    ),
                    make_key(
                        VK_V,
                        windows::Win32::UI::Input::KeyboardAndMouse::KEYBD_EVENT_FLAGS(0),
                    ),
                    make_key(VK_V, KEYEVENTF_KEYUP),
                    make_key(VK_CONTROL, KEYEVENTF_KEYUP),
                ];
                let _ = SendInput(&inputs, std::mem::size_of::<INPUT>() as i32);
                std::thread::sleep(std::time::Duration::from_millis(25));

                // Enter down + up (發送指令)
                inputs = vec![
                    make_key(
                        VK_RETURN,
                        windows::Win32::UI::Input::KeyboardAndMouse::KEYBD_EVENT_FLAGS(0),
                    ),
                    make_key(VK_RETURN, KEYEVENTF_KEYUP),
                ];
                let _ = SendInput(&inputs, std::mem::size_of::<INPUT>() as i32);

                // 3. 等待遊戲端聊天輸入緩衝完成後，自動將原剪貼簿內容寫回
                if let (Some(app_handle), Some(prev_text)) = (app, prev_clipboard) {
                    std::thread::sleep(std::time::Duration::from_millis(60));
                    let _ = app_handle.clipboard().write_text(prev_text);
                }

                return Ok(true);
            }
        }
    }

    // 若未找到遊戲視窗（或非 Windows 平台），將指令寫入剪貼簿供使用者手動貼上
    if let Some(app_handle) = app {
        let _ = app_handle.clipboard().write_text(sanitized.to_string());
    }

    Ok(false)
}

pub fn trigger_in_game_copy() {
    #[cfg(target_os = "windows")]
    {
        use windows::Win32::UI::Input::KeyboardAndMouse::{
            SendInput, INPUT, INPUT_KEYBOARD, KEYBDINPUT, KEYEVENTF_KEYUP, VK_C, VK_CONTROL,
        };
        let make_key = |vk, flags| INPUT {
            r#type: INPUT_KEYBOARD,
            Anonymous: windows::Win32::UI::Input::KeyboardAndMouse::INPUT_0 {
                ki: KEYBDINPUT {
                    wVk: vk,
                    wScan: 0,
                    dwFlags: flags,
                    time: 0,
                    dwExtraInfo: 0,
                },
            },
        };
        let inputs = vec![
            make_key(
                VK_CONTROL,
                windows::Win32::UI::Input::KeyboardAndMouse::KEYBD_EVENT_FLAGS(0),
            ),
            make_key(
                VK_C,
                windows::Win32::UI::Input::KeyboardAndMouse::KEYBD_EVENT_FLAGS(0),
            ),
            make_key(VK_C, KEYEVENTF_KEYUP),
            make_key(VK_CONTROL, KEYEVENTF_KEYUP),
        ];
        unsafe {
            let _ = SendInput(&inputs, std::mem::size_of::<INPUT>() as i32);
        }
    }
}

pub fn trigger_in_game_price_check(app: &tauri::AppHandle) {
    trigger_in_game_copy();

    let app_clone = app.clone();
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_millis(80));
        let text = app_clone.clipboard().read_text().unwrap_or_default();
        if is_poe_item_text(&text) {
            let _ = crate::commands::overlay_commands::show_overlay_window(
                app_clone,
                None,
                None,
                Some(text),
            );
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_poe_item_text() {
        assert!(!is_poe_item_text(""));
        assert!(!is_poe_item_text("short"));
        assert!(is_poe_item_text(
            "Rarity: Rare\nItem Class: Rings\n--------"
        ));
        assert!(is_poe_item_text("稀有度: 稀有\n物品種類: 戒指\n--------"));
        assert!(!is_poe_item_text("/hideout PlayerName"));
    }

    #[test]
    fn test_send_in_game_command_validation() {
        // Command must start with '/'
        assert_eq!(send_in_game_command(None, "invalid_cmd"), Ok(false));
        assert_eq!(send_in_game_command(None, "   "), Ok(false));
        // Valid format returns Ok(false) in non-windows / test environment when game is not found
        assert_eq!(send_in_game_command(None, "/hideout"), Ok(false));
        assert_eq!(
            send_in_game_command(None, "  /hideout PlayerName  "),
            Ok(false)
        );
    }

    #[test]
    fn test_poe_window_titles_focus_on_poe1() {
        // Must contain all valid PoE 1 client titles
        assert!(POE_WINDOW_TITLES.contains(&"Path of Exile"));
        assert!(POE_WINDOW_TITLES.contains(&"PathOfExile"));
        assert!(POE_WINDOW_TITLES.contains(&"PathOfExileSteam"));
        assert!(POE_WINDOW_TITLES.contains(&"PathOfExile_x64"));
        assert!(POE_WINDOW_TITLES.contains(&"PathOfExile_x64Steam"));
        assert!(POE_WINDOW_TITLES.contains(&"PathOfExile_KG.exe"));
        assert!(POE_WINDOW_TITLES.contains(&"PathOfExile_x64_KG.exe"));
        assert!(POE_WINDOW_TITLES.contains(&"流亡黯道"));

        // Must NOT contain unready PoE 2 title (#46)
        assert!(!POE_WINDOW_TITLES.contains(&"Path of Exile 2"));
        assert!(!POE_WINDOW_TITLES.contains(&"PathOfExile2"));
    }
}
