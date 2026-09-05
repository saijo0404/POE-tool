use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, Default, PartialEq, Eq)]
pub struct WindowInfo {
    pub title: Option<String>,
    pub process_name: Option<String>,
}

#[tauri::command]
pub fn toggle_always_on_top(window: tauri::Window, enable: bool) -> Result<bool, String> {
    window
        .set_always_on_top(enable)
        .map_err(|e| e.to_string())?;
    Ok(enable)
}

#[tauri::command]
pub fn show_main_window(window: tauri::Window) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn hide_main_window(window: tauri::Window) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[cfg(target_os = "windows")]
pub fn get_foreground_window_info_internal() -> WindowInfo {
    use windows::Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowTextW};
    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.0 == 0 {
            return WindowInfo::default();
        }
        let mut buffer = [0u16; 512];
        let len = GetWindowTextW(hwnd, &mut buffer);
        if len > 0 {
            let title = String::from_utf16_lossy(&buffer[..len as usize]);
            return WindowInfo {
                title: Some(title),
                process_name: None,
            };
        }
    }
    WindowInfo::default()
}

#[cfg(not(target_os = "windows"))]
pub fn get_foreground_window_info_internal() -> WindowInfo {
    WindowInfo::default()
}

#[tauri::command]
pub fn get_foreground_window_info() -> Result<WindowInfo, String> {
    Ok(get_foreground_window_info_internal())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_window_info_default() {
        let info = WindowInfo::default();
        assert!(info.title.is_none());
        assert!(info.process_name.is_none());
    }

    #[test]
    fn test_get_foreground_window_info() {
        let res = get_foreground_window_info();
        assert!(res.is_ok());
    }
}
