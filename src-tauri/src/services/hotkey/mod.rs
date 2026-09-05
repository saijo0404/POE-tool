pub mod command_sender;
pub mod window_detector;

#[cfg(test)]
mod tests;

pub use command_sender::{send_in_game_command, trigger_in_game_copy};
use tauri_plugin_clipboard_manager::ClipboardExt;
pub use window_detector::{
    is_poe_active, is_poe_item_text, is_valid_in_game_command, POE_WINDOW_TITLES,
};

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
