use serde_json::Value;
use crate::models::trade::{TradeListing, TradeListingItem};

pub fn parse_single_listing(it: &Value, div_rate: f64) -> Option<TradeListing> {
    let listing_obj = &it["listing"];
    let price_obj = &listing_obj["price"];
    let item_obj = &it["item"];
    let account_obj = &listing_obj["account"];

    let amount = price_obj["amount"].as_f64().unwrap_or(0.0);
    let currency = price_obj["currency"].as_str().unwrap_or("chaos").to_string();
    let price_in_chaos = match currency.to_lowercase().as_str() {
        "divine" => amount * div_rate,
        "mirror" => amount * 95000.0,
        "exalted" => amount * 18.0,
        _ => amount,
    };
    let price_in_divine = (price_in_chaos / div_rate * 100.0).round() / 100.0;

    let raw_whisper = listing_obj["whisper"].as_str().or_else(|| it["whisper"].as_str()).unwrap_or("").to_string();
    let account_name = account_obj["name"].as_str().map(|s| s.to_string());
    let char_name = account_obj["lastCharacterName"].as_str().map(|s| s.to_string());
    let token = listing_obj["hideout_token"].as_str().or_else(|| listing_obj["whisper_token"].as_str()).map(|s| s.to_string());
    let is_instant = listing_obj["hideout_token"].is_string() || listing_obj["method"].as_str() == Some("merchant");

    Some(TradeListing {
        id: it["id"].as_str().unwrap_or_default().to_string(),
        indexed: listing_obj["indexed"].as_str().unwrap_or_default().to_string(),
        indexed_age: None,
        account_name: account_name.clone(),
        seller_account: account_name,
        character_name: char_name.clone(),
        seller_ign: char_name,
        online_status: account_obj["online"]["status"].as_str().unwrap_or("online").to_string(),
        is_instant: Some(is_instant),
        price_amount: amount,
        price_currency: currency,
        price_in_chaos,
        price_in_divine,
        whisper: raw_whisper,
        whisper_token: token.clone(),
        hideout_token: token,
        is_instant_buyout: Some(is_instant),
        method: listing_obj["method"].as_str().map(|s| s.to_string()),
        item: TradeListingItem {
            name: item_obj["name"].as_str().unwrap_or_default().to_string(),
            type_line: item_obj["typeLine"].as_str().unwrap_or_default().to_string(),
            icon: item_obj["icon"].as_str().unwrap_or_default().to_string(),
            ilvl: item_obj["ilvl"].as_i64(),
            corrupted: item_obj["corrupted"].as_bool(),
            implicit_mods: item_obj["implicitMods"].as_array().map(|a| a.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect()),
            explicit_mods: item_obj["explicitMods"].as_array().map(|a| a.iter().filter_map(|v| v.as_str().map(|s| s.to_string())).collect()),
        },
    })
}
