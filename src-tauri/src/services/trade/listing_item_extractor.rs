use serde_json::Value;

pub fn map_frame_type_to_rarity(frame_type: i64) -> String {
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

pub fn extract_mod_list(
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

pub fn extract_extended_mods(item_obj: &Value, category: &str) -> Option<Vec<String>> {
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

pub fn extract_quality(item_obj: &Value) -> Option<i64> {
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
