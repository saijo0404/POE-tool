# 🤖 POE_tool Autonomous Engineering Protocol (v2.1)

本協議規範 Antigravity Agent 在無人干預下的全自主軟體開發生命週期。
執行過程必須**嚴格遵守**本目錄下的兩份基礎架構文件：
1. `.antigravity/git-issue-workflow.md`（Git 協作、分支與 PR 規範）
2. `.antigravity/refactor-rules.md`（分層架構、重構與代碼邊界規範）

---

## 🧭 全域約束與鐵律 (Hard Constraints)

1. **架構分層邊界**：
   - `src/domain/`：純業務邏輯與計算，嚴禁依賴 React、DOM、Tauri 或外部 API。
   - `src/application/`：服務調度與 DTO 轉換。
   - `src/infrastructure/`：Tauri IPC、Storage、外部 API 客戶端。
   - `src/interfaces/`：UI 與 React 元件。
2. **代碼標準**：
   - 模組長度分級規範（Tiered Thresholds）：Domain/計算/工具/Hooks 嚴格 $\le 200$ 行；複合 UI 容器/解析器 $\le 300$ 行（超過 300 行者須主動拆解子模組）；單一函式全域嚴格 $\le 30$ 行。
   - 全域嚴禁 `any`；所有例外必須使用 `Result<T, E>` 或具名 `DomainError`。
   - 禁止私自引入大型第三方依賴，嚴禁破壞既有 Public API / IPC 契約。
3. **熔斷機制 (Circuit Breaker)**：
   - 任一 Issue 若在測試修復循環累計嘗試 3 次仍未通過，標記標籤 `blocked`，留言說明原因後 `git checkout main` 並跳至下一個 Issue。

---

## 🔁 6 階段狀態機 (Autonomous State Machine)

```
[State 0: 深度代碼審計與 Bug 探勘 (Bug Hunting)]
       │
       ▼ (發現 Bug 則先建立 Fix Issue，確保基底健康)
[State 1: Roadmap 與 Milestone 規劃/審查]
       │
       ├─ (有未解 Issue) ───────────────> [State 2: 領取 Issue & TDD Red 測試]
       │                                              │
       ├─ (當前 Milestone 完成) ──> [State 5: 釋出發版]   │
       │                                 │            ▼
       │                                 │    [State 3: 代碼實作 & Green]
       │                                 │            │
       │                                 │            ▼
       └─ (開始下一輪) ───> [回到 State 0] ───┴───< [State 4: 閘門檢驗 & PR Merge]
```

---

### 【State 0：深度代碼審計與 Bug 探勘 (Bug Hunting)】
*執行時機：當一個 Milestone 剛釋出完成，在規劃下一版 ROADMAP 之前自動觸發。*

1. **自動化靜態與邊界檢驗**：
   ```bash
   # 檢查測試覆蓋率或隱性錯誤
   npm test -- --coverage
   npm run typecheck
   npm run lint
   cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
   ```
2. **AI 代碼審計檢查清單 (Audit Checklist)**：
   - **邊界條件 (Edge Cases)**：檢查數值溢位、空陣列/物件解構、`undefined`/`null` 邊界、異步未捕獲 Promise。
   - **狀態一致性 (State & Memory)**：檢查前端 LocalStorage/IndexedDB 遷移相容性、Event Listener 遺漏清理導致的記憶體洩漏。
   - **併發與 Race Condition**：Tauri IPC 多次呼叫時的競態條件、Rust 執行緒安全與 Mutex Deadlock。
   - **重構遺留壞味道 (Code Smells)**：違背分級行數約束（Domain/Hooks > 200 行，UI/Parser > 300 行）的檔案、違背分層職責的跨層調用。
3. **建立修復任務**：
   - 若審計出潛在 Bug 或技術債，優先使用 `gh issue create --title "[Bug]: <問題摘要>" --label "bug,tech-debt"` 建立 Issue。
   - 審計完成後前往 **State 1**。

---

### 【State 1：Roadmap 與 Milestone 審查與自主規劃】
1. **讀取進度**：
   - 檢查 `ROADMAP.md` 及 GitHub Milestones：
     ```bash
     gh api repos/:owner/:repo/milestones --jq '.[] | select(.state=="open")'
     ```
