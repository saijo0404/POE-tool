use crate::models::trade::TradeQueryRequest;
use regex::Regex;
use serde_json::{json, Value};

pub fn apply_poe2_filters(top_filters: &mut Value, req: &TradeQueryRequest) {
    if !top_filters.is_object() {
        *top_filters = json!({});
    }

    apply_spirit_filter(top_filters, req);
    apply_rune_socket_filter(top_filters, req);
    apply_waystone_filter(top_filters, req);
    apply_uncut_gem_filter(top_filters, req);
}

fn apply_spirit_filter(top_filters: &mut Value, req: &TradeQueryRequest) {
    let spirit_val = req
        .spirit_min
        .map(i64::from)
        .or_else(|| req.item.as_ref().and_then(|i| i.spirit))
        .or_else(|| {
            let raw = req.item.as_ref()?.raw_text.as_str();
            extract_regex_val(raw, r"(?i)(?:精魂需求|精魂|Spirit|Max Spirit):\s*(\d+)")
        });

    if let Some(spirit) = spirit_val {
        if spirit > 0 {
            ensure_sub_filter(
                top_filters,
                "equipment_filters",
                "spirit",
                json!({ "min": spirit }),
            );
        }
    }
}

fn parse_rune_socket_count(s: &str) -> Option<i64> {
    let trimmed = s.trim();
    if let Ok(num) = trimmed.parse::<i64>() {
        return Some(num);
    }
    let count = trimmed.split_whitespace().count() as i64;
    if count > 0 {
        Some(count)
    } else {
        None
    }
}

fn apply_rune_socket_filter(top_filters: &mut Value, req: &TradeQueryRequest) {
    let rune_val = req
        .rune_sockets_min
        .map(i64::from)
        .or_else(|| {
            req.item
                .as_ref()
                .and_then(|i| i.rune_sockets.as_deref().and_then(parse_rune_socket_count))
        })
        .or_else(|| {
            let raw = req.item.as_ref()?.raw_text.as_str();
            extract_regex_val(raw, r"(?i)(?:符文插槽|Rune Sockets?):\s*(\d+)")
        });

    if let Some(runes) = rune_val {
        if runes > 0 {
            ensure_sub_filter(
                top_filters,
                "socket_filters",
                "rune_sockets",
                json!({ "min": runes }),
            );
        }
    }
}

fn apply_waystone_filter(top_filters: &mut Value, req: &TradeQueryRequest) {
    let waystone_tier = req
        .waystone_tier_min
        .map(i64::from)
        .or_else(|| req.item.as_ref().and_then(|i| i.waystone_tier))
        .or_else(|| {
            let raw = req.item.as_ref()?.raw_text.as_str();
            extract_regex_val(
                raw,
                r"(?i)(?:尋路石階級|銘刻地圖階級|Waystone Tier|階級|Tier):\s*(\d+)",
            )
        });

    if let Some(tier) = waystone_tier {
        if tier > 0 {
            ensure_sub_filter(
                top_filters,
                "map_filters",
                "waystone_tier",
                json!({ "min": tier, "max": tier }),
            );
        }
    }
}

fn apply_uncut_gem_filter(top_filters: &mut Value, req: &TradeQueryRequest) {
    let uncut_tier = req
        .uncut_gem_tier_min
        .map(i64::from)
        .or_else(|| req.item.as_ref().and_then(|i| i.uncut_tier))
        .or_else(|| {
            let raw = req.item.as_ref()?.raw_text.as_str();
            extract_regex_val(raw, r"(?i)(?:未切割.*?階級|Uncut.*?Tier|階級|Tier)\s*(\d+)")
        });

    if let Some(gem_level) = uncut_tier {
        if gem_level > 0 {
            ensure_sub_filter(
                top_filters,
                "misc_filters",
                "gem_level",
                json!({ "min": gem_level }),
            );
        }
    }
}

fn ensure_sub_filter(top_filters: &mut Value, section: &str, key: &str, val: Value) {
    let obj = top_filters.as_object_mut().unwrap();
    let sec_obj = obj
        .entry(section)
        .or_insert_with(|| json!({ "filters": {} }));
    if let Some(filters_map) = sec_obj.get_mut("filters").and_then(|f| f.as_object_mut()) {
        filters_map.insert(key.to_string(), val);
    }
}

fn extract_regex_val(raw: &str, pattern: &str) -> Option<i64> {
    let re = Regex::new(pattern).ok()?;
    let cap = re.captures(raw)?;
    cap[1].parse::<i64>().ok()
}
