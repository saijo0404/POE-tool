# 🗺️ PoE 2 遊戲日誌解析與金幣收益追蹤 (PoE 2 Mapping Log Parser & Gold Profit Tracker)

針對《流亡黯道 2 (Path of Exile 2)》特有的**金幣經濟 (Gold Economy)** 與**銘刻地圖 (Waystone)** 終局玩法，POE_tool 建立了專屬的 **`Client.txt` 遊戲日誌即時解析器**、**場次狀態追蹤狀態機**與**金幣／終局物資時薪精算看板**。

---

## 🔍 1. 系統架構與流程 (Architecture)

```
[ PoE 2 遊戲端寫入 Client.txt ]
               │
               ▼
[ 本地即時日誌監聽 (Tauri ClientLogWatcher / 手動貼上日誌) ]
               │
               ▼
[ PoE 2 日誌事件解析器 (poe2LogParser) ]
• 正則提取時間戳記 (Timestamp) 與去除客戶端前綴
• 區域辨識：銘刻地圖 (Waystone Map) vs 城鎮 / 藏身處 (Town/Hideout)
• 終局事件：金幣拾取 (Gold Pickup)、首領討伐 (Boss Slain)、玩家陣亡 (Deaths)、銘刻與符文掉落 (Waystone/Rune)
               │
               ▼
[ 場次狀態機 (Poe2RunTracker) ]
• 進入地圖：自動初始化場次、綁定地圖階級 (T1~T16) 與開始計時
• 圖內歷程：累計拾取金幣、記錄首領擊殺、死亡計數與掉落物
• 回城／回藏身處：自動結算單場時長、折算每小時金幣 (Gold/hr)
               │
               ▼
[ 雙引擎隔離持久化 (StorageNamespaceAdapter) ]
• 依照 poe1 / poe2 命名空間完全隔離刷圖歷程，互不干擾
               │
               ▼
[ 終局看板 UI (Poe2GoldTrackerCard & MappingRunsTable) ]
• 即時顯示總金幣、活躍 Gold/hr、場均金幣、討伐率、死亡數與掉落清單
```

---

## 📜 2. 支援日誌事件規範 (Supported Log Events)

解析器相容官方 Steam、獨立客戶端與各版本語系：

| 事件類別 | 事件類型 | 日誌特徵範例 (中英雙語支援) | 提取資料 |
|---|---|---|---|
| **地圖產生** | `AREA_GENERATED` | `Generating level 79 area "Riverside Bluff" with seed 2841940291` | 地圖名稱、區域等級 (79)、銘刻階級 (T15 = Level - 64) |
| **進入地圖** | `AREA_ENTERED` | `Entering area Riverside Bluff` / `進入了區域：黃金台地` | 地圖名稱、非城鎮／非藏身處即觸發開圖計時 |
| **回城／藏身處** | `AREA_ENTERED` | `You have entered Hideout.` / `進入了區域：Clearfell Encampment` | 識別為安全區，自動觸發單場結算 |
| **金幣拾取** | `GOLD_RECEIVED` | `You have received 1,250 Gold.` / `獲得了 8,500 金幣` | 數值去逗號提取金幣數量並即時累加 |
| **首領討伐** | `BOSS_SLAIN` | `Quest Complete: Defeat the Map Boss` / `<Boss> has been slain.` | 標記本場次地圖首領已討伐 (Boss Slain) |
| **玩家陣亡** | `PLAYER_DIED` | `You have died.` / `你已經陣亡。` | 累加單場與 Session 總死亡計數 |
| **終局物資掉落** | `ITEM_RECEIVED` | `Waystone (Tier 16)` / `Greater Iron Rune` / `Divine Orb` | 記錄銘刻地圖階級、符文種類與高階通貨 |

---

## 💰 3. 金幣與時薪精算模型 (Metrics & Calculation)

### 核心計算公式：

1. **單場金幣時薪 (Run Gold/hr)**：
   $$\text{Gold/hr} = \frac{\text{單場拾取總金幣}}{\text{單場秒數}} \times 3600$$

2. **活躍刷圖金幣時薪 (Active Mapping Gold/hr)**：
   $$\text{Active Gold/hr} = \frac{\text{所有場次金幣總和}}{\sum \text{場次耗時 (秒)}} \times 3600$$

3. **Session 總金幣時薪 (Total Session Gold/hr)**：
   $$\text{Session Gold/hr} = \frac{\text{所有場次金幣總和}}{\max(\text{牆上總掛網時間}, \sum \text{場次耗時})} \times 3600$$

4. **首領討伐率 (Boss Slain Rate)**：
   $$\text{討伐率} = \frac{\text{成功擊殺首領場次數}}{\text{總刷圖場次數}} \times 100\%$$

---

## 🔒 4. 雙引擎數據隔離 (Storage Namespace Isolation)

在 POE_tool 中，PoE 1 與 PoE 2 擁有完全獨立的刷圖數據空間：
- **PoE 1 命名空間**：`poe_tool:poe1:poe_mapping_sessions_v1`（具備舊版向下相容）
- **PoE 2 命名空間**：`poe_tool:poe2:poe_mapping_sessions_v1`

當使用者透過頂部切換引擎時，刷圖歷程資料庫與當前 Session 會自動切換，避免 PoE 1 輿圖設定與 PoE 2 銘刻歷程互相混淆。

---

## 🖥️ 5. UI 功能特點

- **PoE 2 專屬金幣看板 (Poe2GoldTrackerCard)**：
  - 整合在刷圖追蹤首頁，顯示總累積金幣、金幣時薪、單場平均金幣、首領擊殺率、死亡數、銘刻地圖掉落與符文掉落。
- **日誌即時監聽與批次貼上解析**：
  - Tauri 模式下即時監控 `Client.txt` 寫入，圖進圖出全自動結算。
  - 網頁／備用模式支援一鍵貼上日誌文字，自動批次還原多場刷圖歷史。
- **歷程明細標籤 (MappingRunsTable)**：
  - 標示地圖名稱、銘刻階級（例如 `T15`）、拾取金幣（`💰 18.0k`）、首領討伐（`👑 討伐`）與死亡次數（`💀 x1`）。
  - 展開後提供完整的通貨差量與符文／銘刻明細。

---

## 🔗 相關文檔

- [🗿 銘刻地圖詞綴評鑑與洗圖精算](waystone-risk-and-rolling.md)
- [⚖️ PoE 1 vs PoE 2 雙引擎能力邊界](engine-capabilities.md)
- [🏛️ 系統架構概覽](../architecture/architecture-overview.md)
