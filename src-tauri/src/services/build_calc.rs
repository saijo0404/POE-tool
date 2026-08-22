use std::io::Read;
use base64::Engine;
use flate2::read::ZlibDecoder;
use lazy_static::lazy_static;
use regex::Regex;
use serde_json::Value;
use crate::models::ninja::{
    BuildCategories, BuildCategoryTotal, BuildCharacterMeta, BuildCostResult,
    NinjaBuildData, NinjaBuildFlask, NinjaBuildItem, NinjaBuildJewel, PricedItem
};
use super::ninja::fetch_ninja_prices;
use crate::services::parser::{ROLL_RANGE_RE, VALUE_EXTRACT_RE};

const DEFAULT_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

lazy_static! {
    static ref LIFE_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)\s+to\s+maximum\s+Life|\+(\d+(?:\.\d+)?)\s*最大生命").unwrap();
    static ref STR_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)\s+to\s+Strength|\+(\d+(?:\.\d+)?)\s*力量").unwrap();
    static ref ALL_ATTR_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)\s+to\s+all\s+Attributes|\+(\d+(?:\.\d+)?)\s*全部能力").unwrap();
    
    static ref FLAT_ES_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)\s+to\s+maximum\s+Energy\s+Shield|\+(\d+(?:\.\d+)?)\s*最大能量護盾").unwrap();
    static ref INC_ES_RE: Regex = Regex::new(r"(?i)(\d+(?:\.\d+)?)%\s+increased\s+(?:maximum\s+)?Energy\s+Shield|增加\s*(\d+(?:\.\d+)?)%\s*能量護盾").unwrap();
    static ref INT_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)\s+to\s+Intelligence|\+(\d+(?:\.\d+)?)\s*智慧").unwrap();
    
    static ref FIRE_RES_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+Fire\s+Resistance|\+(\d+(?:\.\d+)?)%\s*火焰抗性").unwrap();
    static ref COLD_RES_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+Cold\s+Resistance|\+(\d+(?:\.\d+)?)%\s*冰冷抗性").unwrap();
    static ref LIGHTNING_RES_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+Lightning\s+Resistance|\+(\d+(?:\.\d+)?)%\s*閃電抗性").unwrap();
    static ref ALL_ELE_RES_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+all\s+Elemental\s+Resistances|\+(\d+(?:\.\d+)?)%\s*全部元素抗性").unwrap();
    static ref TWO_ELE_RES_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+(?:Fire|Cold|Lightning)\s+and\s+(?:Fire|Cold|Lightning)\s+Resistances|\+(\d+(?:\.\d+)?)%\s*(?:火焰|冰冷|閃電)和(?:火焰|冰冷|閃電)抗性").unwrap();
    
    static ref CHAOS_RES_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+Chaos\s+Resistance|\+(\d+(?:\.\d+)?)%\s*混沌抗性").unwrap();
    static ref SUPP_RE: Regex = Regex::new(r"(?i)\+?(\d+(?:\.\d+)?)%\s+chance\s+to\s+Suppress\s+Spell\s+Damage|壓抑法術傷害率\s*\+?(\d+(?:\.\d+)?)%|\+(\d+(?:\.\d+)?)%\s*法術壓抑").unwrap();
    static ref MS_RE: Regex = Regex::new(r"(?i)\+?(\d+(?:\.\d+)?)%\s+increased\s+Movement\s+Speed|增加\s*(\d+(?:\.\d+)?)%\s*移動速度").unwrap();
    
    static ref CRIT_MULTI_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+(?:Global\s+)?Critical\s+Strike\s+Multiplier|\+(\d+(?:\.\d+)?)%\s*暴擊傷害加成").unwrap();
    static ref DOT_MULTI_RE: Regex = Regex::new(r"(?i)\+(\d+(?:\.\d+)?)%\s+to\s+(?:[A-Za-z]+\s+)?Damage\s+over\s+Time\s+Multiplier|\+(\d+(?:\.\d+)?)%\s*(?:持續|混沌|冰冷|火焰|物理)傷害加成").unwrap();
    static ref GEM_LEVEL_RE: Regex = Regex::new(r"(?i)\+(\d+)\s+to\s+Level\s+of\s+|\+(\d+)\s*等級").unwrap();
}

pub async fn fetch_pob_or_ninja_build(url_or_code: &str) -> Result<NinjaBuildData, String> {
    let clean = url_or_code.trim();

    // 1. Check if it is a poe.ninja profile/builds link or GGG account profile link
    if clean.contains("poe.ninja") || clean.contains("pathofexile.com/account") {
        return fetch_ninja_profile(clean).await;
    }

    // 2. pobb.in or base64 code
    let pobb_code = if clean.contains("pobb.in") {
        let re = Regex::new(r"(?:pobb\.in/)(?:u/[^/]+/)?([a-zA-Z0-9_-]+)").unwrap();
        re.captures(clean).map(|c| c[1].to_string()).unwrap_or_else(|| clean.replace("https://", "").replace("http://", "").replace("pobb.in/", ""))
    } else {
        clean.to_string()
    };

    let client = reqwest::Client::builder()
        .user_agent(DEFAULT_USER_AGENT)
        .timeout(std::time::Duration::from_secs(8))
        .build()
        .map_err(|e| e.to_string())?;

    let mut xml_text = String::new();

    // Try pobb.in API
    let api_url = format!("https://api.pobb.in/pob/{}", pobb_code);
    if let Ok(res) = client.get(&api_url).send().await {
        if res.status().is_success() {
            if let Ok(data) = res.json::<Value>().await {
                if let Some(raw) = data["raw"].as_str() {
                    xml_text = decompress_pob_base64(raw)?;
                }
            }
        }
    }

    if xml_text.is_empty() {
        let raw_url = format!("https://pobb.in/{}/raw", pobb_code);
        if let Ok(res) = client.get(&raw_url).send().await {
            if res.status().is_success() {
                if let Ok(raw) = res.text().await {
                    xml_text = decompress_pob_base64(&raw)?;
                }
            }
        }
    }

    if xml_text.is_empty() {
        return Err("無法從 pobb.in 解析流派代碼，請確認網址是否正確。".to_string());
    }

    parse_pob_xml(&xml_text, &pobb_code)
}

fn decompress_pob_base64(base64_str: &str) -> Result<String, String> {
    let clean = base64_str.trim();
    if clean.starts_with("<PathOfBuilding") || clean.starts_with("<?xml") {
        return Ok(clean.to_string());
    }

    let normalized = clean.replace('-', "+").replace('_', "/");
    let decoded = base64::engine::general_purpose::STANDARD.decode(normalized)
        .or_else(|_| base64::engine::general_purpose::URL_SAFE.decode(clean))
        .map_err(|e| format!("Base64 解碼失敗: {}", e))?;

    let mut decoder = ZlibDecoder::new(&decoded[..]);
    let mut s = String::new();
    decoder.read_to_string(&mut s).map_err(|e| format!("Zlib 解壓縮失敗: {}", e))?;
    Ok(s)
}

