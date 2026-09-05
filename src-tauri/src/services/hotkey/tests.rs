use super::*;

#[test]
fn test_is_poe_item_text() {
    assert!(!is_poe_item_text(""));
    assert!(!is_poe_item_text("short"));
    assert!(is_poe_item_text(
        "Rarity: Rare\nItem Class: Rings\n--------"
    ));
    assert!(is_poe_item_text("稀有度: 稀有\n物品種類: 戒指\n--------"));
    assert!(!is_poe_item_text("/hideout PlayerName"));
}

#[test]
fn test_send_in_game_command_validation() {
    // Command must start with '/' or '@'
    assert_eq!(send_in_game_command(None, "invalid_cmd"), Ok(false));
    assert_eq!(send_in_game_command(None, "   "), Ok(false));
    // Valid format returns Ok(false) in non-windows / test environment when game is not found
    assert_eq!(send_in_game_command(None, "/hideout"), Ok(false));
    assert_eq!(
        send_in_game_command(None, "  /hideout PlayerName  "),
        Ok(false)
    );
    assert_eq!(
        send_in_game_command(None, "@Player 正在刷圖中，請稍候 1 分鐘！"),
        Ok(false)
    );
    assert_eq!(
        send_in_game_command(None, "@Player ty gl!\n/kick Player"),
        Ok(false)
    );
    assert!(is_valid_in_game_command("/invite Player"));
    assert!(is_valid_in_game_command("@Player ty gl!"));
    assert!(is_valid_in_game_command("@Player ty gl!\n/kick Player"));
    assert!(!is_valid_in_game_command("not_a_command"));
}

#[test]
fn test_poe_window_titles_focus_on_poe1() {
    // Must contain all valid PoE 1 client titles
    assert!(POE_WINDOW_TITLES.contains(&"Path of Exile"));
    assert!(POE_WINDOW_TITLES.contains(&"PathOfExile"));
    assert!(POE_WINDOW_TITLES.contains(&"PathOfExileSteam"));
    assert!(POE_WINDOW_TITLES.contains(&"PathOfExile_x64"));
    assert!(POE_WINDOW_TITLES.contains(&"PathOfExile_x64Steam"));
    assert!(POE_WINDOW_TITLES.contains(&"PathOfExile_KG.exe"));
    assert!(POE_WINDOW_TITLES.contains(&"PathOfExile_x64_KG.exe"));
    assert!(POE_WINDOW_TITLES.contains(&"流亡黯道"));

    // Must NOT contain unready PoE 2 title (#46)
    assert!(!POE_WINDOW_TITLES.contains(&"Path of Exile 2"));
    assert!(!POE_WINDOW_TITLES.contains(&"PathOfExile2"));
}
