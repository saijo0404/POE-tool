use super::state::StatDictionaryEntry;

pub fn get_poe2_stat_dict() -> Vec<StatDictionaryEntry> {
    vec![
        // Spirit (精魂)
        StatDictionaryEntry {
            id: "explicit.stat_spirit".to_string(),
            zh_text: "+# 最大精魂".to_string(),
            en_text: "+# to maximum Spirit".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_increased_spirit".to_string(),
            zh_text: "增加 #% 精魂".to_string(),
            en_text: "#% increased Spirit".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_spirit_reservation_efficiency".to_string(),
            zh_text: "+#% 精魂保留效能".to_string(),
            en_text: "+#% Spirit Reservation Efficiency".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_increased_max_spirit".to_string(),
            zh_text: "增加 #% 最大精魂".to_string(),
            en_text: "#% increased maximum Spirit".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_reduced_spirit_reservation".to_string(),
            zh_text: "減少 #% 精魂保留".to_string(),
            en_text: "#% reduced Spirit Reservation".to_string(),
        },
        // Dodge Roll (翻滾)
        StatDictionaryEntry {
            id: "explicit.stat_dodge_roll_recovery_rate".to_string(),
            zh_text: "增加 #% 翻滾冷卻回復率".to_string(),
            en_text: "#% increased Dodge Roll Recovery Rate".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_dodge_roll_distance".to_string(),
            zh_text: "+#% 翻滾移動距離".to_string(),
            en_text: "+#% increased Dodge Roll Distance".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_dodge_roll_speed".to_string(),
            zh_text: "翻滾移動速度增加 #%".to_string(),
            en_text: "Dodge Roll has #% increased Movement Speed".to_string(),
        },
        // Energy Shield & Recharge
        StatDictionaryEntry {
            id: "explicit.stat_es_recharge_rate".to_string(),
            zh_text: "增加 #% 能量護盾充能率".to_string(),
            en_text: "#% increased Energy Shield Recharge Rate".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_faster_es_recharge_start".to_string(),
            zh_text: "+#% 能量護盾開始充能速度".to_string(),
            en_text: "+#% faster start of Energy Shield Recharge".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_es_delay_recovery".to_string(),
            zh_text: "增加 #% 能量護盾延遲回復".to_string(),
            en_text: "#% increased Energy Shield Delay Recovery".to_string(),
        },
        // Sockets & Gem Levels
        StatDictionaryEntry {
            id: "explicit.stat_rune_sockets".to_string(),
            zh_text: "+# 個符文插槽".to_string(),
            en_text: "+# Rune Sockets".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_socketed_skill_gem_level".to_string(),
            zh_text: "此物品上的技能石等級 +#".to_string(),
            en_text: "+# to Level of Socketed Skill Gems".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_socketed_spirit_gem_level".to_string(),
            zh_text: "此物品上的精魂技能石等級 +#".to_string(),
            en_text: "+# to Level of Socketed Spirit Gems".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_socketed_spell_gem_level".to_string(),
            zh_text: "此物品上的法術技能石等級 +#".to_string(),
            en_text: "+# to Level of Socketed Spell Gems".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_socketed_melee_gem_level".to_string(),
            zh_text: "此物品上的近戰技能石等級 +#".to_string(),
            en_text: "+# to Level of Socketed Melee Gems".to_string(),
        },
        // Buildup & Status Effects
        StatDictionaryEntry {
            id: "explicit.stat_freeze_buildup".to_string(),
            zh_text: "+#% 冰凍積蓄".to_string(),
            en_text: "+#% Freeze Buildup".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_ignite_buildup".to_string(),
            zh_text: "+#% 點燃積蓄".to_string(),
            en_text: "+#% Ignite Buildup".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_shock_buildup".to_string(),
            zh_text: "+#% 感電積蓄".to_string(),
            en_text: "+#% Shock Buildup".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_stun_buildup".to_string(),
            zh_text: "+#% 昏眩積蓄".to_string(),
            en_text: "+#% Stun Buildup".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_armour_break_buildup".to_string(),
            zh_text: "+#% 護甲破壞積蓄".to_string(),
            en_text: "+#% Armour Break Buildup".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_armour_break_damage".to_string(),
            zh_text: "增加 #% 護甲破壞傷害".to_string(),
            en_text: "#% increased Armour Break Damage".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_stun_threshold".to_string(),
            zh_text: "增加 #% 昏眩閾值".to_string(),
            en_text: "#% increased Stun Threshold".to_string(),
        },
        // Weapon Sets (武器配置)
        StatDictionaryEntry {
            id: "explicit.stat_weapon_set_1_phys".to_string(),
            zh_text: "武器配置 1: 增加 #% 物理傷害".to_string(),
            en_text: "Weapon Set 1: #% increased Physical Damage".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_weapon_set_2_phys".to_string(),
            zh_text: "武器配置 2: 增加 #% 物理傷害".to_string(),
            en_text: "Weapon Set 2: #% increased Physical Damage".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_weapon_set_1_elem".to_string(),
            zh_text: "武器配置 1: 增加 #% 元素傷害".to_string(),
            en_text: "Weapon Set 1: #% increased Elemental Damage".to_string(),
        },
        StatDictionaryEntry {
            id: "explicit.stat_weapon_set_2_elem".to_string(),
            zh_text: "武器配置 2: 增加 #% 元素傷害".to_string(),
            en_text: "Weapon Set 2: #% increased Elemental Damage".to_string(),
        },
    ]
}
