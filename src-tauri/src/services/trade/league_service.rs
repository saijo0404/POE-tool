use super::trade_urls::{get_trade_leagues_api_url, is_poe2_engine};
use crate::models::trade::TradeLeagueEntry;
use lazy_static::lazy_static;
use std::sync::Mutex;
use std::time::{Duration, Instant};

struct LeagueCache {
    poe1_leagues: Vec<TradeLeagueEntry>,
    poe1_updated: Option<Instant>,
    poe2_leagues: Vec<TradeLeagueEntry>,
    poe2_updated: Option<Instant>,
}

lazy_static! {
    static ref LEAGUE_CACHE: Mutex<LeagueCache> = Mutex::new(LeagueCache {
        poe1_leagues: Vec::new(),
        poe1_updated: None,
        poe2_leagues: Vec::new(),
        poe2_updated: None,
    });
}

const CACHE_TTL: Duration = Duration::from_secs(3600); // 1 hour

pub fn get_default_leagues(is_poe2: bool) -> Vec<TradeLeagueEntry> {
    if is_poe2 {
        vec![
            TradeLeagueEntry {
                id: "Standard".to_string(),
                text: "Standard".to_string(),
            },
            TradeLeagueEntry {
                id: "Hardcore".to_string(),
                text: "Hardcore".to_string(),
            },
            TradeLeagueEntry {
                id: "Early Access".to_string(),
                text: "Early Access".to_string(),
            },
            TradeLeagueEntry {
                id: "Hardcore Early Access".to_string(),
                text: "Hardcore Early Access".to_string(),
            },
        ]
    } else {
        vec![
            TradeLeagueEntry {
                id: "Settlers".to_string(),
                text: "Settlers".to_string(),
            },
            TradeLeagueEntry {
                id: "Hardcore Settlers".to_string(),
                text: "Hardcore Settlers".to_string(),
            },
            TradeLeagueEntry {
                id: "Standard".to_string(),
                text: "Standard".to_string(),
            },
            TradeLeagueEntry {
                id: "Hardcore".to_string(),
                text: "Hardcore".to_string(),
            },
        ]
    }
}

pub async fn fetch_trade_leagues(engine: Option<&str>) -> Vec<TradeLeagueEntry> {
    let is_poe2 = is_poe2_engine(engine);

    if let Ok(cache) = LEAGUE_CACHE.lock() {
        let (entries, updated) = if is_poe2 {
            (&cache.poe2_leagues, cache.poe2_updated)
        } else {
            (&cache.poe1_leagues, cache.poe1_updated)
        };
        if let Some(up) = updated {
            if up.elapsed() < CACHE_TTL && !entries.is_empty() {
                return entries.clone();
            }
        }
    }

    let url = get_trade_leagues_api_url(is_poe2, false);
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(5))
        .build();

    if let Ok(c) = client {
        if let Ok(res) = c.get(&url).send().await {
            if res.status().is_success() {
                if let Ok(val) = res.json::<serde_json::Value>().await {
                    if let Some(arr) = val.get("result").and_then(|r| r.as_array()) {
                        let parsed: Vec<TradeLeagueEntry> = arr
                            .iter()
                            .filter_map(|it| {
                                let id = it.get("id")?.as_str()?.to_string();
                                let text = it
                                    .get("text")
                                    .and_then(|t| t.as_str())
                                    .unwrap_or(&id)
                                    .to_string();
                                Some(TradeLeagueEntry { id, text })
                            })
                            .collect();

                        if !parsed.is_empty() {
                            if let Ok(mut cache) = LEAGUE_CACHE.lock() {
                                if is_poe2 {
                                    cache.poe2_leagues = parsed.clone();
                                    cache.poe2_updated = Some(Instant::now());
                                } else {
                                    cache.poe1_leagues = parsed.clone();
                                    cache.poe1_updated = Some(Instant::now());
                                }
                            }
                            return parsed;
                        }
                    }
                }
            }
        }
    }

    if let Ok(cache) = LEAGUE_CACHE.lock() {
        let entries = if is_poe2 {
            &cache.poe2_leagues
        } else {
            &cache.poe1_leagues
        };
        if !entries.is_empty() {
            return entries.clone();
        }
    }

    get_default_leagues(is_poe2)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_leagues() {
        let poe1 = get_default_leagues(false);
        assert!(poe1.iter().any(|l| l.id == "Settlers"));
        assert!(poe1.iter().any(|l| l.id == "Standard"));

        let poe2 = get_default_leagues(true);
        assert!(poe2.iter().any(|l| l.id == "Standard"));
        assert!(poe2.iter().any(|l| l.id == "Early Access"));
    }

    #[tokio::test]
    async fn test_fetch_trade_leagues_fallback() {
        let leagues = fetch_trade_leagues(Some("poe2")).await;
        assert!(!leagues.is_empty());
        assert!(leagues
            .iter()
            .any(|l| l.id == "Standard" || l.id == "Early Access"));
    }
}
