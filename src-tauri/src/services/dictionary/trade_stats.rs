use super::patterns::{normalize_pattern, strip_weapon_set_prefix, NUM_RE};
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

    let line_for_num = strip_weapon_set_prefix(clean_line);
    let mut numbers = Vec::new();
    for cap in NUM_RE.captures_iter(line_for_num) {
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
    let match1 = state
        .stat_ac_matcher
        .find_best_match(normalized, &state.stat_dict);
    let match2 = state
        .poe2_ac_matcher
        .find_best_match(normalized, &state.stat_dict);

    let stat_idx = match (match1, match2) {
        (Some(idx1), Some(idx2)) => {
            let prio1 = state
                .stat_dict
                .get(idx1)
                .map(|e| super::patterns::entry_priority(&e.id))
                .unwrap_or(0);
            let prio2 = state
                .stat_dict
                .get(idx2)
                .map(|e| super::patterns::entry_priority(&e.id))
                .unwrap_or(0);
            if prio2 > prio1 {
                idx2
            } else {
                idx1
            }
        }
        (Some(idx1), None) => idx1,
        (None, Some(idx2)) => idx2,
        (None, None) => return None,
    };

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
