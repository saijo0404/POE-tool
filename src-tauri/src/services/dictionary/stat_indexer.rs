use super::patterns::{
    check_stat_is_armour, check_stat_is_weapon, entry_priority, normalize_pattern, strip_local_tags,
};
use super::stat_matcher::StatAcMatcher;
use super::state::{DictionaryState, StatDictionaryEntry};
use std::collections::HashMap;

impl DictionaryState {
    pub fn rebuild_stat_indexes(&mut self) {
        self.stat_pattern_map.clear();
        self.stat_armour_local_map.clear();
        self.stat_weapon_local_map.clear();
        self.stat_local_map.clear();

        let entries = self.stat_dict.clone();
        for (idx, entry) in entries.iter().enumerate() {
            let idx = idx as u32;
            let is_local = entry.en_text.contains("(Local)")
                || entry.en_text.contains("(local)")
                || entry.zh_text.contains("(部分)")
                || entry.zh_text.contains("(局部)");
            let is_armour = check_stat_is_armour(&entry.en_text, &entry.zh_text);
            let is_weapon = check_stat_is_weapon(&entry.en_text, &entry.zh_text);
            let clean_zh = strip_local_tags(&entry.zh_text);
            let clean_en = strip_local_tags(&entry.en_text);

            if is_local {
                self.index_local_entry(idx, entry, &clean_zh, &clean_en, is_armour, is_weapon);
            } else {
                self.index_global_entry(idx, entry);
            }
        }
        self.stat_ac_matcher = StatAcMatcher::build_from_stats(&self.stat_dict);
    }

    fn index_local_entry(
        &mut self,
        idx: u32,
        entry: &StatDictionaryEntry,
        clean_zh: &str,
        clean_en: &str,
        is_armour: bool,
        is_weapon: bool,
    ) {
        let prio = entry_priority(&entry.id);
        if !clean_zh.is_empty() {
            let zh_p = normalize_pattern(clean_zh);
            self.insert_local_pattern(&zh_p, idx, prio, is_armour, is_weapon);
        }
        if !clean_en.is_empty() {
            let en_p = normalize_pattern(clean_en);
            self.insert_local_pattern(&en_p, idx, prio, is_armour, is_weapon);
        }
    }

    fn insert_local_pattern(
        &mut self,
        pattern: &str,
        idx: u32,
        prio: i32,
        is_armour: bool,
        is_weapon: bool,
    ) {
        if is_armour
            && is_higher_priority(&self.stat_armour_local_map, &self.stat_dict, pattern, prio)
        {
            self.stat_armour_local_map.insert(pattern.to_string(), idx);
        }
        if is_weapon
            && is_higher_priority(&self.stat_weapon_local_map, &self.stat_dict, pattern, prio)
        {
            self.stat_weapon_local_map.insert(pattern.to_string(), idx);
        }
        if is_higher_priority(&self.stat_local_map, &self.stat_dict, pattern, prio) {
            self.stat_local_map.insert(pattern.to_string(), idx);
        }
    }

    fn index_global_entry(&mut self, idx: u32, entry: &StatDictionaryEntry) {
        let prio = entry_priority(&entry.id);
        if !entry.zh_text.is_empty() {
            let zh_p = normalize_pattern(&entry.zh_text);
            if is_higher_priority(&self.stat_pattern_map, &self.stat_dict, &zh_p, prio) {
                self.stat_pattern_map.insert(zh_p, idx);
            }
        }
        if !entry.en_text.is_empty() {
            let en_p = normalize_pattern(&entry.en_text);
            if is_higher_priority(&self.stat_pattern_map, &self.stat_dict, &en_p, prio) {
                self.stat_pattern_map.insert(en_p, idx);
            }
        }
    }
}

fn is_higher_priority(
    map: &HashMap<String, u32>,
    stat_dict: &[StatDictionaryEntry],
    key: &str,
    prio: i32,
) -> bool {
    map.get(key)
        .map(|&old_idx| prio > entry_priority(&stat_dict[old_idx as usize].id))
        .unwrap_or(true)
}
