use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, Instant};
use lazy_static::lazy_static;
use tokio::sync::Mutex;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RequestChannel {
    Search,
    Fetch,
    Stash,
}

struct ChannelState {
    last_time: Instant,
    throttle_delay_ms: u64,
}

impl ChannelState {
    fn new(default_delay_ms: u64) -> Self {
        Self {
            last_time: Instant::now() - Duration::from_secs(10),
            throttle_delay_ms: default_delay_ms,
        }
    }
}

lazy_static! {
    static ref SEARCH_LOCK: Mutex<ChannelState> = Mutex::new(ChannelState::new(1500));
    static ref FETCH_LOCK: Mutex<ChannelState> = Mutex::new(ChannelState::new(1000));
    static ref STASH_LOCK: Mutex<ChannelState> = Mutex::new(ChannelState::new(800));
    static ref RATE_LIMIT_EXPIRY_MS: AtomicU64 = AtomicU64::new(0);
}

fn now_millis() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

pub fn is_trade_rate_limited() -> bool {
    now_millis() < RATE_LIMIT_EXPIRY_MS.load(Ordering::Relaxed)
}

pub fn get_rate_limit_remaining_seconds() -> u64 {
    let now = now_millis();
    let expiry = RATE_LIMIT_EXPIRY_MS.load(Ordering::Relaxed);
    if expiry > now {
        (expiry - now + 999) / 1000
    } else {
        0
    }
}

pub fn set_rate_limit_block(seconds: u64) {
    let expiry = now_millis() + seconds * 1000;
    let curr = RATE_LIMIT_EXPIRY_MS.load(Ordering::Relaxed);
    if expiry > curr {
        RATE_LIMIT_EXPIRY_MS.store(expiry, Ordering::Relaxed);
    }
}

pub async fn acquire_channel_slot(channel: RequestChannel, has_auth: bool) -> Result<(), String> {
    if is_trade_rate_limited() {
        let sec = get_rate_limit_remaining_seconds();
        return Err(format!("官方請求頻率受限，請於 {} 秒後再試。", sec));
    }

    let mutex: &Mutex<ChannelState> = match channel {
        RequestChannel::Search => &*SEARCH_LOCK,
        RequestChannel::Fetch => &*FETCH_LOCK,
        RequestChannel::Stash => &*STASH_LOCK,
    };

    let mut state = mutex.lock().await;

    let base_delay = match channel {
        RequestChannel::Search => if has_auth { 1500 } else { 3500 },
        RequestChannel::Fetch => if has_auth { 1000 } else { 2000 },
        RequestChannel::Stash => if has_auth { 800 } else { 1500 },
    };

    if state.throttle_delay_ms < base_delay {
        state.throttle_delay_ms = base_delay;
    }

    let elapsed = state.last_time.elapsed().as_millis() as u64;
    if elapsed < state.throttle_delay_ms {
        let sleep_time = Duration::from_millis(state.throttle_delay_ms - elapsed);
        tokio::time::sleep(sleep_time).await;
    }

    state.last_time = Instant::now();
    Ok(())
}

pub fn update_rate_limits_from_headers(channel: RequestChannel, headers: &reqwest::header::HeaderMap) {
    let limit_hdr = headers.get("x-rate-limit-account")
        .or_else(|| headers.get("x-rate-limit-ip"))
        .or_else(|| headers.get("x-rate-limit-rules"));

    let state_hdr = headers.get("x-rate-limit-account-state")
        .or_else(|| headers.get("x-rate-limit-ip-state"))
        .or_else(|| headers.get("x-rate-limit-rules-state"));

    if let (Some(l_val), Some(s_val)) = (limit_hdr, state_hdr) {
        if let (Ok(l_str), Ok(s_str)) = (l_val.to_str(), s_val.to_str()) {
            parse_and_apply_rate_limit(channel, l_str, s_str);
        }
    }
}

fn parse_and_apply_rate_limit(channel: RequestChannel, limit_str: &str, state_str: &str) {
    let limits: Vec<Vec<u64>> = limit_str.split(',')
        .map(|s| s.trim().split(':').filter_map(|n| n.parse::<u64>().ok()).collect())
        .collect();

    let states: Vec<Vec<u64>> = state_str.split(',')
        .map(|s| s.trim().split(':').filter_map(|n| n.parse::<u64>().ok()).collect())
        .collect();

    let mut max_wait_suggested = match channel {
        RequestChannel::Search => 1500,
        RequestChannel::Fetch => 1000,
        RequestChannel::Stash => 800,
    };

    for (l, s) in limits.iter().zip(states.iter()) {
        if l.len() >= 2 && s.len() >= 1 {
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
        RequestChannel::Search => &*SEARCH_LOCK,
        RequestChannel::Fetch => &*FETCH_LOCK,
        RequestChannel::Stash => &*STASH_LOCK,
    };

    if let Ok(mut state) = mutex.try_lock() {
        state.throttle_delay_ms = max_wait_suggested;
    }
}
