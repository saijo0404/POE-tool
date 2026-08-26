pub mod base_types;
pub mod patterns;
pub mod state;
pub mod trade_stats;

#[cfg(test)]
pub mod tests;

use lazy_static::lazy_static;
use std::sync::RwLock;

pub use base_types::{get_common_item_map, lookup_english_base_type};
pub use patterns::normalize_pattern;
pub use state::{DictionaryState, StatDictionaryEntry, StatMatchResult};
pub use trade_stats::{
    get_default_stat_dict, lookup_stat_by_text, lookup_stat_for_armour, lookup_stat_for_weapon,
    lookup_stat_with_context,
};

lazy_static! {
    pub static ref DICTIONARY_STATE: RwLock<DictionaryState> = RwLock::new(DictionaryState::new());
}
