use super::path_resolver::{
    get_fallback_log_paths, get_primary_log_path, open_or_create_writable_log,
};
use chrono::Local;
use lazy_static::lazy_static;
use std::fs::File;
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

    log_to_file(&format!(
        "=== POE Tool 服務日誌系統已初始化 (檔案位置: {}) ===",
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

pub fn log_to_file(message: &str) {
    let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S%.3f");
    let log_line = format!("[{}] {}\n", timestamp, message);

    if let Ok(mut writer_guard) = LOG_WRITER.lock() {
        if let Some(file) = writer_guard.as_mut() {
            let _ = file.write_all(log_line.as_bytes());
            let _ = file.flush();
            return;
        }
    }

    let current_path = get_current_log_path();
    if let Ok(mut file) = open_or_create_writable_log(&current_path) {
        let _ = file.write_all(log_line.as_bytes());
        let _ = file.flush();
    }
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
