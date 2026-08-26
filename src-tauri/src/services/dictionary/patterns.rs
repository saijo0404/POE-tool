use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    pub static ref NUM_RE: Regex = Regex::new(r"[+-]?\d+(?:\.\d+)?").unwrap();
    pub static ref PATTERN_NORM_RE: Regex = Regex::new(r"[+-]?\d+(?:\.\d+)?|[+-]?#").unwrap();
    pub static ref TAG_PREFIX_RE: Regex = Regex::new(r"(?i)^\{[^}]+\}\s*|^\([^)]+\)\s*").unwrap();
}

pub fn normalize_pattern(text: &str) -> String {
    let clean = TAG_PREFIX_RE.replace_all(text, "");
    let s = PATTERN_NORM_RE.replace_all(&clean, "#");
    s.split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
        .to_lowercase()
}

pub fn entry_priority(id: &str) -> i32 {
    if id.starts_with("explicit.") {
        100
    } else if id.starts_with("pseudo.") {
        80
    } else if id.starts_with("implicit.") {
        60
    } else if id.starts_with("fractured.") {
        40
    } else {
        20
    }
}
