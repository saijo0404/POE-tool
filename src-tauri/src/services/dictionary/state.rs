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
    pub item_dict_rev: HashMap<String, String>,
    pub stat_ac_matcher: StatAcMatcher,
    pub poe2_ac_matcher: StatAcMatcher,
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
            item_dict_rev: HashMap::new(),
            stat_ac_matcher: StatAcMatcher::default(),
            poe2_ac_matcher: StatAcMatcher::default(),
        };
        state.init();
        state
    }

    pub fn init(&mut self) {
        self.load_precomputed_stat_cache();
        self.load_precomputed_item_cache();
        self.load_poe2_data();
        self.load_custom_user_overrides();
        self.build_reverse_item_map();
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

    fn load_poe2_data(&mut self) {
        for (zh, en) in super::poe2_bases::get_poe2_item_map() {
            self.item_dict.insert(zh, en);
        }

        let poe2_stats = super::poe2_stats::get_poe2_stat_dict();
        let start_idx = self.stat_dict.len() as u32;
        self.poe2_ac_matcher = StatAcMatcher::build_from_stats_with_offset(&poe2_stats, start_idx);
        for entry in poe2_stats {
            let idx = self.stat_dict.len() as u32;
            self.index_single_entry(idx, &entry);
            self.stat_dict.push(entry);
        }
    }

    pub fn build_reverse_item_map(&mut self) {
        self.item_dict_rev.clear();
        for (k, v) in &self.item_dict {
            if k != v {
                self.item_dict_rev.insert(v.to_lowercase(), k.clone());
            }
        }
        for (zh, en) in super::base_types::get_common_item_map() {
            if zh != en {
                self.item_dict_rev.insert(en.to_lowercase(), zh);
            }
        }
        for (zh, en) in super::poe2_bases::get_poe2_canonical_pairs() {
            self.item_dict_rev.insert(en.to_lowercase(), zh);
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
}
