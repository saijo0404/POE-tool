use serde_json::Value;
use crate::services::parser::{ROLL_RANGE_RE, VALUE_EXTRACT_RE};
use super::mod_patterns::*;

pub fn select_candidate_stat_filters(
    slot: &str,
    trans_type: &str,
    explicit_mods: &[String],
    implicit_mods: &[String],
    crafted_mods: &[String],
    fractured_mods: &[String],
    enchant_mods: &[String]
) -> Vec<Value> {
    let is_armour = is_armour_slot_or_type(slot, trans_type);
    let is_weapon = is_weapon_slot_or_type(slot, trans_type);

    let mut candidates = Vec::new();
    collect_mod_candidates(&mut candidates, implicit_mods, ModSource::Implicit, is_armour, is_weapon);
    collect_mod_candidates(&mut candidates, fractured_mods, ModSource::Fractured, is_armour, is_weapon);
    collect_mod_candidates(&mut candidates, explicit_mods, ModSource::Explicit, is_armour, is_weapon);
    collect_mod_candidates(&mut candidates, crafted_mods, ModSource::Crafted, is_armour, is_weapon);
    collect_mod_candidates(&mut candidates, enchant_mods, ModSource::Enchant, is_armour, is_weapon);

    candidates.sort_by(|a, b| b.score.cmp(&a.score));

    let mut seen_ids = std::collections::HashSet::new();
    let max_filters = if slot.contains("Body") || slot.contains("Weapon") { 4 } else { 3 };
    let mut stat_filters = Vec::new();

    for c in candidates {
        if seen_ids.insert(c.id.clone()) {
            crate::app_log!("[BuildCalc] 🎯 精選詞綴篩選: {} -> ID: '{}', min: {:?}", c.log_text, c.id, c.min_val);
            let mut entry = serde_json::json!({ "id": c.id });
            if let Some(min_val) = c.min_val {
                let reasonable_min = if min_val > 0.0 { (min_val * 0.85).floor() } else { min_val };
                entry["value"] = serde_json::json!({ "min": reasonable_min });
            }
            stat_filters.push(entry);
            if stat_filters.len() >= max_filters { break; }
        }
    }
    stat_filters
}

fn is_armour_slot_or_type(slot: &str, trans_type: &str) -> bool {
    slot.contains("Body") || slot.contains("Helm") || slot.contains("Boots") || slot.contains("Gloves") || slot.contains("Offhand") || slot.contains("Shield")
        || trans_type.contains("Regalia") || trans_type.contains("Plate") || trans_type.contains("Robe") || trans_type.contains("Crown") || trans_type.contains("Boots") || trans_type.contains("Gloves") || trans_type.contains("Shield") || trans_type.contains("Buckler")
}

fn is_weapon_slot_or_type(slot: &str, trans_type: &str) -> bool {
    slot.contains("Weapon") || trans_type.contains("Wand") || trans_type.contains("Bow") || trans_type.contains("Sword") || trans_type.contains("Axe") || trans_type.contains("Mace") || trans_type.contains("Sceptre") || trans_type.contains("Staff") || trans_type.contains("Dagger") || trans_type.contains("Claw")
}

fn score_mod(text: &str, source: ModSource) -> i32 {
    let is_gem_lvl = GEM_LEVEL_RE.is_match(text);
    let is_low_utility = text.contains("Stun and Block Recovery")
        || text.contains("Light Radius")
        || text.contains("Life per Enemy")
        || text.contains("Mana per Enemy")
        || text.contains("Reflects");
    let is_core = LIFE_RE.is_match(text)
        || FLAT_ES_RE.is_match(text)
        || INC_ES_RE.is_match(text)
        || FIRE_RES_RE.is_match(text)
        || COLD_RES_RE.is_match(text)
        || LIGHTNING_RES_RE.is_match(text)
        || ALL_ELE_RES_RE.is_match(text)
        || TWO_ELE_RES_RE.is_match(text)
        || CHAOS_RES_RE.is_match(text)
        || SUPP_RE.is_match(text)
        || MS_RE.is_match(text)
        || CRIT_MULTI_RE.is_match(text)
        || DOT_MULTI_RE.is_match(text)
        || text.contains("increased Spell Damage")
        || text.contains("more Elemental Damage");

    if is_gem_lvl { 1200 }
    else if source == ModSource::Implicit || source == ModSource::Fractured { 1100 }
    else if is_core { 900 }
    else if source == ModSource::Crafted { 800 }
    else if is_low_utility { 300 }
    else { 600 }
}

fn collect_mod_candidates(
    candidates: &mut Vec<CandidateFilter>,
    mods: &[String],
    source: ModSource,
    is_armour: bool,
    is_weapon: bool
) {
    let strip_re = regex::Regex::new(r"(?i)\s*\{[^}]+\}\s*|\s*\((?:fractured|crafted|enchant|implicit|local|部分|已分裂|分裂|工藝|附魔|固定詞綴)\)\s*").unwrap();
    for raw in mods {
        for line in raw.lines() {
            let clean = line.trim();
            if clean.is_empty() { continue; }

            let mut range_min: Option<f64> = None;
            if let Some(cap) = ROLL_RANGE_RE.find(clean) {
                let inside = &cap.as_str()[1..cap.as_str().len() - 1];
                let nums: Vec<f64> = VALUE_EXTRACT_RE.find_iter(inside).filter_map(|m| m.as_str().parse::<f64>().ok()).collect();
                if !nums.is_empty() { range_min = Some(nums[0]); }
            }

            let cleaned = ROLL_RANGE_RE.replace_all(clean, "").to_string();
            let cleaned = strip_re.replace_all(&cleaned, " ").to_string();
            let cleaned = cleaned.trim();

            let stat_entry = if is_armour {
                crate::services::dictionary::lookup_stat_for_armour(cleaned)
            } else if is_weapon {
                crate::services::dictionary::lookup_stat_for_weapon(cleaned)
            } else {
                crate::services::dictionary::lookup_stat_by_text(cleaned)
            }.or_else(|| crate::services::dictionary::lookup_stat_by_text(cleaned));

            if let Some(entry) = stat_entry {
                if entry.id.starts_with("custom.") || (!entry.id.contains("stat_") && !entry.id.starts_with("pseudo.")) {
                    continue;
                }
                let formatted_id = format_stat_id_with_source(&entry.id, source);
                let actual_val = extract_mod_numeric_value(cleaned).or(entry.value);
                let effective_min = range_min.or(actual_val);
                let score = score_mod(cleaned, source);
                candidates.push(CandidateFilter {
                    id: formatted_id,
                    min_val: effective_min,
                    score,
                    log_text: format!("{:?} 詞綴: {} (ID: {})", source, cleaned, entry.id)
                });
            } else {
                crate::app_log!("[BuildCalc] ⚠️ 詞綴無字典對應: '{}' (原詞: '{}')", cleaned, raw);
            }
        }
    }
}
