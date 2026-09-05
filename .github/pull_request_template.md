<!--
  感謝您為 POE_tool 提交 Pull Request！
  
  PR 標題格式必須遵循 Conventional Commits 標準：
    feat(atlas): 新增 3.25 輿圖聖甲蟲策略模擬器
    fix(trade): 修復繁中勢力詞綴解析錯誤
    refactor(parser): 抽離 Trade API 限流器為獨立模組
    perf(wealth): 加快倉庫資產快照載入速度
    docs(readme): 更新快速鍵設定與使用說明
    ci(release): 優化 Windows 打包與 Release 工作流
    chore(deps): 升級核心依賴套件

  重要提示：
    1. 請勿在標題使用大括號格式（避免 '[Feat]'、'[Fix]'）。
    2. 請勿在標題手動輸入 '(#123)' 或 Issue 編號（以防 Squash Merge 時產生重複編號標籤）。
    3. 關聯 Issue 請寫在下方的「關聯 Issue」欄位（例如：Closes #123 或 Fixes #456）。
-->

## 變更摘要 (Summary)
<!-- 請簡要說明此 PR 做了哪些修改與新增的功能 -->

## 變更動機與背景 (Motivation & Context)
<!-- 為什麼需要此變更？解決了什麼問題？是否有相關的 Issue 討論？ -->

## 關聯 Issue (Related Issues)
<!-- 使用 Fixes #123, Closes #456 或 Relates to #789 -->
Fixes #

## 變更類型 (Type of Change)
- [ ] 🐛 **Bug 修復** (修復現有問題且不影響既有相容性)
- [ ] ✨ **新功能** (新增功能且不破壞現有行為)
- [ ] 🔨 **代碼重構** (無功能性修改，提升代碼可讀性、維護性或架構)
- [ ] ⚡ **效能優化** (提升運算速度、降低記憶體或網路負載)
- [ ] 📝 **文檔更新** (更新 README、註解或使用手冊)
- [ ] ⚙️ **CI/CD / 建置工具** (GitHub Actions、Tauri 打包、依賴升級)
- [ ] 💥 **重大變更 (Breaking Change)** (可能導致舊設定或現有行為不相容)

---

## 測試與驗證計畫 (Test Plan & Verification)
<!-- 請說明您是如何測試此變更的？請特別著重在 Windows 環境下的驗證 -->

### 1. 自動化測試 (Automated Tests)
- [ ] 前端單元測試通過 (`npm test`)
- [ ] 前端型別檢查通過 (`npm run typecheck` / `tsc -b --noEmit`)
- [ ] 前端代碼風格檢查通過 (`npm run lint` / `oxlint`)
- [ ] 後端 Rust 測試通過 (`cargo test --manifest-path src-tauri/Cargo.toml`)
- [ ] 後端 Rust 格式與靜態分析 (`cargo fmt --check` / `cargo clippy`)

### 2. 本機與 Windows 環境實測 (Windows Verification)
- **測試環境**：Windows 11 / Windows 10 / 其他
- **實測項目**：
  - [ ] 桌面端 Tauri 應用程式能成功編譯並啟動
  - [ ] 遊戲內 Ctrl+C 複製物品可正常觸發查價 / 快捷鍵監聽正常
  - [ ] 繁體中文詞綴 / 市集搜尋過濾器運作正常
  - [ ] 倉庫資產抓取與快照資料正確
  - [ ] 輿圖策略模擬器數據計算無誤

---

## 提交前檢查清單 (Pre-merge Checklist)
- [ ] 我的代碼遵循本專案的代碼風格規範與分層架構設計。
- [ ] 我已在本地完成自我審查（Self-review）。
- [ ] 我已為新增或修改的邏輯補充了相應的單元測試（若適用）。
- [ ] 所有的測試與 CI 檢查皆已通過。
- [ ] 若涉及使用者介面或設定變更，已同步更新相關文檔。
