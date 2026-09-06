use super::path_resolver::{
    get_fallback_log_paths, get_primary_log_path, open_or_create_writable_log,
};
use super::rotator::{clear_all_logs, rotate_logs, should_rotate, DEFAULT_MAX_BACKUPS, MAX_LOG_SIZE_BYTES};
use super::sanitizer::sanitize_log_message;
use super::types::{DiagnosticBundle, LogLevel};
use chrono::Local;
use lazy_static::lazy_static;
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::PathBuf;
use std::sync::Mutex;

lazy_static! {
    static ref LOG_FILE_PATH: Mutex<PathBuf> = Mutex::new(get_primary_log_path());
    static ref LOG_WRITER: Mutex<Option<File>> = Mutex::new(None);
}

pub fn init_logger() {
    let primary = get_primary_log_path();
    let mut chosen_path = primary.clone();
    let mut active_writer = None;

    match open_or_create_writable_log(&primary) {
        Ok(file) => {
            active_writer = Some(file);
        }
        Err(_) => {
            for fallback in get_fallback_log_paths() {
                if let Ok(file) = open_or_create_writable_log(&fallback) {
                    chosen_path = fallback;
                    active_writer = Some(file);
                    break;
                }
            }
        }
    }

    if let Ok(mut path_guard) = LOG_FILE_PATH.lock() {
        *path_guard = chosen_path.clone();
    }
    if let Ok(mut writer_guard) = LOG_WRITER.lock() {
        *writer_guard = active_writer;
    }

    log_entry(LogLevel::Info, Some("System"), &format!(
        "=== POE Tool 結構化日誌系統已啟動 (檔案: {}) ===",
        chosen_path.display()
    ));
}

pub fn get_current_log_path() -> PathBuf {
    if let Ok(guard) = LOG_FILE_PATH.lock() {
        guard.clone()
    } else {
        get_primary_log_path()
    }
}

pub fn log_entry(level: LogLevel, context: Option<&str>, message: &str) {
    let sanitized = sanitize_log_message(message);
    let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S%.3f");
    let ctx_str = context.unwrap_or("App");
    let log_line = format!("[{}] [{}] [{}] {}\n", timestamp, level, ctx_str, sanitized);

    let path = get_current_log_path();
    if should_rotate(&path, MAX_LOG_SIZE_BYTES) {
        let mut writer_guard = LOG_WRITER.lock().unwrap_or_else(|e| e.into_inner());
        *writer_guard = None;
        let _ = rotate_logs(&path, DEFAULT_MAX_BACKUPS);
        *writer_guard = open_or_create_writable_log(&path).ok();
    }

    if let Ok(mut writer_guard) = LOG_WRITER.lock() {
        if let Some(file) = writer_guard.as_mut() {
            let _ = file.write_all(log_line.as_bytes());
            let _ = file.flush();
            return;
        }
    }

    if let Ok(mut file) = open_or_create_writable_log(&path) {
        let _ = file.write_all(log_line.as_bytes());
        let _ = file.flush();
    }
}

pub fn log_to_file(message: &str) {
    log_entry(LogLevel::Info, Some("Legacy"), message);
}

pub fn read_recent_logs(max_lines: Option<usize>) -> Result<String, String> {
    let path = get_current_log_path();
    let mut file = File::open(&path).map_err(|e| format!("無法開啟日誌檔案: {}", e))?;
    let mut content = String::new();
    file.read_to_string(&mut content)
        .map_err(|e| format!("無法讀取日誌內容: {}", e))?;

    if let Some(limit) = max_lines {
        let lines: Vec<&str> = content.lines().collect();
        if lines.len() > limit {
            let recent = &lines[lines.len() - limit..];
            return Ok(recent.join("\n"));
        }
    }
    Ok(content)
}

pub fn clear_logs() -> Result<(), String> {
    let path = get_current_log_path();
    let mut writer_guard = LOG_WRITER.lock().unwrap_or_else(|e| e.into_inner());
    *writer_guard = None;

    clear_all_logs(&path, DEFAULT_MAX_BACKUPS)
        .map_err(|e| format!("清除日誌失敗: {}", e))?;

    *writer_guard = open_or_create_writable_log(&path).ok();
    drop(writer_guard);

    log_entry(LogLevel::Info, Some("System"), "本機日誌歷程已由使用者手動清空");
    Ok(())
}

pub fn get_diagnostic_bundle() -> Result<DiagnosticBundle, String> {
    let path = get_current_log_path();
    let size = fs::metadata(&path).map(|m| m.len()).unwrap_or(0);
    let raw_logs = read_recent_logs(Some(200)).unwrap_or_default();
    let total_lines = raw_logs.lines().count();

    Ok(DiagnosticBundle {
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        os: std::env::consts::OS.to_string(),
        timestamp: Local::now().to_rfc3339(),
        log_file_path: path.to_string_lossy().to_string(),
        log_file_size_bytes: size,
        total_lines,
        recent_logs: raw_logs,
    })
}
