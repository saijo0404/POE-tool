# 📚 POE_tool 技術與使用文檔中心 (Documentation Hub)

歡迎來到 **POE_tool** 官方工程與使用者文檔中心！本目錄旨在依據軟體工程最佳實踐，模組化保存專案的架構設計、功能規格、使用者操作指引與開源協作規範。

---

## 🗺️ 文檔地圖 (Documentation Index)

### 1. 📖 玩家操作指南 ([User Guide](user-guide/))
- [🚀 快速上手與設定 (Getting Started)](user-guide/getting-started.md)：安裝下載、台服/國際服切換、官方 POESESSID 設定與連線驗證。
- [⚡ 快捷鍵與懸浮窗 (Hotkeys & Overlay HUD)](user-guide/hotkeys-and-overlay.md)：`Ctrl+D` 遊戲內極簡懸浮查價小卡、`Ctrl+C` 剪貼簿自動識別、官方交易密語助理與倉庫取貨標記。

### 2. ✨ 核心功能與世代規格 ([Features & Engines](features/))
- [⚖️ PoE 1 vs PoE 2 雙引擎能力邊界 (Engine Capabilities)](features/engine-capabilities.md)：世代差異對照矩陣、雙引擎功能隔離機制與專注模式 (Focus Mode)。
- [⚔️ 裝備即時查價與詞綴精算 (Price Checker)](features/price-checker.md)：100% 繁中/英文雙向字典、數值範圍過濾、偽屬性 (Pseudo) 聚合與官方即時行情查詢。
- [🪙 大宗貨幣交易所 (Faustus Exchange)](features/faustus-exchange.md)：Faustus 官方交易所支援、金幣手續費精算與跨市場現貨套利評估。
- [🗿 PoE 2 銘刻地圖評鑑與洗圖精算 (Waystone Risk & Rolling)](features/waystone-risk-and-rolling.md)：PoE 2 專屬危險詞綴庫、機體弱點對比、安全評分檢驗與洗圖通貨成本預測。
- [🗼 PoE 2 先祖塔台與群落策略優化 (Precursor Towers & Biomes)](features/poe2-precursor-towers-and-biomes.md)：先祖碑牌 (Precursor Tablets) 插槽聚合、多塔交疊共振乘數 (+15%/+35%) 與六大生態群落策略優化。
- [🗺️ PoE 2 日誌解析與金幣收益追蹤 (Mapping Log Parser & Gold Tracker)](features/poe2-mapping-and-gold-tracker.md)：Client.txt 即時事件辨識、銘刻地圖進出狀態機、金幣拾取淨量與 Gold/hr 時薪精算。

### 3. 🏛️ 軟體架構與工程規範 ([Architecture](architecture/))
- [📐 系統架構概覽 (Architecture Overview)](architecture/architecture-overview.md)：六角架構 (Hexagonal Architecture)、連接埠與適配器 (Ports & Adapters)、Tauri 2.0 Rust 原生微核心 IPC。
- [📏 代碼規範與行數守則 (Code Conventions)](architecture/code-conventions.md)：單檔長度上限（邏輯 $\le 200$ 行、UI/測試 $\le 300$ 行、函式 $\le 30$ 行）、0 顯式 `any` 與型別安全體系。
- [📝 結構化滾動日誌與診斷匯出 (Logging & Diagnostics)](architecture/logging-and-diagnostics.md)：大小上限 (1MB)、滾動備份 (3 份)、循環覆寫、敏感資料脫敏與一鍵診斷匯出。

### 4. 🛠️ 開發與協作指南 ([Development](development/))
- [🤝 貢獻指南與工作流程 (Contributing Guide)](development/contributing.md)：本機環境建置、測試執行 (`npm test`, `cargo test`)、Conventional Commits 提交規範與 PR 合併流程。

---

## 📌 文檔維護規範 (Documentation Governance)

為了確保代碼庫與技術文檔長期同步一致，團隊成員與貢獻者須遵循以下維護原則：
1. **同步修訂**：當新增重大功能或調整架構邊界時，必須於同一個 PR 內同步修訂對應的 `/docs` 檔案。
2. **單元測試驗證**：文檔中的所有 CLI 指令與路徑均須經過本機實機測試驗證。
3. **無效連結防護**：提交文檔前，請確認所有 Markdown 內部相對連結跳轉均正確無誤。
