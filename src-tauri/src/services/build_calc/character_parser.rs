use serde_json::Value;
use crate::models::ninja::{NinjaBuildData, NinjaBuildFlask, NinjaBuildGem, NinjaBuildItem, NinjaBuildJewel};

pub fn parse_character_window_json(data: &Value, account: &str, fallback_league: &str) -> Result<NinjaBuildData, String> {
    let char_obj = &data["character"];
    let character_name = char_obj["name"].as_str().or_else(|| data["name"].as_str()).unwrap_or("Character").to_string();
    let league = char_obj["league"].as_str().or_else(|| data["league"].as_str()).unwrap_or(fallback_league).to_string();
    let class_name = char_obj["class"].as_str().or_else(|| data["class"].as_str()).unwrap_or("Unknown").to_string();
    let ascendancy = char_obj["ascendancyClass"].as_str().or_else(|| char_obj["class"].as_str()).unwrap_or(&class_name).to_string();
    let level = char_obj["level"].as_i64().or_else(|| data["level"].as_i64()).unwrap_or(90);

    let raw_items = data["items"].as_array()
        .or_else(|| data["equipment"].as_array())
        .or_else(|| data["character"]["items"].as_array())
        .or_else(|| data["character"]["equipment"].as_array())
        .or_else(|| data["snapshot"]["items"].as_array())
        .or_else(|| data["snapshot"]["equipment"].as_array())
        .cloned().unwrap_or_default();
    let mut equipment = Vec::new();
    let mut flasks = Vec::new();
    let mut jewels = Vec::new();
    let mut gems = Vec::new();

    for it in &raw_items {
        classify_item_into_build_collections(it, &mut equipment, &mut flasks, &mut jewels, &mut gems);
    }

    Ok(NinjaBuildData {
        account: account.to_string(), character_name, league, level, class_name, ascendancy,
        equipment, gems, flasks, jewels,
    })
}

fn try_parse_string_containers(src: &Value, it: &Value) -> Vec<Value> {
    let mut parsed = Vec::new();
    let mut string_candidates = Vec::new();

    let direct_sources = [src, it];
    for d in direct_sources {
        if let Some(obj) = d.as_object() {
            for (_k, v) in obj {
                if let Some(s) = v.as_str() {
                    let st = s.trim_start();
                    if st.starts_with('{') || st.starts_with('[') {
                        string_candidates.push(s);
                    }
                } else if let Some(sub_obj) = v.as_object() {
                    for (_sub_k, sub_v) in sub_obj {
                        if let Some(s) = sub_v.as_str() {
                            let st = s.trim_start();
                            if st.starts_with('{') || st.starts_with('[') {
                                string_candidates.push(s);
                            }
                        }
                    }
                }
            }
        }
    }

    for candidate in string_candidates {
        if let Ok(val) = serde_json::from_str::<Value>(candidate) {
            if val.is_object() {
                parsed.push(val);
            } else if let Some(arr) = val.as_array() {
                for elem in arr {
                    if elem.is_object() { parsed.push(elem.clone()); }
                }
            }
        }
    }
    parsed
}

fn get_all_item_containers<'a>(src: &'a Value, it: &'a Value, parsed_holder: &'a [Value]) -> Vec<&'a Value> {
    let mut list = Vec::new();
    if src.is_object() { list.push(src); }
    if it.is_object() { list.push(it); }
    if let Some(sub) = it.get("item").filter(|v| v.is_object()) { list.push(sub); }
    if let Some(sub) = it.get("itemData").filter(|v| v.is_object()) { list.push(sub); }
    if let Some(sub) = src.get("item").filter(|v| v.is_object()) { list.push(sub); }
    if let Some(sub) = src.get("itemData").filter(|v| v.is_object()) { list.push(sub); }
    for p in parsed_holder {
        if p.is_object() { list.push(p); }
    }
    list
}

