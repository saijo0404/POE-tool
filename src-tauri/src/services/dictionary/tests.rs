use super::*;
use std::time::Instant;

#[test]
fn test_dictionary_init_performance() {
    let start = Instant::now();
    let state = DictionaryState::new();
    let duration = start.elapsed();

    println!("DictionaryState::new() elapsed time: {:?}", duration);
    // In debug mode (unoptimized in CI), deserialization takes ~20-50ms (in release mode < 10ms).
    // Ensure it completes well under the old runtime JSON parse time (~250ms+).
    let max_allowed_ms = if cfg!(debug_assertions) { 150 } else { 20 };
    assert!(
        duration.as_millis() < max_allowed_ms,
        "Dictionary initialization took too long: {:?} (max allowed: {}ms)",
        duration,
        max_allowed_ms
    );
    assert!(
        state.stat_dict.len() > 17000,
        "Expected >17000 stats loaded, got {}",
        state.stat_dict.len()
    );
    assert!(
        !state.stat_pattern_map.is_empty(),
        "Pattern map should not be empty"
    );
}

#[test]
fn test_local_vs_global_es_lookup() {
    let armour_res =
        lookup_stat_for_armour("+85 to maximum Energy Shield").expect("Should match armour ES");
    assert_eq!(armour_res.id, "explicit.stat_4052037485");

    let global_res =
        lookup_stat_by_text("+85 to maximum Energy Shield").expect("Should match global ES");
    assert_eq!(global_res.id, "explicit.stat_3489782002");

    let zh_armour_res =
        lookup_stat_for_armour("+85 最大能量護盾").expect("Should match armour ES zh");
    assert_eq!(zh_armour_res.id, "explicit.stat_4052037485");

    let zh_global_res = lookup_stat_by_text("+85 最大能量護盾").expect("Should match global ES zh");
    assert_eq!(zh_global_res.id, "explicit.stat_3489782002");
}

#[test]
fn test_base_type_lookups() {
    assert_eq!(
        lookup_english_base_type("精髓甲蟲"),
        Some("Essence Scarab".to_string())
    );
    assert_eq!(
        lookup_english_base_type("幽閉墓穴"),
        Some("Dunes Map".to_string())
    );
    assert_eq!(
        lookup_english_base_type("瓦爾寶珠"),
        Some("Vaal Orb".to_string())
    );
    assert_eq!(
        lookup_english_base_type("占卜瞻妄玉"),
        Some("Diviner's Delirium Orb".to_string())
    );
    assert_eq!(lookup_english_base_type("地圖"), Some("Map".to_string()));
    assert_eq!(
        lookup_english_base_type("路標石"),
        Some("Waystone".to_string())
    );
}

#[test]
fn test_fallback_substring_matching() {
    // Exact pattern: "+# 最大生命" / "+# to maximum Life"
    // Unmatched noisy text that requires fallback substring search
    let noisy_zh = "前綴 增加了 50 最大生命 於裝備上";
    let matched = lookup_stat_by_text(noisy_zh);
    assert!(
        matched.is_some(),
        "Fallback substring search should match noisy zh stat"
    );
    let res = matched.unwrap();
    assert_eq!(res.id, "explicit.stat_3299347043");

    let noisy_en = "Prefix Grants 50 to maximum Life On item";
    let matched_en = lookup_stat_by_text(noisy_en);
    assert!(
        matched_en.is_some(),
        "Fallback substring search should match noisy en stat"
    );
    let res_en = matched_en.unwrap();
    assert_eq!(res_en.id, "explicit.stat_3299347043");

    let non_matching = "完全不存在的無效描述文字句子 XYZ123456";
    assert!(lookup_stat_by_text(non_matching).is_none());
}

#[test]
fn test_unmatched_stat_lookup_performance() {
    let unpatterned_queries = [
        "這是一條完全不存在於字典的無效文字",
        "This is an unknown affix line with no matching stats 12345",
        "無效詞綴 造成 100% 額外混沌傷害 隨機附魔",
        "Another random flavour text without any pattern match",
    ];

    // Warm up the matcher OnceLock before measuring steady-state per-query search latency
    let _ = lookup_stat_by_text("warmup query string");

    let start = Instant::now();
    for _ in 0..100 {
        for query in &unpatterned_queries {
            let _ = lookup_stat_by_text(query);
        }
    }
    let elapsed = start.elapsed();
    let total_queries = 100 * unpatterned_queries.len();
    let avg_us = elapsed.as_micros() as f64 / total_queries as f64;

    println!(
        "Completed {} fallback lookups in {:?}, avg {:.2} µs/query",
        total_queries, elapsed, avg_us
    );

    // In unoptimized debug mode on CI runners, ensure average lookup is well under 1ms (1000 µs), release mode is < 100 µs
    let max_allowed_us = if cfg!(debug_assertions) {
        1000.0
    } else {
        100.0
    };
    assert!(
        avg_us < max_allowed_us,
        "Fallback search took too long: {:.2} µs/query (expected < {} µs)",
        avg_us,
        max_allowed_us
    );
}
