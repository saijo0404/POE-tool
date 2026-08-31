use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum SessionState {
    Valid,
    Expired,
    CloudflareBlocked,
    Unconfigured,
    NetworkError,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionHealthInfo {
    pub state: SessionState,
    pub message: String,
    pub account_name: Option<String>,
    pub last_checked_epoch_ms: u64,
    pub has_poesessid: bool,
    pub has_cf_clearance: bool,
}

impl Default for SessionHealthInfo {
    fn default() -> Self {
        Self {
            state: SessionState::Unconfigured,
            message: "尚未設定 POESESSID 官方憑證".to_string(),
            account_name: None,
            last_checked_epoch_ms: 0,
            has_poesessid: false,
            has_cf_clearance: false,
        }
    }
}
