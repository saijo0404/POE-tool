# 🤝 貢獻指南與工作流程 (Contributing Guide)

感謝您有興趣參與 **POE_tool** 的開發！為了維護專案品質與開源協作的高效運轉，請在提交貢獻前詳細閱讀本指南。

---

## 🛠️ 1. 本機開發環境建置

### 必要依賴：
- **Node.js**：v18.0.0 以上（推薦 Node.js 20+ LTS）
- **Rust**：1.80.0 以上（含 `cargo`）
- **作業系統**：Windows 10/11、Linux (Ubuntu/Debian) 或 macOS

### 快速啟動步驟：
```bash
# 1. Clone 專案庫
git clone https://github.com/saijo0404/POE-tool.git
cd POE_tool

# 2. 安裝前端依賴套件
npm install

# 3. 啟動桌面端開發模式 (Tauri 2.0 + Vite 熱重載)
npm run tauri:dev
```

---

## 🧪 2. 測試與品質檢查指令

在送出變更前，務必於本地執行下列四項檢查並確保全部通過：

```bash
# 1. 執行前端 Vitest 單元測試 (目前共 216 個測試檔案、970+ 測試)
npm test

# 2. 執行後端 Rust Cargo 單元測試 (共 78 測試)
cargo test --manifest-path src-tauri/Cargo.toml

# 3. 執行 TypeScript 嚴格型別檢查
npx tsc -b --noEmit

# 4. 執行極速代碼靜態檢查
npx oxlint .
```

---

## ✍️ 3. Conventional Commits 提交規範

本專案採用嚴格的 **Conventional Commits** 規範。GitHub Actions CI 會自動校驗 PR Title 與 Commit 訊息。

### 格式要求：
`<type>(<scope>): <description>`

### 常見類型 (Types)：
- `feat`: 新增功能
- `fix`: 修復缺陷
- `refactor`: 代碼重構（非新增功能亦非修復缺陷）
- `docs`: 文檔更新
- `test`: 測試新增或調整
- `chore`: 建置流程或輔助工具變更

> ⚠️ **重大規範**：
> - **PR 標題與 Commit 訊息禁止包含 Issue 編號**（例如禁止寫 `feat(price): #123 add new filter`，請改為 `feat(price): add new filter`）。
> - 關聯的 Issue 請寫在 **PR Description (Body)** 中（例如 `Fixes #123` 或 `Closes #123`），以便 GitHub 自動在合併後關閉對應 Issue。

---

## 🚀 4. Pull Request 流程

1. **建立功能分支**：
   - 命名風格：`<type>/<short-description>`（例如 `feat/waystone-towers` 或 `docs/update-architecture`）。
2. **撰寫完整測試**：
   - 遵守「邏輯 $\le 200$ 行、UI/測試 $\le 300$ 行、函式 $\le 30$ 行、0 顯式 `any`」規範。
3. **推播分支並發起 PR**：
   - 填寫詳細的變更說明與關聯 Issue（如 `Fixes #196`）。
4. **等待 CI 通過**：
   - 確保所有 CI Checks（Frontend Lint、Rust Format/Clippy、PR Title Lint、Windows CI Tests）均為綠燈。
5. **Squash and Merge**：
   - 經審查通過後，一律採用 Squash and Merge 合併入 `main`。
