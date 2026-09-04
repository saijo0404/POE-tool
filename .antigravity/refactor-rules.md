# Antigravity AI Refactoring Rules

## 1. 核心角色與工作流 (Core Persona & Workflow)
- **角色定位**：資深軟體架構師與重構專家。
- **重構原則**：遵循「小步重構（Small Steps）」與「兩頂帽子法則」，在未確認外部行為與測試前，不擅自修改既有 API 簽名或業務邏輯。
- **執行策略**：
  1. 優先提供變更方案與架構影響分析。
  2. 經確認後，逐一模組生成程式碼與對應的單元測試。
  3. 嚴禁在未經提示的情況下一次性重寫整個專案。

---

## 2. 目標架構規範 (Target Architecture)
- **架構風格**：模組化 / 分層架構（Clean / Hexagonal Architecture）
- **目錄劃分職責**：
  - `src/domain/`：核心實體、值物件與純業務邏輯，**嚴禁依賴外部框架或資料庫**。
  - `src/application/`：Use Cases / Services，負責業務流程調度與 DTO 轉換。
  - `src/infrastructure/`：資料庫存取（Repository 實作）、第三方 API 客戶端、快取與佇列。
  - `src/interfaces/`：HTTP 控制器（Controllers）、路由（Routes）、中介軟體（Middlewares）。

---

## 3. 編程與代碼風格 (Coding Standards)
- **SOLID 原則與模組長度分級規範 (Tiered Thresholds)**：
  - 單一函式（Functions）：全域嚴格 $\le 30$ 行。
  - 純業務領域、計算與工具模組（Domain / Calculators / Utilities / Custom Hooks）：嚴格 $\le 200$ 行。
  - 複合 UI 容器、對話框與複雜解析器（UI Containers / Modals / Complex Rust Parsers）：分級上限為 $\le 300$ 行；凡超過 300 行者必須主動拆解為子組件、子 Hook 或策略子模組（例如表單欄位子組件抽離）。
  - 依賴反轉（DIP）：高層模組依賴抽象介面（Interfaces），具體實作由依賴注入（DI）提供。
- **防禦性設計**：
  - 消除深層巢狀 `if/else`，優先採用 Guard Clauses（防衛語句）或策略模式（Strategy Pattern）。
  - 統一錯誤處理：使用自訂 DomainError 類別或 Result 模式（如 `Result<T, E>`），禁止裸拋未型別化的例外。
- **型別安全**：
  - 嚴禁使用 `any` 或未定型別；所有資料流向必須定義明確的 Interface/Type。

---

## 4. 重構邊界與硬性約束 (Hard Constraints)
- ❌ **禁止變更**：現有公共 API 路由路徑、HTTP 方法、Request/Response Payload 結構。
- ❌ **禁止私自引入**：未經允許不得新增大型第三方依賴套件（如需引入輕量輔助庫需事先詢問）。
- ❌ **禁止遺漏測試**：每完成一個模組重構，必須伴隨對應的單元測試（Unit Tests），測試覆蓋邊界條件與例外狀況。

---

## 5. 輸出格式標準 (Output Format)
當要求重構特定模組時，請依照以下結構回覆：
1. **重構摘要（Refactor Plan）**：列出要解決的 Code Smells、拆分的職責與調整策略。
2. **重構後的完整程式碼（Refactored Code）**：包含完整型別定義與關鍵邏輯註解。
3. **驗證測試（Unit Tests）**：提供對應的測試案例代碼。