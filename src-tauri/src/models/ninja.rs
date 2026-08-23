use serde::{Deserialize, Serialize};
use std::collections::HashMap;

pub type NinjaPriceMap = HashMap<String, f64>;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NinjaPricesResult {
    pub rates: NinjaPriceMap,
    pub divine_chaos_rate: f64,
    pub league: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NinjaBuildItem {
    pub name: String,
    pub type_line: String,
    pub slot: String,
    pub rarity: String,
    pub icon: String,
    pub ilvl: i64,
    pub corrupted: bool,
    pub explicit_mods: Vec<String>,
    pub implicit_mods: Vec<String>,
    #[serde(default)]
    pub crafted_mods: Vec<String>,
    #[serde(default)]
    pub fractured_mods: Vec<String>,
    #[serde(default)]
    pub enchant_mods: Vec<String>,
    #[serde(default)]
    pub links: Option<i64>,
    #[serde(default)]
    pub property_energy_shield: Option<f64>,
    #[serde(default)]
    pub property_armour: Option<f64>,
    #[serde(default)]
    pub property_evasion: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NinjaBuildGem {
    pub name: String,
    pub level: i64,
    pub quality: i64,
    pub icon: String,
    pub socketed_in: String,
    pub is_support: bool,
    pub is_vaal: bool,
    pub is_awakened: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NinjaBuildFlask {
    pub name: String,
    pub type_line: String,
    pub rarity: String,
    pub icon: String,
    pub explicit_mods: Vec<String>,
    pub utility_mods: Vec<String>,
    pub enchant_mods: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NinjaBuildJewel {
    pub name: String,
    pub type_line: String,
    pub rarity: String,
    pub icon: String,
    pub explicit_mods: Vec<String>,
    pub implicit_mods: Vec<String>,
    #[serde(default)]
    pub crafted_mods: Vec<String>,
    #[serde(default)]
    pub fractured_mods: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct NinjaBuildData {
    pub account: String,
    pub character_name: String,
    pub league: String,
    pub level: i64,
    pub class_name: String,
    pub ascendancy: String,
    pub equipment: Vec<NinjaBuildItem>,
    pub gems: Vec<NinjaBuildGem>,
    pub flasks: Vec<NinjaBuildFlask>,
    pub jewels: Vec<NinjaBuildJewel>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PricedItem {
    pub name: String,
    pub type_line: String,
    pub category: String, // "equipment" | "gem" | "flask" | "jewel"
    pub rarity: String,
    pub icon: String,
    pub slot: Option<String>,
    pub price_chaos: f64,
    pub price_divine: f64,
    pub confidence: String, // "high" | "medium" | "low"
    pub details: Option<String>,
    pub trade_search_url: String,
    pub trade_query_json: Option<String>,
    #[serde(default)]
    pub ilvl: Option<i64>,
    #[serde(default)]
    pub corrupted: Option<bool>,
    #[serde(default)]
    pub sockets: Option<String>,
    #[serde(default)]
    pub explicit_mods: Option<Vec<String>>,
    #[serde(default)]
    pub implicit_mods: Option<Vec<String>>,
    #[serde(default)]
    pub crafted_mods: Option<Vec<String>>,
    #[serde(default)]
    pub fractured_mods: Option<Vec<String>>,
    #[serde(default)]
    pub enchant_mods: Option<Vec<String>>,
    #[serde(default)]
    pub gem_level: Option<i64>,
    #[serde(default)]
    pub gem_quality: Option<i64>,
    #[serde(default)]
    pub property_energy_shield: Option<f64>,
    #[serde(default)]
    pub property_armour: Option<f64>,
    #[serde(default)]
    pub property_evasion: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BuildCategoryTotal {
    pub items: Vec<PricedItem>,
    pub total_chaos: f64,
    pub total_divine: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BuildCategories {
    pub equipment: BuildCategoryTotal,
    pub gems: BuildCategoryTotal,
    pub flasks: BuildCategoryTotal,
    pub jewels: BuildCategoryTotal,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BuildCharacterMeta {
    pub account: String,
    pub name: String,
    pub league: String,
    pub level: i64,
    pub class: String,
    pub ascendancy: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BuildCostResult {
    pub character: BuildCharacterMeta,
    pub total_chaos: f64,
    pub total_divine: f64,
    pub divine_chaos_rate: f64,
    pub categories: BuildCategories,
}
