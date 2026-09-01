use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs::File;
use std::io::Write;
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct StatDictionaryEntry {
    pub id: String,
    pub zh_text: String,
    pub en_text: String,
}

#[derive(Serialize, Deserialize)]
struct PrecomputedStatCache {
    pub stat_dict: Vec<StatDictionaryEntry>,
    pub stat_pattern_map: HashMap<String, u32>,
    pub stat_armour_local_map: HashMap<String, u32>,
    pub stat_weapon_local_map: HashMap<String, u32>,
    pub stat_local_map: HashMap<String, u32>,
    pub ac_patterns: Vec<String>,
    pub ac_pattern_to_stat: Vec<u32>,
}

fn main() {
    tauri_build::build();

    println!("cargo:rerun-if-changed=../data/stat_dictionary.json");
    println!("cargo:rerun-if-changed=../data/item_dictionary.json");

    let out_dir = std::env::var("OUT_DIR").expect("OUT_DIR not set");
    let out_path = Path::new(&out_dir);

    build_stat_cache(out_path);
    build_item_cache(out_path);
}

fn build_stat_cache(out_path: &Path) {
    let stat_json_path = Path::new("../data/stat_dictionary.json");
    if !stat_json_path.exists() {
        return;
    }

    let file = File::open(stat_json_path).expect("Failed to open stat_dictionary.json");
    let stats: Vec<StatDictionaryEntry> =
        serde_json::from_reader(file).expect("Failed to parse stat_dictionary.json");

    let tag_prefix_re = regex::Regex::new(r"(?i)^\{[^}]+\}\s*|^\([^)]+\)\s*").unwrap();
    let pattern_norm_re = regex::Regex::new(r"[+-]?\d+(?:\.\d+)?|[+-]?#").unwrap();

    let normalize = |text: &str| -> String {
        let clean = tag_prefix_re.replace_all(text, "");
        let s = pattern_norm_re.replace_all(&clean, "#");
        s.split_whitespace()
            .collect::<Vec<_>>()
            .join(" ")
            .to_lowercase()
    };

    let entry_prio = |id: &str| -> i32 {
        if id.starts_with("explicit.") {
            100
        } else if id.starts_with("pseudo.") {
            80
        } else if id.starts_with("implicit.") {
            60
        } else if id.starts_with("fractured.") {
            40
        } else {
            20
        }
    };

    let mut stat_pattern_map: HashMap<String, u32> = HashMap::new();
    let mut stat_armour_local_map: HashMap<String, u32> = HashMap::new();
    let mut stat_weapon_local_map: HashMap<String, u32> = HashMap::new();
    let mut stat_local_map: HashMap<String, u32> = HashMap::new();
    let mut ac_pattern_map: HashMap<String, (u32, i32)> = HashMap::new();

    let mut insert_ac_pattern = |pattern: String, stat_idx: u32, prio: i32| {
        let trimmed = pattern.trim().to_string();
        if is_valid_stat_pattern(&trimmed) {
            match ac_pattern_map.get(&trimmed) {
                Some(&(_, old_prio)) if prio <= old_prio => {}
                _ => {
                    ac_pattern_map.insert(trimmed, (stat_idx, prio));
                }
            }
        }
    };

    for (idx, entry) in stats.iter().enumerate() {
        let idx = idx as u32;
        let is_local = entry.en_text.contains("(Local)")
            || entry.en_text.contains("(local)")
            || entry.zh_text.contains("(部分)")
            || entry.zh_text.contains("(局部)");
        let is_armour = check_stat_is_armour(entry);
        let is_weapon = check_stat_is_weapon(entry);

        let clean_zh = strip_local_tags(&entry.zh_text);
        let clean_en = strip_local_tags(&entry.en_text);
        let prio = entry_prio(&entry.id);

        let should_replace = |map: &HashMap<String, u32>, key: &str| -> bool {
            map.get(key)
                .map(|&old_idx| prio > entry_prio(&stats[old_idx as usize].id))
                .unwrap_or(true)
        };

        if is_local {
            if !clean_zh.is_empty() {
                let zh_p = normalize(&clean_zh);
                if is_armour && should_replace(&stat_armour_local_map, &zh_p) {
                    stat_armour_local_map.insert(zh_p.clone(), idx);
                }
                if is_weapon && should_replace(&stat_weapon_local_map, &zh_p) {
                    stat_weapon_local_map.insert(zh_p.clone(), idx);
                }
                if should_replace(&stat_local_map, &zh_p) {
                    stat_local_map.insert(zh_p.clone(), idx);
                }
                insert_ac_pattern(zh_p.replace('#', ""), idx, prio);
            }
            if !clean_en.is_empty() {
                let en_p = normalize(&clean_en);
                if is_armour && should_replace(&stat_armour_local_map, &en_p) {
                    stat_armour_local_map.insert(en_p.clone(), idx);
                }
                if is_weapon && should_replace(&stat_weapon_local_map, &en_p) {
                    stat_weapon_local_map.insert(en_p.clone(), idx);
                }
                if should_replace(&stat_local_map, &en_p) {
                    stat_local_map.insert(en_p.clone(), idx);
                }
                insert_ac_pattern(en_p.replace('#', ""), idx, prio);
            }
        } else {
            if !entry.zh_text.is_empty() {
                let zh_p = normalize(&entry.zh_text);
                if should_replace(&stat_pattern_map, &zh_p) {
                    stat_pattern_map.insert(zh_p.clone(), idx);
                }
                insert_ac_pattern(zh_p.replace('#', ""), idx, prio);
            }
            if !entry.en_text.is_empty() {
                let en_p = normalize(&entry.en_text);
                if should_replace(&stat_pattern_map, &en_p) {
                    stat_pattern_map.insert(en_p.clone(), idx);
                }
                insert_ac_pattern(en_p.replace('#', ""), idx, prio);
            }
        }
    }

    let mut ac_patterns = Vec::with_capacity(ac_pattern_map.len());
    let mut ac_pattern_to_stat = Vec::with_capacity(ac_pattern_map.len());
    for (pat, (stat_idx, _)) in ac_pattern_map {
        ac_patterns.push(pat);
        ac_pattern_to_stat.push(stat_idx);
    }

    let cache = PrecomputedStatCache {
        stat_dict: stats,
        stat_pattern_map,
        stat_armour_local_map,
        stat_weapon_local_map,
        stat_local_map,
        ac_patterns,
        ac_pattern_to_stat,
    };

    let encoded = bincode::serialize(&cache).expect("Failed to serialize stat cache");
    let mut out_file = File::create(out_path.join("stat_cache.bincode"))
        .expect("Failed to create stat_cache.bincode");
    out_file
        .write_all(&encoded)
        .expect("Failed to write stat_cache.bincode");
}

