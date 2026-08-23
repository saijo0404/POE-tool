use serde_json::{json, Value};
use crate::models::trade::TradeQueryRequest;
use crate::models::item::ParsedItemMod;

pub fn build_search_query_payload(req: &TradeQueryRequest) -> Value {
    let mut query_obj = json!({});

    let status_option = map_trade_status(req.trade_status.as_deref().unwrap_or("securable"));
    query_obj["status"] = json!({ "option": status_option });

    resolve_item_identity(&mut query_obj, req);

    let stat_filters = build_stat_filters(req);
    if !stat_filters.is_empty() {
        query_obj["stats"] = json!([{ "type": "and", "filters": stat_filters }]);
    }

    let top_filters = build_top_filters(req);
    if top_filters.as_object().map_or(false, |o| !o.is_empty()) {
        query_obj["filters"] = top_filters;
    }

    let sort_obj = build_sort_object(req);

    json!({
        "query": query_obj,
        "sort": sort_obj
    })
}

fn map_trade_status(status: &str) -> &str {
    match status {
        "instant" | "securable" => "securable",
        "any_buyout" | "available" => "available",
        "onlineleague" => "onlineleague",
        "online" => "online",
        "any" => "any",
        other => other,
    }
}

fn resolve_item_identity(query_obj: &mut Value, req: &TradeQueryRequest) {
    let item_rarity = req.rarity.as_deref()
        .or_else(|| req.item.as_ref().map(|i| i.rarity.as_str()))
        .unwrap_or("Rare");
    let is_unique = item_rarity.eq_ignore_ascii_case("unique");

    let raw_name = req.name.as_deref().or_else(|| req.item.as_ref().map(|i| i.name.as_str())).unwrap_or("");
    let raw_base = req.base_type.as_deref().or_else(|| req.item.as_ref().map(|i| i.base_type.as_str())).unwrap_or("");

    let tr_name = if !raw_name.is_empty() {
        crate::services::dictionary::lookup_english_base_type(raw_name).unwrap_or_else(|| raw_name.to_string())
    } else { String::new() };

    let tr_base = if !raw_base.is_empty() {
        crate::services::dictionary::lookup_english_base_type(raw_base).unwrap_or_else(|| raw_base.to_string())
    } else { String::new() };

    if is_unique {
        if !tr_name.is_empty() && tr_name.is_ascii() {
            query_obj["name"] = json!(tr_name);
        }
        if !tr_base.is_empty() && tr_base != tr_name && tr_base.is_ascii() {
            query_obj["type"] = json!(tr_base);
        }
    } else if !tr_base.is_empty() && tr_base.is_ascii() {
        query_obj["type"] = json!(tr_base);
    }
}

fn build_stat_filters(req: &TradeQueryRequest) -> Vec<Value> {
    let mut stat_filters = Vec::new();
    if let Some(filters) = &req.filters {
        for f in filters {
            if f.disabled.unwrap_or(false) { continue; }
            let mut filter_entry = json!({ "id": f.stat_id });
            let mut val_obj = json!({});
            if let Some(min) = f.min { val_obj["min"] = json!(min); }
            if let Some(max) = f.max { val_obj["max"] = json!(max); }
            if val_obj.as_object().map_or(false, |o| !o.is_empty()) {
                filter_entry["value"] = val_obj;
            }
            stat_filters.push(filter_entry);
        }
    }
    if let Some(mods) = &req.selected_mods {
        for m in mods {
            if !m.enabled { continue; }
            append_selected_mod_filter(&mut stat_filters, m, req);
        }
    }
    stat_filters
}