2. **狀態分流**：
   - **分流 A（有待處理 Issue）**：若有未解決的 Bug 或既定功能 Issue，獲取第一個 Issue，前往 **State 2**。
   - **分流 B（Milestone Issue 已全數關閉）**：前往 **State 5 (Release)**。
   - **分流 C（無任何 Milestone 或已全部交付）**：
     - 將 **State 0** 發現的 Bug/技術債優先排入。
     - 結合專案願景規劃下一版 Roadmap（如 `vX.Y.Z`），更新 `ROADMAP.md`。
     - 透過 `gh api repos/:owner/:repo/milestones -f title="vX.Y.Z"` 建立新 Milestone。
     - 使用 `gh issue create` 建立拆解後的模組任務並指派至該 Milestone。
     - 前往 **State 2**。

---

### 【State 2：領取 Issue 與 TDD 紅燈測試 (Red)】
1. **指派並建立分支**：
   ```bash
   gh issue edit <ISSUE_ID> --add-assignee "@me"
   git checkout main && git pull origin main
   git checkout -b feat/issue-<ISSUE_ID>-<SLUG>  # 或 fix/issue-<ISSUE_ID>-<SLUG>
   ```
2. **TDD 防護（先寫失敗測試）**：
   - 根據 Issue 需求或 Bug 重現情境，在 `src/**/__tests__/` 或 Rust 後端編寫重現測試。
   - 執行測試確認失敗（Red）：
     - 前端：`npm test <path_to_test_file>`
     - 後端：`cargo test --manifest-path src-tauri/Cargo.toml <test_name>`
3. 前往 **State 3**。

---

### 【State 3：代碼實作與架構規範 (Green)】
1. **實作最小可用程式碼**：
   - 嚴格遵守 `refactor-rules.md` 之分層規範。
   - 避免改動不相關的業務邏輯。
2. **單元測試驗證**：
   - 再次執行特定測試，確保轉為成功通過（Green）。
3. 前往 **State 4**。

---

### 【State 4：本地品質閘門檢驗、PR 與自動合併】
1. **執行本地分級品質閘門**：
   ```bash
   # 前端檢驗
   npm test
   npm run typecheck
   npm run lint

   # 若異動 Rust 模組
   cargo fmt --check --manifest-path src-tauri/Cargo.toml
   cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
   cargo test --manifest-path src-tauri/Cargo.toml
   ```
   - 若發生錯誤，進入修復迴圈（最多重試 3 次，超額則觸發熔斷機制）。
2. **提交 Commit 並推送**：
   - 遵循 Conventional Commits 格式：
     ```bash
     git add .
     git commit -m "[<Fix|Feat|Refactor>] <任務簡述> (#<ISSUE_ID>)"
     git push -u origin <branch_name>
     ```
3. **建立 PR 並設定自動合併**：
   ```bash
   gh pr create \
     --title "[<Fix|Feat>] <任務名稱>" \
     --body "## 變更摘要
   - 依據 refactor-rules.md 實作
   - 通過所有本地品質閘門檢驗

   Fixes #<ISSUE_ID>"

   gh pr merge --auto --squash --delete-branch
   ```
4. **本機環境清理**：
   ```bash
   git checkout main
   git pull origin main
   git branch -D <branch_name>
   git fetch --prune
   ```
5. 回到 **State 1** 檢查下一個任務。

---

### 【State 5：版本釋出 (Release) 與週期歸檔】
1. **升級版本號與日誌**：
   - 更新 `package.json` 與 `src-tauri/Cargo.toml` 的版本號（遵循語意化版本 SemVer）。
   - 更新 `CHANGELOG.md`，列出該 Milestone 完成的所有功能與修復。
2. **提交版本發布變更**：
   ```bash
   git checkout main && git pull origin main
   git add package.json src-tauri/Cargo.toml CHANGELOG.md
   git commit -m "[Release] v<X.Y.Z>"
   git push origin main
   ```
3. **發布 GitHub Release**：
   ```bash
   gh release create v<X.Y.Z> --generate-notes --title "v<X.Y.Z>"
   ```
4. **關閉當前 Milestone**：
   ```bash
   gh api -X PATCH repos/:owner/:repo/milestones/<MILESTONE_ID> -f state="closed"
   ```
5. 前往 **State 0** 開始新一輪的 Bug 探勘與 Roadmap 規劃。
