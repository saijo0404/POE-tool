pub fn is_poe2_engine(engine: Option<&str>) -> bool {
    engine.is_some_and(|e| e.eq_ignore_ascii_case("poe2"))
}

pub fn detect_is_tw(league: &str) -> bool {
    let lower = league.to_lowercase();
    lower.contains("台服") || lower.starts_with("tw_") || lower.ends_with("_tw")
}

pub fn get_trade_api_base(is_poe2: bool, is_tw: bool) -> &'static str {
    match (is_poe2, is_tw) {
        (true, false) => "https://www.pathofexile.com/api/trade2",
        (true, true) => "https://pathofexile.tw/api/trade2",
        (false, false) => "https://www.pathofexile.com/api/trade",
        (false, true) => "https://pathofexile.tw/api/trade",
    }
}

pub fn get_trade_web_base(is_poe2: bool, is_tw: bool) -> &'static str {
    match (is_poe2, is_tw) {
        (true, false) => "https://www.pathofexile.com/trade2",
        (true, true) => "https://pathofexile.tw/trade2",
        (false, false) => "https://www.pathofexile.com/trade",
        (false, true) => "https://pathofexile.tw/trade",
    }
}

pub fn get_trade_search_api_url(is_poe2: bool, is_tw: bool, league: &str) -> String {
    format!(
        "{}/search/{}",
        get_trade_api_base(is_poe2, is_tw),
        urlencoding::encode(league)
    )
}

pub fn get_trade_fetch_api_url(
    is_poe2: bool,
    is_tw: bool,
    fetch_ids: &str,
    query_id: &str,
) -> String {
    format!(
        "{}/fetch/{}?query={}",
        get_trade_api_base(is_poe2, is_tw),
        fetch_ids,
        query_id
    )
}

pub fn get_trade_whisper_api_url(is_poe2: bool, is_tw: bool) -> String {
    format!("{}/whisper", get_trade_api_base(is_poe2, is_tw))
}

pub fn get_trade_leagues_api_url(is_poe2: bool, is_tw: bool) -> String {
    format!("{}/data/leagues", get_trade_api_base(is_poe2, is_tw))
}

pub fn get_trade_search_web_url(
    is_poe2: bool,
    is_tw: bool,
    league: &str,
    query_id: &str,
) -> String {
    format!(
        "{}/search/{}/{}",
        get_trade_web_base(is_poe2, is_tw),
        urlencoding::encode(league),
        query_id
    )
}

pub fn get_trade_search_web_query_url(
    is_poe2: bool,
    is_tw: bool,
    league: &str,
    query_json: &str,
) -> String {
    format!(
        "{}/search/{}?q={}",
        get_trade_web_base(is_poe2, is_tw),
        urlencoding::encode(league),
        urlencoding::encode(query_json)
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_trade_urls_poe1_and_poe2() {
        assert_eq!(
            get_trade_api_base(false, false),
            "https://www.pathofexile.com/api/trade"
        );
        assert_eq!(
            get_trade_api_base(true, false),
            "https://www.pathofexile.com/api/trade2"
        );
        assert_eq!(
            get_trade_api_base(false, true),
            "https://pathofexile.tw/api/trade"
        );
        assert_eq!(
            get_trade_api_base(true, true),
            "https://pathofexile.tw/api/trade2"
        );

        let search_url = get_trade_search_api_url(true, false, "Standard");
        assert_eq!(
            search_url,
            "https://www.pathofexile.com/api/trade2/search/Standard"
        );

        let web_url = get_trade_search_web_url(true, false, "Standard", "abc123");
        assert_eq!(
            web_url,
            "https://www.pathofexile.com/trade2/search/Standard/abc123"
        );
    }

    #[test]
    fn test_is_poe2_engine() {
        assert!(is_poe2_engine(Some("poe2")));
        assert!(is_poe2_engine(Some("PoE2")));
        assert!(!is_poe2_engine(Some("poe1")));
        assert!(!is_poe2_engine(None));
    }
}
