use serde_json::Value;
use super::stat_selector::select_candidate_stat_filters;

pub fn generate_trade_search_query(
    league: &str,
    name: &str,
    type_line: &str,
    rarity: &str,
    slot: &str,
    links: Option<i64>,
    explicit_mods: &[String],
    implicit_mods: &[String],
    crafted_mods: &[String],
    fractured_mods: &[String],
    enchant_mods: &[String],
    _property_energy_shield: Option<f64>,
    _property_armour: Option<f64>,
    _property_evasion: Option<f64>,
    gem_level: Option<i64>,
    gem_quality: Option<i64>,
    gem_corrupted: Option<bool>,
) -> (String, String) {
    let mut query_obj = serde_json::json!({ "status": { "option": "securable" } });
    let is_unique = rarity.eq_ignore_ascii_case("unique");
    let is_gem = rarity.eq_ignore_ascii_case("gem") || type_line.contains("Gem");

    let trans_name = crate::services::dictionary::lookup_english_base_type(name).unwrap_or_else(|| name.to_string());
    let trans_type = crate::services::dictionary::lookup_english_base_type(type_line).unwrap_or_else(|| type_line.to_string());
    let mut filters_obj = serde_json::json!({});

    if is_unique {
        apply_unique_query_filters(&mut query_obj, &mut filters_obj, &trans_name, &trans_type);
    } else if is_gem {
        apply_gem_query_filters(&mut query_obj, &mut filters_obj, &trans_name, &trans_type, gem_level, gem_quality, gem_corrupted);
    } else {
        apply_rare_query_filters(&mut query_obj, &mut filters_obj, &trans_type, rarity, slot, links);
    }

    if !is_gem && !is_unique {
        let stat_filters = select_candidate_stat_filters(slot, &trans_type, explicit_mods, implicit_mods, crafted_mods, fractured_mods, enchant_mods);
        if !stat_filters.is_empty() {
            query_obj["stats"] = serde_json::json!([{ "type": "and", "filters": stat_filters }]);
        }
    }

    if !filters_obj.as_object().map(|o| o.is_empty()).unwrap_or(true) {
        query_obj["filters"] = filters_obj;
    }

    let payload = serde_json::json!({ "query": query_obj, "sort": { "price": "asc" } });
    let query_str = payload.to_string();
    let fallback_url = format!("https://www.pathofexile.com/trade/search/{}?q={}", urlencoding::encode(league), urlencoding::encode(&query_str));
    (fallback_url, query_str)
}

fn apply_unique_query_filters(query_obj: &mut Value, filters_obj: &mut Value, trans_name: &str, trans_type: &str) {
    filters_obj["type_filters"] = serde_json::json!({ "filters": { "rarity": { "option": "unique" } } });
    let n = trans_name.trim();
    let t = trans_type.trim();

    if !n.is_empty() && !t.is_empty() && n != t {
        query_obj["name"] = serde_json::json!(n);
        query_obj["type"] = serde_json::json!(t);
    } else if !n.is_empty() {
        query_obj["name"] = serde_json::json!(n);
    } else if !t.is_empty() {
        query_obj["name"] = serde_json::json!(t);
    }
}

fn apply_gem_query_filters(query_obj: &mut Value, filters_obj: &mut Value, trans_name: &str, trans_type: &str, lvl: Option<i64>, qual: Option<i64>, corr: Option<bool>) {
    let mut misc = serde_json::json!({});
    if let Some(l) = lvl { misc["gem_level"] = serde_json::json!({ "min": l }); }
    if let Some(q) = qual { if q > 0 { misc["quality"] = serde_json::json!({ "min": q }); } }
    if let Some(c) = corr { if c { misc["corrupted"] = serde_json::json!({ "option": "true" }); } }
    if !misc.as_object().map(|o| o.is_empty()).unwrap_or(true) {
        filters_obj["misc_filters"] = serde_json::json!({ "filters": misc });
    }
    let target = if !trans_type.is_empty() { trans_type } else { trans_name };
    if !target.is_empty() { query_obj["type"] = serde_json::json!(target); }
}

fn apply_rare_query_filters(query_obj: &mut Value, filters_obj: &mut Value, trans_type: &str, rarity: &str, slot: &str, links: Option<i64>) {
    if !trans_type.is_empty() { query_obj["type"] = serde_json::json!(trans_type); }
    if rarity.eq_ignore_ascii_case("rare") {
        filters_obj["type_filters"] = serde_json::json!({ "filters": { "rarity": { "option": "rare" } } });
    }
    if let Some(l) = links {
        if l >= 5 && (slot.contains("Body") || slot.contains("Weapon") || slot.is_empty()) {
            filters_obj["socket_filters"] = serde_json::json!({ "filters": { "links": { "min": l } } });
        }
    }
}
