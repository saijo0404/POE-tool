use super::container::extract_mods_from_src;
use crate::models::ninja::{NinjaBuildFlask, NinjaBuildGem, NinjaBuildJewel};
use serde_json::Value;

pub fn parse_flask_item(
    src: &Value,
    it: &Value,
    name: String,
    type_line: String,
    rarity: String,
    icon: String,
) -> NinjaBuildFlask {
    NinjaBuildFlask {
        name,
        type_line,
        rarity,
        icon,
        explicit_mods: extract_mods_from_src(src, it, "explicitMods"),
        utility_mods: extract_mods_from_src(src, it, "utilityMods"),
        enchant_mods: extract_mods_from_src(src, it, "enchantMods"),
    }
}

pub fn parse_jewel_item(
    src: &Value,
    it: &Value,
    name: String,
    type_line: String,
    rarity: String,
    icon: String,
) -> NinjaBuildJewel {
    NinjaBuildJewel {
        name,
        type_line,
        rarity,
        icon,
        explicit_mods: extract_mods_from_src(src, it, "explicitMods"),
        implicit_mods: extract_mods_from_src(src, it, "implicitMods"),
        crafted_mods: extract_mods_from_src(src, it, "craftedMods"),
        fractured_mods: extract_mods_from_src(src, it, "fracturedMods"),
    }
}

pub fn parse_gem_item(name: String, icon: String, inv_id: &str) -> NinjaBuildGem {
    NinjaBuildGem {
        name,
        level: 20,
        quality: 20,
        icon,
        socketed_in: inv_id.to_string(),
        is_support: false,
        is_vaal: false,
        is_awakened: false,
    }
}
