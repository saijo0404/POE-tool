use super::patterns::{entry_priority, normalize_pattern};
use super::state::StatDictionaryEntry;
use aho_corasick::{AhoCorasick, AhoCorasickKind};
use std::collections::HashMap;
use std::sync::OnceLock;

/// Aho-Corasick based multi-pattern matcher for fast fallback substring searches.
#[derive(Default)]
pub struct StatAcMatcher {
    patterns: Vec<String>,
    pattern_to_stat: Vec<u32>,
    ac: OnceLock<Option<AhoCorasick>>,
}

impl StatAcMatcher {
    /// Builds matcher from precomputed patterns and their stat index mapping.
    pub fn from_precomputed(patterns: Vec<String>, pattern_to_stat: Vec<u32>) -> Self {
        Self {
            patterns,
            pattern_to_stat,
            ac: OnceLock::new(),
        }
    }

    /// Builds an Aho-Corasick automaton dynamically from a list of stat dictionary entries.
    pub fn build_from_stats(stats: &[StatDictionaryEntry]) -> Self {
        Self::build_from_stats_with_offset(stats, 0)
    }

    /// Builds an Aho-Corasick automaton with a stat index offset.
    pub fn build_from_stats_with_offset(stats: &[StatDictionaryEntry], offset: u32) -> Self {
        let mut pattern_map: HashMap<String, (u32, i32)> = HashMap::new();

        for (idx, entry) in stats.iter().enumerate() {
            let stat_idx = offset + idx as u32;
            let prio = entry_priority(&entry.id);
            Self::insert_entry_patterns(&mut pattern_map, entry, stat_idx, prio);
        }

        let mut patterns = Vec::with_capacity(pattern_map.len());
        let mut pattern_to_stat = Vec::with_capacity(pattern_map.len());

        for (pattern, (stat_idx, _)) in pattern_map {
            patterns.push(pattern);
            pattern_to_stat.push(stat_idx);
        }

        Self::from_precomputed(patterns, pattern_to_stat)
    }

    fn get_ac(&self) -> Option<&AhoCorasick> {
        self.ac
            .get_or_init(|| {
                AhoCorasick::builder()
                    .kind(Some(AhoCorasickKind::NoncontiguousNFA))
                    .build(&self.patterns)
                    .ok()
            })
            .as_ref()
    }

    fn insert_entry_patterns(
        map: &mut HashMap<String, (u32, i32)>,
        entry: &StatDictionaryEntry,
        stat_idx: u32,
        prio: i32,
    ) {
        let zh_clean = normalize_pattern(&entry.zh_text).replace('#', "");
        Self::try_insert_pattern(map, &zh_clean, stat_idx, prio);

        let en_clean = normalize_pattern(&entry.en_text).replace('#', "");
        Self::try_insert_pattern(map, &en_clean, stat_idx, prio);
    }

    fn try_insert_pattern(
        map: &mut HashMap<String, (u32, i32)>,
        raw_pattern: &str,
        stat_idx: u32,
        prio: i32,
    ) {
        let trimmed = raw_pattern.trim();
        if is_valid_stat_pattern(trimmed) {
            match map.get(trimmed) {
                Some(&(_, old_prio)) if prio <= old_prio => {}
                _ => {
                    map.insert(trimmed.to_string(), (stat_idx, prio));
                }
            }
        }
    }

    /// Finds the best matching stat index for the normalized text in O(M) time.
    /// Prefers longer pattern matches, followed by higher priority, then lower stat_idx.
    pub fn find_best_match(
        &self,
        normalized: &str,
        stats: &[StatDictionaryEntry],
    ) -> Option<usize> {
        let ac = self.get_ac()?;
        if normalized.is_empty() {
            return None;
        }

        let mut best_match: Option<(usize, usize, i32)> = None;

        for m in ac.find_overlapping_iter(normalized) {
            let p_idx = m.pattern().as_usize();
            if let Some(&stat_idx) = self.pattern_to_stat.get(p_idx) {
                let stat_idx = stat_idx as usize;
                let match_len = m.end() - m.start();
                let prio = stats
                    .get(stat_idx)
                    .map(|e| entry_priority(&e.id))
                    .unwrap_or(0);

                match best_match {
                    None => {
                        best_match = Some((stat_idx, match_len, prio));
                    }
                    Some((cur_idx, cur_len, cur_prio)) => {
                        if match_len > cur_len
                            || (match_len == cur_len && prio > cur_prio)
                            || (match_len == cur_len && prio == cur_prio && stat_idx < cur_idx)
                        {
                            best_match = Some((stat_idx, match_len, prio));
                        }
                    }
                }
            }
        }

        best_match.map(|(idx, _, _)| idx)
    }
}

fn is_valid_stat_pattern(s: &str) -> bool {
    let trimmed = s.trim();
    if trimmed.is_empty() {
        return false;
    }

    let cjk_count = trimmed
        .chars()
        .filter(|c| ('\u{4e00}'..='\u{9fff}').contains(c))
        .count();
    if cjk_count >= 2 {
        return true;
    }

    let alpha_count = trimmed.chars().filter(|c| c.is_ascii_alphabetic()).count();
    if alpha_count >= 3 {
        let lower = trimmed.to_lowercase();
        let stop_words = [
            "the", "and", "for", "with", "from", "that", "this", "into", "item", "when", "have",
            "been", "were", "they",
        ];
        if !stop_words.contains(&lower.as_str()) {
            return true;
        }
    }

    false
}
