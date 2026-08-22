use crate::models::ninja::{BuildCostResult, NinjaPricesResult};
use crate::services::build_calc::{calculate_build_cost, fetch_pob_or_ninja_build};
use crate::services::ninja::fetch_ninja_prices as fetch_ninja_prices_service;

#[tauri::command]
pub async fn get_ninja_prices(league: Option<String>, refresh: Option<bool>) -> Result<NinjaPricesResult, String> {
    let target = league.unwrap_or_else(|| "Standard".to_string());
    fetch_ninja_prices_service(&target, refresh.unwrap_or(false)).await
}

#[tauri::command]
pub async fn calculate_build(ninja_url: String) -> Result<BuildCostResult, String> {
    if ninja_url.trim().is_empty() {
        return Err("請輸入 pobb.in 或 poe.ninja 流派網址。".to_string());
    }
    let build_data = fetch_pob_or_ninja_build(&ninja_url).await?;
    calculate_build_cost(build_data).await
}

#[tauri::command]
pub async fn fetch_build_item_live_price(league: String, query_json: String) -> Result<crate::models::trade::TradeSearchResult, String> {
    crate::services::trade::search_trade_raw_json(&league, &query_json).await
}
