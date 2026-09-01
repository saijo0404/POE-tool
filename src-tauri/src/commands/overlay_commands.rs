use tauri::{Emitter, Manager};

#[cfg(target_os = "windows")]
pub fn get_system_cursor_pos() -> (i32, i32) {
    use windows::Win32::Foundation::POINT;
    use windows::Win32::UI::WindowsAndMessaging::GetCursorPos;
    let mut pt = POINT { x: 0, y: 0 };
    unsafe {
        if GetCursorPos(&mut pt).is_ok() {
            (pt.x, pt.y)
        } else {
            (100, 100)
        }
    }
}

#[cfg(not(target_os = "windows"))]
pub fn get_system_cursor_pos() -> (i32, i32) {
    (100, 100)
}

pub fn calculate_safe_bounds(
    cursor_x: i32,
    cursor_y: i32,
    win_w: u32,
    win_h: u32,
    screen_w: u32,
    screen_h: u32,
    offset_x: i32,
    offset_y: i32,
) -> (i32, i32) {
    let max_x = (screen_w as i32).saturating_sub(win_w as i32).max(0);
    let max_y = (screen_h as i32).saturating_sub(win_h as i32).max(0);

    let mut target_x = cursor_x + offset_x;
    if target_x + (win_w as i32) > screen_w as i32 {
        target_x = cursor_x - offset_x - (win_w as i32);
    }

    let mut target_y = cursor_y + offset_y;
    if target_y + (win_h as i32) > screen_h as i32 {
        target_y = cursor_y - offset_y - (win_h as i32);
    }

    (target_x.clamp(0, max_x), target_y.clamp(0, max_y))
}

static PENDING_OVERLAY_ITEM: std::sync::Mutex<Option<String>> = std::sync::Mutex::new(None);

#[tauri::command]
pub fn get_pending_overlay_item() -> Result<Option<String>, String> {
    let mut lock = match PENDING_OVERLAY_ITEM.lock() {
        Ok(l) => l,
        Err(p) => p.into_inner(),
    };
    Ok(lock.take())
}

#[tauri::command]
pub fn get_cursor_position() -> Result<(i32, i32), String> {
    Ok(get_system_cursor_pos())
}

#[tauri::command]
pub fn show_overlay_window(
    app: tauri::AppHandle,
    x: Option<i32>,
    y: Option<i32>,
    item_text: Option<String>,
) -> Result<(), String> {
    let window = app
        .get_webview_window("overlay")
        .ok_or_else(|| "Overlay window not found".to_string())?;

    let (cur_x, cur_y) = match (x, y) {
        (Some(px), Some(py)) => (px, py),
        _ => get_system_cursor_pos(),
    };

    let (win_w, win_h) = match window.outer_size() {
        Ok(sz) => (sz.width, sz.height),
        _ => (460, 620),
    };

    let (screen_w, screen_h) = match window.current_monitor() {
        Ok(Some(monitor)) => (monitor.size().width, monitor.size().height),
        _ => (1920, 1080),
    };

    let (safe_x, safe_y) =
        calculate_safe_bounds(cur_x, cur_y, win_w, win_h, screen_w, screen_h, 15, 15);

    let _ = window.set_position(tauri::Position::Physical(tauri::PhysicalPosition {
        x: safe_x,
        y: safe_y,
    }));

    window.set_always_on_top(true).map_err(|e| e.to_string())?;
    window.show().map_err(|e| e.to_string())?;
    window.set_focus().map_err(|e| e.to_string())?;

    if let Some(text) = item_text {
        if !text.trim().is_empty() {
            let mut lock = match PENDING_OVERLAY_ITEM.lock() {
                Ok(l) => l,
                Err(p) => p.into_inner(),
            };
            *lock = Some(text.clone());
            drop(lock);

            let _ = app.emit("overlay-show-item", text.clone());

            let json_text = serde_json::to_string(&text).unwrap_or_default();
            let script = format!(
                "if (window.__POE_LOAD_ITEM) {{ window.__POE_LOAD_ITEM({}); }}",
                json_text
            );
            let _ = window.eval(&script);
        }
    }

    crate::app_log!(
        "[Overlay] 🌟 Overlay window shown at ({}, {}) for cursor ({}, {})",
        safe_x,
        safe_y,
        cur_x,
        cur_y
    );

    Ok(())
}

#[tauri::command]
pub fn hide_overlay_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("overlay") {
        window.hide().map_err(|e| e.to_string())?;
        crate::app_log!("[Overlay] 🌑 Overlay window hidden");
    }
    Ok(())
}

#[tauri::command]
pub fn set_overlay_click_through(app: tauri::AppHandle, enable: bool) -> Result<(), String> {
    if let Some(window) = app.get_webview_window("overlay") {
        window
            .set_ignore_cursor_events(enable)
            .map_err(|e| e.to_string())?;
        crate::app_log!("[Overlay] 🖱️ Overlay click-through set to: {}", enable);
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_safe_bounds_normal() {
        let (x, y) = calculate_safe_bounds(500, 300, 460, 620, 1920, 1080, 15, 15);
        assert_eq!(x, 515);
        assert_eq!(y, 315);
    }

    #[test]
    fn test_calculate_safe_bounds_overflow_right_bottom() {
        let (x, y) = calculate_safe_bounds(1800, 950, 460, 620, 1920, 1080, 15, 15);
        // 1800 - 15 - 460 = 1325
        assert_eq!(x, 1325);
        // 950 - 15 - 620 = 315
        assert_eq!(y, 315);
    }

    #[test]
    fn test_calculate_safe_bounds_clamping() {
        let (x, y) = calculate_safe_bounds(1919, 1079, 460, 620, 1920, 1080, 15, 15);
        assert!(x <= 1920 - 460);
        assert!(y <= 1080 - 620);
        assert!(x >= 0);
        assert!(y >= 0);
    }
}
