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
    let spirit_val = req.spirit_min.map(i64::from).or_else(|| {
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

fn apply_rune_socket_filter(top_filters: &mut Value, req: &TradeQueryRequest) {
    let rune_val = req.rune_sockets_min.map(i64::from).or_else(|| {
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
    let waystone_tier = req.waystone_tier_min.map(i64::from).or_else(|| {
        let raw = req.item.as_ref()?.raw_text.as_str();
        extract_regex_val(raw, r"(?i)(?:尋路石階級|Waystone Tier):\s*(\d+)")
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
    let uncut_tier = req.uncut_gem_tier_min.map(i64::from).or_else(|| {
        let raw = req.item.as_ref()?.raw_text.as_str();
        extract_regex_val(raw, r"(?i)(?:未切割.*?階級|Uncut.*?Tier)\s*(\d+)")
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

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::item::ParsedItem;

    #[test]
    fn test_apply_poe2_filters_explicit() {
        let mut filters = json!({});
        let req = TradeQueryRequest {
            league: Some("Standard".into()),
            engine: Some("poe2".into()),
            trade_status: None,
            rarity: None,
            base_type: None,
            name: None,
            item_level_min: None,
            links_min: None,
            corrupted: None,
            filters: None,
            selected_mods: None,
            item: None,
            poesessid: None,
            sort: None,
            fetch_offset: None,
            search_id: None,
            spirit_min: Some(50),
            rune_sockets_min: Some(2),
            waystone_tier_min: Some(15),
            uncut_gem_tier_min: Some(19),
        };

        apply_poe2_filters(&mut filters, &req);

        assert_eq!(filters["equipment_filters"]["filters"]["spirit"]["min"], 50);
        assert_eq!(
            filters["socket_filters"]["filters"]["rune_sockets"]["min"],
            2
        );
        assert_eq!(
            filters["map_filters"]["filters"]["waystone_tier"]["min"],
            15
        );
        assert_eq!(filters["misc_filters"]["filters"]["gem_level"]["min"], 19);
    }

    #[test]
    fn test_apply_poe2_filters_from_item() {
        let mut filters = json!({});
        let mut item = ParsedItem::empty("zh", "");
        item.raw_text = "稀 有 度: 稀有\n高級法杖\n精魂需求: 85\n符文插槽: 3".to_string();

        let req = TradeQueryRequest {
            league: Some("Standard".into()),
            engine: Some("poe2".into()),
            item: Some(item),
            ..Default::default()
        };

        apply_poe2_filters(&mut filters, &req);
        assert_eq!(filters["equipment_filters"]["filters"]["spirit"]["min"], 85);
        assert_eq!(
            filters["socket_filters"]["filters"]["rune_sockets"]["min"],
            3
        );
    }
}
