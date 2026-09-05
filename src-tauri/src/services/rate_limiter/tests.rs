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

#[tokio::test]
async fn test_acquire_channel_slot_suspension() {
    set_rate_limit_block(1);
    let res = acquire_channel_slot(RequestChannel::Search, true).await;
    assert!(res.is_ok());
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
}
