use crate::models::settings::AppSettings;
use reqwest::header::{
    HeaderMap, HeaderValue, ACCEPT, CONTENT_TYPE, COOKIE, ORIGIN, REFERER, USER_AGENT,
};

const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

pub fn build_trade_headers(
    settings: &AppSettings,
    league: &str,
    query_id: Option<&str>,
) -> HeaderMap {
    let mut headers = HeaderMap::new();
    let ua = settings.user_agent.as_deref().unwrap_or(DEFAULT_USER_AGENT);
    headers.insert(
        USER_AGENT,
        HeaderValue::from_str(ua).unwrap_or_else(|_| HeaderValue::from_static(DEFAULT_USER_AGENT)),
    );
    headers.insert(
        ORIGIN,
        HeaderValue::from_static("https://www.pathofexile.com"),
    );
    headers.insert(CONTENT_TYPE, HeaderValue::from_static("application/json"));
    headers.insert(ACCEPT, HeaderValue::from_static("application/json"));
    headers.insert(
        reqwest::header::HeaderName::from_static("x-requested-with"),
        HeaderValue::from_static("XMLHttpRequest"),
    );
    headers.insert(
        reqwest::header::HeaderName::from_static("sec-fetch-dest"),
        HeaderValue::from_static("empty"),
    );
    headers.insert(
        reqwest::header::HeaderName::from_static("sec-fetch-mode"),
        HeaderValue::from_static("cors"),
    );
    headers.insert(
        reqwest::header::HeaderName::from_static("sec-fetch-site"),
        HeaderValue::from_static("same-origin"),
    );

    let referer = if let Some(qid) = query_id {
        format!(
            "https://www.pathofexile.com/trade/search/{}/{}",
            urlencoding::encode(league),
            qid
        )
    } else {
        format!(
            "https://www.pathofexile.com/trade/search/{}",
            urlencoding::encode(league)
        )
    };
    if let Ok(ref_val) = HeaderValue::from_str(&referer) {
        headers.insert(REFERER, ref_val);
    }
    attach_cookies(&mut headers, settings);
    headers
}

fn attach_cookies(headers: &mut HeaderMap, settings: &AppSettings) {
    let mut cookies = Vec::new();
    if !settings.poesessid.trim().is_empty() {
        cookies.push(format!("POESESSID={}", settings.poesessid.trim()));
    }
    if let Some(cf) = &settings.cf_clearance {
        if !cf.trim().is_empty() {
            cookies.push(format!("cf_clearance={}", cf.trim()));
        }
    }
    if !cookies.is_empty() {
        if let Ok(c_val) = HeaderValue::from_str(&cookies.join("; ")) {
            headers.insert(COOKIE, c_val);
        }
    }
}
