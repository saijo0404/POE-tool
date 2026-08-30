use super::*;

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
