use crate::models::item::ParsedItemMod;
use crate::models::trade::TradeQueryRequest;
use serde_json::{json, Value};

pub fn build_stat_filters(req: &TradeQueryRequest) -> Vec<Value> {
    let mut stat_filters = Vec::new();
    if let Some(filters) = &req.filters {
        for f in filters {
            if f.disabled.unwrap_or(false) {
                continue;
            }
            if f.stat_id.starts_with("custom") || !f.stat_id.contains('.') {
                continue;
            }
            let mut filter_entry = json!({ "id": f.stat_id });
            let mut val_obj = json!({});
            if let Some(min) = f.min {
                val_obj["min"] = json!(min);
            }
            if let Some(max) = f.max {
                val_obj["max"] = json!(max);
            }
            if val_obj.as_object().is_some_and(|o| !o.is_empty()) {
                filter_entry["value"] = val_obj;
            }
            stat_filters.push(filter_entry);
        }
    }
    if let Some(mods) = &req.selected_mods {
        for m in mods {
            if !m.enabled {
                continue;
            }
            append_selected_mod_filter(&mut stat_filters, m, req);
        }
    }
    stat_filters
}

pub fn append_selected_mod_filter(
    stat_filters: &mut Vec<Value>,
    m: &ParsedItemMod,
    req: &TradeQueryRequest,
) {
    let mut stat_id = m.id.clone();
    if stat_id.starts_with("custom") || !stat_id.contains('.') {
        let is_armour = check_is_armour(req);
        let is_weapon = check_is_weapon(req);
        let matched = if is_armour {
            crate::services::dictionary::lookup_stat_for_armour(&m.text)
                .or_else(|| crate::services::dictionary::lookup_stat_for_armour(&m.english_text))
        } else if is_weapon {
            crate::services::dictionary::lookup_stat_for_weapon(&m.text)
                .or_else(|| crate::services::dictionary::lookup_stat_for_weapon(&m.english_text))
        } else {
            crate::services::dictionary::lookup_stat_by_text(&m.text)
                .or_else(|| crate::services::dictionary::lookup_stat_by_text(&m.english_text))
        };
        if let Some(res) = matched {
            stat_id = crate::services::parser::normalize_stat_id_for_mod_type(&res.id, &m.mod_type);
        } else {
            return;
        }
    } else {
        stat_id = crate::services::parser::normalize_stat_id_for_mod_type(&stat_id, &m.mod_type);
    }

    if stat_filters
        .iter()
        .any(|f| f.get("id").and_then(|v| v.as_str()) == Some(&stat_id))
    {
        return;
    }

    let mut filter_entry = json!({ "id": stat_id });
    let mut val_obj = json!({});
    if let Some(min) = m.min_value.or(m.value) {
        val_obj["min"] = json!(min);
    }
    if let Some(max) = m.max_value {
        val_obj["max"] = json!(max);
    }
    if val_obj.as_object().is_some_and(|o| !o.is_empty()) {
        filter_entry["value"] = val_obj;
    }
    stat_filters.push(filter_entry);
}

pub fn check_is_armour(req: &TradeQueryRequest) -> bool {
    req.item
        .as_ref()
        .map(|i| {
            let c = i.item_class.as_deref().unwrap_or("");
            crate::services::parser::header_parser::check_is_armour(c, &i.base_type)
        })
        .unwrap_or(false)
}

pub fn check_is_weapon(req: &TradeQueryRequest) -> bool {
    req.item
        .as_ref()
        .map(|i| {
            let c = i.item_class.as_deref().unwrap_or("");
            crate::services::parser::header_parser::check_is_weapon(c, &i.base_type)
        })
        .unwrap_or(false)
}

pub fn build_top_filters(req: &TradeQueryRequest) -> Value {
    let mut top_filters = json!({});
    let item_rarity = req
        .rarity
        .as_deref()
        .or_else(|| req.item.as_ref().map(|i| i.rarity.as_str()))
        .unwrap_or("");
    let raw_base = req
        .base_type
        .as_deref()
        .or_else(|| req.item.as_ref().map(|i| i.base_type.as_str()))
        .unwrap_or("");
    let raw_name = req
        .name
        .as_deref()
        .or_else(|| req.item.as_ref().map(|i| i.name.as_str()))
        .unwrap_or("");
    let is_generic_map = (raw_base.eq_ignore_ascii_case("Map")
        || raw_base == "地圖"
        || raw_name.eq_ignore_ascii_case("Map")
        || raw_name == "地圖")
        && !item_rarity.eq_ignore_ascii_case("unique");

    let rarity_option = match item_rarity.to_lowercase().as_str() {
        "rare" => Some("rare"),
        "unique" => Some("unique"),
        "magic" => Some("magic"),
        "normal" => Some("normal"),
        "nonunique" => Some("nonunique"),
        _ => None,
    };

    let mut type_filter_obj = json!({});
    if let Some(opt) = rarity_option {
        type_filter_obj["rarity"] = json!({ "option": opt });
    }
    if is_generic_map {
        type_filter_obj["category"] = json!({ "option": "map" });
    }
    if type_filter_obj.as_object().is_some_and(|o| !o.is_empty()) {
        top_filters["type_filters"] = json!({ "filters": type_filter_obj });
    }

    if let Some(links_min) = req.links_min {
        if links_min > 0 {
            top_filters["socket_filters"] = json!({ "filters": { "links": { "min": links_min } } });
        }
    }

    // Map filters (tier)
    let map_tier = req
        .item
        .as_ref()
        .and_then(|item| {
            let re = regex::Regex::new(r"(?i)(?:地圖階級|Map\s*Tier|階級|Tier):\s*(\d+)").ok()?;
            let cap = re.captures(&item.raw_text)?;
            cap[1].parse::<i64>().ok()
        })
        .or_else(|| {
            let re = regex::Regex::new(r"(?i)(?:T|Tier\s*)(\d+)").ok()?;
            if let Some(cap) = re.captures(raw_name) {
                cap[1].parse::<i64>().ok()
            } else if let Some(cap) = re.captures(raw_base) {
                cap[1].parse::<i64>().ok()
            } else {
                None
            }
        });

    if let Some(tier) = map_tier {
        top_filters["map_filters"] = json!({
            "filters": {
                "map_tier": { "min": tier, "max": tier }
            }
        });
    }

    let mut misc_filters = json!({});
    if let Some(corrupted) = req.corrupted {
        misc_filters["corrupted"] = json!({ "option": if corrupted { "true" } else { "false" } });
    }
    if let Some(ilvl_min) = req.item_level_min {
        if ilvl_min > 0 {
            misc_filters["ilvl"] = json!({ "min": ilvl_min });
        }
    }
    if misc_filters.as_object().is_some_and(|o| !o.is_empty()) {
        top_filters["misc_filters"] = json!({ "filters": misc_filters });
    }
    top_filters
}
