use crate::services::logger::{get_current_log_path, read_recent_logs};

#[tauri::command]
pub fn get_log_contents(lines: Option<usize>) -> Result<String, String> {
    read_recent_logs(lines)
}

#[tauri::command]
pub fn get_log_file_path() -> Result<String, String> {
    Ok(get_current_log_path().to_string_lossy().to_string())
}
