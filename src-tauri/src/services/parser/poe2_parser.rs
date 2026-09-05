use lazy_static::lazy_static;
use regex::Regex;

lazy_static! {
    static ref SPIRIT_RE: Regex = Regex::new(r"(?im)^(?:Spirit|精魂|精魂需求):\s*(\d+)").unwrap();
    static ref WAYSTONE_TIER_RE: Regex =
        Regex::new(r"(?im)^(?:Waystone\s*Tier|銘刻地圖階級|尋路石階級|地圖階級):\s*(\d+)").unwrap();
    static ref GENERIC_TIER_RE: Regex = Regex::new(r"(?im)^(?:Tier|階級):\s*(\d+)").unwrap();
    static ref WAYSTONE_INLINE_TIER_RE: Regex =
        Regex::new(r"(?i)(?:Waystone|尋路石|銘刻地圖).*?(?:Tier|階級|\(T|T)\s*(\d+)").unwrap();
    static ref UNCUT_INLINE_TIER_RE: Regex =
        Regex::new(r"(?i)(?:Uncut|未切割).*?(?:Tier|階級|\(T|T)\s*(\d+)").unwrap();
    static ref RUNE_SOCKETS_RE: Regex =
        Regex::new(r"(?im)^(?:Rune\s*Sockets|符文插槽):\s*(.+)").unwrap();
}

#[derive(Debug, Clone, Default)]
pub struct Poe2ExtractedFields {
    pub spirit: Option<i64>,
    pub waystone_tier: Option<i64>,
    pub uncut_tier: Option<i64>,
    pub rune_sockets: Option<String>,
}

pub fn is_poe2_item_text(text: &str) -> bool {
    text.contains("Spirit:")
        || text.contains("精魂:")
        || text.contains("精魂需求:")
        || text.contains("Waystone Tier:")
        || text.contains("銘刻地圖階級:")
        || text.contains("尋路石階級:")
        || text.contains("Waystones")
        || text.contains("Waystone")
        || text.contains("銘刻地圖")
        || text.contains("尋路石")
        || text.contains("Uncut Skill Gem")
        || text.contains("未切割技能寶石")
        || text.contains("Uncut Spirit Gem")
        || text.contains("未切割精魂寶石")
        || text.contains("Uncut Support Gem")
        || text.contains("未切割輔助寶石")
        || text.contains("Uncut Gem")
        || text.contains("未切割寶石")
        || text.contains("Rune Sockets:")
        || text.contains("符文插槽:")
}

pub fn extract_poe2_fields(text: &str) -> Poe2ExtractedFields {
    let spirit = SPIRIT_RE
        .captures(text)
        .and_then(|c| c[1].parse::<i64>().ok());

    let is_waystone = text.contains("Waystone")
        || text.contains("Waystones")
        || text.contains("尋路石")
        || text.contains("銘刻地圖");
    let is_uncut = text.contains("Uncut") || text.contains("未切割");

    let waystone_tier = if is_waystone {
        WAYSTONE_TIER_RE
            .captures(text)
            .and_then(|c| c[1].parse::<i64>().ok())
            .or_else(|| {
                GENERIC_TIER_RE
                    .captures(text)
                    .and_then(|c| c[1].parse::<i64>().ok())
            })
            .or_else(|| {
                WAYSTONE_INLINE_TIER_RE
                    .captures(text)
                    .and_then(|c| c[1].parse::<i64>().ok())
            })
    } else {
        None
    };

    let uncut_tier = if is_uncut {
        GENERIC_TIER_RE
            .captures(text)
            .and_then(|c| c[1].parse::<i64>().ok())
            .or_else(|| {
                UNCUT_INLINE_TIER_RE
                    .captures(text)
                    .and_then(|c| c[1].parse::<i64>().ok())
            })
    } else {
        None
    };

    let rune_sockets = RUNE_SOCKETS_RE
        .captures(text)
        .map(|c| c[1].trim().to_string());

    Poe2ExtractedFields {
        spirit,
        waystone_tier,
        uncut_tier,
        rune_sockets,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_poe2_item_text() {
        assert!(is_poe2_item_text("Spirit: 100"));
        assert!(is_poe2_item_text("Waystone Tier: 15"));
        assert!(is_poe2_item_text("未切割技能寶石"));
        assert!(!is_poe2_item_text("Rarity: Unique\nHeadhunter"));
    }

    #[test]
    fn test_extract_poe2_fields() {
        let text = "Item Class: Body Armours\nSpirit: 60\nRune Sockets: S S\n";
        let fields = extract_poe2_fields(text);
        assert_eq!(fields.spirit, Some(60));
        assert_eq!(fields.rune_sockets.as_deref(), Some("S S"));
    }
}
