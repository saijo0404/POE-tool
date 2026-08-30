use super::ninja_profile::fetch_ninja_profile;
use super::pob_xml_parser::parse_pob_xml;
use crate::models::ninja::NinjaBuildData;
use base64::Engine;
use flate2::read::ZlibDecoder;
use regex::Regex;
use serde_json::Value;
use std::io::Read;

const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

pub fn is_raw_pob_code(code: &str) -> bool {
    let clean = code.trim();
    if clean.starts_with("<PathOfBuilding")
        || clean.starts_with("<?xml")
        || clean.contains("<PathOfBuilding")
    {
        return true;
    }
    if clean.starts_with("eN")
        || clean.starts_with("eJ")
        || clean.starts_with("eA")
        || clean.starts_with("eF")
    {
        return true;
    }
    if clean.len() > 100
        && !clean.starts_with("http://")
        && !clean.starts_with("https://")
        && !clean.contains("pobb.in")
    {
        return true;
    }
    false
}

pub async fn fetch_pob_or_ninja_build(url_or_code: &str) -> Result<NinjaBuildData, String> {
    let clean = url_or_code.trim();
    if clean.is_empty() {
        return Err("請輸入 pobb.in / poe.ninja 網址或 PoB 匯出代碼。".to_string());
    }

    if clean.contains("poe.ninja") || clean.contains("pathofexile.com/account") {
        return fetch_ninja_profile(clean).await;
    }

    if is_raw_pob_code(clean) {
        let xml_text = decompress_pob_base64(clean)?;
        return parse_pob_xml(&xml_text, "Local PoB");
    }

    fetch_pobbin_build(clean).await
}

async fn fetch_pobbin_build(clean: &str) -> Result<NinjaBuildData, String> {
    let pobb_code = extract_pobbin_code(clean);

    let client = reqwest::Client::builder()
        .user_agent(DEFAULT_USER_AGENT)
        .timeout(std::time::Duration::from_secs(8))
        .build()
        .map_err(|e| e.to_string())?;

    if let Some(xml_text) = try_fetch_pobbin_api(&client, &pobb_code).await {
        return parse_pob_xml(&xml_text, &pobb_code);
    }

    if let Some(xml_text) = try_fetch_pobbin_raw(&client, &pobb_code).await {
        return parse_pob_xml(&xml_text, &pobb_code);
    }

    Err("無法從 pobb.in 解析流派代碼，請確認網址是否正確。".to_string())
}

fn extract_pobbin_code(clean: &str) -> String {
    if clean.contains("pobb.in") {
        let re = Regex::new(r"(?:pobb\.in/)(?:u/[^/]+/)?([a-zA-Z0-9_-]+)").unwrap();
        re.captures(clean)
            .map(|c| c[1].to_string())
            .unwrap_or_else(|| {
                clean
                    .replace("https://", "")
                    .replace("http://", "")
                    .replace("pobb.in/", "")
            })
    } else {
        clean.to_string()
    }
}

async fn try_fetch_pobbin_api(client: &reqwest::Client, pobb_code: &str) -> Option<String> {
    let api_url = format!("https://api.pobb.in/pob/{}", pobb_code);
    let res = client.get(&api_url).send().await.ok()?;
    if !res.status().is_success() {
        return None;
    }
    let data = res.json::<Value>().await.ok()?;
    let raw = data["raw"].as_str()?;
    decompress_pob_base64(raw).ok()
}

async fn try_fetch_pobbin_raw(client: &reqwest::Client, pobb_code: &str) -> Option<String> {
    let raw_url = format!("https://pobb.in/{}/raw", pobb_code);
    let res = client.get(&raw_url).send().await.ok()?;
    if !res.status().is_success() {
        return None;
    }
    let raw = res.text().await.ok()?;
    decompress_pob_base64(&raw).ok()
}

pub fn decompress_pob_base64(base64_str: &str) -> Result<String, String> {
    let clean = base64_str.trim();
    if clean.starts_with("<PathOfBuilding")
        || clean.starts_with("<?xml")
        || clean.contains("<PathOfBuilding")
    {
        return Ok(clean.to_string());
    }

    let compact: String = clean.chars().filter(|c| !c.is_whitespace()).collect();
    let normalized = compact.replace('-', "+").replace('_', "/");
    let decoded = base64::engine::general_purpose::STANDARD
        .decode(&normalized)
        .or_else(|_| base64::engine::general_purpose::URL_SAFE.decode(&compact))
        .map_err(|e| format!("Base64 解碼失敗: {}", e))?;

    let mut decoder = ZlibDecoder::new(&decoded[..]);
    let mut s = String::new();
    decoder
        .read_to_string(&mut s)
        .map_err(|e| format!("Zlib 解壓縮失敗: {}", e))?;
    Ok(s)
}
