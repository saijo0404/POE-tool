use serde_json::Value;
use std::collections::HashMap;

pub fn lookup_unit_chaos(
    it: &Value,
    clean_name: &str,
    clean_type: &str,
    en_name: &str,
    en_type: &str,
    rates: &HashMap<String, f64>,
) -> f64 {
    if is_six_link_item(it) {
        if let Some(&price) = rates.get(&format!("{}:6L", en_name)) {
            return price;
        }
        if let Some(&price) = rates.get(&format!("{}:6L", en_type)) {
            return price;
        }
        if let Some(&price) = rates.get(&format!("{}:6L", clean_name)) {
            return price;
        }
        if let Some(&price) = rates.get(&format!("{}:6L", clean_type)) {
            return price;
        }
    }

    let is_gem = it["frameType"].as_i64() == Some(4)
        || clean_type.contains("寶石")
        || clean_type.contains("輔助")
        || en_type.contains("Gem")
        || en_type.contains("Support");

    if is_gem {
        if let Some(price) = lookup_gem_price(it, en_name, clean_name, rates) {
            return price;
        }
    }

    let ilvl = it["ilvl"].as_i64().unwrap_or(0);
    if ilvl >= 84 {
        if let Some(price) = lookup_base_price(ilvl, en_type, clean_type, rates) {
            return price;
        }
    }

    if let Some(&price) = rates.get(en_name) {
        return price;
    }
    if let Some(&price) = rates.get(en_type) {
        return price;
    }
    if let Some(&price) = rates.get(clean_name) {
        return price;
    }
    if let Some(&price) = rates.get(clean_type) {
        return price;
    }
    0.0
}

pub fn is_six_link_item(it: &Value) -> bool {
    let sockets = match it["sockets"].as_array() {
        Some(s) if s.len() >= 6 => s,
        _ => return false,
    };
    let mut group_counts = HashMap::new();
    for s in sockets {
        let g = s["group"].as_i64().unwrap_or(0);
        *group_counts.entry(g).or_insert(0) += 1;
    }
    group_counts.values().any(|&count| count >= 6)
}

pub fn lookup_gem_price(
    it: &Value,
    en_name: &str,
    clean_name: &str,
    rates: &HashMap<String, f64>,
) -> Option<f64> {
    let (level, quality, corrupted) = parse_gem_properties(it);
    let corrupted_suffix = if corrupted { "c" } else { "" };
    let keys = [
        format!("{} ({}/{}{})", en_name, level, quality, corrupted_suffix),
        format!("{} ({}/{})", en_name, level, quality),
        format!("{} ({})", en_name, level),
        format!("{}:{}/{}", en_name, level, quality),
        format!("{}:{}", en_name, level),
        format!("{} ({}/{})", clean_name, level, quality),
    ];
    for k in &keys {
        if let Some(&p) = rates.get(k) {
            return Some(p);
        }
    }
    if quality >= 20 {
        let gcp = rates.get("Gemcutter's Prism").copied().unwrap_or(2.0);
        return Some(gcp.max(rates.get(en_name).copied().unwrap_or(0.0)));
    }
    None
}

pub fn parse_gem_properties(it: &Value) -> (i64, i64, bool) {
    let mut level = 1;
    let mut quality = 0;
    let corrupted = it["corrupted"].as_bool().unwrap_or(false);

    if let Some(props) = it["properties"].as_array() {
        for p in props {
            let name = p["name"].as_str().unwrap_or("");
            if name.contains("Level") || name.contains("等級") {
                if let Some(val_str) = p["values"]
                    .as_array()
                    .and_then(|v| v.first())
                    .and_then(|pair| pair.as_array())
                    .and_then(|t| t.first())
                    .and_then(|s| s.as_str())
                {
                    let cleaned = val_str.replace(['+', '%'], "").trim().to_string();
                    if let Ok(l) = cleaned.parse::<i64>() {
                        level = l;
                    }
                }
            } else if name.contains("Quality") || name.contains("品質") {
                if let Some(val_str) = p["values"]
                    .as_array()
                    .and_then(|v| v.first())
                    .and_then(|pair| pair.as_array())
                    .and_then(|t| t.first())
                    .and_then(|s| s.as_str())
                {
                    let cleaned = val_str.replace(['+', '%'], "").trim().to_string();
                    if let Ok(q) = cleaned.parse::<i64>() {
                        quality = q;
                    }
                }
            }
        }
    }
    (level, quality, corrupted)
}

pub fn lookup_base_price(
    ilvl: i64,
    en_type: &str,
    clean_type: &str,
    rates: &HashMap<String, f64>,
) -> Option<f64> {
    let keys = [
        format!("{} (ilvl {})", en_type, ilvl),
        format!("{}:{}", en_type, ilvl),
        format!("{} (ilvl {})", clean_type, ilvl),
        format!("{}:{}", clean_type, ilvl),
    ];
    for k in &keys {
        if let Some(&p) = rates.get(k) {
            return Some(p);
        }
    }
    None
}
