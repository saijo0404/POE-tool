use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    static ref TAG_STRIP_RE: Regex = Regex::new(r"\{[^}]*\}").unwrap();
}

#[derive(Debug, Default)]
pub struct ParsedPobItemRaw {
    pub name: String,
    pub type_line: String,
    pub rarity: String,
    pub item_level: i64,
    pub links: Option<i64>,
    pub property_energy_shield: Option<f64>,
    pub property_armour: Option<f64>,
    pub property_evasion: Option<f64>,
    pub explicit_mods: Vec<String>,
    pub implicit_mods: Vec<String>,
    pub crafted_mods: Vec<String>,
    pub fractured_mods: Vec<String>,
    pub enchant_mods: Vec<String>,
}

pub fn parse_pob_item_content(content: &str) -> Option<ParsedPobItemRaw> {
    let lines: Vec<&str> = content
        .lines()
        .map(|l| l.trim())
        .filter(|l| !l.is_empty())
        .collect();
    if lines.is_empty() {
        return None;
    }

    let mut item = ParsedPobItemRaw::default();
    let mut header_lines = Vec::new();
    let mut implicits_count = 0usize;
    let mut in_mods = false;

    for line in lines {
        if !in_mods {
            if line.starts_with("Rarity:") {
                item.rarity = line.replace("Rarity:", "").trim().to_string();
            } else if line.starts_with("Item Level:") {
                item.item_level = line
                    .replace("Item Level:", "")
                    .trim()
                    .parse::<i64>()
                    .unwrap_or(85);
            } else if line.starts_with("Sockets:") {
                item.links = parse_pob_sockets(line);
            } else if line.starts_with("Energy Shield:") {
                item.property_energy_shield = parse_prop_val(line);
            } else if line.starts_with("Armour:") {
                item.property_armour = parse_prop_val(line);
            } else if line.starts_with("Evasion:") || line.starts_with("Evasion Rating:") {
                item.property_evasion = parse_prop_val(line);
            } else if line.starts_with("Implicits:") {
                implicits_count = line
                    .replace("Implicits:", "")
                    .trim()
                    .parse::<usize>()
                    .unwrap_or(0);
                in_mods = true;
            } else if !line.starts_with("Quality:")
                && !line.starts_with("LevelReq:")
                && !line.starts_with("Unique ID:")
            {
                header_lines.push(line);
            }
        } else {
            classify_pob_mod_line(line, &mut item, &mut implicits_count);
        }
    }

    fill_item_names(&mut item, &header_lines);
    Some(item)
}

fn parse_pob_sockets(line: &str) -> Option<i64> {
    let clean = line.replace("Sockets:", "").trim().to_string();
    clean
        .split_whitespace()
        .map(|grp| (grp.matches('-').count() + 1) as i64)
        .max()
        .filter(|&l| l >= 2)
}

fn parse_prop_val(line: &str) -> Option<f64> {
    let clean = line.split(':').nth(1)?.trim();
    let first_num = clean.split_whitespace().next()?;
    first_num.parse::<f64>().ok()
}

fn classify_pob_mod_line(line: &str, item: &mut ParsedPobItemRaw, implicits_count: &mut usize) {
    let is_enchant = line.contains("{enchant}");
    let is_fractured = line.contains("{fractured}");
    let is_crafted = line.contains("{crafted}");
    let cleaned = TAG_STRIP_RE.replace_all(line, "").trim().to_string();
    if cleaned.is_empty() {
        return;
    }

    if is_enchant {
        item.enchant_mods.push(cleaned);
    } else if is_fractured {
        item.fractured_mods.push(cleaned);
    } else if is_crafted {
        item.crafted_mods.push(cleaned);
    } else if *implicits_count > 0 {
        item.implicit_mods.push(cleaned);
        *implicits_count -= 1;
    } else {
        item.explicit_mods.push(cleaned);
    }
}

fn fill_item_names(item: &mut ParsedPobItemRaw, headers: &[&str]) {
    if headers.is_empty() {
        return;
    }
    item.name = headers[0].to_string();
    item.type_line = if headers.len() > 1 {
        headers[1].to_string()
    } else {
        item.name.clone()
    };
    if item.rarity.is_empty() {
        item.rarity = "Rare".to_string();
    }
    if item.item_level == 0 {
        item.item_level = 85;
    }
}