fn parse_pob_xml(xml: &str, code: &str) -> Result<NinjaBuildData, String> {
    let class_re = Regex::new(r#"className="([^"]+)""#).unwrap();
    let ascend_re = Regex::new(r#"ascendClassName="([^"]+)""#).unwrap();
    let level_re = Regex::new(r#"level="([^"]+)""#).unwrap();
    let league_re = Regex::new(r#"league="([^"]+)""#).unwrap();

    let class_name = class_re.captures(xml).map(|c| c[1].to_string()).unwrap_or_else(|| "Unknown".to_string());
    let ascendancy = ascend_re.captures(xml).map(|c| c[1].to_string()).unwrap_or_else(|| "None".to_string());
    let level = level_re.captures(xml).and_then(|c| c[1].parse::<i64>().ok()).unwrap_or(90);
    let league = league_re.captures(xml).map(|c| c[1].to_string()).unwrap_or_else(|| "Standard".to_string());

    let mut equipment = Vec::new();
    let mut flasks = Vec::new();
    let mut jewels = Vec::new();
    let gems = Vec::new();

    let item_re = Regex::new(r#"(?s)<Item\s+id="[^"]*"[^>]*>(.*?)</Item>"#).unwrap();

    for cap in item_re.captures_iter(xml) {
        let content = &cap[1];
        let lines: Vec<&str> = content.lines().map(|l| l.trim()).filter(|l| !l.is_empty()).collect();
        if lines.is_empty() {
            continue;
        }

        let mut rarity = "Rare".to_string();
        let mut item_level = 85;
        let mut content_lines = Vec::new();

        for line in lines {
            if line.starts_with("Rarity:") {
                rarity = line.replace("Rarity:", "").trim().to_string();
            } else if line.starts_with("Item Level:") {
                item_level = line.replace("Item Level:", "").trim().parse::<i64>().unwrap_or(85);
            } else if !line.starts_with("Quality:") && !line.starts_with("Sockets:") && !line.starts_with("LevelReq:") && !line.starts_with("Implicits:") && !line.starts_with('{') {
                content_lines.push(line);
            }
        }

        let name = content_lines.first().copied().unwrap_or("").to_string();
        let type_line = if content_lines.len() > 1 { content_lines[1].to_string() } else { name.clone() };
        let mods: Vec<String> = content_lines.iter().skip(2).map(|s| s.to_string()).collect();

        if type_line.contains("Flask") || name.contains("Flask") {
            flasks.push(NinjaBuildFlask {
                name,
                type_line,
                rarity,
                icon: "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvRmxhc2tzL2ZsYXNrMSIsInciOjEsImgiOjIsInNjYWxlIjoxfV0/6be457f5c5/flask1.png".to_string(),
                explicit_mods: mods,
                utility_mods: Vec::new(),
                enchant_mods: Vec::new(),
            });
        } else if type_line.contains("Jewel") || name.contains("Jewel") || type_line.contains("Cluster") {
            jewels.push(NinjaBuildJewel {
                name,
                type_line,
                rarity,
                icon: "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvSmV3ZWxzL2Jhc2ljMSIsInciOjEsImgiOjEsInNjYWxlIjoxfV0/d0ff9e4726/basic1.png".to_string(),
                explicit_mods: mods,
                implicit_mods: Vec::new(),
                crafted_mods: Vec::new(),
                fractured_mods: Vec::new(),
            });
        } else if !name.is_empty() {
            equipment.push(NinjaBuildItem {
                name,
                type_line,
                slot: "Equipment".to_string(),
                rarity,
                icon: "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQXJtb3Vycy9IZWxtZXRzL0hlbG1ldDIiLCJ3IjoyLCJoIjoyLCJzY2FsZSI6MX1d/5ba9788f6c/Helmet2.png".to_string(),
                ilvl: item_level,
                corrupted: false,
                explicit_mods: mods,
                implicit_mods: Vec::new(),
                crafted_mods: Vec::new(),
                fractured_mods: Vec::new(),
                enchant_mods: Vec::new(),
                links: None,
                property_energy_shield: None,
                property_armour: None,
                property_evasion: None,
            });
        }
    }

    Ok(NinjaBuildData {
        account: "pobb.in".to_string(),
        character_name: code.to_string(),
        league,
        level,
        class_name,
        ascendancy,
        equipment,
        gems,
        flasks,
        jewels,
    })
}

async fn fetch_ninja_profile(url: &str) -> Result<NinjaBuildData, String> {
    let clean = url.trim();
    crate::app_log!("[BuildCalc] 🔍 正在解析 poe.ninja / GGG 角色網址: {}", clean);

    // 格式 1: https://poe.ninja/poe1/profile/{account}/{league}/character/{character}
    let re_profile = Regex::new(r"poe\.ninja/(?:poe1/)?profile/([^/]+)/([^/]+)/character/([^/?#]+)").unwrap();
    // 格式 2: https://poe.ninja/poe1/builds/{league}/character/{account}/{character}
    let re_builds = Regex::new(r"poe\.ninja/(?:poe1/)?builds/([^/]+)/character/([^/]+)/([^/?#]+)").unwrap();
    // 格式 3: https://www.pathofexile.com/account/view-profile/{account}/characters?character={character}
    let re_ggg = Regex::new(r"pathofexile\.com/account/view-profile/([^/?#]+).*?[?&]character=([^&#]+)").unwrap();

    let (account, league, character) = if let Some(cap) = re_profile.captures(clean) {
        (cap[1].to_string(), cap[2].to_string(), cap[3].to_string())
    } else if let Some(cap) = re_builds.captures(clean) {
        (cap[2].to_string(), cap[1].to_string(), cap[3].to_string())
    } else if let Some(cap) = re_ggg.captures(clean) {
        (cap[1].to_string(), "Standard".to_string(), cap[2].to_string())
    } else {
        return Err("無法辨識的 poe.ninja 或 GGG 角色網址格式，請確認網址完整性。".to_string());
    };

    let account_decoded = urlencoding::decode(&account).unwrap_or(std::borrow::Cow::Borrowed(&account)).to_string();
    let character_decoded = urlencoding::decode(&character).unwrap_or(std::borrow::Cow::Borrowed(&character)).to_string();
    let league_decoded = urlencoding::decode(&league).unwrap_or(std::borrow::Cow::Borrowed(&league)).to_string();

    crate::app_log!("[BuildCalc] 🎯 成功辨識角色資訊: 帳號='{}', 聯盟='{}', 角色名='{}'", account_decoded, league_decoded, character_decoded);

    let client = reqwest::Client::builder()
        .user_agent(DEFAULT_USER_AGENT)
        .timeout(std::time::Duration::from_secs(10))
        .build()
        .map_err(|e| e.to_string())?;

    let settings = crate::services::storage::read_json_safe(
        &crate::services::storage::get_data_dir().join("settings.json"),
        crate::models::settings::AppSettings::default()
    );

    // ── 嘗試 1: 直接向 GGG 官方 Character API 獲取裝備與人物數據 ──
    let account_candidates = vec![
        account_decoded.clone(),
        account_decoded.replace('-', "#"),
        settings.account_name.trim().to_string(),
    ];

    for acc in account_candidates {
        if acc.is_empty() {
            continue;
        }
        let ggg_url = format!(
            "https://www.pathofexile.com/character-window/get-items?accountName={}&character={}",
            urlencoding::encode(&acc),
            urlencoding::encode(&character_decoded)
        );

        let mut req = client.get(&ggg_url)
            .header("Origin", "https://www.pathofexile.com")
            .header("Referer", "https://www.pathofexile.com/")
            .header("X-Requested-With", "XMLHttpRequest")
            .header("Accept", "application/json");

        if !settings.poesessid.trim().is_empty() {
            req = req.header("Cookie", format!("POESESSID={}", settings.poesessid.trim()));
        }

        if let Ok(res) = req.send().await {
            if res.status().is_success() {
                if let Ok(data) = res.json::<Value>().await {
                    if data["items"].as_array().is_some() {
                        crate::app_log!("[BuildCalc] ✅ 成功從 GGG 官方 Character API 取得完整角色裝備清單！");
                        return parse_character_window_json(&data, &acc, &league_decoded);
                    }
                }
            }
        }
    }

    // ── 嘗試 2: 若 GGG 設定為公開隱私或未開，從 poe.ninja 抓取該角色網頁 SSR 快照 ──
    let ninja_page_url = format!(
        "https://poe.ninja/poe1/profile/{}/{}/character/{}",
        urlencoding::encode(&account_decoded),
        urlencoding::encode(&league_decoded),
        urlencoding::encode(&character_decoded)
    );

    let ninja_req = client.get(&ninja_page_url)
        .header("Accept", "text/html,application/xhtml+xml,application/json")
        .header("Referer", "https://poe.ninja/");

    if let Ok(res) = ninja_req.send().await {
        if res.status().is_success() {
            if let Ok(html) = res.text().await {
                // 尋找 Next.js JSON 數據 <script id="__NEXT_DATA__" type="application/json">...</script>
                if let Some(start) = html.find("<script id=\"__NEXT_DATA__\" type=\"application/json\">") {
                    let json_start = start + "<script id=\"__NEXT_DATA__\" type=\"application/json\">".len();
                    if let Some(end) = html[json_start..].find("</script>") {
                        let json_str = &html[json_start..json_start + end];
                        if let Ok(val) = serde_json::from_str::<Value>(json_str) {
                            let page_props = &val["props"]["pageProps"];
                            if let Some(char_data) = page_props.get("character").or_else(|| page_props.get("build")).or_else(|| page_props.get("snapshot")) {
                                if char_data["items"].is_array() || char_data["equipment"].is_array() {
                                    crate::app_log!("[BuildCalc] ✅ 成功從 poe.ninja 快照資料解析出角色裝備！");
                                    return parse_character_window_json(char_data, &account_decoded, &league_decoded);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Err(format!(
        "無法取得角色 '{}' 的裝備資料。請確認該角色在 GGG 官方網站是否已設為公開，或在設定中填妥您的 POESESSID 進行存取。",
        character_decoded
    ))
}

fn extract_mods_from_json(val: &Value) -> Vec<String> {
    let mut results = Vec::new();
    if let Some(arr) = val.as_array() {
        for m in arr {
            if let Some(s) = m.as_str() {
                for line in s.lines() {
                    let trimmed = line.trim();
                    if !trimmed.is_empty() {
                        results.push(trimmed.to_string());
                    }
                }
            } else if let Some(obj) = m.as_object() {
                let desc_opt = obj.get("description")
                    .or_else(|| obj.get("text"))
                    .or_else(|| obj.get("name"))
                    .or_else(|| obj.get("value"))
                    .and_then(|v| v.as_str());
                if let Some(s) = desc_opt {
                    for line in s.lines() {
                        let trimmed = line.trim();
                        if !trimmed.is_empty() {
                            results.push(trimmed.to_string());
                        }
                    }
                }
            }
        }
    }
    results
}

fn extract_property_numeric_value(properties: Option<&Vec<Value>>, names: &[&str]) -> Option<f64> {
    let props = properties?;
    for p in props {
        let p_name = p["name"].as_str().unwrap_or_default();
        if names.iter().any(|&target| p_name.eq_ignore_ascii_case(target)) {
            if let Some(val_arr) = p["values"].as_array().and_then(|v| v.first()).and_then(|row| row.as_array()).and_then(|pair| pair.first()) {
                if let Some(s) = val_arr.as_str() {
                    let cleaned = s.replace('%', "").replace('+', "").trim().to_string();
                    if let Ok(v) = cleaned.parse::<f64>() {
                        return Some(v);
                    }
                } else if let Some(v) = val_arr.as_f64() {
                    return Some(v);
                } else if let Some(v) = val_arr.as_i64() {
                    return Some(v as f64);
                }
            }
        }
    }
    None
}

fn parse_character_window_json(data: &Value, account: &str, fallback_league: &str) -> Result<NinjaBuildData, String> {
    let char_obj = &data["character"];
    let character_name = char_obj["name"].as_str().or_else(|| data["name"].as_str()).unwrap_or("Character").to_string();
    let league = char_obj["league"].as_str().or_else(|| data["league"].as_str()).unwrap_or(fallback_league).to_string();
    let class_name = char_obj["class"].as_str().or_else(|| data["class"].as_str()).unwrap_or("Unknown").to_string();
    let ascendancy = char_obj["ascendancyClass"].as_str().or_else(|| char_obj["class"].as_str()).unwrap_or(&class_name).to_string();
    let level = char_obj["level"].as_i64().or_else(|| data["level"].as_i64()).unwrap_or(90);

    let raw_items = data["items"].as_array().or_else(|| data["equipment"].as_array()).cloned().unwrap_or_default();

    if let Some(first_item) = raw_items.first() {
        crate::app_log!("[BuildCalc DEBUG] 📦 GGG/Ninja 原始物品樣本 [0]: {}", serde_json::to_string(first_item).unwrap_or_default());
    }

    let mut equipment = Vec::new();
    let mut flasks = Vec::new();
    let mut jewels = Vec::new();
    let mut gems = Vec::new();

    for it in &raw_items {
        let inv_id = it["inventoryId"].as_str().unwrap_or_default();
        let type_line = it["typeLine"].as_str().or_else(|| it["name"].as_str()).unwrap_or_default().to_string();
        let name = it["name"].as_str().unwrap_or(&type_line).to_string();
        let icon = it["icon"].as_str().unwrap_or_default().to_string();
        let ilvl = it["ilvl"].as_i64().unwrap_or(85);
        let corrupted = it["corrupted"].as_bool().unwrap_or(false);
        let frame_type = it["frameType"].as_i64().unwrap_or(0);
        let rarity = match frame_type {
            1 => "Magic",
            2 => "Rare",
            3 => "Unique",
            4 => "Gem",
            5 => "Currency",
            _ => "Normal",
        }.to_string();

        let explicit_mods = extract_mods_from_json(&it["explicitMods"]);
        let implicit_mods = extract_mods_from_json(&it["implicitMods"]);
        let crafted_mods = extract_mods_from_json(&it["craftedMods"]);
        let fractured_mods = extract_mods_from_json(&it["fracturedMods"]);
        let enchant_mods = extract_mods_from_json(&it["enchantMods"]);
        let utility_mods = extract_mods_from_json(&it["utilityMods"]);

        let props_vec = it["properties"].as_array();
        let property_energy_shield = extract_property_numeric_value(props_vec, &["Energy Shield", "能量護盾"]);
        let property_armour = extract_property_numeric_value(props_vec, &["Armour", "護甲"]);
        let property_evasion = extract_property_numeric_value(props_vec, &["Evasion Rating", "閃避值", "閃避"]);

        let links = it["sockets"].as_array().and_then(|sockets| {
            let mut group_counts = std::collections::HashMap::new();
            for s in sockets {
                if let Some(g) = s["group"].as_i64() {
                    *group_counts.entry(g).or_insert(0i64) += 1;
                }
            }
            group_counts.values().copied().max()
        });

        let slot_name = match inv_id {
            "Helm" => "Helm",
            "BodyArmour" => "BodyArmour",
            "Gloves" => "Gloves",
            "Boots" => "Boots",
            "Weapon" => "Weapon",
            "Weapon2" => "Weapon2",
            "Offhand" => "Offhand",
            "Offhand2" => "Offhand2",
            "Ring" => "Ring",
            "Ring2" => "Ring2",
            "Amulet" => "Amulet",
            "Belt" => "Belt",
            other => if other.is_empty() { "Equipment" } else { other },
        }.to_string();

        crate::app_log!(
            "[BuildCalc DEBUG] 📦 角色物品: slot='{}' (invId='{}'), name='{}', type='{}', rarity='{}', links={:?}, ES={:?}, Arm={:?}, Eva={:?}, explicits={}, implicits={}, crafted={}, fractured={}, enchant={}",
            slot_name, inv_id, name, type_line, rarity, links, property_energy_shield, property_armour, property_evasion, explicit_mods.len(), implicit_mods.len(), crafted_mods.len(), fractured_mods.len(), enchant_mods.len()
        );
        if !explicit_mods.is_empty() {
            crate::app_log!("   └─ explicitMods: {:?}", explicit_mods);
        }
        if !crafted_mods.is_empty() {
            crate::app_log!("   └─ craftedMods: {:?}", crafted_mods);
        }
        if !fractured_mods.is_empty() {
            crate::app_log!("   └─ fracturedMods: {:?}", fractured_mods);
        }
        if !implicit_mods.is_empty() {
            crate::app_log!("   └─ implicitMods: {:?}", implicit_mods);
        }
        if !enchant_mods.is_empty() {
            crate::app_log!("   └─ enchantMods: {:?}", enchant_mods);
        }

        if inv_id == "Flask" || type_line.contains("Flask") || name.contains("Flask") {
            flasks.push(NinjaBuildFlask {
                name,
                type_line,
                rarity,
                icon,
                explicit_mods,
                utility_mods,
                enchant_mods,
            });
        } else if inv_id == "PassiveJewels" || type_line.contains("Jewel") || name.contains("Jewel") || type_line.contains("Cluster") {
            jewels.push(NinjaBuildJewel {
                name,
                type_line,
                rarity,
                icon,
                explicit_mods,
                implicit_mods,
                crafted_mods,
                fractured_mods,
            });
        } else if frame_type == 4 || inv_id == "Gems" || type_line.contains("Gem") {
            gems.push(crate::models::ninja::NinjaBuildGem {
                name,
                level: 20,
                quality: 20,
                icon,
                socketed_in: inv_id.to_string(),
                is_support: false,
                is_vaal: false,
                is_awakened: false,
            });
        } else if !type_line.is_empty() {
            equipment.push(NinjaBuildItem {
                name,
                type_line,
                slot: slot_name,
                rarity,
                icon,
                ilvl,
                corrupted,
                explicit_mods,
                implicit_mods,
                crafted_mods,
                fractured_mods,
                enchant_mods,
                links,
                property_energy_shield,
                property_armour,
                property_evasion,
            });
        }

        // Check for socketed gems inside items
        if let Some(socketed) = it["socketedItems"].as_array() {
            for gem_it in socketed {
                if gem_it["frameType"].as_i64() == Some(4) {
                    let g_type = gem_it["typeLine"].as_str().unwrap_or("Gem").to_string();
                    let g_icon = gem_it["icon"].as_str().unwrap_or_default().to_string();
                    gems.push(crate::models::ninja::NinjaBuildGem {
                        name: g_type,
                        level: 20,
                        quality: 20,
                        icon: g_icon,
                        socketed_in: inv_id.to_string(),
                        is_support: false,
                        is_vaal: false,
                        is_awakened: false,
                    });
                }
            }
        }
    }

    Ok(NinjaBuildData {
        account: account.to_string(),
        character_name,
        league,
        level,
        class_name,
        ascendancy,
        equipment,
        gems,
        flasks,
        jewels,
    })
}

pub async fn calculate_build_cost(build_data: NinjaBuildData) -> Result<BuildCostResult, String> {
    crate::app_log!("[BuildCalc] 📊 開始計算 Build 成本: 角色='{}', 聯盟='{}', 等級={}, 職業='{}'",
        build_data.character_name, build_data.league, build_data.level, build_data.ascendancy
    );
    crate::app_log!("[BuildCalc] 📦 角色物品清單: 裝備共 {} 件, 珠寶 {} 顆, 藥劑 {} 瓶, 技能寶石 {} 顆",
        build_data.equipment.len(), build_data.jewels.len(), build_data.flasks.len(), build_data.gems.len()
    );

    let ninja_data = fetch_ninja_prices(&build_data.league, false).await.unwrap_or_else(|_| {
        crate::models::ninja::NinjaPricesResult {
            rates: super::ninja::get_accurate_bulk_rates(),
            divine_chaos_rate: 150.0,
            league: build_data.league.clone(),
        }
    });

    let div_rate = ninja_data.divine_chaos_rate;

    // ── 1. 裝備估算 (Equipment) ──
    let mut eq_items = Vec::new();
    let mut eq_chaos = 0.0;

    for it in &build_data.equipment {
        let eng_name = crate::services::dictionary::lookup_english_base_type(&it.name).unwrap_or_else(|| it.name.clone());
        let eng_type = crate::services::dictionary::lookup_english_base_type(&it.type_line).unwrap_or_else(|| it.type_line.clone());

        let (price_chaos, conf, details) = if it.rarity.eq_ignore_ascii_case("unique") {
            let p_opt = ninja_data.rates.get(&eng_name)
                .or_else(|| ninja_data.rates.get(&eng_type))
                .or_else(|| ninja_data.rates.get(&it.name));

            if let Some(&p) = p_opt {
                (p, "high", "poe.ninja 傳奇即時行情".to_string())
            } else if eng_name.contains("Dragonfang") {
                let is_meta_skill = it.explicit_mods.iter().any(|m| {
                    m.contains("Glacial Cascade") || m.contains("Hexblast") || m.contains("Spark")
                    || m.contains("Tornado Shot") || m.contains("Lightning Strike") || m.contains("Blade Vortex")
                    || m.contains("Ice Nova") || m.contains("Righteous Fire") || m.contains("Detonate Dead")
                });
                if is_meta_skill {
                    (10.0 * div_rate, "medium", "熱門技能龍牙之翔行情估算 (建議點擊同步官方現貨)".to_string())
                } else {
                    (35.0, "medium", "傳奇裝備基礎估算價".to_string())
                }
            } else {
                (25.0, "medium", "傳奇裝備基礎估算價".to_string())
            }
        } else {
            let is_six_link = it.links.unwrap_or(0) >= 6 || it.explicit_mods.iter().any(|m| m.contains("6 連") || m.contains("6-link"));
            let es_val = it.property_energy_shield.unwrap_or(0.0);
            let has_plus_two = it.implicit_mods.iter().chain(it.explicit_mods.iter()).any(|m| m.contains("+2 to Level of Socketed Skill Gems") || m.contains("+2 to Level of all"));
            let has_plus_one = it.implicit_mods.iter().chain(it.explicit_mods.iter()).any(|m| m.contains("+1 to Level of all"));

            let mut estimated_div = 0.5;
            let mut reasons = Vec::new();

            if es_val >= 900.0 {
                estimated_div += 15.0;
                reasons.push("900+ ES 頂級護盾");
            } else if es_val >= 700.0 {
                estimated_div += 6.0;
                reasons.push("700+ ES 高階護盾");
            } else if es_val >= 300.0 && it.slot != "BodyArmour" {
                estimated_div += 4.0;
                reasons.push("300+ ES 部位");
            }

            if has_plus_two {
                estimated_div += 18.0;
                reasons.push("+2 技能寶石等級");
            } else if has_plus_one {
                estimated_div += 4.0;
                reasons.push("+1 技能寶石等級");
            }

            if is_six_link {
                estimated_div += 2.0;
                reasons.push("6連線");
            }

            let detail_text = if !reasons.is_empty() {
                format!("稀有裝備 (含 {})", reasons.join(", "))
            } else {
                "黃裝詞綴市場估算價 (可點擊 Trade 開啟官方市集篩選)".to_string()
            };

            let calc_chaos = (estimated_div * div_rate).round();
            (calc_chaos, "medium", detail_text)
        };

        crate::app_log!("[BuildCalc] 🛡️ 裝備 [{}] name='{}' (基底: '{}' -> '{}'), 稀有度={}, 行情估算: {:.1} Chaos ({})",
            it.slot, it.name, it.type_line, eng_type, it.rarity, price_chaos, conf
        );

        let price_div = (price_chaos / div_rate * 100.0).round() / 100.0;
        eq_chaos += price_chaos;

        let (search_url, query_json) = generate_trade_search_query(
            &build_data.league,
            &eng_name,
            &eng_type,
            &it.rarity,
            &it.slot,
            it.links,
            &it.explicit_mods,
            &it.implicit_mods,
            &it.crafted_mods,
            &it.fractured_mods,
            &it.enchant_mods,
            it.property_energy_shield,
            it.property_armour,
            it.property_evasion,
            None,
            None,
            None,
        );

        let display_name = if !it.name.is_empty() && it.name != it.type_line {
            format!("{} ({})", it.name, it.type_line)
        } else {
            it.type_line.clone()
        };

        eq_items.push(PricedItem {
            name: display_name,
            type_line: it.type_line.clone(),
            category: "equipment".to_string(),
            rarity: it.rarity.clone(),
            icon: it.icon.clone(),
            slot: Some(it.slot.clone()),
            price_chaos,
            price_divine: price_div,
            confidence: conf.to_string(),
            details: Some(details),
            trade_search_url: search_url,
            trade_query_json: Some(query_json),
        });
    }

    // ── 2. 珠寶估算 (Jewels & Clusters) ──
    let mut jewel_items = Vec::new();
    let mut jewel_chaos = 0.0;

    for j in &build_data.jewels {
        let eng_name = crate::services::dictionary::lookup_english_base_type(&j.name).unwrap_or_else(|| j.name.clone());
        let eng_type = crate::services::dictionary::lookup_english_base_type(&j.type_line).unwrap_or_else(|| j.type_line.clone());

        let (p, conf, details) = if j.rarity.eq_ignore_ascii_case("unique") {
            let p_opt = ninja_data.rates.get(&eng_name)
                .or_else(|| ninja_data.rates.get(&eng_type))
                .or_else(|| ninja_data.rates.get(&j.name));

            if let Some(&val) = p_opt {
                (val, "high", "poe.ninja 傳奇珠寶即時物價".to_string())
            } else {
                (35.0, "medium", "傳奇珠寶基礎估算價".to_string())
            }
        } else {
            (50.0, "medium", "稀有 / 星團珠寶市場估算價".to_string())
        };

        crate::app_log!("[BuildCalc] 💎 珠寶 name='{}' (基底: '{}' -> '{}'), 稀有度={}, 行情估算: {:.1} Chaos ({})",
            j.name, j.type_line, eng_type, j.rarity, p, conf
        );

        let p_div = (p / div_rate * 100.0).round() / 100.0;
        jewel_chaos += p;

        let (search_url, query_json) = generate_trade_search_query(
            &build_data.league,
            &eng_name,
            &eng_type,
            &j.rarity,
            "Jewel",
            None,
            &j.explicit_mods,
            &j.implicit_mods,
            &j.crafted_mods,
            &j.fractured_mods,
            &[],
            None,
            None,
            None,
            None,
            None,
            None,
        );

        let display_name = if !j.name.is_empty() && j.name != j.type_line {
            format!("{} ({})", j.name, j.type_line)
        } else {
            j.type_line.clone()
        };

        jewel_items.push(PricedItem {
            name: display_name,
            type_line: j.type_line.clone(),
            category: "jewel".to_string(),
            rarity: j.rarity.clone(),
            icon: j.icon.clone(),
            slot: None,
            price_chaos: p,
            price_divine: p_div,
            confidence: conf.to_string(),
            details: Some(details),
            trade_search_url: search_url,
            trade_query_json: Some(query_json),
        });
    }

    // ── 3. 藥劑估算 (Flasks) ──
    let mut flask_items = Vec::new();
    let mut flask_chaos = 0.0;

    for f in &build_data.flasks {
        let eng_name = crate::services::dictionary::lookup_english_base_type(&f.name).unwrap_or_else(|| f.name.clone());
        let eng_type = crate::services::dictionary::lookup_english_base_type(&f.type_line).unwrap_or_else(|| f.type_line.clone());

        let (p, conf, details) = if f.rarity.eq_ignore_ascii_case("unique") {
            let p_opt = ninja_data.rates.get(&eng_name)
                .or_else(|| ninja_data.rates.get(&eng_type))
                .or_else(|| ninja_data.rates.get(&f.name));

            if let Some(&val) = p_opt {
                (val, "high", "poe.ninja 傳奇藥劑即時行情".to_string())
            } else {
                (30.0, "medium", "傳奇藥劑基礎估算價".to_string())
            }
        } else {
            (25.0, "high", "實用魔法藥劑標準參考價".to_string())
        };

        crate::app_log!("[BuildCalc] 🧪 藥劑 name='{}' (基底: '{}' -> '{}'), 稀有度={}, 行情估算: {:.1} Chaos ({})",
            f.name, f.type_line, eng_type, f.rarity, p, conf
        );

        let p_div = (p / div_rate * 100.0).round() / 100.0;
        flask_chaos += p;

        let (search_url, query_json) = generate_trade_search_query(
            &build_data.league,
            &eng_name,
            &eng_type,
            &f.rarity,
            "Flask",
            None,
            &f.explicit_mods,
            &[],
            &[],
            &[],
            &f.enchant_mods,
            None,
            None,
            None,
            None,
            None,
            None,
        );

        let display_name = if !f.name.is_empty() && f.name != f.type_line {
            format!("{} ({})", f.name, f.type_line)
        } else {
            f.type_line.clone()
        };

        flask_items.push(PricedItem {
            name: display_name,
            type_line: f.type_line.clone(),
            category: "flask".to_string(),
            rarity: f.rarity.clone(),
            icon: f.icon.clone(),
            slot: None,
            price_chaos: p,
            price_divine: p_div,
            confidence: conf.to_string(),
            details: Some(details),
            trade_search_url: search_url,
            trade_query_json: Some(query_json),
        });
    }

    // ── 4. 技能寶石估算 (Gems) ──
    let mut gem_items = Vec::new();
    let mut gem_chaos = 0.0;

    for g in &build_data.gems {
        let eng_gem_name = crate::services::dictionary::lookup_english_base_type(&g.name).unwrap_or_else(|| g.name.clone());
        let p_opt = ninja_data.rates.get(&eng_gem_name).or_else(|| ninja_data.rates.get(&g.name));

        let (p, conf, details) = if let Some(&val) = p_opt {
            (val, "high", "poe.ninja 寶石即時行情".to_string())
        } else if g.is_awakened {
            (350.0, "high", "覺醒技能寶石參考價".to_string())
        } else if g.is_vaal {
            (15.0, "medium", "瓦爾技能寶石估算價".to_string())
        } else if g.level >= 21 {
            (40.0, "medium", "21等技能寶石估算價".to_string())
        } else {
            (5.0, "high", "標準技能寶石參考價".to_string())
        };

        crate::app_log!("[BuildCalc] 🔮 寶石 name='{}' (Lv.{}/{}), 價格: {:.1} Chaos ({})",
            g.name, g.level, g.quality, p, conf
        );

        let p_div = (p / div_rate * 100.0).round() / 100.0;
        gem_chaos += p;

        let (search_url, query_json) = generate_trade_search_query(
            &build_data.league,
            "",
            &eng_gem_name,
            "Gem",
            "Gem",
            None,
            &[],
            &[],
            &[],
            &[],
            &[],
            None,
            None,
            None,
            Some(g.level),
            Some(g.quality),
            Some(g.is_vaal),
        );

        gem_items.push(PricedItem {
            name: format!("{} (Lv.{}/{})", g.name, g.level, g.quality),
            type_line: g.name.clone(),
            category: "gem".to_string(),
            rarity: "Gem".to_string(),
            icon: if !g.icon.is_empty() { g.icon.clone() } else { "https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvR2Vtcy9TdXBwb3J0R2Vtcy9TaGFyZWQiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/c6a666e5d8/Shared.png".to_string() },
            slot: if !g.socketed_in.is_empty() { Some(g.socketed_in.clone()) } else { None },
            price_chaos: p,
            price_divine: p_div,
            confidence: conf.to_string(),
            details: Some(details),
            trade_search_url: search_url,
            trade_query_json: Some(query_json),
        });
    }

    let total_chaos = ((eq_chaos + jewel_chaos + flask_chaos + gem_chaos) * 100.0).round() / 100.0;
    let total_divine = (total_chaos / div_rate * 100.0).round() / 100.0;

    crate::app_log!("[BuildCalc] 🎯 Build 成本估算完成！總計: {} Divine / {} Chaos (匯率: 1 Divine = {} Chaos)",
        total_divine, total_chaos, div_rate
    );

    Ok(BuildCostResult {
        character: BuildCharacterMeta {
            account: build_data.account,
            name: build_data.character_name,
            league: build_data.league,
            level: build_data.level,
            class: build_data.class_name,
            ascendancy: build_data.ascendancy,
        },
        total_chaos,
        total_divine,
        divine_chaos_rate: div_rate,
        categories: BuildCategories {
            equipment: BuildCategoryTotal {
                items: eq_items,
                total_chaos: (eq_chaos * 100.0).round() / 100.0,
                total_divine: (eq_chaos / div_rate * 100.0).round() / 100.0,
            },
            gems: BuildCategoryTotal {
                items: gem_items,
                total_chaos: (gem_chaos * 100.0).round() / 100.0,
                total_divine: (gem_chaos / div_rate * 100.0).round() / 100.0,
            },
            flasks: BuildCategoryTotal {
                items: flask_items,
                total_chaos: (flask_chaos * 100.0).round() / 100.0,
                total_divine: (flask_chaos / div_rate * 100.0).round() / 100.0,
            },
            jewels: BuildCategoryTotal {
                items: jewel_items,
                total_chaos: (jewel_chaos * 100.0).round() / 100.0,
                total_divine: (jewel_chaos / div_rate * 100.0).round() / 100.0,
            },
        },
    })
}

#[derive(Debug, Clone)]
struct CandidateFilter {
    id: String,
    min_val: Option<f64>,
    score: i32,
    log_text: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ModSource {
    Enchant,
    Implicit,
    Fractured,
    Explicit,
    Crafted,
}

pub fn format_stat_id_with_source(id: &str, source: ModSource) -> String {
    if id.starts_with("pseudo.") {
        return id.to_string();
    }
    if let Some(pos) = id.find(".stat_") {
        let stat_suffix = &id[pos + 1..]; // e.g. "stat_524797741"
        match source {
            ModSource::Implicit => format!("implicit.{}", stat_suffix),
            ModSource::Fractured => format!("fractured.{}", stat_suffix),
            ModSource::Crafted => format!("crafted.{}", stat_suffix),
            ModSource::Enchant => format!("enchant.{}", stat_suffix),
            ModSource::Explicit => format!("explicit.{}", stat_suffix),
        }
    } else {
        match source {
            ModSource::Implicit => format!("implicit.{}", id),
            ModSource::Fractured => format!("fractured.{}", id),
            ModSource::Crafted => format!("crafted.{}", id),
            ModSource::Enchant => format!("enchant.{}", id),
            ModSource::Explicit => format!("explicit.{}", id),
        }
    }
}

fn extract_regex_num(re: &Regex, text: &str) -> Option<f64> {
    if let Some(cap) = re.captures(text) {
        for i in 1..=cap.len() {
            if let Some(m) = cap.get(i) {
                if let Ok(num) = m.as_str().parse::<f64>() {
                    return Some(num);
                }
            }
        }
    }
    None
}

fn generate_trade_search_query(
    league: &str,
    name: &str,
    type_line: &str,
    rarity: &str,
    slot: &str,
    links: Option<i64>,
    explicit_mods: &[String],
    implicit_mods: &[String],
    crafted_mods: &[String],
    fractured_mods: &[String],
    enchant_mods: &[String],
    property_energy_shield: Option<f64>,
    _property_armour: Option<f64>,
    _property_evasion: Option<f64>,
    gem_level: Option<i64>,
    gem_quality: Option<i64>,
    gem_corrupted: Option<bool>,
) -> (String, String) {
    let mut query_obj = serde_json::json!({
        "status": { "option": "securable" }
    });

    let is_unique = rarity.eq_ignore_ascii_case("unique");
    let is_gem = rarity.eq_ignore_ascii_case("gem") || type_line.contains("Gem");

    let trans_name = if !name.is_empty() {
        crate::services::dictionary::lookup_english_base_type(name).unwrap_or_else(|| name.to_string())
    } else {
        String::new()
    };

    let trans_type = if !type_line.is_empty() {
        crate::services::dictionary::lookup_english_base_type(type_line).unwrap_or_else(|| type_line.to_string())
    } else {
        String::new()
    };

    let mut filters_obj = serde_json::json!({});

    // 1. 稀有度與名稱/基底設定
    if is_unique {
        filters_obj["type_filters"] = serde_json::json!({
            "filters": {
                "rarity": { "option": "unique" }
            }
        });
        if !trans_name.is_empty() {
            query_obj["name"] = serde_json::json!(trans_name);
        }
        if !trans_type.is_empty() && trans_type != trans_name {
            query_obj["type"] = serde_json::json!(trans_type);
        }
    } else if is_gem {
        let mut misc_filters = serde_json::json!({});
        if let Some(lvl) = gem_level {
            misc_filters["gem_level"] = serde_json::json!({ "min": lvl });
        }
        if let Some(qual) = gem_quality {
            if qual > 0 {
                misc_filters["quality"] = serde_json::json!({ "min": qual });
            }
        }
        if let Some(corr) = gem_corrupted {
            if corr {
                misc_filters["corrupted"] = serde_json::json!({ "option": "true" });
            }
        }
        if !misc_filters.as_object().map(|o| o.is_empty()).unwrap_or(true) {
            filters_obj["misc_filters"] = serde_json::json!({ "filters": misc_filters });
        }
        let target_gem_type = if !trans_type.is_empty() { trans_type } else { trans_name };
        if !target_gem_type.is_empty() {
            query_obj["type"] = serde_json::json!(target_gem_type);
        }
    } else {
        // Rare / Magic / Normal
        if !trans_type.is_empty() {
            query_obj["type"] = serde_json::json!(trans_type);
        }
        if rarity.eq_ignore_ascii_case("rare") {
            filters_obj["type_filters"] = serde_json::json!({
                "filters": {
                    "rarity": { "option": "rare" }
                }
            });
        }
    }

    // 2. 插槽與連線數篩選 (5L / 6L)
    if let Some(l) = links {
        if l >= 5 && (slot.contains("Body") || slot.contains("Weapon") || slot.is_empty()) {
            filters_obj["socket_filters"] = serde_json::json!({
                "filters": {
                    "links": { "min": l }
                }
            });
        }
    }

    // 3. 智慧詞綴篩選 (Pseudo & Key Mod Selection for Rare / Magic items and Jewels)
    let mut stat_filters = Vec::new();

    if !is_gem && !is_unique {
        let is_armour = slot.contains("Body") || slot.contains("Helm") || slot.contains("Boots") || slot.contains("Gloves") || slot.contains("Offhand") || slot.contains("Shield")
            || type_line.contains("Regalia") || type_line.contains("Plate") || type_line.contains("Robe") || type_line.contains("Crown") || type_line.contains("Boots") || type_line.contains("Gloves") || type_line.contains("Shield") || type_line.contains("Buckler");
        let is_weapon = slot.contains("Weapon") || type_line.contains("Wand") || type_line.contains("Bow") || type_line.contains("Sword") || type_line.contains("Axe") || type_line.contains("Mace") || type_line.contains("Sceptre") || type_line.contains("Staff") || type_line.contains("Dagger") || type_line.contains("Claw");

        let mut all_typed_mods: Vec<(String, ModSource)> = Vec::new();
        for m in enchant_mods {
            for line in m.lines() {
                let clean_l = line.trim();
                if !clean_l.is_empty() {
                    all_typed_mods.push((clean_l.to_string(), ModSource::Enchant));
                }
            }
        }
        for m in implicit_mods {
            for line in m.lines() {
                let clean_l = line.trim();
                if !clean_l.is_empty() {
                    all_typed_mods.push((clean_l.to_string(), ModSource::Implicit));
                }
            }
        }
        for m in fractured_mods {
            for line in m.lines() {
                let clean_l = line.trim();
                if !clean_l.is_empty() {
                    all_typed_mods.push((clean_l.to_string(), ModSource::Fractured));
                }
            }
        }
        for m in explicit_mods {
            for line in m.lines() {
                let clean_l = line.trim();
                if !clean_l.is_empty() {
                    all_typed_mods.push((clean_l.to_string(), ModSource::Explicit));
                }
            }
        }
        for m in crafted_mods {
            for line in m.lines() {
                let clean_l = line.trim();
                if !clean_l.is_empty() {
                    all_typed_mods.push((clean_l.to_string(), ModSource::Crafted));
                }
            }
        }

        crate::app_log!(
            "[BuildCalc DEBUG] 🔍 [Query Gen] item='{}' (base='{}', rarity='{}', slot='{}', links={:?}), total mods count: {}",
            name, type_line, rarity, slot, links, all_typed_mods.len()
        );
        for (i, (line, src)) in all_typed_mods.iter().enumerate() {
            crate::app_log!("[BuildCalc DEBUG]    ├─ Mod [{}] ({:?}): '{}'", i, src, line);
        }

        let mut candidates = Vec::new();

        for (line, source) in &all_typed_mods {
            let clean = line.trim();
            if clean.is_empty() {
                continue;
            }

            // Extract roll range if present: e.g. (85-104), (42-48)
            let mut range_min: Option<f64> = None;
            if let Some(cap) = ROLL_RANGE_RE.find(clean) {
                let inside = &cap.as_str()[1..cap.as_str().len() - 1]; // strip ( and )
                let nums: Vec<f64> = VALUE_EXTRACT_RE
                    .find_iter(inside)
                    .filter_map(|m| m.as_str().parse::<f64>().ok())
                    .collect();
                if nums.len() >= 2 {
                    range_min = Some(nums[0]);
                } else if nums.len() == 1 {
                    range_min = Some(nums[0]);
                }
            }

            // Clean out roll range and mod tags from line
            let cleaned_line = ROLL_RANGE_RE.replace_all(clean, "").to_string();
            let cleaned_line = Regex::new(r"(?i)\s*\{[^}]+\}\s*|\s*\((?:fractured|crafted|enchant|implicit|local|部分|已分裂|分裂|工藝|附魔|固定詞綴)\)\s*")
                .unwrap()
                .replace_all(&cleaned_line, " ")
                .to_string();
            let cleaned_line = cleaned_line.trim();

            let matched_opt = if is_armour {
                crate::services::dictionary::lookup_stat_for_armour(cleaned_line)
            } else if is_weapon {
                crate::services::dictionary::lookup_stat_for_weapon(cleaned_line)
            } else {
                crate::services::dictionary::lookup_stat_by_text(cleaned_line)
            };

            if let Some(matched) = matched_opt {
                let final_id = format_stat_id_with_source(&matched.id, *source);
                let actual_val = extract_mod_numeric_value(cleaned_line).or(matched.value);
                let effective_min = range_min.or(actual_val);

                let is_gem_lvl = GEM_LEVEL_RE.is_match(cleaned_line);
                let is_low_utility = cleaned_line.contains("Stun and Block Recovery")
                    || cleaned_line.contains("Light Radius")
                    || cleaned_line.contains("Life per Enemy")
                    || cleaned_line.contains("Mana per Enemy")
                    || cleaned_line.contains("Reflects");
                let is_core = LIFE_RE.is_match(cleaned_line)
                    || FLAT_ES_RE.is_match(cleaned_line)
                    || INC_ES_RE.is_match(cleaned_line)
                    || FIRE_RES_RE.is_match(cleaned_line)
                    || COLD_RES_RE.is_match(cleaned_line)
                    || LIGHTNING_RES_RE.is_match(cleaned_line)
                    || ALL_ELE_RES_RE.is_match(cleaned_line)
                    || TWO_ELE_RES_RE.is_match(cleaned_line)
                    || CHAOS_RES_RE.is_match(cleaned_line)
                    || SUPP_RE.is_match(cleaned_line)
                    || MS_RE.is_match(cleaned_line)
                    || CRIT_MULTI_RE.is_match(cleaned_line)
                    || DOT_MULTI_RE.is_match(cleaned_line)
                    || cleaned_line.contains("increased Spell Damage")
                    || cleaned_line.contains("more Elemental Damage");

                let score = if is_gem_lvl {
                    1200
                } else if *source == ModSource::Implicit || *source == ModSource::Fractured {
                    1100
                } else if is_core {
                    900
                } else if *source == ModSource::Crafted {
                    800
                } else if is_low_utility {
                    300
                } else {
                    600
                };

                candidates.push(CandidateFilter {
                    id: final_id.clone(),
                    min_val: effective_min,
                    score,
                    log_text: format!("{:?} 詞綴: {} (ID: {})", source, cleaned_line, final_id),
                });
            }
        }

        candidates.sort_by(|a, b| b.score.cmp(&a.score));

            crate::app_log!(
                "[BuildCalc DEBUG]    ├─ Candidates count: {}, selecting top stats",
                candidates.len()
            );
            for (i, c) in candidates.iter().enumerate() {
                crate::app_log!("[BuildCalc DEBUG]    │  ├─ Candidate [{}]: id='{}', score={}, min={:?}, text='{}'", i, c.id, c.score, c.min_val, c.log_text);
            }

            let mut seen_ids = std::collections::HashSet::new();
            let max_filters = if slot.contains("Body") || slot.contains("Weapon") { 4 } else { 3 };

            for c in candidates {
                if seen_ids.insert(c.id.clone()) {
                    crate::app_log!("[BuildCalc] 🎯 精選詞綴篩選: {} -> ID: '{}', min: {:?}", c.log_text, c.id, c.min_val);
                    let mut entry = serde_json::json!({
                        "id": c.id
                    });
                    if let Some(min_val) = c.min_val {
                        entry["value"] = serde_json::json!({ "min": min_val });
                    }
                    stat_filters.push(entry);
                    if stat_filters.len() >= max_filters {
                        break;
                    }
                }
            }
        }

    if !stat_filters.is_empty() {
        query_obj["stats"] = serde_json::json!([
            {
                "type": "and",
                "filters": stat_filters
            }
        ]);
    }

    if !filters_obj.as_object().map(|o| o.is_empty()).unwrap_or(true) {
        query_obj["filters"] = filters_obj;
    }

    let payload = serde_json::json!({
        "query": query_obj,
        "sort": { "price": "asc" }
    });

    let query_str = payload.to_string();
    crate::app_log!("[BuildCalc DEBUG] 📤 最終產生市集 Payload: {}", query_str);
    let fallback_url = format!(
        "https://www.pathofexile.com/trade/search/{}?q={}",
        urlencoding::encode(league),
        urlencoding::encode(&query_str)
    );

    (fallback_url, query_str)
}

fn extract_mod_numeric_value(text: &str) -> Option<f64> {
    let clean = Regex::new(r"\([+-]?\d+(?:\.\d+)?(?:--?[+-]?\d+(?:\.\d+)?)?\)").ok()?.replace_all(text, "").to_string();
    let re = Regex::new(r"[-+]?\d+(?:\.\d+)?").ok()?;
    re.find(&clean).and_then(|m| m.as_str().parse::<f64>().ok())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_generate_trade_query_rare_body_armour() {
        let explicit_mods = vec![
            "+85 to maximum Energy Shield".to_string(),
            "120% increased Energy Shield".to_string(),
            "+45% to Fire Resistance".to_string(),
            "+42% to Lightning Resistance".to_string(),
        ];
        let (_url, json_str) = generate_trade_search_query(
            "Allflame",
            "Empyrean Coat",
            "Twilight Regalia",
            "Rare",
            "BodyArmour",
            Some(6),
            &explicit_mods,
            &[],
            &[],
            &[],
            &[],
            Some(750.0),
            None,
            None,
            None,
            None,
            None,
        );

        let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
        assert_eq!(val["query"]["type"], "Twilight Regalia");
        assert_eq!(val["query"]["filters"]["type_filters"]["filters"]["rarity"]["option"], "rare");
        assert_eq!(val["query"]["filters"]["socket_filters"]["filters"]["links"]["min"], 6);

        let stats = val["query"]["stats"][0]["filters"].as_array().expect("Stats array");
        assert!(!stats.is_empty(), "Stats must not be empty for rare item with high ES and resistances");
        
        let stat_ids: Vec<&str> = stats.iter().filter_map(|s| s["id"].as_str()).collect();
        for id in &stat_ids {
            assert!(id.starts_with("explicit.stat_") || id.starts_with("crafted.stat_") || id.starts_with("implicit.stat_"));
        }
    }

    #[test]
    fn test_generate_trade_query_rare_boots() {
        let explicit_mods = vec![
            "30% increased Movement Speed".to_string(),
            "+89 to maximum Life".to_string(),
            "+35% to Cold Resistance".to_string(),
            "+12% chance to Suppress Spell Damage".to_string(),
        ];
        let (_url, json_str) = generate_trade_search_query(
            "Allflame",
            "Bramble Trail",
            "Two-Toned Boots",
            "Rare",
            "Boots",
            None,
            &explicit_mods,
            &[],
            &[],
            &[],
            &[],
            None,
            None,
            None,
            None,
            None,
            None,
        );

        let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
        let stats = val["query"]["stats"][0]["filters"].as_array().expect("Stats array");
        let stat_ids: Vec<&str> = stats.iter().filter_map(|s| s["id"].as_str()).collect();
        for id in &stat_ids {
            assert!(id.starts_with("explicit.stat_") || id.starts_with("crafted.stat_") || id.starts_with("implicit.stat_"));
        }
    }

    #[test]
    fn test_generate_trade_query_unique_item() {
        let (_url, json_str) = generate_trade_search_query(
            "Allflame",
            "The Taming",
            "Prismatic Ring",
            "Unique",
            "Ring",
            None,
            &[],
            &[],
            &[],
            &[],
            &[],
            None,
            None,
            None,
            None,
            None,
            None,
        );

        let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
        assert_eq!(val["query"]["name"], "The Taming");
        assert_eq!(val["query"]["filters"]["type_filters"]["filters"]["rarity"]["option"], "unique");
    }

    #[test]
    fn test_generate_trade_query_implicit_gem_levels() {
        let implicit_mods = vec![
            "+2 to Level of Socketed Skill Gems".to_string(),
            "-10% to all Elemental Resistances".to_string(),
        ];
        let (_url, json_str) = generate_trade_search_query(
            "Allflame",
            "Archdemon Crown",
            "Archdemon Crown",
            "Rare",
            "Helm",
            None,
            &[],
            &implicit_mods,
            &[],
            &[],
            &[],
            Some(100.0),
            None,
            None,
            None,
            None,
            None,
        );

        let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
        let stats = val["query"]["stats"][0]["filters"].as_array().expect("Stats array");
        let stat_ids: Vec<&str> = stats.iter().filter_map(|s| s["id"].as_str()).collect();
        
        // Must be implicit.stat_524797741 and NOT explicit.stat_524797741
        assert!(stat_ids.contains(&"implicit.stat_524797741"), "Should have implicit prefix for Archdemon Crown gem level");
    }

    #[test]
    fn test_generate_trade_query_fractured_gem_levels() {
        let fractured_mods = vec![
            "+1 to Level of all Spell Skill Gems".to_string(),
        ];
        let (_url, json_str) = generate_trade_search_query(
            "Allflame",
            "Profane Wand",
            "Profane Wand",
            "Rare",
            "Weapon",
            None,
            &[],
            &[],
            &[],
            &fractured_mods,
            &[],
            None,
            None,
            None,
            None,
            None,
            None,
        );

        let val: Value = serde_json::from_str(&json_str).expect("Valid JSON");
        let stats = val["query"]["stats"][0]["filters"].as_array().expect("Stats array");
        let stat_ids: Vec<&str> = stats.iter().filter_map(|s| s["id"].as_str()).collect();
        
        // Must start with fractured.
        assert!(stat_ids.iter().any(|id| id.starts_with("fractured.")), "Should have fractured prefix for fractured mod");
    }
}
