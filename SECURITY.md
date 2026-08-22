# 🔒 安全性政策與隱私說明 (Security & Privacy Policy)

**POE_tool** 高度重視每位使用者的帳號安全與個人隱私。本專案為完全開源、純本地執行的工具，絕不包含任何後門、追蹤碼或遠端資料上傳行為。

---

## 🛡️ 隱私與憑證保護原則 (Privacy Guarantees)

1. **100% 純本機執行 (Local-Only Execution)**
   - 所有的查價快取、資產快照 (`wealth_snapshots.json`) 與設定檔 (`settings.json`) 僅儲存在您自己的電腦本機中（`server/data/`）。
   - 本專案沒有任何第三方中央伺服器，絕不會收集、轉發或儲存您的任何帳號資料。

2. **POESESSID 憑證安全性 (POESESSID Safety)**
   - `POESESSID` 是官方網站登入後的 Session Cookie，其功能僅用於直接與 GGG 官方伺服器（`pathofexile.com`）進行安全認證，以獲取您個人的角色清單與倉庫頁物品資料。
   - `POESESSID` 僅在向官方 API 發起請求時作為 HTTP Cookie 標頭傳遞，絕不透過任何非官方網路管道傳送。
   - 本專案預設之 `.gitignore` 已嚴密排除所有包含個人 Token 與快取之設定檔，避免您在進行二次開發或提交程式碼時意外將個人 Session 上傳至 GitHub。

3. **保護您的 Session 安全**
   - 請切勿將您的 `POESESSID` 或 `settings.json` 分享給任何陌生人。
   - 若您懷疑 Session 遭到洩漏，只需在瀏覽器中前往官方網站點擊「登出 (Log out)」並重新登入，原有的 Session 即會立刻失效。

---

## 🚨 安全漏洞回報 (Reporting Vulnerabilities)

若您在 **POE_tool** 中發現任何潛在的安全性漏洞或隱私疑慮，請協助循負責任之流程進行回報：

- **請勿直接在公開 Issue 中張貼漏洞細節或含有真實 Session 的日誌。**
- 請透過 GitHub **Private Vulnerability Reporting** 功能建立安全通報。
- 我們將在最短時間內完成驗證、修復並發布安全更新。
