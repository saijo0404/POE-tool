use super::{
    set_rate_limit_block, ChannelState, RequestChannel, FETCH_LOCK, SEARCH_LOCK, STASH_LOCK,
};
use tokio::sync::Mutex;

pub fn update_rate_limits_from_headers(
    channel: RequestChannel,
    headers: &reqwest::header::HeaderMap,
) {
    if let Some(retry_val) = headers.get("retry-after") {
        if let Ok(retry_str) = retry_val.to_str() {
            if let Ok(sec) = retry_str.trim().parse::<u64>() {
                set_rate_limit_block(sec);
            }
        }
    }

    let limit_hdr = headers
        .get("x-rate-limit-account")
        .or_else(|| headers.get("x-rate-limit-ip"))
        .or_else(|| headers.get("x-rate-limit-rules"));

    let state_hdr = headers
        .get("x-rate-limit-account-state")
        .or_else(|| headers.get("x-rate-limit-ip-state"))
        .or_else(|| headers.get("x-rate-limit-rules-state"));

    if let (Some(l_val), Some(s_val)) = (limit_hdr, state_hdr) {
        if let (Ok(l_str), Ok(s_str)) = (l_val.to_str(), s_val.to_str()) {
            parse_and_apply_rate_limit(channel, l_str, s_str);
        }
    }
}

pub(crate) fn parse_and_apply_rate_limit(channel: RequestChannel, limit_str: &str, state_str: &str) {
    let limits: Vec<Vec<u64>> = limit_str
        .split(',')
        .map(|s| {
            s.trim()
                .split(':')
                .filter_map(|n| n.parse::<u64>().ok())
                .collect()
        })
        .collect();

    let states: Vec<Vec<u64>> = state_str
        .split(',')
        .map(|s| {
            s.trim()
                .split(':')
                .filter_map(|n| n.parse::<u64>().ok())
                .collect()
        })
        .collect();

    let mut max_wait_suggested = match channel {
        RequestChannel::Search => 1500,
        RequestChannel::Fetch => 1000,
        RequestChannel::Stash => 800,
    };

    for (l, s) in limits.iter().zip(states.iter()) {
        if l.len() >= 2 && !s.is_empty() {
            let limit = l[0];
            let interval = l[1];
            let current = s[0];

            if limit > 0 {
                let ratio = (current as f64) / (limit as f64);
                if current >= limit.saturating_sub(1) {
                    max_wait_suggested = max_wait_suggested.max((interval * 1000 + 2000).min(8000));
                } else if ratio >= 0.7 {
                    max_wait_suggested = max_wait_suggested.max(5000);
                } else if ratio >= 0.5 {
                    max_wait_suggested = max_wait_suggested.max(3500);
                }
            }
        }
    }

    let mutex: &Mutex<ChannelState> = match channel {
        RequestChannel::Search => &SEARCH_LOCK,
        RequestChannel::Fetch => &FETCH_LOCK,
        RequestChannel::Stash => &STASH_LOCK,
    };

    if let Ok(mut state) = mutex.try_lock() {
        state.throttle_delay_ms = max_wait_suggested;
    }
}
