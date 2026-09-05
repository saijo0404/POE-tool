use super::listing_item_extractor::{
    extract_extended_mods, extract_mod_list, extract_quality, map_frame_type_to_rarity,
};
use super::property_parser::{calculate_indexed_age, parse_properties, parse_sockets};
use crate::models::trade::{TradeListing, TradeListingItem};
use serde_json::Value;

pub fn parse_single_listing(it: &Value, div_rate: f64) -> Option<TradeListing> {
    let listing_obj = if it.get("listing").is_some() {
        &it["listing"]
    } else {
        it
    };
    let price_obj = &listing_obj["price"];
    let raw_item_val = if it.get("item").is_some() {
        &it["item"]
    } else if it.get("itemData").is_some() {
        &it["itemData"]
    } else {
        it
    };

    let parsed_item_holder: Value;
    let item_obj = if let Some(s) = raw_item_val.as_str() {
        if let Ok(v) = serde_json::from_str::<Value>(s) {
            parsed_item_holder = v;
            &parsed_item_holder
        } else {
            raw_item_val
        }
    } else {
        raw_item_val
    };

    let account_obj = &listing_obj["account"];

    let amount = price_obj["amount"].as_f64().unwrap_or(0.0);
    let currency = price_obj["currency"]
        .as_str()
        .unwrap_or("chaos")
        .to_string();
    let price_in_chaos = match currency.to_lowercase().as_str() {
        "divine" => amount * div_rate,
        "mirror" => amount * 95000.0,
        "exalted" => amount * 18.0,
        _ => amount,
    };
    let price_in_divine = (price_in_chaos / div_rate * 100.0).round() / 100.0;

    let raw_whisper = listing_obj["whisper"]
        .as_str()
        .or_else(|| it["whisper"].as_str())
        .unwrap_or("")
        .to_string();
    let account_name = account_obj["name"].as_str().map(|s| s.to_string());
    let char_name = account_obj["lastCharacterName"]
        .as_str()
        .map(|s| s.to_string());
    let token = listing_obj["hideout_token"]
        .as_str()
        .or_else(|| listing_obj["whisper_token"].as_str())
        .map(|s| s.to_string());
    let is_instant = listing_obj["hideout_token"].is_string()
        || listing_obj["method"].as_str() == Some("merchant");

    let frame_type = item_obj["frameType"].as_i64().unwrap_or(2);
    let rarity = item_obj["rarity"]
        .as_str()
        .map(|s| s.to_string())
        .unwrap_or_else(|| map_frame_type_to_rarity(frame_type));

    let indexed_str = listing_obj["indexed"].as_str().unwrap_or_default();
    let indexed_age = calculate_indexed_age(listing_obj["indexed"].as_str());

    let implicit_mods = extract_mod_list(
        item_obj,
        "implicitMods",
        &["implicits", "implicit_mods", "implicit"],
    )
    .or_else(|| extract_extended_mods(item_obj, "implicit"));

    let explicit_mods = extract_mod_list(
        item_obj,
        "explicitMods",
        &[
            "explicits",
            "explicit_mods",
            "explicit",
            "utilityMods",
            "utility",
            "scourgeMods",
            "crucibleMods",
            "sanctumMods",
            "runeMods",
            "pseudoMods",
            "mods",
            "stats",
        ],
    )
    .or_else(|| extract_extended_mods(item_obj, "explicit"));

    let crafted_mods = extract_mod_list(item_obj, "craftedMods", &["crafted", "crafted_mods"])
        .or_else(|| extract_extended_mods(item_obj, "crafted"));

    let fractured_mods =
        extract_mod_list(item_obj, "fracturedMods", &["fractured", "fractured_mods"])
            .or_else(|| extract_extended_mods(item_obj, "fractured"));

    let enchant_mods = extract_mod_list(
        item_obj,
        "enchantMods",
        &["enchants", "enchant_mods", "enchant", "runeMods"],
    )
    .or_else(|| extract_extended_mods(item_obj, "enchant"));

    let flavour_text = extract_mod_list(
        item_obj,
        "flavourText",
        &["flavorText", "flavour_text", "flavor_text"],
    );

    let quality = extract_quality(item_obj);
    let properties = parse_properties(&item_obj["properties"]);
    let requirements = parse_properties(&item_obj["requirements"]);

    let listing_item = TradeListingItem {
        name: item_obj["name"].as_str().unwrap_or_default().to_string(),
        type_line: item_obj["typeLine"]
            .as_str()
            .or_else(|| item_obj["baseType"].as_str())
            .unwrap_or_default()
            .to_string(),
        icon: item_obj["icon"].as_str().unwrap_or_default().to_string(),
        ilvl: item_obj["ilvl"].as_i64(),
        corrupted: item_obj["corrupted"].as_bool(),
        rarity: Some(rarity),
        base_type: item_obj["baseType"]
            .as_str()
            .or_else(|| item_obj["typeLine"].as_str())
            .map(|s| s.to_string()),
        item_class: item_obj["extended"]["category"]
            .as_str()
            .or_else(|| item_obj["itemClass"].as_str())
            .map(|s| s.to_string()),
        quality,
        sockets: parse_sockets(&item_obj["sockets"]),
        implicit_mods,
        explicit_mods,
        crafted_mods,
        fractured_mods,
        enchant_mods,
        flavour_text,
        properties,
        requirements,
    };

    Some(TradeListing {
        id: it["id"].as_str().unwrap_or_default().to_string(),
        indexed: indexed_str.to_string(),
        indexed_age,
        account_name: account_name.clone(),
        seller_account: account_name,
        character_name: char_name.clone(),
        seller_ign: char_name,
        online_status: account_obj["online"]["status"]
            .as_str()
            .unwrap_or("online")
            .to_string(),
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
        item: listing_item,
    })
}
