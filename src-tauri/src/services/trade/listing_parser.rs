use crate::models::trade::{TradeItemProperty, TradeListing, TradeListingItem};
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

    crate::app_log!("[TradeListing] 📦 解析物品: '{}' (type: '{}'), 稀有度={:?}, 物等={:?}, 主要詞綴: {}, 固定詞綴: {}, 工藝: {}, 分裂: {}, 附魔: {}, 屬性: {}",
        listing_item.name, listing_item.type_line, listing_item.rarity, listing_item.ilvl,
        listing_item.explicit_mods.as_ref().map(|v| v.len()).unwrap_or(0),
        listing_item.implicit_mods.as_ref().map(|v| v.len()).unwrap_or(0),
        listing_item.crafted_mods.as_ref().map(|v| v.len()).unwrap_or(0),
        listing_item.fractured_mods.as_ref().map(|v| v.len()).unwrap_or(0),
        listing_item.enchant_mods.as_ref().map(|v| v.len()).unwrap_or(0),
        listing_item.properties.as_ref().map(|v| v.len()).unwrap_or(0)
    );

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

fn map_frame_type_to_rarity(frame_type: i64) -> String {
    match frame_type {
        0 => "Normal".to_string(),
        1 => "Magic".to_string(),
        2 => "Rare".to_string(),
        3 => "Unique".to_string(),
        4 => "Gem".to_string(),
        5 => "Currency".to_string(),
        6 => "DivinationCard".to_string(),
        9 => "Unique".to_string(),
        _ => "Rare".to_string(),
    }
}

fn extract_mod_list(
    item_obj: &Value,
    primary_key: &str,
    alias_keys: &[&str],
) -> Option<Vec<String>> {
    let mut results = Vec::new();
    let mut all_keys = vec![primary_key];
    all_keys.extend_from_slice(alias_keys);

    for key in all_keys {
        if let Some(arr) = item_obj.get(key).and_then(|v| v.as_array()) {
            for m in arr {
                if let Some(s) = m.as_str() {
                    for line in s.lines() {
                        let t = line.trim();
                        if !t.is_empty() && !results.contains(&t.to_string()) {
                            results.push(t.to_string());
                        }
                    }
                } else if let Some(obj) = m.as_object() {
                    if let Some(s) = obj
                        .get("text")
                        .or_else(|| obj.get("name"))
                        .or_else(|| obj.get("line"))
                        .or_else(|| obj.get("string"))
                        .or_else(|| obj.get("description"))
                        .or_else(|| obj.get("desc"))
                        .or_else(|| obj.get("value"))
                        .or_else(|| obj.get("raw"))
                        .or_else(|| obj.get("mod"))
                        .or_else(|| obj.get("stat"))
                        .and_then(|v| v.as_str())
                    {
                        for line in s.lines() {
                            let t = line.trim();
                            if !t.is_empty() && !results.contains(&t.to_string()) {
                                results.push(t.to_string());
                            }
                        }
                    }
                }
            }
        } else if let Some(s) = item_obj.get(key).and_then(|v| v.as_str()) {
            let trimmed = s.trim();
            if !trimmed.is_empty() && !trimmed.starts_with('{') && !trimmed.starts_with('[') {
                for line in trimmed.lines() {
                    let t = line.trim();
                    if !t.is_empty() && !results.contains(&t.to_string()) {
                        results.push(t.to_string());
                    }
                }
            }
        }
    }

    if results.is_empty() {
        None
    } else {
        Some(results)
    }
}

fn extract_extended_mods(item_obj: &Value, category: &str) -> Option<Vec<String>> {
    let mods_arr = item_obj
        .get("extended")?
        .get("mods")?
        .get(category)?
        .as_array()?;
    let mut results = Vec::new();
    for m in mods_arr {
        if let Some(name) = m.get("name").and_then(|v| v.as_str()) {
            let t = name.trim();
            if !t.is_empty() && !results.contains(&t.to_string()) {
                results.push(t.to_string());
            }
        }
    }
    if results.is_empty() {
        None
    } else {
        Some(results)
    }
}

fn extract_quality(item_obj: &Value) -> Option<i64> {
    if let Some(q) = item_obj["quality"].as_i64() {
        return Some(q);
    }
    if let Some(props) = item_obj["properties"].as_array() {
        for p in props {
            let name = p["name"].as_str().unwrap_or_default();
            if name.eq_ignore_ascii_case("Quality") || name.contains("品質") {
                if let Some(v_arr) = p["values"]
                    .as_array()
                    .and_then(|v| v.first())
                    .and_then(|row| row.as_array())
                    .and_then(|pair| pair.first())
                {
                    if let Some(s) = v_arr.as_str() {
                        let cleaned = s.replace(['%', '+'], "").trim().to_string();
                        if let Ok(num) = cleaned.parse::<i64>() {
                            return Some(num);
                        }
                    } else if let Some(num) = v_arr.as_i64() {
                        return Some(num);
                    }
                }
            }
        }
    }
    None
}

fn calculate_indexed_age(indexed_str: Option<&str>) -> Option<String> {
    let s = indexed_str?;
    let indexed_dt = chrono::DateTime::parse_from_rfc3339(s).ok()?;
    let now = chrono::Utc::now();
    let diff = now.signed_duration_since(indexed_dt.with_timezone(&chrono::Utc));
    let mins = diff.num_minutes();
    if mins < 1 {
        Some("剛剛".to_string())
    } else if mins < 60 {
        Some(format!("{} 分鐘前", mins))
    } else if mins < 1440 {
        Some(format!("{} 小時前", mins / 60))
    } else {
        Some(format!("{} 天前", mins / 1440))
    }
}

fn parse_properties(val: &Value) -> Option<Vec<TradeItemProperty>> {
    let arr = val.as_array()?;
    let mut props = Vec::new();
    for p in arr {
        let name_opt = p["name"].as_str().or_else(|| p["type_name"].as_str());
        if let Some(name) = name_opt {
            let mut values = Vec::new();
            if let Some(v_arr) = p["values"].as_array() {
                for v in v_arr {
                    if let Some(pair) = v.as_array() {
                        let text = match pair.first() {
                            Some(Value::String(s)) => s.clone(),
                            Some(Value::Number(n)) => n.to_string(),
                            Some(Value::Bool(b)) => b.to_string(),
                            _ => String::new(),
                        };
                        let num = pair.get(1).and_then(|n| n.as_i64()).unwrap_or(0);
                        values.push((text, num));
                    } else if let Some(s) = v.as_str() {
                        values.push((s.to_string(), 0));
                    }
                }
            }
            props.push(TradeItemProperty {
                name: name.to_string(),
                values,
                display_mode: p["displayMode"]
                    .as_i64()
                    .or_else(|| p["display_mode"].as_i64()),
                r#type: p["type"].as_i64(),
            });
        }
    }
    if props.is_empty() {
        None
    } else {
        Some(props)
    }
}

fn parse_sockets(val: &Value) -> Option<String> {
    let arr = val.as_array()?;
    if arr.is_empty() {
        return None;
    }
    let mut groups: std::collections::BTreeMap<i64, Vec<String>> =
        std::collections::BTreeMap::new();
    for s in arr {
        let g = s["group"].as_i64().unwrap_or(0);
        let col = s["sColour"]
            .as_str()
            .or_else(|| s["colour"].as_str())
            .unwrap_or("W");
        groups.entry(g).or_default().push(col.to_string());
    }
    let formatted = groups
        .values()
        .map(|cols| cols.join("-"))
        .collect::<Vec<_>>()
        .join(" ");
    if formatted.is_empty() {
        None
    } else {
        Some(formatted)
    }
}
