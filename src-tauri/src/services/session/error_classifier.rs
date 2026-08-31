use crate::models::session::SessionState;
use reqwest::header::HeaderMap;

pub fn is_cloudflare_challenge(status: u16, headers: &HeaderMap, body: &str) -> bool {
    if status == 403 || status == 503 {
        let has_cf_ray = headers.contains_key("cf-ray");
        let has_cf_mitigated = headers.contains_key("cf-mitigated");
        let is_cf_server = headers
            .get("server")
            .and_then(|s| s.to_str().ok())
            .map(|s| s.to_ascii_lowercase().contains("cloudflare"))
            .unwrap_or(false);

        let lower_body = body.to_ascii_lowercase();
        let body_has_cf = lower_body.contains("just a moment")
            || lower_body.contains("cloudflare")
            || lower_body.contains("turnstile")
            || lower_body.contains("cf-chl")
            || lower_body.contains("cf_clearance")
            || lower_body.contains("attention required")
            || lower_body.contains("challenge-platform");

        return has_cf_mitigated || (has_cf_ray && body_has_cf) || (is_cf_server && body_has_cf);
    }
    false
}

pub fn classify_http_trade_error(
    status: u16,
    headers: &HeaderMap,
    body: &str,
) -> (SessionState, String) {
    if is_cloudflare_challenge(status, headers, body) {
        return (
            SessionState::CloudflareBlocked,
            "[CLOUDFLARE_CHALLENGE] 遭遇官方 Cloudflare WAF / Turnstile 安全驗證 (403)，請點擊【一鍵重新授權登入】更新驗證。"
                .to_string(),
        );
    }

    if status == 401 || status == 403 {
        return (
            SessionState::Expired,
            "[AUTH_SESSION_EXPIRED] 官方 POESESSID 憑證已過期或失效 (403)，請點擊【一鍵重新授權登入】。"
                .to_string(),
        );
    }

    if status == 429 {
        return (
            SessionState::Valid,
            "[RATE_LIMITED] 官方請求頻率受限 (429)，將於冷卻後重試。".to_string(),
        );
    }

    let trimmed = body.trim();
    let display_body = if trimmed.starts_with('<') || trimmed.len() > 120 {
        "伺服器回傳非預期內容"
    } else if trimmed.is_empty() {
        "無回傳訊息"
    } else {
        trimmed
    };

    (
        SessionState::NetworkError,
        format!("官方市集請求失敗 ({}): {}", status, display_body),
    )
}
