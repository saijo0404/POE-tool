use serde_json::Value;

pub fn extract_property_numeric_value(
    properties: Option<&Vec<Value>>,
    names: &[&str],
) -> Option<f64> {
    let props = properties?;
    for p in props {
        let p_name = p["name"].as_str().unwrap_or_default();
        if names.iter().any(|&t| p_name.eq_ignore_ascii_case(t)) {
            let first_val = p["values"]
                .as_array()
                .and_then(|v| v.first())
                .and_then(|row| row.as_array())
                .and_then(|pair| pair.first());

            if let Some(val_node) = first_val {
                if let Some(s) = val_node.as_str() {
                    let cleaned = s.replace(['%', '+'], "").trim().to_string();
                    if let Ok(v) = cleaned.parse::<f64>() {
                        return Some(v);
                    }
                } else if let Some(v) = val_node.as_f64() {
                    return Some(v);
                } else if let Some(v) = val_node.as_i64() {
                    return Some(v as f64);
                }
            }
        }
    }
    None
}
