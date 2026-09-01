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
