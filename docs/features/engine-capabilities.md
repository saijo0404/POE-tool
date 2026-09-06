# ⚖️ PoE 1 與 PoE 2 雙引擎能力邊界與功能隔離 (Engine Capabilities)

POE_tool 從架構底層即支援《流亡黯道 1 (Path of Exile 1)》與《流亡黯道 2 (Path of Exile 2)》雙世代引擎。為了防止不同世代的專屬機制相互污染，系統建立了嚴格的能力定義、邊界隔離與專注模式。

---

## 📊 雙引擎功能能力對照表 (Capability Matrix)

| 功能模組 | ID 標識 | 支援世代 | 世代差異與機制說明 |
|---|---|---|---|
| **首頁儀表板** | `dashboard` | 雙世代支援 (`poe1`, `poe2`) | 即時經濟概況、快捷操作導航與遊戲引擎狀態檢視 |
| **裝備查價** | `price` | 雙世代支援 (`poe1`, `poe2`) | PoE 1 支援複雜詞綴與偽屬性；PoE 2 支援未剪切寶石、符文與全新詞綴結構 |
| **大宗交易所** | `exchange` | 雙世代支援 (`poe1`, `poe2`) | PoE 2 原生對接 Faustus 市集，支援黃金 (Gold) 手續費計算與掛牌匯率 |
| **資產估算** | `wealth` | 雙世代支援 (`poe1`, `poe2`) | 倉庫通貨與裝備價值折算（PoE 1 基於 Chaos/Divine；PoE 2 結合次世代匯率模型） |
| **刷圖記錄** | `mapping` | 雙世代支援 (`poe1`, `poe2`) | PoE 1 對應 Map 輿圖刷圖日誌；PoE 2 支援 Waystone（路標石）戰鬥追蹤 |
| **輿圖策略** | `atlas` | **PoE 1 專屬** (`poe1`) | 內建 860+ 節點輿圖天賦樹拓撲、聖甲蟲 (Scarab) 與地圖工藝配置 |
| **地圖過濾 / Waystone** | `mapmod` | 雙世代支援 (`poe1`, `poe2`) | PoE 1 支援地圖危險詞綴與安全 Regex；PoE 2 支援專屬 [銘刻地圖 (Waystone) 詞綴評鑑與洗圖精算](waystone-risk-and-rolling.md) |
| **Build 成本** | `build` | 雙世代支援 (`poe1`, `poe2`) | PoE 1 支援 PoB XML/Base64 解碼；PoE 2 支援全新技能雙配置 (Dual Spec) 與武器切換成本 |
| **拓荒指南** | `acts` | **PoE 1 專屬** (`poe1`) | 經典 Act 1 ~ Act 10 主線任務、昇華試煉與拓荒天賦節奏全指南 |
| **工藝精算** | `craft` | **PoE 1 專屬** (`poe1`) | 針對 PoE 1 化石、精髓、收割與混沌石重置之成本期望值精算矩陣 |

---

## 🛡️ 隔離防護機制 (Isolation & Protection)

### 1. 儲存隔離 (Namespaced Storage Adapter)
- 玩家在 PoE 1 與 PoE 2 下的暫存、快照記錄與偏好設定完全透過 `StorageNamespaceAdapter` 隔離。
- 鍵值自動標記前綴（如 `poe1:settings` 與 `poe2:settings`），防止不同世代的歷史資產或設定互相覆蓋。

### 2. 路由自動重導向防呆 (Route Fallback Guard)
- 當使用者目前處於 PoE 2 引擎，卻嘗試點入或透過網址存取 PoE 1 專屬頁面（如 `atlas` 或 `craft`）時，系統會自動攔截並安全導航回通用分頁（預設為 `price` 查價）。

### 3. 🎯 專注模式 (Focus Mode)
- 位於頂部狀態列的「專注模式」開關。
- 開啟後，左側功能導航欄會自動隱藏當前世代不支援的全部功能，提供玩家最極簡、無干擾的操作介面。
