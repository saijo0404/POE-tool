use super::trade_headers::build_trade_headers;
use super::trade_urls::{get_trade_whisper_api_url, is_poe2_engine};
use crate::models::settings::AppSettings;

pub async fn send_official_whisper(
    token: &str,
    league: Option<&str>,
    engine: Option<&str>,
) -> Result<String, String> {
    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        AppSettings::default(),
    );
    if settings.poesessid.trim().is_empty() {
        return Err("請先於設定中填寫 POESESSID 或完成官方授權登入".to_string());
    }

    let is_poe2 = is_poe2_engine(engine);
    let default_league = if !settings.league.is_empty() && settings.league != "Auto" {
        &settings.league
    } else if is_poe2 {
        "Standard"
    } else {
        "Settlers"
    };
    let target_league = league.unwrap_or(default_league);
    let whisper_url = get_trade_whisper_api_url(is_poe2, false);
    let headers = build_trade_headers(&settings, target_league, None, is_poe2);
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(8))
        .build()
        .map_err(|e| e.to_string())?;

    let payload = serde_json::json!({ "token": token });
    let res = client
        .post(&whisper_url)
        .headers(headers)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("發送密語失敗: {}", e))?;

    if res.status().is_success() {
        Ok("密語發送成功".to_string())
    } else {
        Err(format!("官方伺服器拒絕密語請求 ({})", res.status()))
    }
}