fn strip_local_tags(text: &str) -> String {
    text.replace("(部分)", "")
        .replace("(局部)", "")
        .replace("(Local)", "")
        .replace("(local)", "")
}

fn check_stat_is_armour(entry: &StatDictionaryEntry) -> bool {
    entry.en_text.contains("Energy Shield")
        || entry.en_text.contains("Armour")
        || entry.en_text.contains("Evasion")
        || entry.zh_text.contains("能量護盾")
        || entry.zh_text.contains("護甲")
        || entry.zh_text.contains("閃避")
}

fn check_stat_is_weapon(entry: &StatDictionaryEntry) -> bool {
    entry.en_text.contains("Physical Damage")
        || entry.en_text.contains("Attack Speed")
        || entry.en_text.contains("Critical Strike Chance")
        || entry.en_text.contains("Accuracy")
        || entry.zh_text.contains("物理傷害")
        || entry.zh_text.contains("攻擊速度")
        || entry.zh_text.contains("暴擊率")
        || entry.zh_text.contains("命中")
}

fn build_item_cache(out_path: &Path) {
    let item_json_path = Path::new("../data/item_dictionary.json");
    if !item_json_path.exists() {
        return;
    }

    let file = File::open(item_json_path).expect("Failed to open item_dictionary.json");
    let items: HashMap<String, String> =
        serde_json::from_reader(file).expect("Failed to parse item_dictionary.json");

    let encoded = bincode::serialize(&items).expect("Failed to serialize item cache");
    let mut out_file = File::create(out_path.join("item_cache.bincode"))
        .expect("Failed to create item_cache.bincode");
    out_file
        .write_all(&encoded)
        .expect("Failed to write item_cache.bincode");
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
