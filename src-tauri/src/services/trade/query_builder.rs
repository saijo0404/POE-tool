use super::query_filter_builder::{build_stat_filters, build_top_filters};
use crate::models::trade::TradeQueryRequest;
use serde_json::{json, Value};

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
    if top_filters.as_object().is_some_and(|o| !o.is_empty()) {
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
    let item_rarity = req
        .rarity
        .as_deref()
        .or_else(|| req.item.as_ref().map(|i| i.rarity.as_str()))
        .unwrap_or("");
    let is_unique = item_rarity.eq_ignore_ascii_case("unique");

    let raw_name = req
        .name
        .as_deref()
        .or_else(|| req.item.as_ref().map(|i| i.name.as_str()))
        .unwrap_or("");
    let raw_base = req
        .base_type
        .as_deref()
        .or_else(|| req.item.as_ref().map(|i| i.base_type.as_str()))
        .unwrap_or("");

    let tr_name = if !raw_name.is_empty() {
        crate::services::dictionary::lookup_english_base_type(raw_name)
            .unwrap_or_else(|| raw_name.to_string())
    } else {
        String::new()
    };

    let tr_base = if !raw_base.is_empty() {
        crate::services::dictionary::lookup_english_base_type(raw_base)
            .unwrap_or_else(|| raw_base.to_string())
    } else {
        String::new()
    };

    let is_generic_map = (tr_base.eq_ignore_ascii_case("Map")
        || tr_base == "地圖"
        || tr_name.eq_ignore_ascii_case("Map")
        || tr_name == "地圖")
        && !is_unique;

    if is_generic_map {
        // For generic maps, do not set query_obj["type"] because "Map" is a category filter on PoE trade
        return;
    }

    if is_unique {
        if !tr_name.is_empty() {
            query_obj["name"] = json!(tr_name);
        }
        if !tr_base.is_empty() && tr_base != tr_name {
            query_obj["type"] = json!(tr_base);
        }
    } else if !tr_base.is_empty() {
        query_obj["type"] = json!(tr_base);
    } else if !tr_name.is_empty() {
        query_obj["type"] = json!(tr_name);
    }
}

fn build_sort_object(req: &TradeQueryRequest) -> Value {
    if let Some(s) = &req.sort {
        let mut obj = json!({});
        if let Some(p) = &s.price {
            obj["price"] = json!(p);
        }
        if let Some(i) = &s.indexed {
            obj["indexed"] = json!(i);
        }
        if obj.as_object().is_some_and(|o| !o.is_empty()) {
            return obj;
        }
    }
    json!({ "price": "asc" })
}
