# 🛠️ POE_tool 軟體工程 Issue 解決與 Git 標準協作流程指南

本手冊為 `POE_tool` 專案的標準開源與團隊工程協作流程（GitHub Flow / Feature Branch Workflow）。  
適用於人類開發者與 Antigravity AI Agent 從「Issue 建立與指派、測試驅動重現、代碼實作、本地品質閘門、PR 提交、CI/Review 反饋修正、合併上線至分支清理」的完整生命週期。

---

## 📑 目錄

1. [標準 7 階段 Issue 解決生命週期](#1-標準-7-階段-issue-解決生命週期)
   - [階段 1：分析問題、指派 Issue 與建立分支 (Branching)](#階段-1分析問題指派-issue-與建立分支-branching)
   - [階段 2：撰寫測試重現問題 (TDD 防護：Vitest / Cargo Test)](#階段-2撰寫測試重現問題-tdd-防護vitest--cargo-test)
   - [階段 3：代碼實作與架構規範 (Architecture Standards)](#階段-3代碼實作與架構規範-architecture-standards)
   - [階段 4：本地品質閘門檢驗 (Quality Gates：分級檢查)](#階段-4本地品質閘門檢驗-quality-gates分級檢查)
   - [階段 5：Commit 與發送 Pull Request (PR / Draft PR)](#階段-5commit-與發送-pull-request-pr--draft-pr)
   - [階段 6：Code Review、反饋修復與 Merge 合併](#階段-6code-review反饋修復與-merge-合併)
   - [階段 7：分支清理與本機同步 (Post-merge Cleanup)](#階段-7分支清理與本機同步-post-merge-cleanup)
2. [多工情境與堆疊分支處理 (Stacked PRs & Multi-tasking)](#2-多工情境與堆疊分支處理-stacked-prs--multi-tasking)
   - [情況 A：完全獨立的 Issue 平行開發](#情況-a完全獨立的-issue-平行開發最推薦)
   - [情況 B：依賴前一個 PR 的堆疊分支與 Squash-Merge 避坑指南](#情況-b依賴前一個-pr-的堆疊分支與-squash-merge-避坑指南)
   - [情況 C：中途突發緊急任務 (Git Stash 與 Git Worktree)](#情況-c中途突發緊急任務-git-stash-與-git-worktree)
3. [🚀 常用速查指令清單 (Cheat Sheet)](#3--常用速查指令清單-cheat-sheet)

---

## 1. 標準 7 階段 Issue 解決生命週期

```mermaid
flowchart TD
    A[main 分支最新狀態] -->|gh issue edit 指派| B[切出 feat/fix 分支]
    B --> C[撰寫測試重現問題 (Red)]
    C --> D[代碼實作與架構規範 (Green)]
    D --> E[本地品質閘門檢驗 (Lint/Type/Test)]
    E --> F[Push & 發送 PR (可先 Draft)]
    F --> G{CI 與 Review 審查}
    G -- 需修改/衝突 --> H[本地修正 Commit/Rebase 推送]
    H --> G
    G -- 通過 --> I[Squash and Merge]
    I --> J[刪除遠端/本地分支 & 更新 main]
```

---

### 階段 1：分析問題、指派 Issue 與建立分支 (Branching)

在開始編寫代碼前，先確認 Issue 狀態、同步本地 `main` 分支，並建立語意明確的工作分支。

```bash
# 1. (可選) 透過 GitHub CLI 將 Issue 指派給自己，避免重複派工
gh issue edit <issue_number> --add-assignee "@me"

# 2. 切回 main 主分支並拉取遠端最新代碼
git checkout main
git pull origin main

# 3. 建立並切換至新工作分支
# 命名慣例：fix/issue-<編號>-<簡述> 或 feat/issue-<編號>-<簡述>
git checkout -b fix/issue-2-poeplanner-atlas-tree-url
```

*常用分支前綴：`fix/`, `feat/`, `refactor/`, `perf/`, `docs/`, `ci/`*

---

### 階段 2：撰寫測試重現問題 (TDD 防護：Vitest / Cargo Test)

養成「先寫失敗測試（Red）、再寫修復程式（Green）」的習慣，防止未來版本回退（Regression）。

#### 1. 前端 TypeScript / React 模組
在對應的 `__tests__` 目錄下建立或更新測試案例：
```bash
# 執行特定測試檔案，確認在未修復前會拋出錯誤 (Red)
npm test src/domain/atlas/__tests__/atlasPresets.test.ts
```

#### 2. 後端 Rust / Tauri 模組
若問題位於後端 Rust 邏輯（如系統監聽、IPC 通訊或檔案處理）：
```bash
# 執行特定 Rust 單元測試
cargo test --manifest-path src-tauri/Cargo.toml <test_name>
```

> [!NOTE]
> 若遇到難以透過單元測試覆蓋的 UI 視覺或全螢幕快捷鍵問題，請於 PR 說明中提供詳細的手動重現步驟與預期效果。

---

### 階段 3：代碼實作與架構規範 (Architecture Standards)

編寫程式碼時需嚴格遵守 `POE_tool` 的架構規範（詳見 `.antigravity/refactor-rules.md`）：

- **分層架構職責**：
  - `src/domain/`：核心實體、數值計算、純業務邏輯（禁止依賴 React、DOM 或外部 API）。
  - `src/application/`：服務調度、DTO 轉換、狀態管理整合。
  - `src/infrastructure/`：Tauri IPC、本機儲存、第三方 API 客戶端。
  - `src/interfaces/` / UI：React 元件、樣式呈現。
- **微模組化**：單一檔案長度 $\le 200$ 行，單一函式 $\le 30$ 行。
- **嚴格型別安全**：全域禁止 `any`，保持完整的 Interface / Type 定義。
- **防禦性設計與錯誤處理**：採用 `Result<T, E>` 與具名 `DomainError`，禁止裸拋例外。
- **資料遷移與向下相容**：若變更 LocalStorage / IndexedDB 資料結構，需具備自動清洗與升級相容邏輯。

---

### 階段 4：本地品質閘門檢驗 (Quality Gates：分級檢查)

為兼顧開發效率與代碼品質，檢驗分為兩級：

#### 🟢 快速循環檢驗 (每次 Commit 前必跑，數秒內完成)
```bash
# 1. 前端單元測試全數通過
npm test

# 2. TypeScript 靜態型別檢查 (零錯誤)
npm run typecheck

# 3. 前端代碼風格檢查 (Oxlint)
npm run lint

# 4. 後端 Rust 代碼風格、靜態分析與單元測試 (若有異動 Rust 模組)
cargo fmt --check --manifest-path src-tauri/Cargo.toml
cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings
cargo test --manifest-path src-tauri/Cargo.toml
```

#### 🟡 完整建置檢驗 (發送 PR 前或重大重構時執行)
```bash
# 驗證 Windows 桌面端完整編譯與打包
npm run tauri:build:win
```

---

### 階段 5：Commit 與發送 Pull Request (PR / Draft PR)

#### 1. 提交 Commit (遵循 Conventional Commits)
```bash
git add .
git commit -m "[Fix] 修復預設 poeplanner.com 輿圖天賦網址無法在網頁載入之問題 (#2)"
```
*前綴標準：`[Fix]`, `[Feat]`, `[Refactor]`, `[Perf]`, `[Docs]`, `[CI]`*

#### 2. 推送至遠端工作分支
```bash
git push -u origin fix/issue-2-poeplanner-atlas-tree-url
```

#### 3. 透過 GitHub CLI 建立 PR
使用專案標準範本建立 PR，並標註關聯 Issue 關鍵字（如 `Fixes #2`）：

```bash
# 正式 PR
gh pr create \
  --title "[Fix] 修復預設 poeplanner.com 輿圖天賦網址無法在網頁載入之問題" \
  --body "## 變更摘要
- 修正 atlasPresets.ts 預設天賦網址為標準連結
- 加入資料清洗與自動遷移保護
- 補充單元測試

## 測試計畫
- [x] npm test 通過
- [x] npm run typecheck 通過
- [x] npm run lint 通過

Fixes #2"
```

> [!TIP]
> **大型功能建議先建立 Draft PR**：若功能仍在開發中，但想提前在 GitHub Actions 上執行 CI 測試，可加上 `--draft` 標記：  
> `gh pr create --draft --title "[WIP] [Feat] ..." --body "..."`  
> 開發完成後執行 `gh pr ready <pr_number>` 轉為正式審查狀態。

---

### 階段 6：Code Review、反饋修復與 Merge 合併

#### 1. 反饋與修正循環 (Feedback Loop)
當 CI 失敗或 Reviewer 提出修改建議時：
```bash
# 1. 在本地工作分支修改程式碼並通過品質閘門
npm test

# 2. 提交修復 Commit 並推送
git commit -m "[Fix] 修正 Review 建議之邊界例外處理"
git push origin fix/issue-2-poeplanner-atlas-tree-url
```

#### 2. 若 main 分支有新進展導致衝突 (Rebase 處理)
```bash
# 1. 更新本地 main
git fetch origin main

# 2. 將工作分支變基到最新 main
git rebase origin/main

# 3. 若有衝突，編輯檔案解決衝突後標記已解決：
git add <conflicted_file>
git rebase --continue

# 4. 安全強制推送到工作分支 (使用 --force-with-lease 防止覆蓋他人提交)
git push --force-with-lease origin fix/issue-2-poeplanner-atlas-tree-url
```

#### 3. 合併 PR
- 專案一律推薦採用 **Squash and merge**，維持 `main` 歷史清晰乾淨。
- 可使用 GitHub 自動合併指令（當 CI 全綠且審查通過時自動合併）：
  ```bash
  gh pr merge <pr_number> --auto --squash --delete-branch
  ```

---

### 階段 7：分支清理與本機同步 (Post-merge Cleanup)

合併完成後，必須進行清理以保持工作環境乾淨：

```bash
# 1. 切回 main 分支並拉取最新代碼
git checkout main
git pull origin main

# 2. 刪除本地已完成的修復分支 (-d 為安全刪除，已合併才會允許刪除)
git branch -d fix/issue-2-poeplanner-atlas-tree-url

# 3. 清理本機中已在遠端被刪除的分支引用 (Prune)
git fetch --prune
```

---

## 2. 多工情境與堆疊分支處理 (Stacked PRs & Multi-tasking)

### 情況 A：完全獨立的 Issue 平行開發（最推薦）

若 Issue #2（修復網址）與 Issue #3（快捷鍵設定）互不相干：
```bash
# 永遠從乾淨的 main 切出全新獨立分支
git checkout main
git pull origin main
git checkout -b feat/issue-3-hotkey-settings
```
> **優勢**：各自獨立 Review、獨立 CI、獨立 Merge，互不干擾。

---

### 情況 B：依賴前一個 PR 的堆疊分支與 Squash-Merge 避坑指南

若 Issue #4 是在 PR #2 修改好的架構上新增功能：

#### 1. 建立堆疊分支並開發
```bash
git checkout fix/issue-2-poeplanner-atlas-tree-url
git checkout -b feat/issue-4-delete-atlas-strategies

# 進行開發、Commit、Push
git commit -m "[Feat] 支援自由刪除輿圖策略機制 (#4)"
git push -u origin feat/issue-4-delete-atlas-strategies

# 建立 PR 時，Base 暫時設定為 fix/issue-2-poeplanner-atlas-tree-url
gh pr create --base fix/issue-2-poeplanner-atlas-tree-url --title "[Feat] 支援自由刪除輿圖策略機制" ...
```

#### 2. 當 PR 1 (Issue #2) 被「Squash and Merge」合併進 main 之後 ⚠️
因為 Squash Merge 會在 `main` 產生全新的 Commit Hash，**若直接把 PR 2 的 Base 改為 `main` 會產生歷史分歧與假衝突**。

**標準解法：使用 `git rebase --onto` 重新嫁接**：
```bash
# 1. 同步最新 main
git checkout main
git pull origin main

# 2. 將 PR 2 的改動從舊的 PR 1 分支起點重新嫁接到 main
git checkout feat/issue-4-delete-atlas-strategies
git rebase --onto main fix/issue-2-poeplanner-atlas-tree-url

# 3. 推送更新
git push --force-with-lease origin feat/issue-4-delete-atlas-strategies

# 4. 在 GitHub PR 網頁端將 Base 分支改回「main」
```

---

### 情況 C：中途突發緊急任務 (Git Stash 與 Git Worktree)

當在分支 `feat/issue-3` 開發到一半，需要緊急修復另一個高優先級問題時：

#### 做法 1：暫存工作區 (Git Stash)
```bash
# 1. 暫存未完成的修改
git stash push -m "WIP: issue-3 hotkey work"

# 2. 切到 main 開緊急分支修復...
git checkout main && git pull origin main
git checkout -b fix/emergency-hotfix

# 3. 緊急修復完成並提交後，切回原分支恢復進度
git checkout feat/issue-3-hotkey-settings
git stash pop
```

#### 做法 2：平行工作目錄 (Git Worktree - 無需頻繁切換/重新編譯)
```bash
# 在獨立資料夾開啟新的緊急修復分支
git worktree add ../POE_tool_hotfix -b fix/emergency-hotfix

# 進入該資料夾進行修復，修完 PR 後移除 worktree：
cd ../POE_tool_hotfix
# (完成開發與 PR 後)
cd /home/yijun/Project/POE_tool
git worktree remove ../POE_tool_hotfix
```

---

## 3. 🚀 常用速查指令清單 (Cheat Sheet)

### Git 日常與分支操作
| 操作項目 | 指令 |
| :--- | :--- |
| **切換並更新 main** | `git checkout main && git pull origin main` |
| **建立並切換新分支** | `git checkout -b <branch_name>` |
| **檢查工作區狀態** | `git status` |
| **簡要 Commit 歷史** | `git log -n 5 --oneline` |
| **安全刪除已合併本地分支** | `git branch -d <branch_name>` |
| **強制刪除未合併本地分支** | `git branch -D <branch_name>` |
| **清理遠端已刪除分支引用** | `git fetch --prune` |
| **安全強制推送 (Rebase 後)** | `git push --force-with-lease origin <branch_name>` |

### GitHub CLI (`gh`) 協作操作
| 操作項目 | 指令 |
| :--- | :--- |
| **查看 Issue 清單** | `gh issue list` |
| **指派 Issue 給自己** | `gh issue edit <issue_number> --add-assignee "@me"` |
| **建立新 Issue** | `gh issue create --title "[Feat]: ..." --body-file issue.md` |
| **建立正式 Pull Request** | `gh pr create --title "[Fix] ..." --body "..."` |
| **建立 Draft Pull Request** | `gh pr create --draft --title "[WIP] ..." --body "..."` |
| **將 Draft 轉為正式 PR** | `gh pr ready <pr_number>` |
| **查看當前 PR 狀態/檢查** | `gh pr status` 或 `gh pr checks` |
| **設定 CI 通過自動 Squash 合併** | `gh pr merge <pr_number> --auto --squash --delete-branch` |

### POE_tool 專案品質檢驗指令
| 檢驗項目 | 指令 | 適用時機 |
| :--- | :--- | :--- |
| **前端全單元測試** | `npm test` | 每次 Commit 前 |
| **前端單一測試檔案** | `npm test <path_to_test_file>` | TDD 重現/修復時 |
| **TypeScript 型別檢查** | `npm run typecheck` | 每次 Commit 前 |
| **Oxlint 代碼風格** | `npm run lint` | 每次 Commit 前 |
| **Rust 程式碼格式化檢查** | `cargo fmt --check --manifest-path src-tauri/Cargo.toml` | 異動 Rust 後端時 |
| **Rust Clippy 靜態分析** | `cargo clippy --manifest-path src-tauri/Cargo.toml -- -D warnings` | 異動 Rust 後端時 |
| **Rust 後端單元測試** | `cargo test --manifest-path src-tauri/Cargo.toml` | 異動 Rust 後端時 |
| **Windows 完整建置驗證** | `npm run tauri:build:win` | 發送 PR 前 / 發布驗證 |
