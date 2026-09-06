# 💎 POE_tool - 流亡黯道 1 & 2 雙引擎原生即時查價與資產管理工具

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub Repository](https://img.shields.io/badge/GitHub-saijo0404%2FPOE--tool-181717.svg?logo=github&logoColor=white)](https://github.com/saijo0404/POE-tool)
[![Version](https://img.shields.io/badge/Version-v3.2.0-gold.svg)](CHANGELOG.md)
[![Tests](https://img.shields.io/badge/Tests-1086%2B%20Passed%20(1000%20Vitest%20%2B%2086%20Rust)-success.svg)]()
[![Dual Engine](https://img.shields.io/badge/Engine-PoE%201%20%26%20PoE%202%20Native-orange.svg)]()
[![Tauri 2.0](https://img.shields.io/badge/Tauri-2.0-24C8D8.svg?logo=tauri&logoColor=white)](https://tauri.app/)
[![Rust](https://img.shields.io/badge/Rust-1.80%2B-orange.svg?logo=rust&logoColor=white)](https://www.rust-lang.org/)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-5.0%2B%20Strict-blue.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Architecture](https://img.shields.io/badge/Architecture-Hexagonal%20Clean%20Code-purple.svg)](docs/architecture/architecture-overview.md)

> **POE_tool** 是一款專為《流亡黯道 (Path of Exile)》與《流亡黯道 2 (Path of Exile 2)》台服與國際服玩家打造的次世代原生極速輔助工具。採用 **Tauri 2.0 + Rust + React 19 + 六角架構 (Hexagonal Architecture)**，打包為純單一執行檔（`.exe`），啟動即用、**零 Node.js 執行期依賴**、記憶體佔用極低（約 35~60MB），提供毫秒級遊戲指令響應與 Awakened-style 遊戲內極簡懸浮查價卡片。

---

## 🗺️ 官方技術與使用文檔中心 (Documentation Hub)

本專案將詳細的技術規格、架構設計與操作指引全面解耦模組化至 [`/docs`](docs/README.md) 目錄中：

| 文檔板塊 | 重點內容 | 快速連結 |
|---|---|---|
| 📖 **玩家操作指南** | 快速安裝、伺服器選擇、官方 POESESSID 設定、`Ctrl+D` 懸浮查價小卡與交易密語助理 | [docs/user-guide/](docs/user-guide/getting-started.md) |
| ✨ **核心功能規格** | PoE 1 vs PoE 2 雙引擎能力邊界、專注模式、雙語詞綴解析、Faustus 大宗交易所與金幣計算 | [docs/features/](docs/features/engine-capabilities.md) |
| 🏛️ **軟體架構規範** | 六角架構分層、Rust IPC 通信、單檔 $\le 200$ 行規範、0 顯式 `any` 與 1MB 滾動日誌系統 | [docs/architecture/](docs/architecture/architecture-overview.md) |
| 🛠️ **開發與貢獻指引** | 本機環境啟動、測試執行 (`npm test`, `cargo test`)、Conventional Commits 與 PR 流程 | [docs/development/](docs/development/contributing.md) |

---

## ✨ 核心特色一覽 (Key Features)

```
                       ┌─────────────────────────────────┐
                       │   POE Helper Tool 雙引擎中樞     │
                       └────────────────┬────────────────┘
                                        │
         ┌──────────────────────────────┼──────────────────────────────┐
         ▼                              ▼                              ▼
┌─────────────────┐            ┌─────────────────┐            ┌─────────────────┐
│ ⚔️ 即時查價與小卡 │            │ 🪙 大宗交易所與資產 │            │ 📊 終局地圖與流派 │
│ • 17,600+ 中英字典 │            │ • Faustus 行情同步 │            │ • 860+ 輿圖天賦樹 │
│ • 偽屬性 (Pseudo)│            │ • 黃金手續費試算 │            │ • 危險詞綴 Regex │
│ • Ctrl+D 懸浮置頂 │            │ • 倉庫資產時薪統計 │            │ • PoB XML/造價精算│
└─────────────────┘            └─────────────────┘            └─────────────────┘
```

- ⚔️ **Awakened-style 遊戲內極簡懸浮小卡 (`Ctrl+D`)**：
  游標自適應定位、全螢幕點擊穿透、無邊框置頂，100% 繁體中文台服與國際服雙向精準字典。
- ⚖️ **PoE 1 與 PoE 2 雙世代原生支援**：
  內建「自動引擎偵測」與「專注模式 (Focus Mode)」，自動折疊不適用的世代機制，儲存與偏好完全命名空間隔離。
- 🪙 **Faustus 大宗交易所與金幣精算**：
  同步官方現貨深度行情、跨市場套利評估與兌換所需黃金 (Gold) 門檻試算。
- 💬 **交易密語助理與倉庫格位指示器**：
  背景自動監聽 `Client.txt`，提供一鍵 `/invite`、`/tradewith`、`/hideout` 快捷指令與 12x12 / 24x24 視覺化取貨地圖。
- 📊 **刷圖收益追蹤與地圖安全過濾**：
  進出圖自動對比背包資產變動，精算神聖石時薪（Divine/hr），自動高亮致命反傷詞綴並產生安全 Regex。
- 🗿 **PoE 2 銘刻地圖 (Waystone) 評鑑與洗圖精算**：
  內建專屬危險詞綴庫，比對機體抗性弱點自動標記秒殺威脅，並精算點金/重鑄/混沌之通貨成本期望值。
- 🔒 **結構化滾動日誌與一鍵診斷**：
  單檔嚴格限制 1MB、3 份備份、循環覆寫淘汰，敏感憑證自動脫敏，支援一鍵匯出診斷報告。

---

## 🚀 快速開始使用 (Getting Started)

### 方式 A：一般玩家免安裝版 (推薦)
1. 前往 GitHub [Releases](https://github.com/saijo0404/POE-tool/releases) 頁面下載最新版 `poe-tool.exe`（或免安裝可攜版 zip）。
2. 解壓縮後直接雙擊執行 `poe-tool.exe`。
3. 於遊戲中游標停留在裝備上方按下 `Ctrl+C` 或 `Ctrl+D` 即可開始使用！
4. 詳細設定說明請參閱 [快速上手指南](docs/user-guide/getting-started.md)。

### 方式 B：開發者環境啟動 (Tauri 2.0 Dev)
確保本機已安裝 **Rust (cargo 1.80+)** 與 **Node.js 18+**：
```bash
# 1. Clone 專案庫
git clone https://github.com/saijo0404/POE-tool.git
cd POE_tool

# 2. 安裝依賴套件
npm install

# 3. 啟動桌面端開發模式 (Tauri 2.0 + Vite 熱重載)
npm run tauri:dev
```

---

## 🧪 測試與代碼品質規範 (Quality Standards)

本專案遵循嚴格的軟體工程標準，目前全專案共有 **1086+ 項自動化單元測試** 全數通過：

```bash
# 執行前端 Vitest 單元測試 (223 個測試檔，1000 項測試)
npm test

# 執行後端 Rust Cargo 單元測試 (86 項測試)
cargo test --manifest-path src-tauri/Cargo.toml

# 執行 TypeScript 嚴格編譯與 oxlint 檢查 (0 錯誤 0 警告)
npx tsc -b --noEmit
npx oxlint .
```

- **單檔規模守則**：邏輯模組 $\le 200$ 行、UI/測試元件 $\le 300$ 行、個別函式 $\le 30$ 行。
- **嚴格型別安全**：全域 0 顯式 `any`，所有輸入輸出具備嚴謹 TypeScript 介面防護。
- 詳細規範請參閱 [代碼規範與守則](docs/architecture/code-conventions.md)。

---

## 🔒 隱私與安全性保證 (Privacy & Security)

- 🛡️ **100% 本機運作**：無任何自建遠端伺服器收集使用者資訊，所有設定與快照均保存在玩家個人電腦中。
- 🛡️ **官方安全通道**：個人 `POESESSID` 僅直連官方伺服器（`pathofexile.com`）請求公開與個人倉庫資料。
- 🛡️ **Git 隱私防護**：`.gitignore` 嚴格排除玩家設定檔，絕不洩漏憑證。
- 詳細政策請參閱 [SECURITY.md](SECURITY.md)。

---

## 📜 授權條款與免責聲明 (License & Disclaimer)

### 開源授權
本專案採用 [MIT License](LICENSE) 授權開源。

### 免責聲明 (Disclaimer)
- 本軟體為社群愛好者自製之第三方開源輔助工具，與 Grinding Gear Games (GGG) 官方無關聯或官方授權關係。
- *Path of Exile*、*Path of Exile 2* 與相關美術資源商標均屬 Grinding Gear Games 所有。
- 本工具僅使用官方公開之 API 與網頁資料，請遵守官方使用條款與合理的 API 調用頻率。