fn classify_item_into_build_collections(
    it: &Value,
    equipment: &mut Vec<NinjaBuildItem>,
    flasks: &mut Vec<NinjaBuildFlask>,
    jewels: &mut Vec<NinjaBuildJewel>,
    gems: &mut Vec<NinjaBuildGem>
) {
    let parsed_strings = try_parse_string_containers(&Value::Null, it);
    let src = if let Some(first_parsed) = parsed_strings.first() {
        first_parsed
    } else if it.get("itemData").map_or(false, |v| v.is_object()) {
        it.get("itemData").unwrap()
    } else if it.get("item").map_or(false, |v| v.is_object()) {
        it.get("item").unwrap()
    } else {
        it
    };

    let containers = get_all_item_containers(src, it, &parsed_strings);

    let inv_id = containers.iter().find_map(|c| c["inventoryId"].as_str().or_else(|| c["slot"].as_str())).unwrap_or_default();
    let type_line = containers.iter().find_map(|c| c["typeLine"].as_str().or_else(|| c["baseType"].as_str())).unwrap_or_default().to_string();
    let name = containers.iter().find_map(|c| c["name"].as_str()).unwrap_or(&type_line).to_string();
    let icon = containers.iter().find_map(|c| c["icon"].as_str()).unwrap_or_default().to_string();
    let frame_type = containers.iter().find_map(|c| c["frameType"].as_i64()).unwrap_or(0);

    let rarity = match frame_type {
        1 => "Magic",
        2 => "Rare",
        3 => "Unique",
        4 => "Gem",
        5 => "Currency",
        6 => "DivinationCard",
        7 => "Quest",
        8 => "Prophecy",
        9 => "Foil",
        _ => "Normal",
    }.to_string();

    if inv_id.eq_ignore_ascii_case("MainInventory") || inv_id.eq_ignore_ascii_case("ExpandedMainInventory") || frame_type == 5 || frame_type == 6 || frame_type == 7 {
        return;
    }

    if inv_id == "Flask" || type_line.contains("Flask") || name.contains("Flask") {
        flasks.push(NinjaBuildFlask {
            name, type_line, rarity, icon,
            explicit_mods: extract_mods_from_src(src, it, "explicitMods"),
            utility_mods: extract_mods_from_src(src, it, "utilityMods"),
            enchant_mods: extract_mods_from_src(src, it, "enchantMods"),
        });
    } else if inv_id == "PassiveJewels" || type_line.contains("Jewel") || name.contains("Jewel") || type_line.contains("Cluster") {
        jewels.push(NinjaBuildJewel {
            name, type_line, rarity, icon,
            explicit_mods: extract_mods_from_src(src, it, "explicitMods"),
            implicit_mods: extract_mods_from_src(src, it, "implicitMods"),
            crafted_mods: extract_mods_from_src(src, it, "craftedMods"),
            fractured_mods: extract_mods_from_src(src, it, "fracturedMods"),
        });
    } else if frame_type == 4 || inv_id == "Gems" || type_line.contains("Gem") {
        gems.push(NinjaBuildGem {
            name, level: 20, quality: 20, icon, socketed_in: inv_id.to_string(),
            is_support: false, is_vaal: false, is_awakened: false,
        });
    } else if !type_line.is_empty() {
        equipment.push(parse_ninja_build_equipment_item(src, it, inv_id, &name, &type_line, icon, frame_type));
    }
}

fn parse_ninja_build_equipment_item(src: &Value, it: &Value, inv_id: &str, name: &str, type_line: &str, icon: String, frame_type: i64) -> NinjaBuildItem {
    let rarity = match frame_type { 1 => "Magic", 2 => "Rare", 3 => "Unique", _ => "Normal" }.to_string();
    let parsed_strings = try_parse_string_containers(src, it);
    let containers = get_all_item_containers(src, it, &parsed_strings);

    let props_vec = containers.iter().find_map(|c| c.get("properties").and_then(|v| v.as_array()));
    let sockets_vec = containers.iter().find_map(|c| c.get("sockets").and_then(|v| v.as_array()));
    let links = sockets_vec.and_then(|sockets| {
        let mut group_counts = std::collections::HashMap::new();
        for s in sockets { if let Some(g) = s["group"].as_i64() { *group_counts.entry(g).or_insert(0i64) += 1; } }
        group_counts.values().copied().max()
    });

    let ilvl = containers.iter().find_map(|c| c.get("ilvl").and_then(|v| v.as_i64())).unwrap_or(85);
    let corrupted = containers.iter().find_map(|c| c.get("corrupted").and_then(|v| v.as_bool())).unwrap_or(false);

    let explicit_mods = extract_mods_from_src(src, it, "explicitMods");
    let implicit_mods = extract_mods_from_src(src, it, "implicitMods");
    let crafted_mods = extract_mods_from_src(src, it, "craftedMods");
    let fractured_mods = extract_mods_from_src(src, it, "fracturedMods");
    let enchant_mods = extract_mods_from_src(src, it, "enchantMods");

    crate::app_log!(
        "[BuildCalc] 🔍 裝備 [{}] '{}' (基底: '{}'), 稀有度={}, 提取詞綴: explicit={}, implicit={}, crafted={}, fractured={}, enchant={}",
        inv_id, name, type_line, rarity, explicit_mods.len(), implicit_mods.len(), crafted_mods.len(), fractured_mods.len(), enchant_mods.len()
    );
    if explicit_mods.is_empty() && (rarity == "Rare" || rarity == "Magic") {
        crate::app_log!("[BuildCalc RAW] Item '{}' raw JSON: {}", name, serde_json::to_string(it).unwrap_or_default());
    }

    NinjaBuildItem {
        name: name.to_string(), type_line: type_line.to_string(), slot: inv_id.to_string(), rarity, icon,
        ilvl, corrupted,
        explicit_mods,
        implicit_mods,
        crafted_mods,
        fractured_mods,
        enchant_mods,
        links,
        property_energy_shield: extract_property_numeric_value(props_vec, &["Energy Shield", "能量護盾"]),
        property_armour: extract_property_numeric_value(props_vec, &["Armour", "護甲"]),
        property_evasion: extract_property_numeric_value(props_vec, &["Evasion Rating", "閃避值", "閃避"]),
    }
}

