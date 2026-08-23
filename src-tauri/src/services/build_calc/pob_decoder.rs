use std::io::Read;
use base64::Engine;
use flate2::read::ZlibDecoder;
use regex::Regex;
use serde_json::Value;
use crate::models::ninja::NinjaBuildData;
use super::pob_xml_parser::parse_pob_xml;
use super::character_parser::parse_character_window_json;

const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

pub async fn fetch_pob_or_ninja_build(url_or_code: &str) -> Result<NinjaBuildData, String> {
    let clean = url_or_code.trim();
    if clean.contains("poe.ninja") || clean.contains("pathofexile.com/account") {
        return fetch_ninja_profile(clean).await;
    }

    let pobb_code = if clean.contains("pobb.in") {
        let re = Regex::new(r"(?:pobb\.in/)(?:u/[^/]+/)?([a-zA-Z0-9_-]+)").unwrap();
        re.captures(clean).map(|c| c[1].to_string()).unwrap_or_else(|| clean.replace("https://", "").replace("http://", "").replace("pobb.in/", ""))
    } else {
        clean.to_string()
    };

    let client = reqwest::Client::builder().user_agent(DEFAULT_USER_AGENT).timeout(std::time::Duration::from_secs(8)).build().map_err(|e| e.to_string())?;
    let mut xml_text = String::new();

    let api_url = format!("https://api.pobb.in/pob/{}", pobb_code);
    if let Ok(res) = client.get(&api_url).send().await {
        if res.status().is_success() {
            if let Ok(data) = res.json::<Value>().await {
                if let Some(raw) = data["raw"].as_str() { xml_text = decompress_pob_base64(raw)?; }
            }
        }
    }

    if xml_text.is_empty() {
        let raw_url = format!("https://pobb.in/{}/raw", pobb_code);
        if let Ok(res) = client.get(&raw_url).send().await {
            if res.status().is_success() {
                if let Ok(raw) = res.text().await { xml_text = decompress_pob_base64(&raw)?; }
            }
        }
    }

    if xml_text.is_empty() {
        return Err("無法從 pobb.in 解析流派代碼，請確認網址是否正確。".to_string());
    }

    parse_pob_xml(&xml_text, &pobb_code)
}

pub fn decompress_pob_base64(base64_str: &str) -> Result<String, String> {
    let clean = base64_str.trim();
    if clean.starts_with("<PathOfBuilding") || clean.starts_with("<?xml") {
        return Ok(clean.to_string());
    }

    let normalized = clean.replace('-', "+").replace('_', "/");
    let decoded = base64::engine::general_purpose::STANDARD.decode(&normalized)
        .or_else(|_| base64::engine::general_purpose::URL_SAFE.decode(clean))
        .map_err(|e| format!("Base64 解碼失敗: {}", e))?;

    let mut decoder = ZlibDecoder::new(&decoded[..]);
    let mut s = String::new();
    decoder.read_to_string(&mut s).map_err(|e| format!("Zlib 解壓縮失敗: {}", e))?;
    Ok(s)
}

async fn fetch_ninja_profile(url: &str) -> Result<NinjaBuildData, String> {
    let clean = url.trim();
    let (account, league, character) = extract_profile_url_parts(clean)?;

    let account_decoded = urlencoding::decode(&account).unwrap_or(std::borrow::Cow::Borrowed(&account)).to_string();
    let character_decoded = urlencoding::decode(&character).unwrap_or(std::borrow::Cow::Borrowed(&character)).to_string();
    let league_decoded = urlencoding::decode(&league).unwrap_or(std::borrow::Cow::Borrowed(&league)).to_string();

    let client = reqwest::Client::builder().user_agent(DEFAULT_USER_AGENT).timeout(std::time::Duration::from_secs(10)).build().map_err(|e| e.to_string())?;

    if let Ok(data) = try_fetch_ggg_character_window(&client, &account_decoded, &character_decoded).await {
        return parse_character_window_json(&data, &account_decoded, &league_decoded);
    }

    if let Ok(data) = try_fetch_ninja_ssr_snapshot(&client, &account_decoded, &league_decoded, &character_decoded).await {
        return parse_character_window_json(&data, &account_decoded, &league_decoded);
    }

    Err(format!("無法取得角色 '{}' 的裝備資料。請確認該角色在 GGG 官方網站是否已設為公開。", character_decoded))
}

