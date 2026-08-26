use super::DICTIONARY_STATE;
use std::collections::HashMap;

pub fn lookup_english_base_type(zh_base_type: &str) -> Option<String> {
    if zh_base_type.is_empty() {
        return None;
    }
    let clean = zh_base_type.trim();
    let state = DICTIONARY_STATE.read().ok()?;
    state.item_dict.get(clean).cloned()
}

pub fn get_common_item_map() -> HashMap<String, String> {
    let mut map = HashMap::new();
    let pairs = [
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
        ("古靈莊園", "Sacred Lifeforce"),
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
