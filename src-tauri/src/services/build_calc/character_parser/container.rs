use serde_json::Value;

const EXPLICIT_ALIASES: &[&str] = &[
    "explicitMods",
    "explicits",
    "explicit_mods",
    "explicit",
    "mods",
    "stats",
    "stat",
];
const IMPLICIT_ALIASES: &[&str] = &["implicitMods", "implicits", "implicit_mods", "implicit"];
const CRAFTED_ALIASES: &[&str] = &["craftedMods", "crafted", "crafted_mods"];
const FRACTURED_ALIASES: &[&str] = &["fracturedMods", "fractured", "fractured_mods"];
const ENCHANT_ALIASES: &[&str] = &["enchantMods", "enchants", "enchant_mods", "enchant"];
const UTILITY_ALIASES: &[&str] = &["utilityMods", "utility", "utility_mods"];

pub fn try_parse_string_containers(src: &Value, it: &Value) -> Vec<Value> {
    let mut parsed = Vec::new();
    let mut string_candidates = Vec::new();

    for d in [src, it] {
        collect_string_candidates_from_val(d, &mut string_candidates);
    }

    for candidate in string_candidates {
        if let Ok(val) = serde_json::from_str::<Value>(candidate) {
            if val.is_object() {
                parsed.push(val);
            } else if let Some(arr) = val.as_array() {
                for elem in arr {
                    if elem.is_object() {
                        parsed.push(elem.clone());
                    }
                }
            }
        }
    }
    parsed
}

fn collect_string_candidates_from_val<'a>(val: &'a Value, candidates: &mut Vec<&'a str>) {
    if let Some(obj) = val.as_object() {
        for (_k, v) in obj {
            if let Some(s) = v.as_str() {
                let st = s.trim_start();
                if st.starts_with('{') || st.starts_with('[') {
                    candidates.push(s);
                }
            } else if let Some(sub_obj) = v.as_object() {
                for (_sub_k, sub_v) in sub_obj {
                    if let Some(s) = sub_v.as_str() {
                        let st = s.trim_start();
                        if st.starts_with('{') || st.starts_with('[') {
                            candidates.push(s);
                        }
                    }
                }
            }
        }
    }
}

pub fn get_all_item_containers<'a>(
    src: &'a Value,
    it: &'a Value,
    parsed_holder: &'a [Value],
) -> Vec<&'a Value> {
    let mut list = Vec::new();
    if src.is_object() {
        list.push(src);
    }
    if it.is_object() {
        list.push(it);
    }
    for root in [it, src] {
        if let Some(sub) = root.get("item").filter(|v| v.is_object()) {
            list.push(sub);
        }
        if let Some(sub) = root.get("itemData").filter(|v| v.is_object()) {
            list.push(sub);
        }
    }
    for p in parsed_holder {
        if p.is_object() {
            list.push(p);
        }
    }
    list
}

fn get_mod_aliases(primary_key: &str) -> Option<&'static [&'static str]> {
    match primary_key {
        "explicitMods" => Some(EXPLICIT_ALIASES),
        "implicitMods" => Some(IMPLICIT_ALIASES),
        "craftedMods" => Some(CRAFTED_ALIASES),
        "fracturedMods" => Some(FRACTURED_ALIASES),
        "enchantMods" => Some(ENCHANT_ALIASES),
        "utilityMods" => Some(UTILITY_ALIASES),
        _ => None,
    }
}

fn append_lines(text: &str, results: &mut Vec<String>) {
    for line in text.lines() {
        let t = line.trim();
        if !t.is_empty() {
            results.push(t.to_string());
        }
    }
}

fn extract_mod_item_obj(obj: &serde_json::Map<String, Value>, results: &mut Vec<String>) {
    let text_keys = [
        "text",
        "name",
        "line",
        "string",
        "description",
        "desc",
        "value",
        "raw",
        "mod",
        "stat",
    ];
    if let Some(s) = text_keys.iter().find_map(|&k| obj.get(k)?.as_str()) {
        append_lines(s, results);
        return;
    }
    for (_obj_k, obj_v) in obj {
        if let Some(s) = obj_v.as_str() {
            let matched = s.contains('+')
                || s.contains('%')
                || s.contains("increased")
                || s.contains("to ")
                || s.contains("Damage")
                || s.contains("Resistance")
                || s.contains("maximum");
            if matched {
                append_lines(s, results);
            }
        }
    }
}

pub fn extract_mods_from_src(src: &Value, it: &Value, primary_key: &str) -> Vec<String> {
    let fallback = [primary_key];
    let aliases = get_mod_aliases(primary_key).unwrap_or(&fallback);
    let parsed_strings = try_parse_string_containers(src, it);
    let containers = get_all_item_containers(src, it, &parsed_strings);

    let mut results = Vec::new();
    for container in containers {
        for &k in aliases {
            if let Some(arr) = container.get(k).and_then(|v| v.as_array()) {
                if !arr.is_empty() {
                    for m in arr {
                        if let Some(s) = m.as_str() {
                            append_lines(s, &mut results);
                        } else if let Some(obj) = m.as_object() {
                            extract_mod_item_obj(obj, &mut results);
                        }
                    }
                    if !results.is_empty() {
                        return results;
                    }
                }
            } else if let Some(s) = container.get(k).and_then(|v| v.as_str()) {
                let trimmed = s.trim();
                if !trimmed.is_empty() && !trimmed.starts_with('{') && !trimmed.starts_with('[') {
                    append_lines(trimmed, &mut results);
                    if !results.is_empty() {
                        return results;
                    }
                }
            }
        }
    }
    results
}
