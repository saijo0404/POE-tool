use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    pub static ref ROLL_RANGE_RE: Regex =
        Regex::new(r"\([+-]?\d+(?:\.\d+)?(?:--?[+-]?\d+(?:\.\d+)?)?\)").unwrap();
    pub static ref POB_RANGE_TAG_RE: Regex = Regex::new(r"\{range:([0-9.]+)\}").unwrap();
    pub static ref VALUE_EXTRACT_RE: Regex = Regex::new(r"[-+]?\d+(?:\.\d+)?").unwrap();
    static ref TAGS_CLEAN_RE: Regex = Regex::new(
        r"(?i)\s*\{[^}]+\}\s*|\s*\((?:fractured|crafted|enchant|implicit|local|部分|已分裂|分裂|工藝|附魔|固定詞綴)\)\s*"
    )
    .unwrap();
    static ref POB_PLUS_RANGE_RE: Regex =
        Regex::new(r"^\+\s*\([+-]?\d+(?:\.\d+)?(?:--?[+-]?\d+(?:\.\d+)?)?\)").unwrap();
    static ref POB_PERCENT_RANGE_RE: Regex =
        Regex::new(r"(?:^|\s)\([+-]?\d+(?:\.\d+)?(?:--?[+-]?\d+(?:\.\d+)?)?\)\s*%").unwrap();
}

pub fn extract_roll_range(line: &str) -> (Option<f64>, Option<f64>) {
    let Some(cap) = ROLL_RANGE_RE.find(line) else {
        return (None, None);
    };
    let inside = &cap.as_str()[1..cap.as_str().len() - 1].trim();
    if let Some((first, second)) = inside.split_once("--") {
        let min_val = first.parse::<f64>().ok();
        let max_val = format!("-{}", second).parse::<f64>().ok();
        (min_val, max_val)
    } else if let Some(dash_idx) = inside[1..].find('-').map(|i| i + 1) {
        let min_val = inside[..dash_idx].parse::<f64>().ok();
        let max_val = inside[dash_idx + 1..].parse::<f64>().ok();
        (min_val, max_val)
    } else if let Ok(single) = inside.parse::<f64>() {
        (Some(single), Some(single))
    } else {
        (None, None)
    }
}

pub fn clean_mod_line_and_extract_values(
    raw_line: &str,
) -> (String, Option<f64>, Option<f64>, Option<f64>) {
    let mut line = raw_line.trim().to_string();

    let pob_range_ratio = POB_RANGE_TAG_RE
        .captures(&line)
        .and_then(|c| c[1].parse::<f64>().ok());
    let (range_min, range_max) = extract_roll_range(&line);

    let pob_val = if let (Some(min), Some(max)) = (range_min, range_max) {
        if let Some(r) = pob_range_ratio {
            let interpolated = min + (max - min) * r;
            Some((interpolated * 10.0).round() / 10.0)
        } else {
            Some(min)
        }
    } else {
        range_min
    };

    line = TAGS_CLEAN_RE.replace_all(&line, " ").to_string();
    let mut clean_line = line.trim().to_string();

    if clean_line.starts_with("+ (") || clean_line.starts_with("+(") {
        if let Some(v) = pob_val {
            clean_line = POB_PLUS_RANGE_RE
                .replace(&clean_line, format!("+{}", v))
                .to_string();
        }
    } else if clean_line.starts_with('(') || clean_line.contains(" (") {
        if let Some(v) = pob_val {
            clean_line = POB_PERCENT_RANGE_RE
                .replace(&clean_line, format!(" {}%", v))
                .to_string();
        }
    }

    clean_line = ROLL_RANGE_RE.replace_all(&clean_line, "").to_string();
    let cleaned_text = clean_line.split_whitespace().collect::<Vec<_>>().join(" ");

    let val = VALUE_EXTRACT_RE
        .find(&cleaned_text)
        .and_then(|m| m.as_str().parse::<f64>().ok())
        .or(pob_val);

    (cleaned_text, val, range_min, range_max)
}
