use super::rotator::{rotate_logs, should_rotate, DEFAULT_MAX_BACKUPS, MAX_LOG_SIZE_BYTES};
use std::fs::{File, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};

pub fn get_exe_dir() -> PathBuf {
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            return parent.to_path_buf();
        }
    }
    std::env::current_dir().unwrap_or_else(|_| PathBuf::from("."))
}

pub fn get_primary_log_path() -> PathBuf {
    get_exe_dir().join("poe-tool.log")
}

pub fn get_fallback_log_paths() -> Vec<PathBuf> {
    let mut list = Vec::new();
    let app_dir = if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
        PathBuf::from(local_app_data).join("POE_tool")
    } else if let Some(home) = std::env::var_os("HOME") {
        PathBuf::from(home).join(".poe_tool")
    } else {
        PathBuf::from("data")
    };
    list.push(app_dir.join("poe-tool.log"));

    let temp_dir = std::env::temp_dir().join("POE_tool");
    list.push(temp_dir.join("poe-tool.log"));
    list
}

pub fn open_or_create_writable_log(path: &Path) -> Result<File, std::io::Error> {
    if let Some(parent) = path.parent() {
        if !parent.exists() {
            std::fs::create_dir_all(parent)?;
        }
    }

    if let Ok(metadata) = std::fs::metadata(path) {
        let mut perms = metadata.permissions();
        if perms.readonly() {
            perms.set_readonly(false);
            let _ = std::fs::set_permissions(path, perms);
        }
    }

    if should_rotate(path, MAX_LOG_SIZE_BYTES) {
        let _ = rotate_logs(path, DEFAULT_MAX_BACKUPS);
    }

    let mut file = OpenOptions::new().create(true).append(true).open(path)?;
    file.flush()?;
    Ok(file)
}
