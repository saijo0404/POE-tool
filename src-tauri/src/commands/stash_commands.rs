use crate::models::stash::{StashProgress, StashTabMeta, WealthSnapshot};
use crate::services::stash::{
    clear_snapshots as clear_snapshots_service, create_snapshot as create_snapshot_service,
    fetch_stash_tabs_meta, get_snapshots as get_snapshots_service,
    get_stash_progress as get_stash_progress_service,
};

#[tauri::command]
pub fn get_wealth_snapshots() -> Vec<WealthSnapshot> {
    get_snapshots_service()
}

#[tauri::command]
pub async fn take_wealth_snapshot() -> Result<WealthSnapshot, String> {
    create_snapshot_service().await
}

#[tauri::command]
pub fn clear_wealth_snapshots() -> Result<bool, String> {
    clear_snapshots_service();
    Ok(true)
}

#[tauri::command]
pub fn get_stash_progress() -> StashProgress {
    get_stash_progress_service()
}

#[tauri::command]
pub async fn get_stash_tabs(league: Option<String>) -> Result<Vec<StashTabMeta>, String> {
    fetch_stash_tabs_meta(league.as_deref()).await
}
