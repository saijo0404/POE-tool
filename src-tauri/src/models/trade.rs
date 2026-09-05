use super::item::{ParsedItem, ParsedItemMod, TradeQueryFilter};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TradeQuerySort {
    pub price: Option<String>,
    pub indexed: Option<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TradeQueryRequest {
    pub league: Option<String>,
    pub engine: Option<String>,
    pub trade_status: Option<String>,
    pub rarity: Option<String>,
    pub base_type: Option<String>,
    pub name: Option<String>,
    pub item_level_min: Option<i64>,
    pub links_min: Option<i64>,
    pub corrupted: Option<bool>,
    pub filters: Option<Vec<TradeQueryFilter>>,
    pub selected_mods: Option<Vec<ParsedItemMod>>,
    pub item: Option<ParsedItem>,
    pub poesessid: Option<String>,
    pub sort: Option<TradeQuerySort>,
    pub fetch_offset: Option<usize>,
    pub search_id: Option<String>,
    pub spirit_min: Option<u32>,
    pub rune_sockets_min: Option<u32>,
    pub waystone_tier_min: Option<u32>,
    pub uncut_gem_tier_min: Option<u32>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "camelCase")]
pub struct TradeLeagueEntry {
    pub id: String,
    pub text: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TradeItemProperty {
    pub name: String,
    pub values: Vec<(String, i64)>,
    #[serde(default)]
    pub display_mode: Option<i64>,
    #[serde(default)]
    pub r#type: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TradeListingItem {
    pub name: String,
    pub type_line: String,
    pub icon: String,
    pub ilvl: Option<i64>,
    pub corrupted: Option<bool>,
    pub rarity: Option<String>,
    pub base_type: Option<String>,
    pub item_class: Option<String>,
    pub quality: Option<i64>,
    pub sockets: Option<String>,
    pub implicit_mods: Option<Vec<String>>,
    pub explicit_mods: Option<Vec<String>>,
    pub crafted_mods: Option<Vec<String>>,
    pub fractured_mods: Option<Vec<String>>,
    pub enchant_mods: Option<Vec<String>>,
    pub flavour_text: Option<Vec<String>>,
    pub properties: Option<Vec<TradeItemProperty>>,
    pub requirements: Option<Vec<TradeItemProperty>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TradeListing {
    pub id: String,
    pub indexed: String,
    pub indexed_age: Option<String>,
    pub account_name: Option<String>,
    pub seller_account: Option<String>,
    pub character_name: Option<String>,
    pub seller_ign: Option<String>,
    pub online_status: String,
    pub is_instant: Option<bool>,
    pub price_amount: f64,
    pub price_currency: String,
    pub price_in_chaos: f64,
    pub price_in_divine: f64,
    pub whisper: String,
    pub whisper_token: Option<String>,
    pub hideout_token: Option<String>,
    pub is_instant_buyout: Option<bool>,
    pub method: Option<String>,
    pub item: TradeListingItem,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EstimatedPriceSummary {
    pub min: f64,
    pub median: f64,
    pub max: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TradeSearchResult {
    pub id: String,
    pub search_id: Option<String>,
    pub trade_url: Option<String>,
    pub search_url: Option<String>,
    pub total: usize,
    pub estimated_min_price_chaos: f64,
    pub estimated_min_price_divine: f64,
    pub estimated_median_price_chaos: f64,
    pub estimated_median_price_divine: f64,
    pub estimated_price: Option<EstimatedPriceSummary>,
    pub listings: Vec<TradeListing>,
}
