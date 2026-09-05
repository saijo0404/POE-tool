use super::header_parser::parse_and_apply_rate_limit;
use super::*;

#[test]
fn test_rate_limit_block_and_expiry() {
    assert!(!is_trade_rate_limited() || get_rate_limit_remaining_seconds() > 0);

    set_rate_limit_block(5);
    assert!(is_trade_rate_limited());
    let remaining = get_rate_limit_remaining_seconds();
    assert!((1..=5).contains(&remaining));
}

#[test]
fn test_rate_limiter_channel_isolation() {
    // Setting block on PoE 2 channel should NOT alter PoE 1's rate limit expiry
    let poe1_before = get_channel_rate_limit_remaining_seconds(RequestChannel::Search);
    set_channel_rate_limit_block(RequestChannel::SearchPoe2, 10);
    assert!(is_channel_rate_limited(RequestChannel::SearchPoe2));
    assert!(is_channel_rate_limited(RequestChannel::FetchPoe2));

    let poe1_after = get_channel_rate_limit_remaining_seconds(RequestChannel::Search);
    assert_eq!(poe1_before, poe1_after);

    // RequestChannel helper
    assert!(RequestChannel::SearchPoe2.is_poe2());
    assert!(RequestChannel::FetchPoe2.is_poe2());
    assert!(!RequestChannel::Search.is_poe2());
    assert!(!RequestChannel::Fetch.is_poe2());
    assert!(!RequestChannel::Stash.is_poe2());
}

#[tokio::test]
async fn test_acquire_channel_slot_suspension() {
    set_rate_limit_block(1);
    let res = acquire_channel_slot(RequestChannel::Search, true).await;
    assert!(res.is_ok());

    let res_poe2 = acquire_channel_slot(RequestChannel::SearchPoe2, true).await;
    assert!(res_poe2.is_ok());
}

#[test]
fn test_parse_and_apply_rate_limit_headers() {
    let channel = RequestChannel::Search;
    parse_and_apply_rate_limit(channel, "15:10:60,30:300:1800", "5:10:0,10:300:0");
    parse_and_apply_rate_limit(channel, "10:10:60", "8:10:0");
    parse_and_apply_rate_limit(channel, "10:10:60", "10:10:0");
    parse_and_apply_rate_limit(channel, "", "");
    parse_and_apply_rate_limit(channel, "abc:xyz", "invalid");
    parse_and_apply_rate_limit(channel, "0:10:0", "0:0:0");

    let poe2_channel = RequestChannel::SearchPoe2;
    parse_and_apply_rate_limit(poe2_channel, "15:10:60", "5:10:0");
}
