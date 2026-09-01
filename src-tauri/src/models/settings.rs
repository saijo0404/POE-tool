use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettings {
    #[serde(default = "default_league")]
    pub league: String,
    #[serde(default)]
    pub poesessid: String,
    #[serde(default)]
    pub account_name: String,
    #[serde(default = "default_true")]
    pub auto_snapshot_enabled: bool,
    #[serde(default = "default_interval")]
    pub auto_snapshot_interval_minutes: u64,
    #[serde(default)]
    pub use_demo_data: bool,
    pub poetoken: Option<String>,
    pub cf_clearance: Option<String>,
    pub user_agent: Option<String>,
    #[serde(default = "default_hotkey")]
    pub hotkey: Option<String>,
    pub selected_stash_tabs: Option<Vec<usize>>,
    #[serde(default = "default_max_tabs")]
    pub max_stash_tabs: Option<usize>,
    #[serde(default = "default_true")]
    pub overlay_enabled: bool,
    #[serde(default = "default_overlay_opacity")]
    pub overlay_opacity: f64,
    #[serde(default)]
    pub overlay_click_through: bool,
    #[serde(default = "default_true")]
    pub overlay_auto_close_on_blur: bool,
    #[serde(default = "default_overlay_scale")]
    pub overlay_scale: f64,
}

fn default_league() -> String {
    "Auto".to_string()
}
fn default_true() -> bool {
    true
}
fn default_interval() -> u64 {
    60
}
fn default_hotkey() -> Option<String> {
    Some("ctrl+c+d".to_string())
}
fn default_max_tabs() -> Option<usize> {
    Some(60)
}
fn default_overlay_opacity() -> f64 {
    0.92
}
fn default_overlay_scale() -> f64 {
    1.0
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            league: default_league(),
            poesessid: String::new(),
            account_name: String::new(),
            auto_snapshot_enabled: true,
            auto_snapshot_interval_minutes: 60,
            use_demo_data: false,
            poetoken: None,
            cf_clearance: None,
            user_agent: None,
            hotkey: default_hotkey(),
            selected_stash_tabs: None,
            max_stash_tabs: default_max_tabs(),
            overlay_enabled: true,
            overlay_opacity: default_overlay_opacity(),
            overlay_click_through: false,
            overlay_auto_close_on_blur: true,
            overlay_scale: default_overlay_scale(),
        }
    }
}
