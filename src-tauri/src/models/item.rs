use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum ModType {
    Implicit,
    Explicit,
    Fractured,
    Crafted,
    Enchant,
    Pseudo,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedItemMod {
    pub id: String,
    pub text: String,
    pub english_text: String,
    #[serde(rename = "type")]
    pub mod_type: ModType,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tier: Option<i64>,
    pub value: Option<f64>,
    pub min_value: Option<f64>,
    pub max_value: Option<f64>,
    #[serde(default = "default_true")]
    pub enabled: bool,
}

fn default_true() -> bool {
    true
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedItem {
    pub name: String,
    pub base_type: String,
    pub rarity: String, // "Normal" | "Magic" | "Rare" | "Unique" | "Currency" | "Gem"
    pub item_class: Option<String>,
    pub item_level: Option<i64>,
    pub quality: Option<i64>,
    pub corrupted: Option<bool>,
    pub sockets: Option<String>,
    pub language: String, // "zh" | "en"
    pub implicits: Vec<ParsedItemMod>,
    pub explicits: Vec<ParsedItemMod>,
    pub raw_text: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub engine: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub spirit: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub waystone_tier: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub uncut_tier: Option<i64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rune_sockets: Option<String>,
}

impl ParsedItem {
    pub fn empty(language: &str, clean_text: &str) -> Self {
        Self {
            name: String::new(),
            base_type: String::new(),
            rarity: "Rare".to_string(),
            item_class: None,
            item_level: None,
            quality: None,
            corrupted: None,
            sockets: None,
            language: language.to_string(),
            implicits: Vec::new(),
            explicits: Vec::new(),
            raw_text: clean_text.to_string(),
            engine: None,
            spirit: None,
            waystone_tier: None,
            uncut_tier: None,
            rune_sockets: None,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TradeQueryFilter {
    pub stat_id: String,
    pub disabled: Option<bool>,
    pub min: Option<f64>,
    pub max: Option<f64>,
}
