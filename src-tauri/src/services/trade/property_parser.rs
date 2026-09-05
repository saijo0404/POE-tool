use crate::models::trade::TradeItemProperty;
use serde_json::Value;

pub fn calculate_indexed_age(indexed_str: Option<&str>) -> Option<String> {
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

pub fn parse_properties(val: &Value) -> Option<Vec<TradeItemProperty>> {
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

pub fn parse_sockets(val: &Value) -> Option<String> {
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
