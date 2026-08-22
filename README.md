# 💎 POE_tool - 流亡黯道 (Path of Exile) 繁體中文即時查價與資產管理工具

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![GitHub Repository](https://img.shields.io/badge/GitHub-saijo0404%2FPOE--tool-181717.svg?logo=github&logoColor=white)](https://github.com/saijo0404/POE-tool)
[![Tauri 2.0](https://img.shields.io/badge/Tauri-2.0-24C8D8.svg?logo=tauri&logoColor=white)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-1.80%2B-orange.svg?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0%2B-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Platform](https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)]()

> **POE_tool** 是一款專為台服與國際服《流亡黯道 (Path of Exile)》玩家打造的極速即時查價、倉庫資產追蹤與 Build 造價計算工具。採用 **Tauri 2.0 + Rust + React 19** 原生架構，打包為純單一執行檔（`.exe`），啟動即用、**零 Node.js 執行期依賴**、記憶體佔用極低且具備毫秒級遊戲指令響應速度。

---

## 📑 目錄 (Table of Contents)

- [✨ 核心特色與功能 (Key Features)](#-核心特色與功能-key-features)
- [🔒 隱私與安全性保證 (Privacy & Security)](#-隱私與安全性保證-privacy--security)
- [🚀 快速開始使用 (Getting Started)](#-快速開始使用-getting-started)
  - [方式 A：Windows 玩家免安裝獨立執行檔 (推薦)](#方式-a-windows-玩家免安裝獨立執行檔-推薦)
  - [方式 B：開發者環境啟動 (Tauri 2.0 開發模式)](#方式-b-開發者環境啟動-tauri-20-開發模式)
- [⚙️ 設定與 POESESSID 說明 (Configuration)](#️-設定與-poesessid-說明-configuration)
- [🛠️ 建置與測試指南 (Build & Testing)](#️-建置與測試指南-build--testing)
- [📁 專案架構說明 (Project Structure)](#-專案架構說明-project-structure)
- [📜 授權條款與免責聲明 (License & Disclaimer)](#-授權條款與免責聲明-license--disclaimer)

---

## ✨ 核心特色與功能 (Key Features)

### 1. ⚔️ 遊戲內極速查價 (Instant In-Game Price Checker)
- **100% 繁體中文台服詞綴精準對照**：
  內建 17,600+ 詞綴與 5,100+ 物品中英雙向字典，不管是基底名稱（如 `後悔石` ➔ `Orb of Regret`、`撤銷石` ➔ `Orb of Unmaking`、`罪魔邪冠` ➔ `Hubris Circlet`）或是各類數值區間，均能毫秒級精準對譯並直接向官方市集查詢。
- **遊戲內 `Ctrl+C` 即時捕捉**：
  在遊戲中對著任意裝備按下 `Ctrl+C` 複製，工具即時透過原生剪貼簿解析物品屬性，一秒呈現市集搜尋結果。
- **Win32 原生遊戲按鍵注入 (< 1ms)**：
  點擊「前往藏身處 (Travel to Hideout)」時，Rust 端透過 Win32 原生 `SendInput` 瞬間完成視窗切換與指令發送，徹底消除傳統腳本 400ms 的冷啟動卡頓。
- **官方 API 智慧多通道節流 (Rate-Limiting)**：
  Rust 核心內建 Tokio 多通道狀態機，自動解析 GGG Rate-Limit 標頭並智慧退避，確保高頻查價不遭遇 HTTP 429 封鎖。

### 2. 💰 倉庫資產與財富追蹤 (Wealth Tracker & Stash Breakdown)
- **倉庫價值自動計算**：
  對接官方 Stash API 與 poe.ninja 即時通貨匯率，自動計算倉庫頁與角色身上的通貨、碎片、星團珠寶、地圖與傳奇裝備之 Chaos / Divine 總價值。
- **分類佔比與倉庫頁拆解 (Breakdown)**：
  清楚列出各大倉庫頁面的價值排行與前 20 大高價值物品清單。
- **自動資產快照與趨勢圖表 (Historical Snapshots)**：
  支援自訂背景排程週期（如每 60 分鐘）自動記錄資產快照，透過視覺化折線圖直觀追蹤財富增長動態。

### 3. 🧮 pobb.in / poe.ninja 流派造價計算器 (Build Cost Calculator)
- **一鍵解析配置**：
  直接貼上 `pobb.in` 連結或 `poe.ninja` 角色流派網址，Rust 核心直接於記憶體中解壓縮 Zlib Base64 XML 代碼，抓取全套裝備、技能寶石、傳奇藥劑與珠寶插槽。
- **動態估算整套造價**：
  即時查詢當前聯盟市場物價，列出各欄位細項花費並加總整套流派所需之 Divine 與 Chaos 總成本。

### 4. ⚡ 純 Rust 原生核心 (Pure Rust + Tokio Backend)
- 前後端完全透過 **Tauri 2.0 記憶體 IPC** 直接通訊（延遲 < 0.05ms），不再需要本機 HTTP 開 port 或 Node.js 伺服器中介。
- 記憶體佔用極低（僅約 35MB~60MB），啟動速度 < 0.2 秒。

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
cd POE-tool

# 2. 安裝前端依賴
npm install

# 3. 啟動 Tauri 2.0 桌面端開發模式
npm run tauri:dev
```

---

## ⚙️ 設定與 POESESSID 說明 (Configuration)

若您欲使用「**倉庫資產追蹤**」功能，需要在系統設定中填入您的官方帳號資訊：

### 取得 POESESSID 的兩種方式：

1. **方式一：手動獲取 Cookie (推薦)**
   - 使用一般瀏覽器開啟 [Path of Exile 官方網站](https://www.pathofexile.com/) 並登入。
   - 按下鍵盤 `F12` 開啟開發者工具，切換至 **應用程式 (Application)** / **儲存空間 (Storage)** ➔ **Cookies** ➔ `https://www.pathofexile.com`。
   - 複製名為 `POESESSID` 的 Cookie 數值。
   - 回到本工具右上角 ⚙️ **系統設定**，貼入「官方 POESESSID」並填寫您的「帳號名稱 (Account Name)」。

2. **方式二：測試連線**
   - 填寫完畢後點擊「測試官方連線」，系統將自動驗證憑證並列出您帳號下的角色清單。

---

## 🛠️ 建置與測試指南 (Build & Testing)

### 執行前端測試套件

```bash
# 執行所有前端組件與邏輯測試
npm test
```

### 打包為原生單一執行檔 (Tauri 2.0 Build)

#### 1. 在 Windows 本機終端機打包：
```bash
npm run tauri:build
```
打包後的執行檔將位於 `src-tauri/target/release/POE_tool.exe`。

#### 2. 在 WSL (Linux / Ubuntu) 跨平台直接編譯 Windows `.exe`：

##### 首次環境設定 (只需執行一次)：
```bash
# 1. 安裝 Rust Windows MSVC 目標與 cargo-xwin 工具
rustup target add x86_64-pc-windows-msvc
cargo install cargo-xwin

# 2. 安裝 LLVM 工具鏈
sudo apt update && sudo apt install -y clang lld

# 3. 建立 LLVM Windows 資源編譯器軟連結
sudo ln -sf /usr/bin/llvm-lib-18 /usr/local/bin/llvm-lib
sudo ln -sf /usr/bin/llvm-ar-18 /usr/local/bin/llvm-ar
sudo ln -sf /usr/bin/llvm-rc-18 /usr/local/bin/llvm-rc
sudo ln -sf /usr/bin/llvm-mt-18 /usr/local/bin/llvm-mt
sudo ln -sf /usr/bin/llvm-cvtres-18 /usr/local/bin/llvm-cvtres
sudo ln -sf /usr/bin/lld-link-18 /usr/local/bin/lld-link
```

##### 執行 Windows 獨立執行檔編譯：
```bash
npm run tauri:build:win
```
產出的單一免安裝執行檔將位於：
👉 `src-tauri/target/x86_64-pc-windows-msvc/release/poe-tool.exe`

---

## 📁 專案架構說明 (Project Structure)

```text
POE_tool/
├── data/                           # 官方中英詞綴與物品雙向字典 (JSON)
│   ├── ggg_items.json              # 國際服物品資料
│   ├── ggg_static.json             # 國際服靜態通貨與分類
│   ├── ggg_stats.json              # 國際服詞綴資料
│   ├── tw_ggg_items.json           # 台服物品資料
│   ├── tw_ggg_static.json          # 台服靜態通貨與分類
│   ├── tw_ggg_stats.json           # 台服詞綴資料
│   ├── item_dictionary.json        # 5,100+ 中英物品名稱雙向字典
│   ├── stat_dictionary.json        # 17,600+ 中英詞綴對照雙向字典
│   └── settings.example.json       # 預設設定檔範本
├── src/                            # React 19 + TypeScript 前端介面
│   ├── components/                 # 核心功能組件 (查價、資產追蹤、流派計算、設定)
│   │   ├── BuildCalculator.tsx     # 流派造價頁面
│   │   ├── PriceChecker.tsx        # 即時查價頁面
│   │   ├── SettingsModal.tsx       # 系統設定彈窗
│   │   ├── TabBreakdown.tsx        # 倉庫分類拆解
│   │   ├── WealthChart.tsx         # 資產歷史趨勢圖
│   │   └── WealthTracker.tsx       # 倉庫資產總覽
│   ├── context/                    # React Context (AppState, Settings)
│   ├── hooks/                      # 業務 Hooks (usePriceChecker, useClipboardSync)
│   ├── services/                   # api.ts (原生調用 Tauri 2.0 invoke IPC)
│   ├── types/                      # poe.ts 跨端資料型別定義
│   ├── App.tsx                     # 主應用入口與分頁導航
│   └── main.tsx
├── src-tauri/                      # Tauri 2.0 Rust 原生核心 (取代 Node.js 後端)
│   ├── Cargo.toml                  # Rust 依賴 (reqwest, tokio, serde, windows)
│   ├── tauri.conf.json             # 桌面視窗尺寸、置頂、IPC 權限與打包設定
│   ├── capabilities/               # Tauri 2.0 系統權限宣告 (default.json)
│   └── src/
│       ├── commands/               # 17 個 Tauri #[tauri::command] IPC 接口
│       ├── models/                 # Rust 核心資料結構 (Item, Trade, Stash, Ninja)
│       ├── services/               # 核心業務邏輯
│       │   ├── dictionary.rs       # 記憶體雙向字典索引與模糊匹配
│       │   ├── parser.rs           # 遊戲裝備複製文字解析器 (中/英)
│       │   ├── rate_limiter.rs     # GGG API 智慧多通道速率限制器
│       │   ├── trade.rs            # 官方市集查詢與 Travel to Hideout 直購
│       │   ├── stash.rs            # 倉庫資產掃描與定期快照排程
│       │   ├── ninja.rs            # poe.ninja 市場價格爬蟲
│       │   ├── build_calc.rs       # pobb.in / PoB XML 流派造價計算引擎
│       │   ├── hotkey.rs           # Win32 SendInput 遊戲按鍵注入與剪貼簿
│       │   └── storage.rs          # 跨平台 Atomic JSON 檔案儲存
│       └── lib.rs                  # 應用程式入口點、全域熱鍵與系統匣管理器
├── .env.example                    # 環境變數範本檔
├── .gitignore                      # Git 忽略規則（已嚴格隔離憑證與大檔）
├── package.json                    # 前端開發與 Tauri 建置腳本
├── vite.config.ts                  # Vite 打包配置
├── tsconfig.json                   # TypeScript 配置
├── SECURITY.md                     # 安全性政策與隱私指南
├── LICENSE                         # MIT 開源授權
└── README.md                       # 專案說明文件
```

---

## 📜 授權條款與免責聲明 (License & Disclaimer)

### 開源授權
本專案採用 [MIT License](LICENSE) 授權開放。

### 免責聲明 (Disclaimer)
- 本軟體為社群愛好者自製之第三方開源輔助工具，與 Grinding Gear Games (GGG) 官方無官方關聯或授權關係。
- *Path of Exile* 與相關美術資源商標均屬 Grinding Gear Games 所有。
- 本工具僅使用官方公開之 Trade API 與公開網頁進行查詢，請遵守官方使用者守則及合理的 API 調用規範。
