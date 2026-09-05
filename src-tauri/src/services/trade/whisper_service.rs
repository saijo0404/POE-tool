use super::trade_headers::build_trade_headers;
use crate::models::settings::AppSettings;

pub async fn send_official_whisper(token: &str, league: Option<&str>) -> Result<String, String> {
    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        AppSettings::default(),
    );
    if settings.poesessid.trim().is_empty() {
        return Err("請先於設定中填寫 POESESSID 或完成官方授權登入".to_string());
    }

    let default_league = if !settings.league.is_empty() && settings.league != "Auto" {
        &settings.league
    } else {
        "Settlers"
    };
    let target_league = league.unwrap_or(default_league);
    let whisper_url = "https://www.pathofexile.com/api/trade/whisper".to_string();
    let headers = build_trade_headers(&settings, target_league, None);
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
