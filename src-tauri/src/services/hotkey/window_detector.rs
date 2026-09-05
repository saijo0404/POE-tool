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

pub fn is_valid_in_game_command(command: &str) -> bool {
    let sanitized = command.trim();
    if sanitized.is_empty() {
        return false;
    }
    sanitized.lines().all(|line| {
        let l = line.trim();
        l.starts_with('/') || l.starts_with('@')
    })
}
