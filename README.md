# 💎 POE_tool - 流亡黯道 (Path of Exile) 繁體中文即時查價與資產管理工具

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub Repository](https://img.shields.io/badge/GitHub-saijo0404%2FPOE--tool-181717.svg?logo=github&logoColor=white)](https://github.com/saijo0404/POE-tool)
[![Tauri 2.0](https://img.shields.io/badge/Tauri-2.0-24C8D8.svg?logo=tauri&logoColor=white)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-1.80%2B-orange.svg?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B%20Strict-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0%2B-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tests](https://img.shields.io/badge/Tests-271%20Passed-success.svg)]()
[![Architecture](https://img.shields.io/badge/Architecture-Hexagonal%20Clean%20Code-purple.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()

> **POE_tool** 是一款專為台服與國際服《流亡黯道 (Path of Exile)》玩家打造的極速即時查價、倉庫資產追蹤、Build 造價精算與輿圖策略規劃工具。採用 **Tauri 2.0 + Rust + React 19 + 六角架構 (Hexagonal Architecture)**，打包為純單一執行檔（`.exe`），啟動即用、**零 Node.js 執行期依賴**、記憶體佔用極低且具備毫秒級遊戲指令響應速度。

---

## 📑 目錄 (Table of Contents)

- [✨ 核心特色與功能 (Key Features)](#-核心特色與功能-key-features)
- [🗺️ 產品發展路線圖 (Roadmap & Milestones)](ROADMAP.md)
- [🏛️ 軟體架構與代碼品質規範 (Architecture & Quality)](#️-軟體架構與代碼品質規範-architecture--quality)
- [🔒 隱私與安全性保證 (Privacy & Security)](#-隱私與安全性保證-privacy--security)
- [🚀 快速開始使用 (Getting Started)](#-快速開始使用-getting-started)
  - [方式 A：Windows 玩家免安裝獨立執行檔 (推薦)](#方式-a-windows-玩家免安裝獨立執行檔-推薦)
  - [方式 B：開發者環境啟動 (Tauri 2.0 開發模式)](#方式-b-開發者環境啟動-tauri-20-開發模式)
- [⚙️ 設定與 POESESSID 說明 (Configuration)](#️-設定與-poesessid-說明-configuration)
- [🛠️ 建置與測試指南 (Build & Testing)](#️-建置與測試指南-build--testing)
- [📁 專案架構目錄說明 (Project Structure)](#-專案架構目錄說明-project-structure)
- [📜 授權條款與免責聲明 (License & Disclaimer)](#-授權條款與免責聲明-license--disclaimer)

---

## ✨ 核心特色與功能 (Key Features)

### 1. ⚔️ 遊戲內極速查價 (Instant In-Game Price Checker)
- **100% 繁體中文台服詞綴精準對照**：
  內建 17,600+ 詞綴與 5,100+ 物品中英雙向字典，不管是基底名稱（如 `後悔石` ➔ `Orb of Regret`、`撤銷石` ➔ `Orb of Unmaking`、`罪魔邪冠` ➔ `Hubris Circlet`）或是各類數值區間，均能毫秒級精準對譯並直接向官方市集查詢。
- **遊戲內 `Ctrl+C` 自動捕捉**：
  在遊戲中對著任意裝備按下 `Ctrl+C` 複製，工具即時透過剪貼簿自動解析物品屬性，一秒呈現市集即時刊登、官方現貨底價與中位數行情。
- **Win32 原生遊戲指令發送 (< 1ms)**：
  點擊「前往藏身處 (Travel to Hideout - F5)」或快速密語時，Rust 端透過 Win32 原生 `SendInput` 與安全的剪貼簿注入管線，瞬間完成視窗切換與指令發送，徹底消除傳統腳本冷啟動與輸入遺失問題。
- **官方 API 智慧多通道節流 (Rate-Limiting)**：
  Rust 核心內建 Tokio 多通道狀態機，自動解析 GGG Rate-Limit 標頭並智慧退避，確保高頻查價不遭遇 HTTP 429 封鎖。

### 2. 💰 倉庫資產與財富追蹤 (Wealth Tracker & Stash Breakdown)
- **真實資產即時估值（支援繁中字典轉換）**：
  對接官方 Stash API 與 poe.ninja / GGG 官方貨幣交易所即時現貨匯率，繁中物品自動轉換中英字典，精準計算倉庫頁與角色身上的通貨、碎片、星團珠寶、命運卡、聖甲蟲、精髓、地圖與傳奇裝備之 Chaos / Divine 總淨值。
- **分類佔比、自選分頁與門檻過濾**：
  支援勾選特定倉庫頁面、設定最低價值門檻（過濾微量垃圾物），並提供前 20 大高價值物品清單與各頁面排行。
- **自動資產快照、趨勢圖表與社群分享**：
  支援自訂背景排程週期（如每 60 分鐘）自動記錄資產快照，透過視覺化折線圖直觀追蹤財富增長動態，並支援一鍵匯出 **CSV 歷程報表** 與 **Discord 格式摘要**。

### 3. 🧮 流派造價計算器 (Build Cost Calculator - 支援 PoB 代碼與 ninja 解析)
- **多來源一鍵解析配置**：
  - **Path of Building (PoB) 原始代碼**：直接貼上 PoB 匯出的 **Raw Base64 壓縮碼** 或 **原始 XML**，Rust 核心在記憶體中進行 Base64 解碼與 zlib inflate 解壓縮。
  - **線上網址**：支援直接貼入 `pobb.in` 或 `poe.ninja` 角色流派網址。
  - 自動分類與抓取全套裝備、技能寶石、傳奇藥劑、珠寶與插槽。
- **官方即時現貨價同步 (Live Trade Sync)**：
  自動將 PoB 各部位裝備轉譯為官方 Trade 查詢條件，支援直接在介面中一鍵同步官方現貨價與開啟搜尋連結。
- **流派造價報表複製**：
  一鍵產出完整 Markdown 格式的部位造價報表，方便社群分享與配置評估。

### 4. 🗺️ 輿圖天賦規劃器與刷圖成本精算 (Atlas Strategy & Planner)
- **內建完整 860+ 節點輿圖天賦樹**：
  100% 繁體中文對齊官方天賦樹拓撲，支援 138 點上限防呆、智能最短路徑尋路、屬性總結面板與官方/PoEPlanner Base64 天賦編解碼。
- **自訂策略分級與聖甲蟲/工藝配置**：
  支援自由建立/編輯多級策略（入門/進階/頂配），配置聖甲蟲與地圖工藝（單一互斥原則與自訂價格記憶）。
- **即時物價連動與批次採購清單**：
  連動 poe.ninja 即時物價與神聖石匯率，精算單場成本、淨利潤、ROI 與時薪估計，並提供一鍵複製批次備料採購清單與市集精確搜尋關鍵字。

### 5. 📖 章節拓荒全指引 (Act Leveling Guide)
- **Act 1 ~ Act 10 最佳主線路線**：完整任務流程、被動技能點、昇華試煉與天賦拓荒節奏，採模組化章節架構維護。
- **職業寶石獎勵過濾與迷你浮窗模式**：支援職業專屬寶石過濾與懸浮置頂半透明迷你模式。

### 6. ⚡ 純 Rust 原生核心 (Pure Rust + Tokio Backend)
- 前後端完全透過 **Tauri 2.0 記憶體 IPC** 直接通訊（延遲 < 0.05ms），不再需要本機 HTTP 開 port 或 Node.js 伺服器中介。
- 記憶體佔用極低（僅約 35MB~60MB），啟動速度 < 0.2 秒。

---

## 🏛️ 軟體架構與代碼品質規範 (Architecture & Quality)

本專案遵循嚴格的 **六角架構 (Hexagonal / Ports & Adapters Architecture)** 與現代化整潔代碼規範：

```
                    ┌────────────────────────┐
                    │  UI Presentation (Web) │
                    │  React 19 Components   │
                    └───────────┬────────────┘
                                │
                    ┌───────────▼────────────┐
                    │  Application Ports     │
                    │  IApiClient / IStorage │
                    └───────────┬────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │                       │                       │
┌───────▼───────────┐ ┌─────────▼─────────┐ ┌───────────▼───────────┐
│   Domain Core     │ │   Infrastructure  │ │   Tauri Rust Backend  │
│  Entities / Mod   │ │ TauriBridgeClient │ │ Modularized Services  │
│  Result / Error   │ │  LocalStorageAdap │ │  (Trade/Stash/Parser) │
└───────────────────┘ └───────────────────┘ └───────────────────────┘
```

- **微模組化設計**：所有生產檔案長度嚴格控制在 **$\le 200$ 行** 內，所有函式長度嚴格控制在 **$\le 30$ 行** 內。
- **六角架構埠口解耦 (IStoragePort)**：全面採用依賴注入 (DIP)，徹底消除 UI 元件與全域 `localStorage` 的直接綁定。
- **Railway-oriented 錯誤處理**：全面採用 `Result<T, E>` 與型別化的 `DomainError`，拒絕未處理的例外拋出。
- **TypeScript Strict Typing**：全域無顯式 `any` 宣告，所有資料傳遞皆具備嚴格介面防護。
- **雙向適配器支援**：前端透過 `ApiClientFactory` 支援 Tauri 原生環境與純瀏覽器展示環境之無縫相容。

---

## 🔒 隱私與安全性保證 (Privacy & Security)

**POE_tool 是 100% 本地運行的開源專案，我們將您的帳號隱私與安全性置於首位：**

- 🛡️ **無任何外部伺服器**：本工具不設任何遠端收集伺服器，所有設定、快取與資產歷史資料皆保存在您個人的電腦本機（`data/` 或系統應用程式資料夾）。
- 🛡️ **憑證只與官方通訊**：您的 `POESESSID` 僅在向 Path of Exile 官方伺服器（`pathofexile.com`）請求您的個人角色與倉庫頁資料時使用。
- 🛡️ **防止誤傳 Git**：本專案的 `.gitignore` 已嚴格排除個人設定檔 (`settings.json`) 與資產記錄檔 (`wealth_snapshots.json`)，確保您的隱私不會在協作或上傳 GitHub 時洩漏。
- 詳細資訊請參閱 [SECURITY.md](SECURITY.md)。

---

## 🚀 快速開始使用 (Getting Started)

### 方式 A：Windows 玩家免安裝獨立執行檔 (推薦)

1. 前往 GitHub [Releases](https://github.com/saijo0404/POE-tool/releases) 頁面下載最新版單一執行檔 `POE_tool.exe`。
2. 雙擊執行 `POE_tool.exe`。
3. 點擊右上角 ⚙️ **「系統設定」** 完成基本設定即可開始使用！
4. 可透過右上角按鈕將工具設為 **「📌 視窗置頂 (Always on Top)」**，方便在遊戲中隨時對照查價。

---

### 方式 B：開發者環境啟動 (Tauri 2.0 開發模式)

確保本機已安裝 **Rust (cargo 1.80+)** 與 **Node.js 18+**（僅用於 Vite 前端編譯）：

```bash
# 1. 複製專案庫
git clone https://github.com/saijo0404/POE-tool.git
cd POE_tool

# 2. 安裝前端依賴
npm install

# 3. 啟動 Tauri 2.0 桌面端開發模式
npm run tauri:dev
```

---

## ⚙️ 設定與 POESESSID 說明 (Configuration)

若您欲使用「**倉庫資產追蹤**」功能，需要在系統設定中填入您的官方帳號資訊：

### 取得 POESESSID 的方式：

1. **方式一：一鍵授權登入**
   - 點擊設定彈窗中的「一鍵登入官方帳號」，於安全視窗中登入官方帳號即可自動同步連線。

2. **方式二：手動填寫 Cookie**
   - 使用瀏覽器開啟 [Path of Exile 官方網站](https://www.pathofexile.com/) 並登入。
   - 按下鍵盤 `F12` 開啟開發者工具，切換至 **應用程式 (Application)** / **儲存空間 (Storage)** ➔ **Cookies** ➔ `https://www.pathofexile.com`。
   - 複製名為 `POESESSID` 的 Cookie 數值。
   - 回到本工具右上角 ⚙️ **系統設定**，貼入「官方 POESESSID」並填寫您的「帳號名稱 (Account Name)」。
   - 點擊「測試官方連線」驗證連線狀態。

---

## 🛠️ 建置與測試指南 (Build & Testing)

### 執行完整測試套件 (271 Tests Passed)

```bash
# 1. 執行前端 Vitest 單元測試 (49 Test Suites, 232 Tests)
npm test

# 2. 執行後端 Rust Cargo 單元測試 (39 Tests)
cargo test --manifest-path src-tauri/Cargo.toml

# 3. 執行前端型別檢查與代碼品質檢驗
npm run typecheck
npm run lint

# 4. 執行前端生產編譯
npm run build
```

### 打包為原生單一執行檔 (Tauri 2.0 Build)

#### 1. 在 Windows 本機終端機打包：
```bash
npm run tauri:build
```
打包後的執行檔將位於 `src-tauri/target/release/POE_tool.exe`。

#### 2. 在 WSL (Linux / Ubuntu) 跨平台直接編譯 Windows `.exe`：

```bash
# 首次環境設定 (安裝 xwin 與 LLVM 工具鏈)
rustup target add x86_64-pc-windows-msvc
cargo install cargo-xwin
sudo apt update && sudo apt install -y clang lld

# 執行 Windows 獨立執行檔跨平台編譯
npm run tauri:build:win
```
產出的單一免安裝執行檔將位於：
👉 `src-tauri/target/x86_64-pc-windows-msvc/release/poe-tool.exe`

---

## 📁 專案架構目錄說明 (Project Structure)

```text
POE_tool/
├── data/                               # 官方中英詞綴與物品雙向字典 (JSON)
│   ├── ggg_items.json                  # 國際服物品資料
│   ├── ggg_static.json                 # 國際服靜態通貨與分類
│   ├── ggg_stats.json                  # 國際服詞綴資料
│   ├── tw_ggg_items.json               # 台服物品資料
│   ├── tw_ggg_static.json              # 台服靜態通貨與分類
│   ├── tw_ggg_stats.json               # 台服詞綴資料
│   ├── item_dictionary.json            # 5,100+ 中英物品名稱雙向字典
│   └── stat_dictionary.json            # 17,600+ 中英詞綴對照雙向字典
├── src/                                # React 19 + TypeScript 六角架構前端 (各檔案 <= 200 行)
│   ├── application/ports/              # 應用抽象介面 (IApiClientPort, IStoragePort)
│   ├── domain/                         # 純領域核心 (型別定義、Result 錯誤處理、純函式計算)
│   │   ├── acts/                       # 章節拓荒指引資料 (acts/act1.ts ~ act10.ts)
│   │   ├── atlas/                      # 輿圖天賦拓撲、聖甲蟲資料庫、尋路與算力核心
│   │   ├── errors/                     # Result<T, E> 與 DomainError
│   │   ├── item/                       # 物品解析、詞綴格式化
│   │   ├── trade/                      # 市集請求結構、排序與過濾
│   │   ├── wealth/                     # 資產統計、快照計算
│   │   ├── build/                      # 流派造價模型與常數
│   │   └── settings/                   # 系統設定領域實體
│   ├── infrastructure/                 # 基礎設施適配器
│   │   ├── api/                        # TauriBridgeClient, HttpFallbackClient, ApiClientFactory
│   │   └── storage/                    # LocalStorageAdapter (實作 IStoragePort)
│   ├── components/                     # 模組化展示組件 (各檔案 <= 200 行)
│   │   ├── acts/                       # 章節拓荒子元件
│   │   ├── atlas/                      # 輿圖規劃器與聖甲蟲子元件
│   │   ├── price/                      # 即時查價子元件 (TradeListingView, AffixFilterList...)
│   │   ├── wealth/                     # 倉庫資產子元件 (WealthHeaderCard, TabSidebarList...)
│   │   ├── build/                      # 造價計算子元件 (BuildInputBar, BuildItemRow...)
│   │   ├── settings/                   # 系統設定子元件 (AccountAuthSection, StashTabSelector...)
│   │   ├── common/                     # 通用元件 (ItemTooltip, ConnectionStatusBadge...)
│   │   ├── PriceChecker.tsx            # 查價頁容器
│   │   ├── WealthTracker.tsx           # 資產頁容器
│   │   ├── BuildCalculator.tsx         # 造價頁容器
│   │   ├── AtlasStrategyHub.tsx        # 輿圖策略核心容器
│   │   └── SettingsModal.tsx           # 設定彈窗容器
│   ├── hooks/                          # 業務 Hooks (usePriceChecker, useWealthTracker, useAtlasStrategy...)
│   ├── utils/                          # 工具庫 (image, tauri, wealthExport, wealthCalculator)
│   ├── context/                        # React Context 全域狀態管理
│   ├── App.tsx                         # 主應用導航入口
│   └── main.tsx
├── src-tauri/                          # Tauri 2.0 Rust 原生微核心 (各檔案 <= 200 行)
│   ├── Cargo.toml                      # Rust 依賴
│   ├── tauri.conf.json                 # 視窗尺寸、IPC 權限與打包設定
│   └── src/
│       ├── commands/                   # Tauri #[tauri::command] IPC 接口
│       │   ├── trade_commands.rs       # 查價、物品解析與藏身處發送
│       │   ├── settings_commands/      # 帳號設定、連線測試與 Webview 驗證
│       │   ├── wealth_commands.rs      # 倉庫快照與進度排程
│       │   ├── ninja_commands.rs       # ninja 行情與 build 計算
│       │   └── logger_commands.rs      # 日誌路徑與內容讀取
│       ├── models/                     # Rust 領域資料模型 (Item, Trade, Stash, Ninja, Settings)
│       ├── services/                   # 核心微服務
│       │   ├── parser/                 # 裝備文字解析子模組 (header, affix, requirements...)
│       │   ├── trade/                  # 市集搜尋、Listing 解析與密語發送 (query_builder, trade_client...)
│       │   ├── dictionary/             # 中英詞綴索引與匹配 (state, base_types, trade_stats...)
│       │   ├── stash/                  # 倉庫抓取、資產估值與快照排程 (stash_api, valuation, snapshot_manager...)
│       │   ├── build_calc/             # PoB XML/Base64 解碼、詞綴轉譯與整套造價 (character_parser, pob_decoder...)
│       │   ├── ninja/                  # 官方交易所與 poe.ninja 即時物價 (official_exchange, ninja_api...)
│       │   ├── logger/                 # 跨平台日誌記錄與檔案輪替 (path_resolver, writer...)
│       │   ├── rate_limiter.rs         # GGG API 智慧多通道速率限制器
│       │   ├── hotkey.rs               # Win32 SendInput 按鍵注入與全域熱鍵
│       │   └── storage.rs              # 跨平台 Atomic JSON 檔案儲存
│       └── lib.rs                      # Tauri 應用程式初始化與外掛註冊
├── package.json                        # 前端開發與建置腳本
├── vite.config.ts                      # Vite 打包配置
├── tsconfig.json                       # TypeScript 配置
├── ROADMAP.md                          # 產品發展路線圖與 GitHub Milestone
├── SECURITY.md                         # 安全性政策與隱私指南
├── LICENSE                             # MIT 開源授權
└── README.md                           # 專案說明文件
```

---

## 📜 授權條款與免責聲明 (License & Disclaimer)

### 開源授權
本專案採用 [MIT License](LICENSE) 授權開放。

### 免責聲明 (Disclaimer)
- 本軟體為社群愛好者自製之第三方開源輔助工具，與 Grinding Gear Games (GGG) 官方無官方關聯或授權關係。
- *Path of Exile* 與相關美術資源商標均屬 Grinding Gear Games 所有。
- 本工具僅使用官方公開之 Trade API 與公開網頁進行查詢，請遵守官方使用者守則及合理的 API 調用規範。
