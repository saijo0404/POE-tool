use crate::services::clipboard_listener::{is_poe_trade_whisper, PoeItemCopiedPayload};
use std::fs::File;
use std::io::{BufRead, BufReader, Seek, SeekFrom};
use std::path::{Path, PathBuf};
use tauri::Emitter;

pub const COMMON_CLIENT_LOG_PATHS: &[&str] = &[
    r"C:\Program Files (x86)\Steam\steamapps\common\Path of Exile\logs\Client.txt",
    r"C:\Program Files (x86)\Grinding Gear Games\Path of Exile\logs\Client.txt",
    r"C:\SteamLibrary\steamapps\common\Path of Exile\logs\Client.txt",
    r"D:\SteamLibrary\steamapps\common\Path of Exile\logs\Client.txt",
    r"E:\SteamLibrary\steamapps\common\Path of Exile\logs\Client.txt",
    r"C:\Program Files (x86)\GarenaPoE\GameData\Apps\PoE\logs\Client.txt",
    r"C:\Program Files (x86)\Steam\steamapps\common\Path of Exile 2\logs\Client.txt",
    r"C:\Program Files (x86)\Grinding Gear Games\Path of Exile 2\logs\Client.txt",
    r"C:\SteamLibrary\steamapps\common\Path of Exile 2\logs\Client.txt",
    r"D:\SteamLibrary\steamapps\common\Path of Exile 2\logs\Client.txt",
    r"E:\SteamLibrary\steamapps\common\Path of Exile 2\logs\Client.txt",
];

pub fn find_client_log_path(custom_path: Option<&str>) -> Option<PathBuf> {
    if let Some(p) = custom_path {
        let trimmed = p.trim();
        if !trimmed.is_empty() {
            let path = PathBuf::from(trimmed);
            if path.exists() {
                return Some(path);
            }
        }
    }

    for candidate in COMMON_CLIENT_LOG_PATHS {
        let path = PathBuf::from(candidate);
        if path.exists() {
            return Some(path);
        }
    }
    None
}

fn process_log_line(app: &tauri::AppHandle, line: &str) {
    let now = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64;

    let payload = PoeItemCopiedPayload {
        text: line.trim().to_string(),
        timestamp: now,
    };

    let _ = app.emit("poe-client-log-line", &payload);

    if !is_poe_trade_whisper(line) {
        return;
    }

    let _ = app.emit("poe-trade-whisper", payload);
    crate::app_log!(
        "[ClientLogWatcher] 💬 Client.txt whisper detected & pushed to frontend: {}",
        line.trim()
    );

    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        crate::models::settings::AppSettings::default(),
    );

    if settings.overlay_enabled {
        let _ =
            crate::commands::overlay_commands::show_overlay_window(app.clone(), None, None, None);
    }
}

fn tail_log_file(app: &tauri::AppHandle, log_path: &Path) {
    let mut file = match File::open(log_path) {
        Ok(f) => f,
        Err(_) => return,
    };

    // Seek to end of file to ignore past history
    let _ = file.seek(SeekFrom::End(0));
    let mut reader = BufReader::new(file);
    let mut line = String::new();

    loop {
        line.clear();
        match reader.read_line(&mut line) {
            Ok(0) => {
                // EOF reached, wait before polling for new content
                std::thread::sleep(std::time::Duration::from_millis(150));
            }
            Ok(_) => {
                let trimmed = line.trim();
                if !trimmed.is_empty() {
                    process_log_line(app, trimmed);
                }
            }
            Err(_) => {
                std::thread::sleep(std::time::Duration::from_millis(500));
            }
        }
    }
}

pub fn init_client_log_watcher(app: &tauri::AppHandle) {
    let app_handle = app.clone();
    std::thread::Builder::new()
        .name("poe-client-log-watcher".to_string())
        .spawn(move || loop {
            let settings = crate::services::storage::read_json_safe(
                &crate::services::storage::get_data_dir().join("settings.json"),
                crate::models::settings::AppSettings::default(),
            );

            if let Some(log_path) = find_client_log_path(settings.client_log_path.as_deref()) {
                crate::app_log!(
                    "[ClientLogWatcher] 📜 Monitoring Client.txt at {:?}",
                    log_path
                );
                tail_log_file(&app_handle, &log_path);
            }

            // Retry detecting file every 15 seconds if not currently found
            std::thread::sleep(std::time::Duration::from_secs(15));
        })
        .expect("failed to spawn client log watcher thread");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_find_client_log_path_with_custom_nonexistent() {
        let res = find_client_log_path(Some("C:\\NonExistentPath\\Client.txt"));
        assert!(res.is_none());
    }

    #[test]
    fn test_common_paths_format() {
        for path in COMMON_CLIENT_LOG_PATHS {
            assert!(path.ends_with("Client.txt"));
        }
    }
}
