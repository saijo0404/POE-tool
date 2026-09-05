use super::patterns::{normalize_pattern, NUM_RE};
use super::state::{DictionaryState, StatDictionaryEntry, StatMatchResult};
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

    fallback_substring_search(&state, &normalized, primary_val)
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
    state: &DictionaryState,
    normalized: &str,
    primary_val: Option<f64>,
) -> Option<StatMatchResult> {
    let stat_idx = state
        .stat_ac_matcher
        .find_best_match(normalized, &state.stat_dict)?;
    let entry = state.stat_dict.get(stat_idx)?;
    Some(build_match_result(entry, primary_val))
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
