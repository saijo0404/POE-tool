use crate::models::item::ParsedItem;
use crate::models::trade::{TradeQueryRequest, TradeSearchResult};
use crate::services::hotkey::send_in_game_command;
use crate::services::parser::parse_item_text;
use crate::services::trade::{
    search_trade as search_trade_service, send_official_whisper as send_whisper_service,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TravelResult {
    pub success: bool,
    pub game_triggered: bool,
    pub official_whisper_sent: bool,
    pub hideout_cmd: String,
    pub message: String,
}

#[tauri::command]
pub fn parse_item(item_text: String) -> Result<ParsedItem, String> {
    crate::app_log!(
        "[Tauri Command] 📥 parse_item received (len: {} chars)",
        item_text.len()
    );
    if item_text.trim().is_empty() {
        return Err("裝備文字不可為空".to_string());
    }
    let parsed = parse_item_text(&item_text);
    crate::app_log!("[Tauri Command] 📤 parse_item result: name='{}', base='{}', rarity='{}', implicits={}, explicits={}",
        parsed.name, parsed.base_type, parsed.rarity, parsed.implicits.len(), parsed.explicits.len());
    Ok(parsed)
}

#[tauri::command]
pub async fn search_trade(request: TradeQueryRequest) -> Result<TradeSearchResult, String> {
    crate::app_log!("[Tauri Command] 🔍 search_trade called! League: {:?}, Rarity: {:?}, Base: {:?}, Name: {:?}",
        request.league, request.rarity, request.base_type, request.name);
    search_trade_service(request).await
}

#[tauri::command]
pub async fn get_trade_leagues(
    engine: Option<String>,
) -> Result<Vec<crate::models::trade::TradeLeagueEntry>, String> {
    Ok(crate::services::trade::league_service::fetch_trade_leagues(engine.as_deref()).await)
}

#[tauri::command]
pub async fn send_official_whisper(
    token: String,
    league: Option<String>,
    engine: Option<String>,
) -> Result<String, String> {
    send_whisper_service(&token, league.as_deref(), engine.as_deref()).await
}

#[tauri::command]
pub async fn travel_to_hideout(
    app: tauri::AppHandle,
    token: Option<String>,
    character_name: Option<String>,
    league: Option<String>,
    engine: Option<String>,
) -> Result<TravelResult, String> {
    let hideout_cmd = if let Some(ref char_name) = character_name {
        if !char_name.trim().is_empty() {
            format!("/hideout {}", char_name.trim())
        } else {
            "/hideout".to_string()
        }
    } else {
        "/hideout".to_string()
    };

    let mut official_whisper_sent = false;
    let mut whisper_error = None;

    if let Some(tok) = token {
        if !tok.trim().is_empty() {
            match send_whisper_service(&tok, league.as_deref(), engine.as_deref()).await {
                Ok(_) => {
                    official_whisper_sent = true;
                }
                Err(e) => {
                    whisper_error = Some(e);
                }
            }
        }
    }

    let game_triggered = send_in_game_command(Some(&app), &hideout_cmd).unwrap_or(false);
    let message = if game_triggered && official_whisper_sent {
        format!(
            "⚡ 官方直購 (Travel to Hideout) 已觸發，並在遊戲中執行 {}！",
            hideout_cmd
        )
    } else if official_whisper_sent {
        format!(
            "⚡ 官方直購 (Travel to Hideout) 已觸發！已複製 {}",
            hideout_cmd
        )
    } else if game_triggered {
        format!("⚡ 已在遊戲中執行 {} 前往藏身處！", hideout_cmd)
    } else if let Some(err) = whisper_error {
        format!("已複製 {} ({})", hideout_cmd, err)
    } else {
        format!("已複製 {}", hideout_cmd)
    };

    Ok(TravelResult {
        success: true,
        game_triggered,
        official_whisper_sent,
        hideout_cmd,
        message,
    })
}
