use super::DICTIONARY_STATE;
use std::collections::HashMap;

pub fn lookup_english_base_type(zh_base_type: &str) -> Option<String> {
    if zh_base_type.is_empty() {
        return None;
    }
    let clean = zh_base_type.trim();
    if let Some(en) = get_common_item_map().get(clean) {
        return Some(en.clone());
    }
    if let Ok(state) = DICTIONARY_STATE.read() {
        if let Some(en) = state.item_dict.get(clean) {
            return Some(en.clone());
        }
    }
    None
}

pub fn get_common_item_map() -> HashMap<String, String> {
    let mut map = HashMap::new();
    let pairs = [
        // Currency & Consumables
        ("神聖石", "Divine Orb"),
        ("崇高石", "Exalted Orb"),
        ("混沌石", "Chaos Orb"),
        ("鏡子", "Mirror of Kalandra"),
        ("卡蘭德的魔鏡", "Mirror of Kalandra"),
        ("後悔石", "Orb of Regret"),
        ("重鑄石", "Orb of Scouring"),
        ("富豪石", "Regal Orb"),
        ("點金石", "Orb of Alchemy"),
        ("鏈結石", "Orb of Fusing"),
        ("工匠石", "Jeweller's Orb"),
        ("幻色石", "Chromatic Orb"),
        ("改造石", "Orb of Alteration"),
        ("增幅石", "Orb of Augmentation"),
        ("蛻變石", "Orb of Transmutation"),
        ("機會石", "Orb of Chance"),
        ("無效石", "Orb of Annulment"),
        ("瓦爾寶珠", "Vaal Orb"),
        ("製圖釘", "Cartographer's Chisel"),
        ("玻璃彈珠", "Glassblower's Bauble"),
        ("寶石匠的稜鏡", "Gemcutter's Prism"),
        ("磨刀石", "Blacksmith's Whetstone"),
        ("護甲片", "Armourer's Scrap"),
        ("祝福石", "Blessed Orb"),
        ("聖靈之核", "Beyond Catalyst"),
        ("古靈莊園", "Sacred Lifeforce"),

        // Fragments
        ("充能血器", "Filled Blood Vessel"),
        ("祭壇之血容器", "Filled Blood Vessel"),
        ("黎明的奉獻", "Sacrifice at Dawn"),
        ("正午的奉獻", "Sacrifice at Noon"),
        ("黃昏的奉獻", "Sacrifice at Dusk"),
        ("午夜的奉獻", "Sacrifice at Midnight"),

        // Delirium Orbs
        ("占卜瞻妄玉", "Diviner's Delirium Orb"),
        ("精髓瞻妄玉", "Fine Delirium Orb"),
        ("通貨瞻妄玉", "Skittering Delirium Orb"),
        ("地圖瞻妄玉", "Cartographer's Delirium Orb"),
        ("化石瞻妄玉", "Fossilised Delirium Orb"),
        ("飾品瞻妄玉", "Jeweller's Delirium Orb"),
        ("裂痕瞻妄玉", "Breaching Delirium Orb"),

        // Scarabs (Essence)
        ("精髓甲蟲", "Essence Scarab"),
        ("飛升之精髓甲蟲", "Essence Scarab of Ascent"),
        ("鈣化之精髓甲蟲", "Essence Scarab of Calcification"),
        ("穩定之精髓甲蟲", "Essence Scarab of Stability"),
        ("適應之精髓甲蟲", "Essence Scarab of Adaptation"),

        // Scarabs (Ambush)
        ("伏擊甲蟲", "Ambush Scarab"),
        ("隱密之伏擊甲蟲", "Ambush Scarab of Hidden Compartments"),
        ("效能之伏擊甲蟲", "Ambush Scarab of Potency"),
        ("洞察之伏擊甲蟲", "Ambush Scarab of Discernment"),
        ("圍堵之伏擊甲蟲", "Ambush Scarab of Containment"),

        // Scarabs (Harvest & Legion)
        ("收割甲蟲", "Harvest Scarab"),
        ("豐收之收割甲蟲", "Harvest Scarab of Cornucopia"),
        ("倍增之收割甲蟲", "Harvest Scarab of Doubling"),
        ("軍團甲蟲", "Legion Scarab"),
        ("軍官之軍團甲蟲", "Legion Scarab of Officers"),
        ("指令之軍團甲蟲", "Legion Scarab of Command"),
        ("決鬥之軍團甲蟲", "Legion Scarab of The Sekhema"),

        // Scarabs (Breach, Expedition, Ritual)
        ("破滅裂痕甲蟲", "Breach Scarab"),
        ("探險甲蟲", "Expedition Scarab"),
        ("先祖之探險甲蟲", "Expedition Scarab of Verisium"),
        ("考古之探險甲蟲", "Expedition Scarab of Archaeology"),
        ("儀式甲蟲", "Ritual Scarab"),
        ("選拔之儀式甲蟲", "Ritual Scarab of Selectiveness"),
        ("富饒之儀式甲蟲", "Ritual Scarab of Abundance"),

        // Scarabs (Harbinger, Beyond, Domination, Delirium, Cartography, Divination)
        ("神諭甲蟲", "Harbinger Scarab"),
        ("戰爭之神諭甲蟲", "Harbinger Scarab of Warhoards"),
        ("超越甲蟲", "Beyond Scarab"),
        ("復興之超越甲蟲", "Beyond Scarab of Resurgence"),
        ("支配甲蟲", "Domination Scarab"),
        ("驚駭之支配甲蟲", "Domination Scarab of Terrors"),
        ("深淵甲蟲", "Abyss Scarab"),
        ("地圖甲蟲", "Cartography Scarab"),
        ("昇華之地圖甲蟲", "Cartography Scarab of Ascension"),
        ("複製之地圖甲蟲", "Cartography Scarab of Duplication"),
        ("瞻妄甲蟲", "Delirium Scarab"),
        ("命運甲蟲", "Divination Scarab"),
        ("豐盛之命運甲蟲", "Divination Scarab of Plenty"),
        ("策劃之命運甲蟲", "Divination Scarab of Curation"),
        ("異能甲蟲", "Anarchy Scarab"),
        ("苦痛甲蟲", "Torment Scarab"),
        ("宿敵甲蟲", "Nemesis Scarab"),
        ("野獸甲蟲", "Bestiary Scarab"),

        // Maps & Waystones
        ("地圖", "Map"),
        ("路標石", "Waystone"),
        ("幽閉墓穴", "Dunes Map"),
        ("劇毒林地", "Toxic Sewer Map"),
        ("濱海山丘", "Strand Map"),
        ("市集", "City Square Map"),
        ("堡壘", "Citadel Map"),
        ("聖所", "Sanctuary Map"),
        ("恐懼要塞", "Abomination Map"),
        ("奇術之泉", "Curator Map"),
        ("日耀神殿", "Solaris Temple Map"),
        ("熔火地穴", "Lava Chamber Map"),
        ("地下墓穴", "Catacomb Map"),
        ("平頂荒漠", "Mesa Map"),
        ("乾枯湖畔", "Arid Lake Map"),
        ("畸形亡域", "Defiled Cathedral Map"),
        ("白沙灘頭", "Atoll Map"),
        ("危機水道", "Waterways Map"),
        ("晨曦墓園", "Graveyard Map"),
        ("巨型通道", "Colonnade Map"),
        ("長草荒原", "Fields Map"),
        ("貧瘠之地", "Waste Pool Map"),
        ("遠古市集", "Bazaar Map"),
        ("絕壁海岸", "Coves Map"),
        ("寒頂之巔", "Summit Map"),
        ("密林泥沼", "Mud Geyser Map"),
        ("地下河道", "Underground River Map"),
        ("幽暗地道", "Subterranean Map"),
        ("大鐘樓", "Belfry Map"),
        ("巨坑", "Pit Map"),
        ("濱海幽穴", "Shore Map"),
        ("晨曦之境", "Promenade Map"),

        // Uniques & Bases
        ("罪魔邪冠", "Hubris Circlet"),
        ("魔影法衣", "Vaal Regalia"),
        ("術士長靴", "Sorcerer Boots"),
        ("術士手套", "Sorcerer Gloves"),
        ("厚頭盔", "Royal Burgonet"),
        ("皮革腰帶", "Leather Belt"),
        ("重型腰帶", "Heavy Belt"),
        ("素布腰帶", "Rustic Sash"),
        ("水晶腰帶", "Crystal Belt"),
        ("獵首", "Headhunter"),
        ("法師之血", "Mageblood"),
        ("灰燼之甕", "Ashes of the Stars"),
        ("滅絕之星", "Crystallised Omniscience"),
        ("西拉克", "The Squire"),
        ("原始之罪", "Original Sin"),
        ("尼米斯", "Nimis"),
    ];

    for (zh, en) in pairs {
        map.insert(zh.to_string(), en.to_string());
        map.insert(en.to_string(), en.to_string());
    }

    map
}
