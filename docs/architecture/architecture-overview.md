# 🏛️ 系統架構概覽 (Architecture Overview)

POE_tool 採用**六角架構 (Hexagonal / Ports & Adapters Architecture)** 與 **Tauri 2.0 Rust 原生微核心**，旨在實現高度解耦、可測試性與毫秒級桌面端效能。

---

## 📐 分層架構模型

```
                    ┌────────────────────────┐
                    │  UI Presentation (Web) │
                    │  React 19 / TSX Views  │
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
│    Domain Core    │ │   Infrastructure  │ │   Tauri Rust Backend  │
│  Entities / Logic │ │ TauriBridgeClient │ │ Modularized Services  │
│  Result / Errors  │ │ StorageNamespace  │ │  (Trade/Stash/Parser) │
└───────────────────┘ └───────────────────┘ └───────────────────────┘
```

---

## 🧩 核心分層職責

### 1. 領域核心層 (Domain Layer - `src/domain/`)
- 純 TypeScript 實作，包含純資料結構、介面、業務邏輯與驗證規則。
- **無任何外部 UI 或框架依賴**：不可引用 React、Tauri API 或 DOM 物件。
- 採用 Railway-oriented 設計：全面以 `Result<T, E>` 與型別化 `DomainError` 傳遞成功與錯誤狀態，避免非預期的例外崩潰。

### 2. 應用連接埠 (Application Ports - `src/application/ports/`)
- 定義對外溝通的抽象介面（如 `IApiClientPort`、`IStoragePort`）。
- 嚴格遵守依賴反轉原則 (Dependency Inversion Principle, DIP)，高層模組不直接依賴底層細節。

### 3. 基礎設施適配器 (Infrastructure Adapters - `src/infrastructure/`)
- 連接埠的具體實作：
  - `api/TauriBridgeClient.ts`：透過 Tauri 2.0 `invoke` 與 Rust 後端進行高速 IPC 通訊。
  - `api/HttpFallbackClient.ts`：用於瀏覽器展示與開發環境的 HTTP 回退通道。
  - `storage/StorageNamespaceAdapter.ts`：支援 PoE 1 / PoE 2 命名空間隔離的本地儲存適配器。

### 4. 展現層 (Presentation Layer - `src/components/`, `src/hooks/`)
- 採用 React 19 與自訂 Hooks 組織 UI 狀態。
- 嚴格落實 UI 與計算邏輯分離：元件只負責渲染與事件轉發，複雜資料運算由 Domain 函式執行。

### 5. 原生微核心 (Rust Backend - `src-tauri/`)
- 採用 Rust 1.80+ 與 Tokio 非同步執行期。
- 負責系統級底層功能：全域熱鍵監聽 (Win32 API)、剪貼簿事件處理、Tokio API 請求退避佇列、本機資料持久化與滾動日誌寫入。
