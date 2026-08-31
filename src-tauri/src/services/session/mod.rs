pub mod error_classifier;
pub mod session_probe;

pub use error_classifier::*;
pub use session_probe::*;

#[cfg(test)]
mod tests {
    use super::*;
    use crate::models::session::SessionState;
    use reqwest::header::{HeaderMap, HeaderValue};

    #[test]
    fn test_cloudflare_challenge_detection() {
        let mut headers = HeaderMap::new();
        headers.insert("cf-ray", HeaderValue::from_static("8bf123456789-TPE"));
        headers.insert("server", HeaderValue::from_static("cloudflare"));

        let body_cf =
            "<html><title>Just a moment...</title><body>Checking your browser</body></html>";
        assert!(is_cloudflare_challenge(403, &headers, body_cf));

        let (state, msg) = classify_http_trade_error(403, &headers, body_cf);
        assert_eq!(state, SessionState::CloudflareBlocked);
        assert!(msg.contains("[CLOUDFLARE_CHALLENGE]"));
    }

    #[test]
    fn test_session_expired_classification() {
        let headers = HeaderMap::new();
        let body_unauth = "{\"error\":{\"code\":3,\"message\":\"Resource not found\"}}";
        let (state, msg) = classify_http_trade_error(403, &headers, body_unauth);
        assert_eq!(state, SessionState::Expired);
        assert!(msg.contains("[AUTH_SESSION_EXPIRED]"));
    }

    #[test]
    fn test_rate_limited_classification() {
        let headers = HeaderMap::new();
        let (state, msg) = classify_http_trade_error(429, &headers, "");
        assert_eq!(state, SessionState::Valid);
        assert!(msg.contains("[RATE_LIMITED]"));
    }

    #[test]
    fn test_session_health_cache_state_flow() {
        mark_session_valid("TestAccount");
        let valid = get_cached_session_health();
        assert_eq!(valid.account_name.as_deref(), Some("TestAccount"));

        mark_session_expired("Session timeout");
        let expired = get_cached_session_health();
        assert_eq!(expired.state, SessionState::Expired);

        mark_cloudflare_blocked("Cloudflare challenge");
        let blocked = get_cached_session_health();
        assert_eq!(blocked.state, SessionState::CloudflareBlocked);
    }
}
