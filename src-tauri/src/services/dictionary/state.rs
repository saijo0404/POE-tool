use super::patterns::{
    check_stat_is_armour, check_stat_is_weapon, entry_priority, normalize_pattern, strip_local_tags,
};
use super::stat_matcher::StatAcMatcher;
use crate::services::storage::{get_data_dir, read_json_safe};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StatDictionaryEntry {
    pub id: String,
    pub zh_text: String,
    pub en_text: String,
}

#[derive(Debug, Clone)]
pub struct StatMatchResult {
    pub id: String,
    pub en_text: String,
    pub value: Option<f64>,
    pub min_value: Option<f64>,
    pub max_value: Option<f64>,
}

#[derive(Serialize, Deserialize)]
pub struct PrecomputedStatCache {
    pub stat_dict: Vec<StatDictionaryEntry>,
    pub stat_pattern_map: HashMap<String, u32>,
    pub stat_armour_local_map: HashMap<String, u32>,
    pub stat_weapon_local_map: HashMap<String, u32>,
    pub stat_local_map: HashMap<String, u32>,
    pub ac_patterns: Vec<String>,
    pub ac_pattern_to_stat: Vec<u32>,
}

static PRECOMPUTED_STAT_BIN: &[u8] =
    include_bytes!(concat!(env!("OUT_DIR"), "/stat_cache.bincode"));
static PRECOMPUTED_ITEM_BIN: &[u8] =
    include_bytes!(concat!(env!("OUT_DIR"), "/item_cache.bincode"));

pub struct DictionaryState {
    pub stat_dict: Vec<StatDictionaryEntry>,
    pub stat_pattern_map: HashMap<String, u32>,
    pub stat_armour_local_map: HashMap<String, u32>,
    pub stat_weapon_local_map: HashMap<String, u32>,
    pub stat_local_map: HashMap<String, u32>,
    pub item_dict: HashMap<String, String>,
    pub stat_ac_matcher: StatAcMatcher,
}

impl Default for DictionaryState {
    fn default() -> Self {
        Self::new()
    }
}

impl DictionaryState {
    pub fn new() -> Self {
        let mut state = Self {
            stat_dict: Vec::new(),
            stat_pattern_map: HashMap::new(),
            stat_armour_local_map: HashMap::new(),
            stat_weapon_local_map: HashMap::new(),
            stat_local_map: HashMap::new(),
            item_dict: HashMap::new(),
            stat_ac_matcher: StatAcMatcher::default(),
        };
        state.init();
        state
    }

    pub fn init(&mut self) {
        self.load_precomputed_stat_cache();
        self.load_precomputed_item_cache();
        self.load_custom_user_overrides();
    }

    fn load_precomputed_stat_cache(&mut self) {
        if let Ok(cache) = bincode::deserialize::<PrecomputedStatCache>(PRECOMPUTED_STAT_BIN) {
            self.stat_dict = cache.stat_dict;
            self.stat_pattern_map = cache.stat_pattern_map;
            self.stat_armour_local_map = cache.stat_armour_local_map;
            self.stat_weapon_local_map = cache.stat_weapon_local_map;
            self.stat_local_map = cache.stat_local_map;
            self.stat_ac_matcher =
                StatAcMatcher::from_precomputed(cache.ac_patterns, cache.ac_pattern_to_stat);
        }
    }

    fn load_precomputed_item_cache(&mut self) {
        if let Ok(items) = bincode::deserialize::<HashMap<String, String>>(PRECOMPUTED_ITEM_BIN) {
            self.item_dict = items;
        }
        for (k, v) in super::base_types::get_common_item_map() {
            self.item_dict.insert(k, v);
        }
    }

    fn load_custom_user_overrides(&mut self) {
        let data_dir = get_data_dir();
        let custom_stat_path = data_dir.join("custom_stat_dictionary.json");
        let custom_item_path = data_dir.join("custom_item_dictionary.json");

        if custom_stat_path.exists() {
            let loaded_stats: Vec<StatDictionaryEntry> =
                read_json_safe(&custom_stat_path, Vec::new());
            if !loaded_stats.is_empty() {
                self.stat_dict.extend(loaded_stats);
                self.rebuild_stat_indexes();
            }
        }

        if custom_item_path.exists() {
            let loaded_items: HashMap<String, String> =
                read_json_safe(&custom_item_path, HashMap::new());
            for (k, v) in loaded_items {
                self.item_dict.insert(k, v);
            }
        }
    }

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
