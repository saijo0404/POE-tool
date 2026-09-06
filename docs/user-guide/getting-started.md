# 🚀 快速上手與設定指南 (Getting Started)

本指南引導玩家完成 **POE_tool** 的安裝、伺服器伺服選擇、POESESSID 官方連線授權與核心環境配置。

---

## 📥 1. 安裝與執行

### Windows 玩家免安裝版 (推薦)
1. 前往 GitHub [Releases](https://github.com/saijo0404/POE-tool/releases) 頁面下載最新版可執行檔：
   - 獨立執行檔：`poe-tool.exe`
   - 免安裝壓縮檔：`poe-tool-*-windows-x64-portable.zip`
2. 將檔案解壓縮至任意個人目錄（建議避免放置於需管理員權限的受保護系統目錄）。
3. 雙擊執行 `poe-tool.exe`。

> 💡 **提示**：POE_tool 採用純單一執行檔架構（Tauri 2.0 + Rust 原生微核心），內部已封裝所需執行期，**無需安裝 Node.js、Python 或任何額外執行期**。

---

## ⚙️ 2. 伺服器與聯盟選擇 (Realm & League)

開啟應用後，可在右上角或「系統設定」中調整目標遊戲環境：
- **伺服器 (Realm)**：支援**台服 (TW)** 與 **國際服 (Global)**。
- **目標聯盟 (League)**：預設載入當季官方最新挑戰聯盟（如 `Settlers`），亦支援專家、標準與各類私人聯賽。
- **世代引擎 (Engine)**：預設為「自動偵測 (Auto)」，會根據背景運行的遊戲程序自動切換為 **PoE 1** 或 **PoE 2**，亦可手動點擊頂欄膠囊徽章強制鎖定。

---

## 🔑 3. 官方帳號設定 (POESESSID)

若您欲使用「**倉庫資產追蹤**」、「**即時大宗掛牌**」或「**個人角色資料同步**」功能，需要在設定中提供官方授權資訊：

### 取得方式：手動填寫 Cookie
1. 使用瀏覽器開啟 [Path of Exile 官方網站](https://www.pathofexile.com/)（台服請前往對應官方平台）並完成登入。
2. 在網頁任意處按下鍵盤 `F12` 開啟開發者工具（DevTools）。
3. 切換至 **應用程式 (Application)** 或 **儲存空間 (Storage)** 分頁。
4. 展開左側 **Cookies** ➔ 點選 `https://www.pathofexile.com`。
5. 找到名稱為 `POESESSID` 的 Cookie 項目，複製其 Value 數值（約 32 位英數字元）。
6. 回到 POE_tool 點選右上角 ⚙️ **「系統設定」**：
   - 貼入 **官方 POESESSID**。
   - 填寫您的 **帳號名稱 (Account Name)**。
7. 點擊 **「測試連線」** 按鈕驗證授權有效性。

---

## 🔒 4. 隱私與安全性保證

- **100% 本地運作**：POE_tool 不具備任何遠端收集伺服器，您的設定檔只保存在本地端。
- **直連官方 API**：您的憑證僅用於向 GGG 官方伺服器通訊以讀取您自身的公開與私人倉庫頁。
- 更多細節請參閱 [SECURITY.md](../../SECURITY.md) 與 [隱私規格](../architecture/architecture-overview.md#安全性與隱私架構)。
