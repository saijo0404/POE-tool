# 📝 版本更新日誌 (Changelog)

本專案的所有重要變更均會記錄於此文件中。

本更新日誌格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/) 標準，並嚴格遵循 [語意化版本 (Semantic Versioning)](https://semver.org/lang/zh-TW/) 規範。

---

## [Unreleased]

### 📖 文件 (Documentation)
- 建立產品發展路線圖 [`ROADMAP.md`](ROADMAP.md) 並配置 GitHub Milestone 連結 ([#37](https://github.com/saijo0404/POE-tool/issues/37))。
- 建立根目錄版本歷史與發布記錄 [`CHANGELOG.md`](CHANGELOG.md) ([#38](https://github.com/saijo0404/POE-tool/issues/38))。

---

## [1.4.0] - 2026-08-30

### ✨ 新增 (Added)
- **PoB 原始代碼解析**：流派造價計算器 (Build Calculator) 支援直接解析 Path of Building 原始 Raw Base64 壓縮字串與 XML 格式，由 Rust 核心進行記憶體 inflate 解壓縮 ([#27](https://github.com/saijo0404/POE-tool/issues/27), [#33](https://github.com/saijo0404/POE-tool/pull/33))。

### 🐛 修復 (Fixed)
- **倉庫繁中資產估值**：修復倉庫資產估值 (Stash Valuation) 未對繁體中文物品名稱進行字典轉換之問題，確保台服玩家資產計算 100% 精準 ([#28](https://github.com/saijo0404/POE-tool/issues/28), [#34](https://github.com/saijo0404/POE-tool/pull/34))。
- **藏身處指令管線**：修復 Win32「前往藏身處 (F5)」指令未先寫入剪貼簿即模擬鍵盤貼上導致指令失效之問題 ([#26](https://github.com/saijo0404/POE-tool/issues/26), [#32](https://github.com/saijo0404/POE-tool/pull/32))。
- **UI 冗餘按鈕移除**：移除查價介面已無作用之「讀取剪貼簿」按鈕，精簡介面佈局 ([#19](https://github.com/saijo0404/POE-tool/issues/19), [#31](https://github.com/saijo0404/POE-tool/pull/31))。

### ♻️ 重構 (Refactored)
- **六角架構儲存埠統一**：定義 `IStoragePort` 應用抽象並實作 `LocalStorageAdapter`，消除前端組件對底層儲存機制的直接耦合 ([#36](https://github.com/saijo0404/POE-tool/pull/36))。
- **微模組化規範落地**：重構大型檔案，使全專案所有 TypeScript / React 與 Rust 檔案長度均符合 $\le 200$ 行之架構規範 ([#36](https://github.com/saijo0404/POE-tool/pull/36))。
- **全域型別健全化**：消除代碼庫中所有顯式 `any` 型別，並於 `types/poe.ts` 補齊 atlas 輿圖領域型別導出 ([#29](https://github.com/saijo0404/POE-tool/issues/29), [#35](https://github.com/saijo0404/POE-tool/pull/35))。

---

## [1.3.0] - 2026-08-30

### ✨ 新增 (Added)
- **輿圖策略自由編輯**：輿圖策略支援自由修改機制分類、自訂標籤、名稱與簡介，並提供選擇器卡片快捷編輯按鈕 ([#13](https://github.com/saijo0404/POE-tool/issues/13))。
- **地圖工藝自訂價格與名稱記憶**：輿圖備料之地圖工藝支援自訂修改名稱與單價記憶自動儲存 ([#16](https://github.com/saijo0404/POE-tool/issues/16))。
- **規劃器匯入匯出模組整合**：簡化策略頂部天賦列，將外部瀏覽器開啟與天賦複製功能整合至規劃器匯入匯出模組中 ([#7](https://github.com/saijo0404/POE-tool/issues/7), [#9](https://github.com/saijo0404/POE-tool/pull/9))。
- **倉庫資產歷程匯出**：倉庫資產追蹤器支援資產走勢圖、CSV 歷程報表與 Discord 格式摘要匯出。

### 🐛 修復 (Fixed)
- **天賦點數上限與繁中補完**：更正輿圖天賦點數上限為 138 點，加入超額分配防呆警示，並補完屬性總結面板之繁體中文翻譯 ([#11](https://github.com/saijo0404/POE-tool/issues/11), [#14](https://github.com/saijo0404/POE-tool/pull/14))。
- **地圖工藝單一原則約束**：限制輿圖策略備料地圖工藝至多選擇 1 項，防止重複或多重工藝疊加造成計算失真 ([#12](https://github.com/saijo0404/POE-tool/issues/12), [#15](https://github.com/saijo0404/POE-tool/pull/15))。
- **採購清單生成修復**：修復輿圖策略備料之「一鍵複製採購清單」產生內容格式與市集查詢條件異常問題 ([#10](https://github.com/saijo0404/POE-tool/issues/10))。

### 🛠️ 基礎設施 (CI/CD)
- **CI/CD 分流管理**：移除過時且重複之 `build.yml` 工作流程，由 `ci.yml` (自動化測試) 與 `release.yml` (打包發布) 分流管理。

---

## [1.2.0] - 2026-08-29

### ✨ 新增 (Added)
- **內建 PoE 1 輿圖天賦規劃器**：導入官方完整 860+ 節點輿圖天賦樹幾何拓撲資料結構與雙圖層高亮畫布 ([#1](https://github.com/saijo0404/POE-tool/issues/1), [#6](https://github.com/saijo0404/POE-tool/pull/6))。
- **智慧尋路與天賦編解碼**：實作 Dijkstra 智能最短路徑尋路分配演算法，並支援官方 Base64 與 PoEPlanner (`BQAc...`) 雙向編解碼與自適應解析 ([#1](https://github.com/saijo0404/POE-tool/issues/1))。
- **核心基石繁中化與屬性總結**：收錄 27 顆輿圖核心基石繁體中文說明與數值即時加總統計面板 ([#1](https://github.com/saijo0404/POE-tool/issues/1))。
- **輿圖策略自由刪除與空狀態**：支援輿圖策略完全自由刪除，解除單一分級限制與優化完全空狀態呈現 ([#4](https://github.com/saijo0404/POE-tool/issues/4), [#5](https://github.com/saijo0404/POE-tool/pull/5))。

### 🐛 修復 (Fixed)
- **PoEPlanner 網址載入修復**：修復預設 `poeplanner.com` 輿圖天賦網址格式無法在外部網頁正常載入之問題 ([#2](https://github.com/saijo0404/POE-tool/issues/2), [#3](https://github.com/saijo0404/POE-tool/pull/3))。
- **天賦雙向連線拓撲修復**：修復官方天賦雙向連線拓撲與雙圖層高亮顯示缺失問題 ([#1](https://github.com/saijo0404/POE-tool/issues/1))。
- **繁中翻譯引擎升級**：全面升級輿圖天賦屬性繁中翻譯引擎，並修復畫布在一般/縮小模式下的置中偏移 ([#1](https://github.com/saijo0404/POE-tool/issues/1))。

### 🛠️ 基礎設施 (CI/CD)
- **工程規範範本**：新增 GitHub Issue 與 Pull Request 標準範本，並配置專注 Windows 平台的 CI/CD 工作流程。

---

## [1.1.0] - 2026-08-23

### ✨ 新增 (Added)
- **多來源剪貼簿格式支援**：即時查價介面支援解析 `poe.ninja` 與 `Path of Building` (PoB) 物品剪貼簿複製格式。
- **物品浮動提示卡片 (Tooltip)**：全面強化查價介面與流派計算器之物品 Hover 浮動提示卡片體驗。
- **即時價格持久化**：歷史查價紀錄支援持久化儲存與即時價格重載。

### 🐛 修復 (Fixed)
- **流派造價過濾器修復**：修復流派造價計算器 (Build Calculator) 之市集查詢過濾條件與傳奇物品名稱搜尋。
- **背包物品排除**：在計算流派造價時自動排除角色背包內之非穿戴物品，避免造價重複累加。

---

## [1.0.0] - 2026-08-22

### ✨ 初始發布 (Initial Release)
- **⚔️ 遊戲內極速即時查價 (Instant Price Checker)**：
  - 支援遊戲內 `Ctrl+C` 剪貼簿自動捕捉與即時官方市集行情查詢。
  - 內建 17,600+ 詞綴與 5,100+ 物品名稱中英雙向智慧字典。
  - Rust 原生 Win32 `SendInput` 按鍵指令注入（< 1ms 響應，支援 F5 一鍵前往藏身處）。
  - Tokio 智慧多通道速率限制器 (Rate Limiter)，自動解析 GGG Rate-Limit 標頭並指數退避防 429 阻擋。
- **💰 倉庫資產即時估值 (Wealth Tracker & Stash Valuation)**：
  - 對接官方 Stash API 與即時匯率，精算通貨、碎片、卡片、聖甲蟲與傳奇裝備之 Chaos / Divine 淨值。
  - 支援自選分頁勾選、最低價值門檻過濾與資產分類佔比圖表。
- **🧮 流派造價計算器 (Build Cost Calculator)**：
  - 支援解析 `pobb.in` 與 `poe.ninja` 角色流派網址，自動抓取整套裝備與技能寶石並精算造價。
  - 支援官方即時現貨價一鍵同步與部位造價 Markdown 報表匯出。
- **📖 章節拓荒全指引 (Act Leveling Guide)**：
  - 完整收錄 Act 1 ~ Act 10 最佳主線升級路線、被動天賦點、昇華試煉與職業寶石過濾。
  - 支援懸浮置頂半透明迷你模式。
- **⚡ Tauri 2.0 + Rust 六角架構**：
  - 純單一執行檔（`.exe`），零 Node.js 執行期依賴，記憶體佔用僅 35MB~60MB。
  - 具備完整 Vitest 前端單元測試防護網。

---

[Unreleased]: https://github.com/saijo0404/POE-tool/compare/v1.4.0...HEAD
[1.4.0]: https://github.com/saijo0404/POE-tool/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/saijo0404/POE-tool/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/saijo0404/POE-tool/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/saijo0404/POE-tool/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/saijo0404/POE-tool/releases/tag/v1.0.0
