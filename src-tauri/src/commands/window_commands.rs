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
