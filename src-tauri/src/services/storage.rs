use std::fs;
use std::path::{Path, PathBuf};
use serde::{de::DeserializeOwned, Serialize};

pub fn get_data_dir() -> PathBuf {
    // 1. Check data directory in executable's directory
    if let Ok(exe_path) = std::env::current_exe() {
        if let Some(parent) = exe_path.parent() {
            let exe_data = parent.join("data");
            if exe_data.exists() {
                return exe_data;
            }
        }
    }

    // 2. Check local data directory relative to current working directory
    let local_data = Path::new("data");
    if local_data.exists() {
        return local_data.to_path_buf();
    }
    let parent_data = Path::new("../data");
    if parent_data.exists() {
        return parent_data.to_path_buf();
    }

    // 3. Fallback to OS user local data directory
    let app_dir = if let Some(local_app_data) = std::env::var_os("LOCALAPPDATA") {
        PathBuf::from(local_app_data).join("POE_tool")
    } else if let Some(home) = std::env::var_os("HOME") {
        PathBuf::from(home).join(".poe_tool")
    } else {
        PathBuf::from("data")
    };

    let _ = fs::create_dir_all(&app_dir);
    app_dir
}

pub fn read_json_safe<T: DeserializeOwned>(file_path: &Path, fallback: T) -> T {
    if !file_path.exists() {
        return fallback;
    }
    match fs::read_to_string(file_path) {
        Ok(raw) => {
            if raw.trim().is_empty() {
                fallback
            } else {
                serde_json::from_str(&raw).unwrap_or(fallback)
            }
        }
        Err(_) => fallback,
    }
}

pub fn write_json_atomic<T: Serialize>(file_path: &Path, data: &T) -> Result<(), String> {
    if let Some(parent) = file_path.parent() {
        let _ = fs::create_dir_all(parent);
    }

    // If target file is marked read-only, attempt to clear the flag
    if let Ok(meta) = fs::metadata(file_path) {
        let mut perms = meta.permissions();
        if perms.readonly() {
            perms.set_readonly(false);
            let _ = fs::set_permissions(file_path, perms);
        }
    }

    let json_str = serde_json::to_string_pretty(data).map_err(|e| e.to_string())?;
    let tmp_file_name = format!(
        "{}.tmp.{}",
        file_path.file_name().unwrap_or_default().to_string_lossy(),
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_millis()
    );
    let tmp_path = file_path.with_file_name(tmp_file_name);

    if let Err(e) = fs::write(&tmp_path, &json_str) {
        // Fallback directly writing to target file
        let _ = fs::write(file_path, &json_str);
        return Err(e.to_string());
    }

    // On Windows std::fs::rename fails if destination already exists, so remove it first
    #[cfg(windows)]
    {
        if file_path.exists() {
            let _ = fs::remove_file(file_path);
        }
    }

    if let Err(_) = fs::rename(&tmp_path, file_path) {
        // Fallback direct write
        let _ = fs::write(file_path, &json_str);
        let _ = fs::remove_file(&tmp_path);
    }
    Ok(())
}

