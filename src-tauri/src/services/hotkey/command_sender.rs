#[cfg(target_os = "windows")]
use super::window_detector::POE_WINDOW_TITLES;
use super::window_detector::is_valid_in_game_command;
use tauri_plugin_clipboard_manager::ClipboardExt;

pub fn send_in_game_command(app: Option<&tauri::AppHandle>, command: &str) -> Result<bool, String> {
    let sanitized = command.trim();
    if !is_valid_in_game_command(sanitized) {
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
                app_handle.clipboard().read_text().ok()
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

                let lines: Vec<&str> = sanitized
                    .lines()
                    .map(|l| l.trim())
                    .filter(|l| !l.is_empty())
                    .collect();

                for (idx, line) in lines.iter().enumerate() {
                    if let Some(app_handle) = app {
                        let _ = app_handle.clipboard().write_text(line.to_string());
                    }

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

                    if idx + 1 < lines.len() {
                        std::thread::sleep(std::time::Duration::from_millis(35));
                    }
                }

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
