use super::*;
use std::time::Instant;

#[test]
fn test_dictionary_init_performance() {
    let start = Instant::now();
    let state = DictionaryState::new();
    let duration = start.elapsed();

    println!("DictionaryState::new() elapsed time: {:?}", duration);
    // In debug mode (unoptimized in CI virtual machines), deserialization takes ~30-250ms (in release mode < 10ms).
    // Ensure it completes well under 1000ms in debug mode, and under 50ms in release mode.
    let max_allowed_ms = if cfg!(debug_assertions) { 1000 } else { 50 };
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

#[test]
fn test_poe2_stat_lookups() {
    // 1. Spirit (精魂)
    let res_zh = lookup_stat_by_text("+30 最大精魂").expect("Should match zh spirit");
    assert_eq!(res_zh.id, "explicit.stat_spirit");
    assert_eq!(res_zh.value, Some(30.0));

    let res_en = lookup_stat_by_text("+30 to maximum Spirit").expect("Should match en spirit");
    assert_eq!(res_en.id, "explicit.stat_spirit");

    // 2. Dodge roll (翻滾)
    let roll_zh = lookup_stat_by_text("增加 15% 翻滾冷卻回復率").expect("Should match zh roll");
    assert_eq!(roll_zh.id, "explicit.stat_dodge_roll_recovery_rate");

    let roll_en = lookup_stat_by_text("15% increased Dodge Roll Recovery Rate")
        .expect("Should match en roll");
    assert_eq!(roll_en.id, "explicit.stat_dodge_roll_recovery_rate");

    // 3. Sockets & Buildup & Weapon Sets
    let socket = lookup_stat_by_text("+2 個符文插槽").expect("Should match rune sockets");
    assert_eq!(socket.id, "explicit.stat_rune_sockets");

    let freeze = lookup_stat_by_text("+15% 冰凍積蓄").expect("Should match freeze buildup");
    assert_eq!(freeze.id, "explicit.stat_freeze_buildup");

    let weapon =
        lookup_stat_by_text("武器配置 1: 增加 25% 物理傷害").expect("Should match weapon set 1");
    assert_eq!(weapon.id, "explicit.stat_weapon_set_1_phys");
    assert_eq!(weapon.value, Some(25.0));

    let weapon2 =
        lookup_stat_by_text("武器配置 2: 增加 35% 物理傷害").expect("Should match weapon set 2");
    assert_eq!(weapon2.id, "explicit.stat_weapon_set_2_phys");
    assert_eq!(weapon2.value, Some(35.0));

    // Performance assertion: Lookup should be < 5ms (5000 µs)
    let start = Instant::now();
    for _ in 0..100 {
        let _ = lookup_stat_by_text("+30 最大精魂");
        let _ = lookup_stat_by_text("15% increased Dodge Roll Recovery Rate");
    }
    let elapsed = start.elapsed();
    let per_lookup_us = elapsed.as_micros() as f64 / 200.0;
    assert!(
        per_lookup_us < 5000.0,
        "PoE 2 lookup took too long: {:.2} µs (expected < 5000 µs)",
        per_lookup_us
    );
}

#[test]
fn test_poe2_fallback_substring_matching() {
    let noisy = "前綴 額外獲得了 +40 最大精魂 魔法屬性";
    let matched = lookup_stat_by_text(noisy).expect("Should substring match spirit");
    assert_eq!(matched.id, "explicit.stat_spirit");
    assert_eq!(matched.value, Some(40.0));

    let noisy_roll = "Crafted 20% increased Dodge Roll Recovery Rate On Boots";
    let matched_roll = lookup_stat_by_text(noisy_roll).expect("Should substring match roll");
    assert_eq!(matched_roll.id, "explicit.stat_dodge_roll_recovery_rate");
}

#[test]
fn test_poe2_bidirectional_base_type_lookups() {
    // Waystone Tiers 1-16
    assert_eq!(
        lookup_english_base_type("尋路石 (階級 1)"),
        Some("Waystone (Tier 1)".to_string())
    );
    assert_eq!(
        lookup_chinese_base_type("Waystone (Tier 1)"),
        Some("尋路石 (階級 1)".to_string())
    );
    assert_eq!(
        lookup_english_base_type("尋路石 T16"),
        Some("Waystone (Tier 16)".to_string())
    );
    assert_eq!(
        lookup_chinese_base_type("Waystone (Tier 16)"),
        Some("尋路石 (階級 16)".to_string())
    );

    // Uncut Gems T1-T20
    assert_eq!(
        lookup_english_base_type("未切割寶石 (階級 1)"),
        Some("Uncut Gem (Tier 1)".to_string())
    );
    assert_eq!(
        lookup_chinese_base_type("Uncut Gem (Tier 1)"),
        Some("未切割寶石 (階級 1)".to_string())
    );
    assert_eq!(
        lookup_english_base_type("未切割寶石 T20"),
        Some("Uncut Gem (Tier 20)".to_string())
    );
    assert_eq!(
        lookup_chinese_base_type("Uncut Gem (Tier 20)"),
        Some("未切割寶石 (階級 20)".to_string())
    );

    // Runes & Currency
    assert_eq!(
        lookup_english_base_type("太陽符文"),
        Some("Sun Rune".to_string())
    );
    assert_eq!(
        lookup_chinese_base_type("Sun Rune"),
        Some("太陽符文".to_string())
    );
    assert_eq!(lookup_english_base_type("金幣"), Some("Gold".to_string()));
    assert_eq!(lookup_chinese_base_type("Gold"), Some("金幣".to_string()));
    assert_eq!(
        lookup_chinese_base_type("Divine Orb"),
        Some("神聖石".to_string())
    );
}
