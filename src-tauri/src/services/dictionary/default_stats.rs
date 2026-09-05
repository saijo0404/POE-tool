use super::state::StatDictionaryEntry;

pub fn get_default_stat_dict() -> Vec<StatDictionaryEntry> {
    vec![
        StatDictionaryEntry {
            id: "pseudo.pseudo_total_elemental_resistance".to_string(),
            zh_text: "+#% 總元素抗性 (Pseudo)".to_string(),
            en_text: "+#% total Elemental Resistance".to_string(),
        },
        StatDictionaryEntry {
            id: "pseudo.pseudo_total_resistance".to_string(),
            zh_text: "+#% 總抗性 (Pseudo)".to_string(),
            en_text: "+#% total Resistance".to_string(),
        },
        StatDictionaryEntry {
            id: "pseudo.pseudo_total_life".to_string(),
            zh_text: "+# 總生命 (Pseudo)".to_string(),
            en_text: "+# to total maximum Life".to_string(),
        },
        StatDictionaryEntry {
            id: "pseudo.pseudo_total_energy_shield".to_string(),
            zh_text: "+# 總能量護盾 (Pseudo)".to_string(),
            en_text: "+# to total maximum Energy Shield".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_3299347043".to_string(),
            zh_text: "+# 最大生命".to_string(),
            en_text: "+# to maximum Life".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_1050105434".to_string(),
            zh_text: "+# 最大魔力".to_string(),
            en_text: "+# to maximum Mana".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_4052037485".to_string(),
            zh_text: "+# 最大能量護盾".to_string(),
            en_text: "+# to maximum Energy Shield".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_3593843976".to_string(),
            zh_text: "增加 #% 能量護盾".to_string(),
            en_text: "#% increased Energy Shield".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_3372524247".to_string(),
            zh_text: "+#% 火焰抗性".to_string(),
            en_text: "+#% to Fire Resistance".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_4220027924".to_string(),
            zh_text: "+#% 冰冷抗性".to_string(),
            en_text: "+#% to Cold Resistance".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_1671376347".to_string(),
            zh_text: "+#% 閃電抗性".to_string(),
            en_text: "+#% to Lightning Resistance".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_2923486250".to_string(),
            zh_text: "+#% 混沌抗性".to_string(),
            en_text: "+#% to Chaos Resistance".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_2901986750".to_string(),
            zh_text: "+#% 全部元素抗性".to_string(),
            en_text: "+#% to all Elemental Resistances".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_4082204447".to_string(),
            zh_text: "+# 力量".to_string(),
            en_text: "+# to Strength".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_3261801946".to_string(),
            zh_text: "+# 敏捷".to_string(),
            en_text: "+# to Dexterity".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_4167198415".to_string(),
            zh_text: "+# 智慧".to_string(),
            en_text: "+# to Intelligence".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_1379411836".to_string(),
            zh_text: "+# 全能力".to_string(),
            en_text: "+# to all Attributes".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_2250533757".to_string(),
            zh_text: "增加 #% 移動速度".to_string(),
            en_text: "#% increased Movement Speed".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_681332047".to_string(),
            zh_text: "增加 #% 攻擊速度".to_string(),
            en_text: "#% increased Attack Speed".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_2891184298".to_string(),
            zh_text: "增加 #% 施法速度".to_string(),
            en_text: "#% increased Cast Speed".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_55876295".to_string(),
            zh_text: "增加 #% 暴擊率".to_string(),
            en_text: "#% increased Critical Strike Chance".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_3556824919".to_string(),
            zh_text: "+#% 暴擊加成".to_string(),
            en_text: "+#% to Critical Strike Multiplier".to_string(),
        },
    ]
}