fn extract_profile_url_parts(clean: &str) -> Result<(String, String, String), String> {
    let re_profile = Regex::new(r"poe\.ninja/(?:poe1/)?profile/([^/]+)/([^/]+)/character/([^/?#]+)").unwrap();
    let re_builds = Regex::new(r"poe\.ninja/(?:poe1/)?builds/([^/]+)/character/([^/]+)/([^/?#]+)").unwrap();
    let re_ggg = Regex::new(r"pathofexile\.com/account/view-profile/([^/?#]+).*?[?&]character=([^&#]+)").unwrap();

    if let Some(cap) = re_profile.captures(clean) {
        Ok((cap[1].to_string(), cap[2].to_string(), cap[3].to_string()))
    } else if let Some(cap) = re_builds.captures(clean) {
        Ok((cap[2].to_string(), cap[1].to_string(), cap[3].to_string()))
    } else if let Some(cap) = re_ggg.captures(clean) {
        Ok((cap[1].to_string(), "Standard".to_string(), cap[2].to_string()))
    } else {
        Err("無法辨識的 poe.ninja 或 GGG 角色網址格式，請確認網址完整性。".to_string())
    }
}

async fn try_fetch_ggg_character_window(client: &reqwest::Client, account: &str, character: &str) -> Result<Value, String> {
    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        crate::models::settings::AppSettings::default()
    );
    let account_candidates = vec![account.to_string(), account.replace('-', "#"), settings.account_name.trim().to_string()];

    for acc in account_candidates {
        if acc.is_empty() { continue; }
        let ggg_url = format!("https://www.pathofexile.com/character-window/get-items?accountName={}&character={}", urlencoding::encode(&acc), urlencoding::encode(character));
        let mut req = client.get(&ggg_url).header("Origin", "https://www.pathofexile.com").header("Accept", "application/json");
        if !settings.poesessid.trim().is_empty() {
            req = req.header("Cookie", format!("POESESSID={}", settings.poesessid.trim()));
        }
        if let Ok(res) = req.send().await {
            if res.status().is_success() {
                if let Ok(data) = res.json::<Value>().await {
                    if data["items"].as_array().is_some() { return Ok(data); }
                }
            }
        }
    }
    Err("GGG character window fetch failed".to_string())
}

async fn try_fetch_ninja_ssr_snapshot(client: &reqwest::Client, account: &str, league: &str, character: &str) -> Result<Value, String> {
    let ninja_page_url = format!("https://poe.ninja/poe1/profile/{}/{}/character/{}", urlencoding::encode(account), urlencoding::encode(league), urlencoding::encode(character));
    if let Ok(res) = client.get(&ninja_page_url).header("Accept", "text/html").send().await {
        if res.status().is_success() {
            if let Ok(html) = res.text().await {
                if let Some(start) = html.find("<script id=\"__NEXT_DATA__\" type=\"application/json\">") {
                    let json_start = start + "<script id=\"__NEXT_DATA__\" type=\"application/json\">".len();
                    if let Some(end) = html[json_start..].find("</script>") {
                        let json_str = &html[json_start..json_start + end];
                        if let Ok(val) = serde_json::from_str::<Value>(json_str) {
                            let page_props = &val["props"]["pageProps"];
                            if let Some(char_data) = page_props.get("character").or_else(|| page_props.get("build")).or_else(|| page_props.get("snapshot")) {
                                if char_data["items"].is_array() || char_data["equipment"].is_array() {
                                    return Ok(char_data.clone());
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    Err("Ninja snapshot fetch failed".to_string())
}
