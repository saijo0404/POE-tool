# 📝 結構化滾動日誌與診斷匯出 (Logging & Diagnostics)

為了方便使用者回報問題、開發者除錯與 AI Agent 自動化診斷，POE_tool 建立了嚴格控管檔案大小的結構化滾動日誌系統。

---

## 🔒 1. 檔案大小上限與滾動備份機制

為杜絕日誌無限擴充佔用硬碟空間，系統設有三道嚴格防護線：
- **單檔大小上限 (Size Cap)**：單一日誌檔案最大上限嚴格限制為 **1 MB (1,048,576 bytes)**。
- **滾動備份數量 (Max Backups)**：最多保留 **3 份歷史備份**：
  - `poe-tool.log`（當前寫入中）
  - `poe-tool.log.1`（最近滾動）
  - `poe-tool.log.2`
  - `poe-tool.log.3`（最舊滾動）
- **循環覆寫淘汰 (Rolling Rotation)**：當 `poe-tool.log` 超過 1MB 時，自動順移輪替並刪除超過第 3 份的舊檔。若在無備份檔支援時達到上限，則自動執行循環覆寫（截斷前段舊記錄保留最新條目）。

---

## 🛡️ 2. 隱私與敏感資料脫敏 (Sanitization)

日誌系統在將資料寫入磁碟前，會自動執行敏感欄位正則脫敏：
- **`poesessid`**：替換為 `[REDACTED_POESESSID]`。
- **帳號 Token 與 Session**：替換為 `***` 或部分遮罩。
- 使用者可在不洩漏個人認證金鑰的前提下安心導出與回報日誌。

---

## 📊 3. 結構化日誌格式 (Structured JSON / Plaintext)

每條日誌條目均包含完整上下文資訊：
```text
[2026-09-06T08:30:15.123Z] [INFO] [EngineDetector] PoE 2 process detected (PID: 18452), switching active engine mode to poe2
[2026-09-06T08:30:16.456Z] [WARN] [TradeRateLimiter] GGG API rate limit threshold reached (Rule: 12/4s), delaying next request by 350ms
[2026-09-06T08:30:18.789Z] [ERROR] [Parser] Failed to parse corrupted item clipboard: unexpected token at line 3
```

---

## 📤 4. 一鍵診斷報告匯出 (Diagnostic Export)

使用者若遇到崩潰或異常，可至 ⚙️ **系統設定** ➔ **日誌與診斷**：
1. 查看當前日誌檔案大小與滾動備份狀態。
2. 點擊 **「一鍵匯出診斷報告」**，系統將自動打包近期的脫敏日誌、當前引擎狀態、系統版本與網路延遲數據為單一 Markdown / Zip 檔案，方便在 GitHub Issue 中快速提交回報。
