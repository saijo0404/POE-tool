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
    SearchPoe2,
    FetchPoe2,
}

impl RequestChannel {
    pub fn is_poe2(&self) -> bool {
        matches!(self, RequestChannel::SearchPoe2 | RequestChannel::FetchPoe2)
    }
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
    pub(crate) static ref SEARCH_POE2_LOCK: Mutex<ChannelState> = Mutex::new(ChannelState::new(1500));
    pub(crate) static ref FETCH_POE2_LOCK: Mutex<ChannelState> = Mutex::new(ChannelState::new(1000));
    static ref RATE_LIMIT_EXPIRY_POE1_MS: AtomicU64 = AtomicU64::new(0);
    static ref RATE_LIMIT_EXPIRY_POE2_MS: AtomicU64 = AtomicU64::new(0);
}

fn now_millis() -> u64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

fn get_expiry_ref(is_poe2: bool) -> &'static AtomicU64 {
    if is_poe2 {
        &RATE_LIMIT_EXPIRY_POE2_MS
    } else {
        &RATE_LIMIT_EXPIRY_POE1_MS
    }
}

pub fn is_trade_rate_limited() -> bool {
    is_channel_rate_limited(RequestChannel::Search)
}

pub fn is_channel_rate_limited(channel: RequestChannel) -> bool {
    let expiry = get_expiry_ref(channel.is_poe2()).load(Ordering::Relaxed);
    now_millis() < expiry
}

pub fn get_rate_limit_remaining_seconds() -> u64 {
    get_channel_rate_limit_remaining_seconds(RequestChannel::Search)
}

pub fn get_channel_rate_limit_remaining_seconds(channel: RequestChannel) -> u64 {
    let now = now_millis();
    let expiry = get_expiry_ref(channel.is_poe2()).load(Ordering::Relaxed);
    if expiry > now {
        (expiry - now).div_ceil(1000)
    } else {
        0
    }
}

pub fn set_rate_limit_block(seconds: u64) {
    set_channel_rate_limit_block(RequestChannel::Search, seconds);
}

pub fn set_channel_rate_limit_block(channel: RequestChannel, seconds: u64) {
    let expiry = now_millis() + seconds * 1000;
    let atomic_ref = get_expiry_ref(channel.is_poe2());
    let curr = atomic_ref.load(Ordering::Relaxed);
    if expiry > curr {
        atomic_ref.store(expiry, Ordering::Relaxed);
    }
}

pub async fn acquire_channel_slot(channel: RequestChannel, has_auth: bool) -> Result<(), String> {
    let start = Instant::now();
    while is_channel_rate_limited(channel) {
        let remaining = get_channel_rate_limit_remaining_seconds(channel);
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
        RequestChannel::SearchPoe2 => &SEARCH_POE2_LOCK,
        RequestChannel::FetchPoe2 => &FETCH_POE2_LOCK,
    };

    let mut state = mutex.lock().await;
    let base_delay = match channel {
        RequestChannel::Search | RequestChannel::SearchPoe2 => {
            if has_auth {
                1500
            } else {
                3500
            }
        }
        RequestChannel::Fetch | RequestChannel::FetchPoe2 => {
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