fn append_selected_mod_filter(stat_filters: &mut Vec<Value>, m: &ParsedItemMod, req: &TradeQueryRequest) {
    let mut stat_id = m.id.clone();
    if stat_id.starts_with("custom") || !stat_id.contains('.') {
        let is_armour = check_is_armour(req);
        let is_weapon = check_is_weapon(req);
        let matched = if is_armour {
            crate::services::dictionary::lookup_stat_for_armour(&m.text).or_else(|| crate::services::dictionary::lookup_stat_for_armour(&m.english_text))
        } else if is_weapon {
            crate::services::dictionary::lookup_stat_for_weapon(&m.text).or_else(|| crate::services::dictionary::lookup_stat_for_weapon(&m.english_text))
        } else {
            crate::services::dictionary::lookup_stat_by_text(&m.text).or_else(|| crate::services::dictionary::lookup_stat_by_text(&m.english_text))
        };
        if let Some(res) = matched {
            stat_id = crate::services::parser::normalize_stat_id_for_mod_type(&res.id, &m.mod_type);
        } else {
            return;
        }
    } else {
        stat_id = crate::services::parser::normalize_stat_id_for_mod_type(&stat_id, &m.mod_type);
    }

    if stat_filters.iter().any(|f| f.get("id").and_then(|v| v.as_str()) == Some(&stat_id)) {
        return;
    }

    let mut filter_entry = json!({ "id": stat_id });
    let mut val_obj = json!({});
    if let Some(min) = m.min_value.or(m.value) { val_obj["min"] = json!(min); }
    if let Some(max) = m.max_value { val_obj["max"] = json!(max); }
    if val_obj.as_object().map_or(false, |o| !o.is_empty()) {
        filter_entry["value"] = val_obj;
    }
    stat_filters.push(filter_entry);
}

fn check_is_armour(req: &TradeQueryRequest) -> bool {
    req.item.as_ref().map(|i| {
        let c = i.item_class.as_deref().unwrap_or("");
        c.contains("Armour") || c.contains("Body") || c.contains("Boots") || c.contains("Gloves") || c.contains("Helmet") || c.contains("Shield")
            || c.contains("胸甲") || c.contains("鞋") || c.contains("手套") || c.contains("頭部") || c.contains("盾")
    }).unwrap_or(false)
}

fn check_is_weapon(req: &TradeQueryRequest) -> bool {
    req.item.as_ref().map(|i| {
        let c = i.item_class.as_deref().unwrap_or("");
        c.contains("Weapon") || c.contains("Bow") || c.contains("Wand") || c.contains("Sword") || c.contains("Axe") || c.contains("Mace") || c.contains("Dagger") || c.contains("Claw")
            || c.contains("武器") || c.contains("弓") || c.contains("杖") || c.contains("劍") || c.contains("斧") || c.contains("槌") || c.contains("匕首") || c.contains("爪")
    }).unwrap_or(false)
}

fn build_top_filters(req: &TradeQueryRequest) -> Value {
    let mut top_filters = json!({});
    let item_rarity = req.rarity.as_deref().or_else(|| req.item.as_ref().map(|i| i.rarity.as_str())).unwrap_or("Rare");
    let rarity_option = match item_rarity.to_lowercase().as_str() {
        "rare" => Some("rare"), "unique" => Some("unique"), "magic" => Some("magic"),
        "normal" => Some("normal"), "currency" => Some("currency"), "gem" => Some("gem"),
        _ => None,
    };
    if let Some(opt) = rarity_option {
        top_filters["type_filters"] = json!({ "filters": { "rarity": { "option": opt } } });
    }
    if let Some(links_min) = req.links_min {
        if links_min > 0 {
            top_filters["socket_filters"] = json!({ "filters": { "links": { "min": links_min } } });
        }
    }
    let mut misc_filters = json!({});
    if let Some(corrupted) = req.corrupted {
        misc_filters["corrupted"] = json!({ "option": if corrupted { "true" } else { "false" } });
    }
    if let Some(ilvl_min) = req.item_level_min {
        if ilvl_min > 0 { misc_filters["ilvl"] = json!({ "min": ilvl_min }); }
    }
    if misc_filters.as_object().map_or(false, |o| !o.is_empty()) {
        top_filters["misc_filters"] = json!({ "filters": misc_filters });
    }
    top_filters
}

fn build_sort_object(req: &TradeQueryRequest) -> Value {
    if let Some(s) = &req.sort {
        let mut obj = json!({});
        if let Some(p) = &s.price { obj["price"] = json!(p); }
        if let Some(i) = &s.indexed { obj["indexed"] = json!(i); }
        if obj.as_object().map_or(false, |o| !o.is_empty()) { return obj; }
    }
    json!({ "price": "asc" })
}
