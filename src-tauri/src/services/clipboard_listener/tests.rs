use super::*;

#[test]
fn test_poe_item_copied_payload_serialization() {
    let payload = PoeItemCopiedPayload {
        text: "稀有度: 傳奇\n賭神芬多\n--------".to_string(),
        timestamp: 1700000000000,
    };

    let json = serde_json::to_string(&payload).expect("should serialize");
    assert!(json.contains("\"text\":"));
    assert!(json.contains("\"timestamp\":1700000000000"));

    let deserialized: PoeItemCopiedPayload =
        serde_json::from_str(&json).expect("should deserialize");
    assert_eq!(deserialized, payload);
}

#[test]
fn test_deduplication_state() {
    let mut lock = LAST_EMITTED_TEXT.lock().unwrap();
    *lock = "initial".to_string();
    assert_eq!(*lock, "initial");
    *lock = String::new();
}

#[test]
fn test_is_poe_trade_whisper() {
    assert!(is_poe_trade_whisper(
        "@From Buyer: Hi, I would like to buy your Mageblood"
    ));
    assert!(is_poe_trade_whisper("@來自 買家: 你好，我想購買 獵首"));
    assert!(is_poe_trade_whisper("@来自 買家: 你好，我想购买 崇高石"));
    assert!(!is_poe_trade_whisper("@From Friend: Hey how are you?"));
    assert!(!is_poe_trade_whisper("Just normal text"));
}
