# 📏 代碼規範與行數守則 (Code Conventions)

為維護代碼庫的高可讀性、敏捷迭代能力與易維護性，本專案所有代碼均必須嚴格遵守以下工程規範。

---

## 📐 1. 檔案與函式規模限制 (Strict Length Limits)

| 檔案類型 | 行數上限 | 說明 |
|---|---|---|
| **業務邏輯與領域模組 (Logic & Domain)** | **$\le 200$ 行** | 包括 domain、services、utils、hooks 等核心計算模組 |
| **展現層與測試 (UI Components & Tests)** | **$\le 300$ 行** | 包括 `.tsx` 元件檔與 `__tests__` 單元測試檔 |
| **個別函式與方法 (Functions & Methods)** | **$\le 30$ 行** | 單一函式職責單一化，過長運算須拆解為純輔助函式 |

> ⚠️ **違規處置**：CI 與本機 linter 會嚴格監控檔案行數，超過限制之 PR 將無法通過審查與合併。

---

## 🛡️ 2. 型別安全體系 (Zero Explicit `any`)

- **0 顯式 `any`**：專案全域全面禁止使用顯式 `any` 宣告。
- **替代方案**：
  - 未知型別使用 `unknown` 並搭配 Type Narrowing（如 `typeof`, `instanceof`, 或型別守衛）。
  - 通用型別使用泛型 `<T>`。
  - 特殊結構撰寫明確的 TypeScript `interface` 或 `type`。

---

## 🎨 3. 代碼風格與 Linter (Oxlint & Biome)

- **Oxlint**：本專案採用極速 JavaScript/TypeScript linter `oxlint` 進行靜態檢查。
- **React 規範**：
  - 元件模組除組件外，不可 export 內部專用常數或函式，以保障 Fast Refresh 正常運作。
  - Hooks 呼叫順序與相依性陣列須完整填寫。

---

## 🧪 4. 測試覆蓋規範

1. **領域純函式 100% 覆蓋**：所有位於 `src/domain/` 的業務計算均須備齊對應的 Vitest 單元測試。
2. **UI 元件關鍵互動測試**：每個重要 UI 元件須具備相應的測試檔，涵蓋渲染、事件觸發、邊界狀態與無障礙文字。
3. **本地執行**：送出 PR 前必須在本地執行 `npm test` 確認通過。
