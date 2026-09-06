use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    static ref RE_POESESSID: Regex =
        Regex::new(r"(?i)(poesessid=)[a-zA-Z0-9_-]+").expect("Invalid poesessid regex");
    static ref RE_BEARER: Regex =
        Regex::new(r"(?i)(bearer\s+)[a-zA-Z0-9._-]+").expect("Invalid bearer regex");
    static ref RE_TOKEN_KV: Regex =
        Regex::new(r#"(?i)("?(?:token|secret|password|session_id)"?\s*[:=]\s*"?)[^"'\s,;&]+"#)
            .expect("Invalid token kv regex");
    static ref RE_URL_TOKEN: Regex =
        Regex::new(r"(?i)([?&](?:token|session|auth|password)=)[^&\s]+").expect("Invalid url token regex");
}

pub fn sanitize_log_message(msg: &str) -> String {
    let step1 = RE_POESESSID.replace_all(msg, "${1}***REDACTED***");
    let step2 = RE_BEARER.replace_all(&step1, "${1}***REDACTED***");
    let step3 = RE_TOKEN_KV.replace_all(&step2, "${1}***REDACTED***");
    let step4 = RE_URL_TOKEN.replace_all(&step3, "${1}***REDACTED***");
    step4.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_redacts_poesessid() {
        let raw = "Cookie: POESESSID=abcdef1234567890; domain=pathofexile.com";
        let sanitized = sanitize_log_message(raw);
        assert_eq!(
            sanitized,
            "Cookie: POESESSID=***REDACTED***; domain=pathofexile.com"
        );
    }

    #[test]
    fn test_redacts_lowercase_poesessid() {
        let raw = "error with poesessid=xyz987secret in request";
        let sanitized = sanitize_log_message(raw);
        assert_eq!(
            sanitized,
            "error with poesessid=***REDACTED*** in request"
        );
    }

    #[test]
    fn test_redacts_bearer_token() {
        let raw = "Authorization: Bearer my_jwt_token_secret_value_123";
        let sanitized = sanitize_log_message(raw);
        assert_eq!(sanitized, "Authorization: Bearer ***REDACTED***");
    }

    #[test]
    fn test_redacts_json_tokens_and_passwords() {
        let raw = r#"{"token": "super_secret_123", "password": "mypassword456"}"#;
        let sanitized = sanitize_log_message(raw);
        assert!(sanitized.contains(r#"{"token": "***REDACTED***""#));
        assert!(sanitized.contains(r#""password": "***REDACTED***""#));
    }

    #[test]
    fn test_redacts_url_token_query() {
        let raw = "https://example.com/api?token=secret123&action=fetch";
        let sanitized = sanitize_log_message(raw);
        assert_eq!(
            sanitized,
            "https://example.com/api?token=***REDACTED***&action=fetch"
        );
    }

    #[test]
    fn test_leaves_normal_message_untouched() {
        let raw = "Successfully fetched 15 trade search results in league Settlers";
        let sanitized = sanitize_log_message(raw);
        assert_eq!(sanitized, raw);
    }
}
