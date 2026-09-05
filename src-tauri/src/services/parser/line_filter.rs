use crate::models::item::ModType;
use crate::services::parser::mod_parser::TIER_EXTRACT_RE;

pub fn is_prefix_header_line(line: &str) -> bool {
    let lower = line.to_lowercase();
    lower.starts_with("item class:")
        || lower.starts_with("物品種類:")
        || lower.starts_with("物品類別:")
        || lower.starts_with("rarity:")
        || lower.starts_with("稀有度:")
}

pub fn is_body_metadata_line(line: &str) -> bool {
    let lower = line.to_lowercase();
    lower.starts_with("unique id:")
        || lower.starts_with("item level:")
        || lower.starts_with("itemlevel:")
        || lower.starts_with("ilvl:")
        || lower.starts_with("物品等級:")
        || lower.starts_with("quality:")
        || lower.starts_with("品質:")
        || lower.starts_with("sockets:")
        || lower.starts_with("插槽:")
        || lower.starts_with("stack size:")
        || lower.starts_with("堆疊數量:")
        || lower.starts_with("堆疊:")
        || lower.starts_with("stack:")
        || lower.starts_with("map tier:")
        || lower.starts_with("地圖階級:")
        || lower.starts_with("階級:")
        || lower.starts_with("tier:")
        || lower.starts_with("area level:")
        || lower.starts_with("區域等級:")
        || lower.starts_with("levelreq:")
        || lower.starts_with("level:")
        || lower.starts_with("等級:")
        || lower.starts_with("requirements:")
        || lower.starts_with("需求:")
        || lower.starts_with("str:")
        || lower.starts_with("力量:")
        || lower.starts_with("dex:")
        || lower.starts_with("敏捷:")
        || lower.starts_with("int:")
        || lower.starts_with("智慧:")
        || lower.starts_with("implicits:")
        || lower.starts_with("prefix:")
        || lower.starts_with("suffix:")
        || lower.starts_with("variant:")
        || lower.starts_with("selected variant:")
        || lower.starts_with("has alt variant:")
        || lower.starts_with("catalyst:")
        || lower.starts_with("catalystquality:")
        || lower.starts_with("radius:")
        || lower.starts_with("limited to:")
        || lower.starts_with("requires class:")
        || lower.starts_with("armour:")
        || lower.starts_with("護甲:")
        || lower.starts_with("evasion:")
        || lower.starts_with("閃避值:")
        || lower.starts_with("energy shield:")
        || lower.starts_with("能量護盾:")
        || lower.starts_with("ward:")
        || lower.starts_with("physical damage:")
        || lower.starts_with("elemental damage:")
        || lower.starts_with("critical strike chance:")
        || lower.starts_with("attacks per second:")
        || lower == "corrupted"
        || lower == "已汙染"
        || lower == "已污染"
        || lower.starts_with("note:")
        || lower.starts_with("備註:")
        || lower.starts_with("~b/o")
        || lower.starts_with("~price")
}

pub fn is_header_metadata_line(line: &str) -> bool {
    is_prefix_header_line(line) || is_body_metadata_line(line)
}

pub fn is_pure_tag_line(
    line: &str,
    pending: &mut Option<ModType>,
    pending_tier: &mut Option<i64>,
) -> bool {
    let lower = line.to_lowercase();
    if line.starts_with('{') && line.ends_with('}') {
        if let Some(c) = TIER_EXTRACT_RE.captures(line) {
            if let Ok(t) = c[1].parse::<i64>() {
                *pending_tier = Some(t);
            }
        }
        if lower.contains("fractured") || line.contains("已分裂") || line.contains("分裂") {
            *pending = Some(ModType::Fractured);
            return true;
        }
        if lower.contains("crafted") || line.contains("工藝") {
            *pending = Some(ModType::Crafted);
            return true;
        }
        if lower.contains("enchant") || line.contains("附魔") {
            *pending = Some(ModType::Enchant);
            return true;
        }
        if lower.contains("implicit") || line.contains("固定詞綴") {
            *pending = Some(ModType::Implicit);
            return true;
        }
        return true;
    }
    false
}

pub fn is_ignorable_line(line: &str) -> bool {
    let lower = line.to_lowercase();
    if lower.starts_with("備註:")
        || lower.starts_with("note:")
        || lower.starts_with("~b/o")
        || lower.starts_with("~price")
        || lower.starts_with("unique id:")
    {
        return true;
    }
    is_body_metadata_line(line)
        || lower.contains("塑者之物")
        || lower.contains("尊師之物")
        || lower.contains("shaper item")
        || lower.contains("elder item")
}

pub fn is_pure_metadata_section(lines: &[&str]) -> bool {
    lines.iter().all(|l| is_ignorable_line(l))
}
