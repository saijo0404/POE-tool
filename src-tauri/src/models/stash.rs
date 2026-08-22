use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TabColor {
    pub r: u8,
    pub g: u8,
    pub b: u8,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StashTabMeta {
    pub i: usize,
    pub id: String,
    pub n: String,
    #[serde(rename = "type")]
    pub tab_type: String,
    pub color: Option<TabColor>,
    pub src: Option<String>,
    pub folder: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StashItem {
    pub id: String,
    pub name: String,
    pub type_line: String,
    pub icon: String,
    pub stack_size: Option<i64>,
    pub tab_name: String,
    pub category: String, // "Currency" | "Fragment" | "DivCard" | "Essence" | "Scarab" | "Map" | "Equipment"
    pub unit_price_chaos: f64,
    pub total_price_chaos: f64,
    pub unit_price_divine: f64,
    pub total_price_divine: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StashTabSummary {
    pub tab_name: String,
    pub category: Option<String>,
    pub total_chaos: Option<f64>,
    pub total_divine: Option<f64>,
    pub total_value_chaos: f64,
    pub total_value_divine: f64,
    pub item_count: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct WealthSnapshot {
    pub timestamp: String,
    pub league: String,
    pub total_chaos: f64,
    pub total_divine: f64,
    pub chaos_rate: f64,
    pub hourly_change_chaos: Option<f64>,
    pub hourly_change_divine: Option<f64>,
    pub tab_summaries: Vec<StashTabSummary>,
    pub top_items: Vec<StashItem>,
    pub all_items: Option<Vec<StashItem>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StashProgress {
    pub active: bool,
    pub current_tab: usize,
    pub total_tabs: usize,
    pub current_tab_name: String,
    pub stage: String,
}

impl Default for StashProgress {
    fn default() -> Self {
        Self {
            active: false,
            current_tab: 0,
            total_tabs: 0,
            current_tab_name: String::new(),
            stage: "idle".to_string(),
        }
    }
}
