pub mod header_parser;

#[cfg(test)]
mod tests;

pub use header_parser::update_rate_limits_from_headers;

use lazy_static::lazy_static;
use std::sync::atomic::{AtomicU64, Ordering};
use std::time::{Duration, Instant};
use tokio::sync::Mutex;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RequestChannel {
    Search,
    Fetch,
    Stash,
}

pub(crate) struct ChannelState {
    last_time: Instant,
    pub(crate) throttle_delay_ms: u64,
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
    pub(crate) static ref SEARCH_LOCK: Mutex<ChannelState> = Mutex::new(ChannelState::new(1500));
    pub(crate) static ref FETCH_LOCK: Mutex<ChannelState> = Mutex::new(ChannelState::new(1000));
    pub(crate) static ref STASH_LOCK: Mutex<ChannelState> = Mutex::new(ChannelState::new(800));
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
        (expiry - now).div_ceil(1000)
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
    let start = Instant::now();
    while is_trade_rate_limited() {
        let remaining = get_rate_limit_remaining_seconds();
        if remaining == 0 || start.elapsed() > Duration::from_secs(60) {
            break;
        }
        let wait_ms = (remaining * 1000).min(1000);
        tokio::time::sleep(Duration::from_millis(wait_ms)).await;
    }

    let mutex: &Mutex<ChannelState> = match channel {
        RequestChannel::Search => &SEARCH_LOCK,
        RequestChannel::Fetch => &FETCH_LOCK,
        RequestChannel::Stash => &STASH_LOCK,
    };

    let mut state = mutex.lock().await;
    let base_delay = match channel {
        RequestChannel::Search => {
            if has_auth {
                1500
            } else {
                3500
            }
        }
        RequestChannel::Fetch => {
            if has_auth {
                1000
            } else {
                2000
            }
        }
        RequestChannel::Stash => {
            if has_auth {
                800
            } else {
                1500
            }
        }
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
