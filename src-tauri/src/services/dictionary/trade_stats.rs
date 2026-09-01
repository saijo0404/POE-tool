use super::patterns::{normalize_pattern, NUM_RE};
use super::state::{StatDictionaryEntry, StatMatchResult};
use super::DICTIONARY_STATE;

pub fn lookup_stat_with_context(
    clean_line: &str,
    is_armour: bool,
    is_weapon: bool,
) -> Option<StatMatchResult> {
    if clean_line.is_empty() {
        return None;
    }

    let mut numbers = Vec::new();
    for cap in NUM_RE.captures_iter(clean_line) {
        if let Some(m) = cap.get(0) {
            if let Ok(num) = m.as_str().parse::<f64>() {
                numbers.push(num);
            }
        }
    }
    let primary_val = numbers.first().copied();
    let normalized = normalize_pattern(clean_line);
    let state = DICTIONARY_STATE.read().ok()?;

    if is_armour {
        if let Some(&idx) = state.stat_armour_local_map.get(&normalized) {
            if let Some(entry) = state.stat_dict.get(idx as usize) {
                return Some(build_match_result(entry, primary_val));
            }
        }
    }
    if is_weapon {
        if let Some(&idx) = state.stat_weapon_local_map.get(&normalized) {
            if let Some(entry) = state.stat_dict.get(idx as usize) {
                return Some(build_match_result(entry, primary_val));
            }
        }
    }
    if let Some(&idx) = state.stat_pattern_map.get(&normalized) {
        if let Some(entry) = state.stat_dict.get(idx as usize) {
            return Some(build_match_result(entry, primary_val));
        }
    }
    if let Some(&idx) = state.stat_local_map.get(&normalized) {
        if let Some(entry) = state.stat_dict.get(idx as usize) {
            return Some(build_match_result(entry, primary_val));
        }
    }

    fallback_substring_search(&state.stat_dict, &normalized, primary_val)
}

fn build_match_result(entry: &StatDictionaryEntry, primary_val: Option<f64>) -> StatMatchResult {
    StatMatchResult {
        id: entry.id.clone(),
        en_text: if !entry.en_text.is_empty() {
            entry.en_text.clone()
        } else {
            entry.zh_text.clone()
        },
        value: primary_val,
        min_value: primary_val.map(|v| if v > 0.0 { (v * 0.85).floor() } else { v }),
        max_value: primary_val.map(|v| if v > 0.0 { (v * 1.15).ceil() } else { v }),
    }
}

fn fallback_substring_search(
    stats: &[StatDictionaryEntry],
    normalized: &str,
    primary_val: Option<f64>,
) -> Option<StatMatchResult> {
    for entry in stats {
        let zh_clean = normalize_pattern(&entry.zh_text).replace('#', "");
        let en_clean = normalize_pattern(&entry.en_text).replace('#', "");
        let zh_trim = zh_clean.trim();
        let en_trim = en_clean.trim();

        if (!zh_trim.is_empty() && normalized.contains(zh_trim))
            || (!en_trim.is_empty() && normalized.contains(en_trim))
        {
            return Some(build_match_result(entry, primary_val));
        }
    }
    None
}

pub fn lookup_stat_by_text(clean_line: &str) -> Option<StatMatchResult> {
    lookup_stat_with_context(clean_line, false, false)
}

pub fn lookup_stat_for_armour(clean_line: &str) -> Option<StatMatchResult> {
    lookup_stat_with_context(clean_line, true, false)
}

pub fn lookup_stat_for_weapon(clean_line: &str) -> Option<StatMatchResult> {
    lookup_stat_with_context(clean_line, false, true)
}

pub fn get_default_stat_dict() -> Vec<StatDictionaryEntry> {
    vec![
        StatDictionaryEntry {
            id: "explicit.stat_3299347043".to_string(),
            zh_text: "+# 最大生命".to_string(),
            en_text: "+# to maximum Life".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_1050105434".to_string(),
            zh_text: "+# 最大魔力".to_string(),
            en_text: "+# to maximum Mana".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_4052037485".to_string(),
            zh_text: "+# 最大能量護盾".to_string(),
            en_text: "+# to maximum Energy Shield".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_3593843976".to_string(),
            zh_text: "增加 #% 能量護盾".to_string(),
            en_text: "#% increased Energy Shield".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_3372524247".to_string(),
            zh_text: "+#% 火焰抗性".to_string(),
            en_text: "+#% to Fire Resistance".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_4220027924".to_string(),
            zh_text: "+#% 冰冷抗性".to_string(),
            en_text: "+#% to Cold Resistance".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_1671376347".to_string(),
            zh_text: "+#% 閃電抗性".to_string(),
            en_text: "+#% to Lightning Resistance".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_2923486250".to_string(),
            zh_text: "+#% 混沌抗性".to_string(),
            en_text: "+#% to Chaos Resistance".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_2901986750".to_string(),
            zh_text: "+#% 全部元素抗性".to_string(),
            en_text: "+#% to all Elemental Resistances".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_4082204447".to_string(),
            zh_text: "+# 力量".to_string(),
            en_text: "+# to Strength".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_3261801946".to_string(),
            zh_text: "+# 敏捷".to_string(),
            en_text: "+# to Dexterity".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_4167198415".to_string(),
            zh_text: "+# 智慧".to_string(),
            en_text: "+# to Intelligence".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_1379411836".to_string(),
            zh_text: "+# 全能力".to_string(),
            en_text: "+# to all Attributes".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_2250533757".to_string(),
            zh_text: "增加 #% 移動速度".to_string(),
            en_text: "#% increased Movement Speed".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_681332047".to_string(),
            zh_text: "增加 #% 攻擊速度".to_string(),
            en_text: "#% increased Attack Speed".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_2891184298".to_string(),
            zh_text: "增加 #% 施法速度".to_string(),
            en_text: "#% increased Cast Speed".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_55876295".to_string(),
            zh_text: "增加 #% 暴擊率".to_string(),
            en_text: "#% increased Critical Strike Chance".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_3556824919".to_string(),
            zh_text: "+#% 暴擊加成".to_string(),
            en_text: "+#% to Critical Strike Multiplier".to_string(),
        },
    ]
}
