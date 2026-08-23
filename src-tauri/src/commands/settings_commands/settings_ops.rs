use serde_json::Value;
use crate::models::settings::AppSettings;
use crate::services::stash::fetch_user_characters;
use crate::services::storage::{get_data_dir, read_json_safe, write_json_atomic};

pub fn sanitize_poesessid(raw: &str) -> String {
    let trimmed = raw.trim();
    if trimmed.contains("POESESSID=") {
        if let Some(pos) = trimmed.find("POESESSID=") {
            let sub = &trimmed[pos + "POESESSID=".len()..];
            let val = sub.split(';').next().unwrap_or("").trim();
            return val.trim_matches('"').trim_matches('\'').to_string();
        }
    }
    trimmed.trim_matches('"').trim_matches('\'').to_string()
}

#[tauri::command]
pub fn get_settings() -> AppSettings {
    let path = get_data_dir().join("settings.json");
    read_json_safe(&path, AppSettings::default())
}

#[tauri::command]
pub fn update_settings(mut settings: AppSettings) -> Result<AppSettings, String> {
    settings.poesessid = sanitize_poesessid(&settings.poesessid);
    let path = get_data_dir().join("settings.json");
    write_json_atomic(&path, &settings)?;
    Ok(settings)
}

#[tauri::command]
pub async fn get_characters() -> Result<Vec<Value>, String> {
    fetch_user_characters().await
}
