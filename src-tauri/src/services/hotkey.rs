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

        let titles = [
            "Path of Exile",
            "PathOfExile",
            "PathOfExileSteam",
            "Path of Exile 2",
            "PathOfExile_x64",
            "PathOfExile_x64Steam",
            "PathOfExile_KG.exe",
            "PathOfExile_x64_KG.exe",
            "流亡黯道",
        ];
        for title in titles {
            let h_title = HSTRING::from(title);
            unsafe {
                if let Ok(hwnd) = FindWindowW(None, &h_title) {
                    if !hwnd.0.is_null() {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    #[cfg(not(target_os = "windows"))]
    {
        true
    }
}

pub fn send_in_game_command(command: &str) -> Result<bool, String> {
    let sanitized = command.trim();
    if !sanitized.starts_with('/') {
        return Ok(false);
    }

    #[cfg(target_os = "windows")]
    {
        use windows::core::HSTRING;
        use windows::Win32::UI::WindowsAndMessaging::{FindWindowW, SetForegroundWindow};
        use windows::Win32::UI::Input::KeyboardAndMouse::{
            SendInput, INPUT, INPUT_KEYBOARD, KEYBDINPUT, KEYEVENTF_KEYUP, VK_CONTROL, VK_RETURN, VK_V
        };

        let titles = [
            "Path of Exile",
            "PathOfExile",
            "PathOfExileSteam",
            "Path of Exile 2",
            "PathOfExile_x64",
            "PathOfExile_x64Steam",
            "PathOfExile_KG.exe",
            "PathOfExile_x64_KG.exe",
            "流亡黯道",
        ];
        let mut target_hwnd = windows::Win32::Foundation::HWND(std::ptr::null_mut());

        for title in titles {
            let h_title = HSTRING::from(title);
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

                // Enter down + up
                let mut inputs = vec![
                    make_key(VK_RETURN, windows::Win32::UI::Input::KeyboardAndMouse::KEYBD_EVENT_FLAGS(0)),
                    make_key(VK_RETURN, KEYEVENTF_KEYUP),
                ];
                let _ = SendInput(&inputs, std::mem::size_of::<INPUT>() as i32);
                std::thread::sleep(std::time::Duration::from_millis(25));

                // Ctrl+V down + up
                inputs = vec![
                    make_key(VK_CONTROL, windows::Win32::UI::Input::KeyboardAndMouse::KEYBD_EVENT_FLAGS(0)),
                    make_key(VK_V, windows::Win32::UI::Input::KeyboardAndMouse::KEYBD_EVENT_FLAGS(0)),
                    make_key(VK_V, KEYEVENTF_KEYUP),
                    make_key(VK_CONTROL, KEYEVENTF_KEYUP),
                ];
                let _ = SendInput(&inputs, std::mem::size_of::<INPUT>() as i32);
                std::thread::sleep(std::time::Duration::from_millis(25));

                // Enter down + up
                inputs = vec![
                    make_key(VK_RETURN, windows::Win32::UI::Input::KeyboardAndMouse::KEYBD_EVENT_FLAGS(0)),
                    make_key(VK_RETURN, KEYEVENTF_KEYUP),
                ];
                let _ = SendInput(&inputs, std::mem::size_of::<INPUT>() as i32);

                return Ok(true);
            }
        }
    }

    Ok(false)
}
