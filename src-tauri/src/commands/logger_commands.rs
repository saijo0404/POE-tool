use crate::services::logger::{
    clear_logs as svc_clear_logs, get_current_log_path, get_diagnostic_bundle as svc_diagnostic,
    log_entry, read_recent_logs, DiagnosticBundle, LogLevel,
};

#[tauri::command]
pub fn get_log_contents(lines: Option<usize>) -> Result<String, String> {
    read_recent_logs(lines)
}

#[tauri::command]
pub fn get_log_file_path() -> Result<String, String> {
    Ok(get_current_log_path().to_string_lossy().to_string())
}

#[tauri::command]
pub fn write_log_entry(
    level: String,
    message: String,
    context: Option<String>,
) -> Result<(), String> {
    let parsed_level = LogLevel::from_str_relaxed(&level);
    log_entry(parsed_level, context.as_deref(), &message);
    Ok(())
}

#[tauri::command]
pub fn clear_logs() -> Result<(), String> {
    svc_clear_logs()
}

#[tauri::command]
pub fn get_diagnostic_bundle() -> Result<DiagnosticBundle, String> {
    svc_diagnostic()
}

#[tauri::command]
pub fn open_log_directory() -> Result<(), String> {
    let log_path = get_current_log_path();
    let dir = log_path
        .parent()
        .ok_or_else(|| "無法取得日誌目錄路徑".to_string())?;

    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(dir)
            .spawn()
            .map_err(|e| format!("無法開啟目錄: {}", e))?;
    }

    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(dir)
            .spawn()
            .map_err(|e| format!("無法開啟目錄: {}", e))?;
    }

    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(dir)
            .spawn()
            .map_err(|e| format!("無法開啟目錄: {}", e))?;
    }

    Ok(())
}