fn extract_mods_from_src(src: &Value, it: &Value, primary_key: &str) -> Vec<String> {
    let aliases: &[&str] = match primary_key {
        "explicitMods" => &["explicitMods", "explicits", "explicit_mods", "explicit", "mods", "stats", "stat"],
        "implicitMods" => &["implicitMods", "implicits", "implicit_mods", "implicit"],
        "craftedMods" => &["craftedMods", "crafted", "crafted_mods"],
        "fracturedMods" => &["fracturedMods", "fractured", "fractured_mods"],
        "enchantMods" => &["enchantMods", "enchants", "enchant_mods", "enchant"],
        "utilityMods" => &["utilityMods", "utility", "utility_mods"],
        _ => &[primary_key],
    };

    let parsed_strings = try_parse_string_containers(src, it);
    let containers = get_all_item_containers(src, it, &parsed_strings);

    let mut results = Vec::new();
    for container in containers {
        for &k in aliases {
            if let Some(arr) = container.get(k).and_then(|v| v.as_array()) {
                if !arr.is_empty() {
                    for m in arr {
                        if let Some(s) = m.as_str() {
                            for line in s.lines() { let t = line.trim(); if !t.is_empty() { results.push(t.to_string()); } }
                        } else if let Some(obj) = m.as_object() {
                            if let Some(s) = obj.get("text")
                                .or_else(|| obj.get("name"))
                                .or_else(|| obj.get("line"))
                                .or_else(|| obj.get("string"))
                                .or_else(|| obj.get("description"))
                                .or_else(|| obj.get("desc"))
                                .or_else(|| obj.get("value"))
                                .or_else(|| obj.get("raw"))
                                .or_else(|| obj.get("mod"))
                                .or_else(|| obj.get("stat"))
                                .and_then(|v| v.as_str()) {
                                for line in s.lines() { let t = line.trim(); if !t.is_empty() { results.push(t.to_string()); } }
                            } else {
                                for (_obj_k, obj_v) in obj {
                                    if let Some(s) = obj_v.as_str() {
                                        if s.contains('+') || s.contains('%') || s.contains("increased") || s.contains("to ") || s.contains("Damage") || s.contains("Resistance") || s.contains("maximum") {
                                            for line in s.lines() { let t = line.trim(); if !t.is_empty() { results.push(t.to_string()); } }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if !results.is_empty() { return results; }
                }
            } else if let Some(s) = container.get(k).and_then(|v| v.as_str()) {
                let trimmed = s.trim();
                if !trimmed.is_empty() && !trimmed.starts_with('{') && !trimmed.starts_with('[') {
                    for line in trimmed.lines() {
                        let t = line.trim();
                        if !t.is_empty() { results.push(t.to_string()); }
                    }
                    if !results.is_empty() { return results; }
                }
            }
        }
    }
    results
}

pub fn extract_property_numeric_value(properties: Option<&Vec<Value>>, names: &[&str]) -> Option<f64> {
    let props = properties?;
    for p in props {
        let p_name = p["name"].as_str().unwrap_or_default();
        if names.iter().any(|&target| p_name.eq_ignore_ascii_case(target)) {
            if let Some(val_arr) = p["values"].as_array().and_then(|v| v.first()).and_then(|row| row.as_array()).and_then(|pair| pair.first()) {
                if let Some(s) = val_arr.as_str() {
                    let cleaned = s.replace('%', "").replace('+', "").trim().to_string();
                    if let Ok(v) = cleaned.parse::<f64>() { return Some(v); }
                } else if let Some(v) = val_arr.as_f64() {
                    return Some(v);
                } else if let Some(v) = val_arr.as_i64() {
                    return Some(v as f64);
                }
            }
        }
    }
    None
}
