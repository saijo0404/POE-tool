use super::character_parser::parse_character_window_json;
use crate::models::ninja::NinjaBuildData;
use regex::Regex;
use serde_json::Value;

const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

pub async fn fetch_ninja_profile(url: &str) -> Result<NinjaBuildData, String> {
    let clean = url.trim();
    let (account, league, character) = extract_profile_url_parts(clean)?;

    let account_decoded = urlencoding::decode(&account)
        .unwrap_or(std::borrow::Cow::Borrowed(&account))
        .to_string();
    let character_decoded = urlencoding::decode(&character)
        .unwrap_or(std::borrow::Cow::Borrowed(&character))
        .to_string();
    let league_decoded = urlencoding::decode(&league)
        .unwrap_or(std::borrow::Cow::Borrowed(&league))
        .to_string();

    let client = reqwest::Client::builder()
        .user_agent(DEFAULT_USER_AGENT)
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    if let Ok(data) =
        try_fetch_ggg_character_window(&client, &account_decoded, &character_decoded).await
    {
        return parse_character_window_json(&data, &account_decoded, &league_decoded);
    }

    if let Ok(data) = try_fetch_ninja_ssr_snapshot(
        &client,
        &account_decoded,
        &league_decoded,
        &character_decoded,
    )
    .await
    {
        return parse_character_window_json(&data, &account_decoded, &league_decoded);
    }

    Err(format!(
        "無法取得角色 '{}' 的裝備資料。請確認該角色在 GGG 官方網站是否已設為公開。",
        character_decoded
    ))
}

fn extract_profile_url_parts(clean: &str) -> Result<(String, String, String), String> {
    let re_profile =
        Regex::new(r"poe\.ninja/(?:poe1/)?profile/([^/]+)/([^/]+)/character/([^/?#]+)").unwrap();
    let re_builds =
        Regex::new(r"poe\.ninja/(?:poe1/)?builds/([^/]+)/character/([^/]+)/([^/?#]+)").unwrap();
    let re_ggg =
        Regex::new(r"pathofexile\.com/account/view-profile/([^/?#]+).*?[?&]character=([^&#]+)")
            .unwrap();

    if let Some(cap) = re_profile.captures(clean) {
        Ok((cap[1].to_string(), cap[2].to_string(), cap[3].to_string()))
    } else if let Some(cap) = re_builds.captures(clean) {
        Ok((cap[2].to_string(), cap[1].to_string(), cap[3].to_string()))
    } else if let Some(cap) = re_ggg.captures(clean) {
        Ok((
            cap[1].to_string(),
            "Standard".to_string(),
            cap[2].to_string(),
        ))
    } else {
        Err("無法辨識的 poe.ninja 或 GGG 角色網址格式，請確認網址完整性。".to_string())
    }
}

async fn try_fetch_ggg_character_window(
    client: &reqwest::Client,
    account: &str,
    character: &str,
) -> Result<Value, String> {
    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        crate::models::settings::AppSettings::default(),
    );
    let account_candidates = vec![
        account.to_string(),
        account.replace('-', "#"),
        settings.account_name.trim().to_string(),
    ];

    for acc in account_candidates {
        if acc.is_empty() {
            continue;
        }
        let ggg_url = format!(
            "https://www.pathofexile.com/character-window/get-items?accountName={}&character={}",
            urlencoding::encode(&acc),
            urlencoding::encode(character)
        );
        let mut req = client
            .get(&ggg_url)
            .header("Origin", "https://www.pathofexile.com")
            .header("Accept", "application/json");
        if !settings.poesessid.trim().is_empty() {
            req = req.header("Cookie", format!("POESESSID={}", settings.poesessid.trim()));
        }
        if let Ok(res) = req.send().await {
            if res.status().is_success() {
                if let Ok(data) = res.json::<Value>().await {
                    if data["items"].as_array().is_some() {
                        return Ok(data);
                    }
                }
            }
        }
    }
    Err("GGG character window fetch failed".to_string())
}

async fn try_fetch_ninja_ssr_snapshot(
    client: &reqwest::Client,
    account: &str,
    league: &str,
    character: &str,
) -> Result<Value, String> {
    let ninja_page_url = format!(
        "https://poe.ninja/poe1/profile/{}/{}/character/{}",
        urlencoding::encode(account),
        urlencoding::encode(league),
        urlencoding::encode(character)
    );
    let res = client
        .get(&ninja_page_url)
        .header("Accept", "text/html")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        return Err("Ninja snapshot request not success".to_string());
    }

    let html = res.text().await.map_err(|e| e.to_string())?;
    let marker = "<script id=\"__NEXT_DATA__\" type=\"application/json\">";
    let start = html
        .find(marker)
        .ok_or_else(|| "Next data not found".to_string())?;
    let json_start = start + marker.len();
    let end = html[json_start..]
        .find("</script>")
        .ok_or_else(|| "Closing script tag not found".to_string())?;
    let json_str = &html[json_start..json_start + end];
    let val: Value = serde_json::from_str(json_str).map_err(|e| e.to_string())?;
    let page_props = &val["props"]["pageProps"];

    let char_data = page_props
        .get("character")
        .or_else(|| page_props.get("build"))
        .or_else(|| page_props.get("snapshot"))
        .ok_or_else(|| "Character data not found".to_string())?;

    if char_data["items"].is_array() || char_data["equipment"].is_array() {
        Ok(char_data.clone())
    } else {
        Err("No valid item array in character snapshot".to_string())
    }
}
