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

pub fn strip_local_tags(text: &str) -> String {
    text.replace("(部分)", "")
        .replace("(局部)", "")
        .replace("(Local)", "")
        .replace("(local)", "")
}

pub fn check_stat_is_armour(en_text: &str, zh_text: &str) -> bool {
    en_text.contains("Energy Shield")
        || en_text.contains("Armour")
        || en_text.contains("Evasion")
        || zh_text.contains("能量護盾")
        || zh_text.contains("護甲")
        || zh_text.contains("閃避")
}

pub fn check_stat_is_weapon(en_text: &str, zh_text: &str) -> bool {
    en_text.contains("Physical Damage")
        || en_text.contains("Attack Speed")
        || en_text.contains("Critical Strike Chance")
        || en_text.contains("Accuracy")
        || zh_text.contains("物理傷害")
        || zh_text.contains("攻擊速度")
        || zh_text.contains("暴擊率")
        || zh_text.contains("命中")
}
