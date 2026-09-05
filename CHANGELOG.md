# 📝 版本更新日誌 (Changelog)

本專案的所有重要變更均會記錄於此文件中。

本更新日誌格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/) 標準，並嚴格遵循 [語意化版本 (Semantic Versioning)](https://semver.org/lang/zh-TW/) 規範。

---

## [Unreleased]

---

## [2.5.0] - 2026-09-05

### ✨ 新增 (Added)
- **流派自訂詞綴權重精算與裝備契合度評分引擎 (Custom Build Affix Weight & Fit Score Engine)**：
  - 純領域評估核心 (`affixWeightEngine.ts`)，根據流派權重規則庫即時計算裝備契合度總分、階級分級（S/A/B/C/D）與個人化評語建議 ([#116](https://github.com/saijo0404/POE-tool/issues/116), [#119](https://github.com/saijo0404/POE-tool/pull/119))。
  - 內建四大熱門主流預設（正火純火生命流、元素弓箭暴擊流、中毒混沌持續流、旋風斬純物理流）。
  - 流派契合徽章組件 (`BuildFitScoreBadge.tsx`)，整合至查價主頁面與懸浮查價視窗，支援流派預設切換與得分明細展開。
- **市集掛牌四分位距統計與抗壓價建議售價估算 (Market IQR Price Cleaning & Fair Value Advisor)**：
  - 純領域四分位距（IQR）與離群值檢測引擎 (`priceFilterEngine.ts`)，自動辨識並剔除市集異常低價壓價（Price Fixing）與極端天價掛牌 ([#117](https://github.com/saijo0404/POE-tool/issues/117), [#120](https://github.com/saijo0404/POE-tool/pull/120))。
  - 產出穩健中位數市價、快速脫手建議價與信賴區間指標，並於查價結果面板頂部嵌入建議售價卡片 (`PriceAdvisorBadge.tsx`)。
- **穿戴裝備即時差額對比與屬性盈虧分析器 (Equipped Gear Delta & Stat Gain Inspector)**：
  - 純領域差額比對引擎 (`gearDeltaEngine.ts`)，自動偵測裝備部位並對比生命、魔力、護盾、單抗、複合抗、全元素抗、混沌抗、法術壓抑與攻速等屬性差額 (+/- Delta) ([#118](https://github.com/saijo0404/POE-tool/issues/118), [#121](https://github.com/saijo0404/POE-tool/pull/121))。
  - 本地槽位穿戴裝備存儲 (`gearStorage.ts`) 與一鍵「設為穿戴基準」功能。
  - 差額分析視圖 (`GearComparisonView.tsx`)，以綠色/紅色清楚標記屬性盈虧與整體升級建議 (upgrade / sidegrade / downgrade)。

### ♻️ 重構 (Refactored)
- **核心地圖詞綴預設、輿圖尋路與查價 Hook 閾值解耦 (Map Mod Presets & Price Hooks Thresholds Decoupling)**：
  - 抽出 `dangerModsData.ts` (194 行)，使 `dangerPresets.ts` 降至 67 行保持向後相容 ([#114](https://github.com/saijo0404/POE-tool/issues/114), [#115](https://github.com/saijo0404/POE-tool/pull/115))。
  - 抽出 `atlasGraph.ts` (86 行)，使 `atlasPathfinding.ts` 降至 137 行並分解 BFS 為小函式。
  - 抽出 `atlasTradeMeta.ts` (78 行)，使 `atlasShoppingList.ts` 降至 153 行。
  - 抽出 `useOverlayWindowEvents.ts` (90 行)，使 `useOverlayPrice.ts` 降至 155 行。
  - 抽出 `useTradeSearchExecution.ts` (115 行)，使 `usePriceChecker.ts` 降至 159 行，全數達到檔案 $\le 200$ 行、函式 $\le 30$ 行標準。

---

## [2.4.0] - 2026-09-05

### ✨ 新增 (Added)
- **輿圖策略 50 場大宗備料清單與成本精算器 (Atlas Strategy Bulk Material Shopping List & Cost Calculator)**：
  - 純領域計算核心 (`atlasBulkShoppingEngine.ts`)，根據策略分級之聖甲蟲與額外工藝配置，乘算指定場次（10/25/50/100 或自訂），自動產出備料清單、單場與總採購花費（Chaos / Divine）以及利潤期望值預估 ([#108](https://github.com/saijo0404/POE-tool/issues/108), [#111](https://github.com/saijo0404/POE-tool/pull/111))。
  - 整合 Faustus 通貨交易所金幣手續費計算公式，評估大宗交易需耗費之金幣總量與 T16 補金幣場次。
  - 大宗採購精算卡片 (`AtlasBulkShoppingCard.tsx`) 整合至輿圖規劃中心，支援單價即時自訂覆寫與一鍵複製格式化採購清單。
- **本機增量物價差分快取與高效查詢引擎 (Incremental Price Cache & Diff Query Engine)**：
  - 增量差分領域引擎 (`incrementalCache.ts`)，比對物價快照版本產出新增、更新與移除差分物件 (`PriceDelta`)，支援基準快照疊加差分重構最新物價，避免全量 JSON 反序列化之記憶體消耗 ([#109](https://github.com/saijo0404/POE-tool/issues/109), [#112](https://github.com/saijo0404/POE-tool/pull/112))。
  - 支援繁中、英文與 ID 三向 $O(1)$ 高效索引查詢與基於 TTL 的差分過期管理。
  - 差分快取本地儲存適配器 (`IncrementalPriceStorage.ts`)，提供最大差分佇列持久化。
- **Steam Deck 與手把友善觸控 HUD 介面模式 (Steam Deck HUD & Gamepad Friendly UI Mode)**：
  - 裝置設定領域模型 (`deviceProfile.ts`)，支援標準桌面 (`desktop`)、掌機模式 (`steam-deck`，125% 縮放、48px 觸控點擊目標、高對比字體) 與精簡模式 (`compact-hud`)，並能依據螢幕解析度智慧建議最佳配置 ([#110](https://github.com/saijo0404/POE-tool/issues/110), [#113](https://github.com/saijo0404/POE-tool/pull/113))。
  - 響應式狀態管理 (`useDeviceProfile.ts`) 與全域 CSS 變數動態注入。
  - 裝置切換器組件 (`DeviceProfileSelector.tsx`) 整合至系統設定視窗。

### ♻️ 重構 (Refactored)
- **輿圖架構分級行數閾值解耦 (Atlas Architecture Thresholds Decoupling)**：
  - 抽離分類過濾標籤列至獨立組件 `AtlasCategoryFilterBar.tsx` (113 行)，使 `AtlasStrategySelector.tsx` 降至 282 行 ([#106](https://github.com/saijo0404/POE-tool/issues/106), [#107](https://github.com/saijo0404/POE-tool/pull/107))。
  - 抽出 `atlasDataParser.ts` (122 行)、`atlasOrbitGeometry.ts` (32 行)、`atlasNodeTranslations.ts` (70 行) 與 `atlasMechanicDetector.ts` (33 行)，使 `atlasOfficialSyncService.ts` 降至 76 行。
  - 抽出 `atlasCostSummary.ts` (163 行)，使 `atlasHelpers.ts` 降至 87 行，全數嚴格符合 Domain $\le 200$ 行與 UI $\le 300$ 行規範。

---

## [2.3.0] - 2026-09-04

### ✨ 新增 (Added)
- **本機離線物價快照與容災快取引擎 (Offline Price Snapshot & Fallback Engine)**：
  - 純領域快照模型 (`priceSnapshotEngine.ts`)，支援快照結構封裝、合法性驗證、精確/模糊/類別降級回退與陳舊度 (Stale Age) 健康評估 ([#100](https://github.com/saijo0404/POE-tool/issues/100), [#103](https://github.com/saijo0404/POE-tool/pull/103))。
  - LocalStorage 持久化快取 (`priceSnapshotStorage.ts`) 與 JSON 快照匯出/匯入。
  - 查價介面無縫整合快照狀態警示徽章 (`PriceSnapshotBadge.tsx`)。
- **交易密語自訂快捷範本與情境快速回覆 (Customizable Trade Whisper Templates & Quick Actions)**：
  - 多情境密語範本純領域管理 (`whisperTemplates.ts`)，內建刷圖稍候、打王攻堅、已售出、感謝交易等預設情境，支援動態變數替換 (`{buyer}`, `{item}`, `{price}`, `{stash}`) ([#101](https://github.com/saijo0404/POE-tool/issues/101), [#104](https://github.com/saijo0404/POE-tool/pull/104))。
  - 交易懸浮卡片 (`TradeWhisperCard.tsx`) 整合「⚡ 情境回覆範本」快捷選單。
  - 交易助理設定 (`TradeWhisperTester.tsx`) 提供自訂範本增刪與預設值重設。
- **刷圖日誌歷程深度統計與時薪分佈分析 (Mapping History Analytics & Hourly Profit Distribution)**：
  - 多 Session 歷程聚合分析核心 (`mappingAnalytics.ts`)，計算總刷圖場次、累積總時長、總淨利潤、綜合平均時薪、單場均利與最佳回報 Top 3 排行 ([#102](https://github.com/saijo0404/POE-tool/issues/102), [#105](https://github.com/saijo0404/POE-tool/pull/105))。
  - 支援聯盟、時間區間（今日、近 7 天、近 30 天、全部）與輿圖策略過濾。
  - 刷圖記錄器 (`MappingTracker.tsx`) 整合深度統計分析卡片 (`MappingHistoryAnalyticsCard.tsx`)。

### 🐛 修復 (Fixed)
- **已污染與白裝異常獲得工藝空間修復**：修正 `craftingCalculator.ts` 中已污染物品 (`item.corrupted === true`) 與普通白裝誤判為具備工藝空間之瑕疵，並防範無效附魔推薦 ([#98](https://github.com/saijo0404/POE-tool/issues/98), [#99](https://github.com/saijo0404/POE-tool/pull/99))。

---

## [2.2.0] - 2026-09-04

### ✨ 新增 (Added)
- **裝備詞綴階級評鑑與工藝潛力分析 (Gear Inspector & Affix Tier Evaluator)**：
  - 純領域詞綴分類器 (`affixClassifier.ts`)，精準識別生命、抗性、物理、法術、速度等前綴與後綴屬性維度 ([#92](https://github.com/saijo0404/POE-tool/issues/92), [#95](https://github.com/saijo0404/POE-tool/pull/95))。
  - 工藝潛力評鑑引擎 (`gearInspector.ts`)，自動判定前綴/後綴剩餘空位 (Open Prefixes/Suffixes)、裝備綜合評級 (S/A/B/C/Vendor Trash)，並提供針對性工藝策略建議（保前保後重鑄、附魔補抗、隱匿混沌等）。
  - 查價介面無縫整合裝備潛力分析卡片 (`GearInspectorCard.tsx`)。
- **輿圖策略社群雲端分享中心與短代碼匯入匯出 (Atlas Strategy Community Hub & Share Codes)**：
  - 輕量化 `POEATLAS-v1-` 短代碼編解碼器 (`atlasShareCodec.ts`)，支援以 base64url 格式一鍵複製與匯入輿圖策略配置 ([#93](https://github.com/saijo0404/POE-tool/issues/93), [#96](https://github.com/saijo0404/POE-tool/pull/96))。
  - 內建 5 大熱門機制精選社群配置（軍團沙丘速刷、甲蟲狂歡、炸墳黑鐮日誌、莊園作物輪替、通牒致命試煉）。
  - 50 場大宗採購清單與成本計算器 (`communityStrategies.ts`)，快速精算聖甲蟲總量與 Divine 資金需求。
  - 互動式社群中心視窗 (`AtlasCommunityHubModal.tsx`) 與空狀態引導組件 (`AtlasEmptyStateCard.tsx`)。
- **章節拓荒技能與裝備轉換檢查點浮動指引 (Leveling Progression Gem Swap Checkpoints)**：
  - 7 大職業在 Lv 12、Lv 28、Lv 38 的技能與裝備抗性門檻檢查點純領域模型 (`gemSwapData.ts`)，共收錄 21 組關鍵里程碑 ([#94](https://github.com/saijo0404/POE-tool/issues/94), [#97](https://github.com/saijo0404/POE-tool/pull/97))。
  - 智慧屬性缺口警告系統 (`getAttributeWarningForGem`)，依據起手體質主動提示補足力量/敏捷/智慧底座（海玉/翡翠護身符、重革腰帶等）。
  - 技能轉換檢查點組件 (`ActGemSwapCheckpoints.tsx`)，支援分級篩選、插槽顏色提示與打勾持久化。
  - `ActLevelingGuide.tsx` 與 `ActMiniOverlay.tsx` 極簡置頂 HUD 全面整合技能里程碑檢視。

### 🐛 修復 (Fixed)
- **價格警報清空後重啟導致預設規則復活問題**：修正 `priceAlertStorage.ts` 中解析為空陣列被誤判為初始狀態的條件分支 ([#88](https://github.com/saijo0404/POE-tool/issues/88), [#90](https://github.com/saijo0404/POE-tool/pull/90))。
- **SVG 甜甜圈圓餅圖 100% 單一類別分配時弧線消失問題**：在 `portfolioCalculator.ts` 中對單一類別 100% 情況施加角度微量安全夾逼，避免 SVG 弧線起點與終點完全重合而無法繪製 ([#89](https://github.com/saijo0404/POE-tool/issues/89), [#91](https://github.com/saijo0404/POE-tool/pull/91))。

---

## [2.1.0] - 2026-09-04

### ✨ 新增 (Added)
- **官方通貨交易所 (Faustus Currency Exchange) 即時行情整合與套利試算**：
  - 即時查詢卡爾葛通貨交易所主流通貨行情與金幣 (Gold) 手續費消耗精算 ([#74](https://github.com/saijo0404/POE-tool/issues/74), [#81](https://github.com/saijo0404/POE-tool/pull/81))。
  - 三角套利與跨市場利差警示，自動標記套利機會與期望回報率。
  - 支援全通貨匯率轉換矩陣與一鍵反向試算。
- **高價值資產 7 日價格走勢圖與自訂波動警報 (Price Trends & Volatility Alerts)**：
  - 7 日歷史價格走勢圖、波動率 (Volatility) 指標與 24 小時漲跌幅高亮 ([#75](https://github.com/saijo0404/POE-tool/issues/75), [#85](https://github.com/saijo0404/POE-tool/pull/85))。
  - 自訂價格突破/跌破警戒線設定，支援 LocalStorage 本地持久化保存與 Web Audio 原生合成清脆警報提示音效 (`playPriceAlertSound`)。
- **玩家資產組合深度分析與歷史成長軌跡 (Portfolio Breakdown & Net Worth Growth)**：
  - 互動式 SVG 甜甜圈圓餅圖展示資產分類佔比、分類下鑽排行與資產集中度指標 ([#76](https://github.com/saijo0404/POE-tool/issues/76), [#86](https://github.com/saijo0404/POE-tool/pull/86))。
  - 歷史淨值成長折線圖與躍升里程碑偵測（標記大額掉落/交易飛躍點）。
  - 支援 Markdown、CSV 與 Discord 多格式資產總結報表一鍵匯出與複製。

### ♻️ 重構 (Refactored)
- **微模組化分級閾值架構規範確立與核心組件解耦**：
  - 確立分級行數閾值標準（Domain/計算/工具/Hooks 嚴格 $\le 200$ 行；複合 UI 容器/解析器 $\le 300$ 行；全域函式嚴格 $\le 30$ 行）([#79](https://github.com/saijo0404/POE-tool/issues/79), [#87](https://github.com/saijo0404/POE-tool/pull/87))。
  - 解耦 `AtlasEditStrategyModal.tsx`（387 行 $\to$ 156 行），抽離 `StrategyMetaFields.tsx` (150 行) 與 `StrategyTierFields.tsx` (87 行)。
  - 解耦 `useMappingTracker.ts`（265 行 $\to$ 164 行），抽離 `useMappingTimers.ts` (54 行) 與 `useMappingSessionActions.ts` (121 行)。

### 🐛 修復 (Fixed)
- **更新日誌版本比對連結修復**：補齊 `CHANGELOG.md` 底部遺漏的 `[2.0.0]` 比對定義並新增單元測試 ([#77](https://github.com/saijo0404/POE-tool/issues/77), [#82](https://github.com/saijo0404/POE-tool/pull/82))。
- **React 19 異步測試 act(...) 警告修復**：為 `useMappingTracker` 與 `MappingTracker` 補齊異步倉庫分頁掛載等待，達成測試零警告 ([#78](https://github.com/saijo0404/POE-tool/issues/78), [#83](https://github.com/saijo0404/POE-tool/pull/83))。
- **測試環境 Polyfill 增補**：補齊 jsdom 環境缺少 `window.open` 實作之 Mock，消除警告 ([#80](https://github.com/saijo0404/POE-tool/issues/80), [#84](https://github.com/saijo0404/POE-tool/pull/84))。

---

## [2.0.0] - 2026-09-03

### ✨ 新增 (Added)
- **裝備工藝模擬與成本期望精算器 (Crafting Actuary & Simulator - Craft of Exile 輕量整合)**：
  - 支援全裝備部位（身體護甲、頭盔、手套、靴子、弓、單手武器、盾牌、飾品等）熱門基底與 ilvl (1~100) 等級選擇 ([#54](https://github.com/saijo0404/POE-tool/issues/54), [#73](https://github.com/saijo0404/POE-tool/pull/73))。
  - 根據前/後綴詞綴權重資料庫，即時精算精髓 (Essence) 保底、化石 (Fossils) 最佳配方（10x 加倍與 0x 阻斷權重組合）、收割 (Harvest) 與混沌石點骰之成功機率 $P$。
  - 精準提供平均嘗試次數 $1/P$、期望 Chaos/Divine 成本、95% 信心區間花費預估，並自動以金色徽章推薦最省錢工藝路線。
  - **實機模擬試骰沙盒 (Live Craft Sandbox)**：支援單次試骰與自動點到命中（上限 100 次），仿 PoE 經典風格即時展示裝備卡片、隨機 roll 點結果與目標命中高亮。
  - **熱門工藝預設配方**：內建壓抑生命抗性胸甲、35% 跑速雙抗鞋、大傷物理脊骨弓、滿混抗紫晶戒指、+1 全法術寶石法杖、純護甲星辰皮甲等一鍵帶入範本。
- **交易密語懸浮助理與藏身處快速操作 (Trade Whisper & Quick Response Assistant)**：
  - 即時監聽遊戲日誌 `Client.txt` 與剪貼簿，支援英文、繁體中文（台服）、簡體中文（國服）與大宗通貨交易密語解析 ([#53](https://github.com/saijo0404/POE-tool/issues/53), [#72](https://github.com/saijo0404/POE-tool/pull/72))。
  - 提供五大快捷指令按鈕：`/invite`（組隊）、`@<玩家名> 正在刷圖中，請稍候 1 分鐘！`（稍候回覆）、`/tradewith`（交易）、`/hideout`（回藏身處）與 `ty gl` + `/kick`（致謝並踢除）。
  - **倉庫格位視覺指示器 (Stash Grid Indicator)**：依據密語座標自動高亮 12x12 一般分頁與 24x24 四倍分頁目標格位。
  - **合成提示音效**：透過 Web Audio API 原生合成清脆水晶提示音 (`playTradeWhisperSound`)。
  - **密語助理模擬器 (Trade Whisper Tester)**：內建多語言密語測試範本與自訂快捷回覆詞設定。

## [1.5.0] - 2026-09-02

### ✨ 新增 (Added)
- **遊戲內極簡半透明懸浮查價視窗 (Awakened-style Floating Overlay)**：
  - 支援無邊框置頂、全螢幕遊戲視窗點擊穿透 (Click-through)、滑鼠懸停啟用與全域快捷鍵 (`Ctrl+D` / `Ctrl+W`) 呼出關閉 ([#41](https://github.com/saijo0404/POE-tool/issues/41), [#62](https://github.com/saijo0404/POE-tool/pull/62), [#63](https://github.com/saijo0404/POE-tool/pull/63))。
  - 支援滑鼠游標自動貼齊與邊界防溢出計算，不遮蔽遊戲內物品屬性欄。
- **刷圖收益即時追蹤與結算器 (Mapping Session & Profit Tracker)**：
  - 監聽 `Client.txt` 遊戲日誌自動識別進出地圖事件與歷程計時 ([#51](https://github.com/saijo0404/POE-tool/issues/51), [#70](https://github.com/saijo0404/POE-tool/pull/70))。
  - 進出圖前後自動結算背包與倉庫物品資產差額，即時精算單場利潤、累計收益與神聖石時薪（Divine/hr）。
  - 支援音效提醒、自訂投資成本扣除與 Markdown/CSV 收益報表匯出。
- **地圖危險詞綴警示與安全 Regex 產生器 (Map Dangerous Mod Warning & Regex)**：
  - 依據玩家流派特性（物理/元素反傷、無法回復、降最大抗性、無法偷取）自動將危險詞綴標記為紅色高警示 ([#52](https://github.com/saijo0404/POE-tool/issues/52), [#71](https://github.com/saijo0404/POE-tool/pull/71))。
  - 一鍵生成安全地圖過濾正則表達式（Regex），支援直接貼入遊戲倉庫或市集搜尋欄快速高亮安全地圖。
- **稀有裝備 Pseudo 偽屬性合併與智慧篩選**：
  - 智慧聚合「總元素抗性」、「總生命/魔力」等核心複合數值，並預設勾選最具市場價值的核心 2~3 條關鍵詞綴 ([#47](https://github.com/saijo0404/POE-tool/issues/47), [#67](https://github.com/saijo0404/POE-tool/pull/67))。
  - 支援數值區間浮動微調（$\pm 10\% \sim 20\%$）與自訂詞綴條件增刪。
- **倉庫大宗出售 (Bulk Sale) 溢價估值模型**：
  - 倉庫資產估值支援自訂各類物資（甲蟲、精髓、命運卡、通貨）之大宗出售打包溢價倍率 ([#48](https://github.com/saijo0404/POE-tool/issues/48), [#68](https://github.com/saijo0404/POE-tool/pull/68))。
  - 支援特殊高價值未鑑定基底物與勢力基底定價。
- **Cloudflare WAF / Turnstile 驗證適應性與 Session 存活探針**：
  - 完善 Webview 輔助驗證流程，加入心跳偵測與過期提醒，改善官方 Cloudflare 防護阻擋問題 ([#45](https://github.com/saijo0404/POE-tool/issues/45), [#60](https://github.com/saijo0404/POE-tool/pull/60))。

### ⚡ 效能 (Performance)
- **Win32 事件驅動剪貼簿推送機制 (Win32 Push vs Poll)**：使用 Win32 `AddClipboardFormatListener` 取代前端定時輪詢，背景待機 CPU 佔用降至 0% ([#40](https://github.com/saijo0404/POE-tool/issues/40), [#61](https://github.com/saijo0404/POE-tool/pull/61))。
- **3.2MB 靜態詞綴字典載入優化**：針對字典 JSON 實作二進制預先序列化與記憶體快取，冷啟動反序列化時間由 250ms 縮減至 < 20ms ([#42](https://github.com/saijo0404/POE-tool/issues/42), [#64](https://github.com/saijo0404/POE-tool/pull/64))。
- **未匹配詞綴子字串 Aho-Corasick 演算法**：將 $O(N)$ 線性搜尋改建為 Aho-Corasick 多模式匹配機，未命中比對延遲壓至 < 0.5ms ([#43](https://github.com/saijo0404/POE-tool/issues/43), [#65](https://github.com/saijo0404/POE-tool/pull/65))。

### ♻️ 重構 (Refactored)
- **Rate Limiter 非同步請求排隊佇列與自動平滑重試**：於 Rust 端透過 Tokio 實作排隊佇列，遇到 GGG 429 速率限制時自動指數退避並依序重送 ([#44](https://github.com/saijo0404/POE-tool/issues/44), [#59](https://github.com/saijo0404/POE-tool/pull/59))。
- **代碼庫專注度提升**：移除目前未成熟的 PoE 2 關聯代碼，專注維護 PoE 1 當季版本的絕對穩定 ([#46](https://github.com/saijo0404/POE-tool/issues/46), [#66](https://github.com/saijo0404/POE-tool/pull/66))。
- **React Fast Refresh 規範修復**：分離常數與元件導出，消除開發模式熱重載警告 ([#49](https://github.com/saijo0404/POE-tool/issues/49), [#69](https://github.com/saijo0404/POE-tool/pull/69))。

### 🧪 測試 (Testing)
- 調整詞綴字典效能測試門檻（`test_dictionary_init_performance`）以動態適應 Debug 與 Release 環境，修復 Windows CI 環境下測試超時斷言失敗問題。
- 修復 `SettingsContext.test.tsx` 在非同步狀態載入時未被 React 19 `act(...)` 包裹之控制台警告 ([#50](https://github.com/saijo0404/POE-tool/issues/50), [#58](https://github.com/saijo0404/POE-tool/pull/58))。

### 📖 文件 (Documentation)
- 建立產品發展路線圖 [`ROADMAP.md`](ROADMAP.md) 並配置 GitHub Milestone 連結 ([#37](https://github.com/saijo0404/POE-tool/issues/37), [#55](https://github.com/saijo0404/POE-tool/pull/55))。
- 建立根目錄版本歷史與發布記錄 [`CHANGELOG.md`](CHANGELOG.md) ([#38](https://github.com/saijo0404/POE-tool/issues/38), [#56](https://github.com/saijo0404/POE-tool/pull/56))。
- 修正 [`README.md`](README.md) 中 Windows 執行檔命名與建置輸出路徑說明不一致問題 (`POE_tool.exe` ➔ `poe-tool.exe`) ([#39](https://github.com/saijo0404/POE-tool/issues/39), [#57](https://github.com/saijo0404/POE-tool/pull/57))。

---

## [1.4.0] - 2026-08-30

### ✨ 新增 (Added)
- **PoB 原始代碼解析**：流派造價計算器 (Build Calculator) 支援直接解析 Path of Building 原始 Raw Base64 壓縮字串與 XML 格式，由 Rust 核心進行記憶體 inflate 解壓縮 ([#27](https://github.com/saijo0404/POE-tool/issues/27), [#33](https://github.com/saijo0404/POE-tool/pull/33))。

### 🐛 修復 (Fixed)
- **倉庫繁中資產估值**：修復倉庫資產估值 (Stash Valuation) 未對繁體中文物品名稱進行字典轉換之問題，確保台服玩家資產計算 100% 精準 ([#28](https://github.com/saijo0404/POE-tool/issues/28), [#34](https://github.com/saijo0404/POE-tool/pull/34))。
- **藏身處指令管線**：修復 Win32「前往藏身處 (F5)」指令未先寫入剪貼簿即模擬鍵盤貼上導致指令失效之問題 ([#26](https://github.com/saijo0404/POE-tool/issues/26), [#32](https://github.com/saijo0404/POE-tool/pull/32))。
- **UI 冗餘按鈕移除**：移除查價介面已無作用之「讀取剪貼簿」按鈕，精簡介面佈局 ([#19](https://github.com/saijo0404/POE-tool/issues/19), [#31](https://github.com/saijo0404/POE-tool/pull/31))。

### ♻️ 重構 (Refactored)
- **六角架構儲存埠統一**：定義 `IStoragePort` 應用抽象並實作 `LocalStorageAdapter`，消除前端組件對底層儲存機制的直接耦合 ([#36](https://github.com/saijo0404/POE-tool/pull/36))。
- **微模組化規範落地**：重構大型檔案，使全專案所有 TypeScript / React 與 Rust 檔案長度均符合 $\le 200$ 行之架構規範 ([#36](https://github.com/saijo0404/POE-tool/pull/36))。
- **全域型別健全化**：消除代碼庫中所有顯式 `any` 型別，並於 `types/poe.ts` 補齊 atlas 輿圖領域型別導出 ([#29](https://github.com/saijo0404/POE-tool/issues/29), [#35](https://github.com/saijo0404/POE-tool/pull/35))。

---

## [1.3.0] - 2026-08-30

### ✨ 新增 (Added)
- **輿圖策略自由編輯**：輿圖策略支援自由修改機制分類、自訂標籤、名稱與簡介，並提供選擇器卡片快捷編輯按鈕 ([#13](https://github.com/saijo0404/POE-tool/issues/13))。
- **地圖工藝自訂價格與名稱記憶**：輿圖備料之地圖工藝支援自訂修改名稱與單價記憶自動儲存 ([#16](https://github.com/saijo0404/POE-tool/issues/16))。
- **規劃器匯入匯出模組整合**：簡化策略頂部天賦列，將外部瀏覽器開啟與天賦複製功能整合至規劃器匯入匯出模組中 ([#7](https://github.com/saijo0404/POE-tool/issues/7), [#9](https://github.com/saijo0404/POE-tool/pull/9))。
- **倉庫資產歷程匯出**：倉庫資產追蹤器支援資產走勢圖、CSV 歷程報表與 Discord 格式摘要匯出。

### 🐛 修復 (Fixed)
- **天賦點數上限與繁中補完**：更正輿圖天賦點數上限為 138 點，加入超額分配防呆警示，並補完屬性總結面板之繁體中文翻譯 ([#11](https://github.com/saijo0404/POE-tool/issues/11), [#14](https://github.com/saijo0404/POE-tool/pull/14))。
- **地圖工藝單一原則約束**：限制輿圖策略備料地圖工藝至多選擇 1 項，防止重複或多重工藝疊加造成計算失真 ([#12](https://github.com/saijo0404/POE-tool/issues/12), [#15](https://github.com/saijo0404/POE-tool/pull/15))。
- **採購清單生成修復**：修復輿圖策略備料之「一鍵複製採購清單」產生內容格式與市集查詢條件異常問題 ([#10](https://github.com/saijo0404/POE-tool/issues/10))。

### 🛠️ 基礎設施 (CI/CD)
- **CI/CD 分流管理**：移除過時且重複之 `build.yml` 工作流程，由 `ci.yml` (自動化測試) 與 `release.yml` (打包發布) 分流管理。

---

## [1.2.0] - 2026-08-29

### ✨ 新增 (Added)
- **內建 PoE 1 輿圖天賦規劃器**：導入官方完整 860+ 節點輿圖天賦樹幾何拓撲資料結構與雙圖層高亮畫布 ([#1](https://github.com/saijo0404/POE-tool/issues/1), [#6](https://github.com/saijo0404/POE-tool/pull/6))。
- **智慧尋路與天賦編解碼**：實作 Dijkstra 智能最短路徑尋路分配演算法，並支援官方 Base64 與 PoEPlanner (`BQAc...`) 雙向編解碼與自適應解析 ([#1](https://github.com/saijo0404/POE-tool/issues/1))。
- **核心基石繁中化與屬性總結**：收錄 27 顆輿圖核心基石繁體中文說明與數值即時加總統計面板 ([#1](https://github.com/saijo0404/POE-tool/issues/1))。
- **輿圖策略自由刪除與空狀態**：支援輿圖策略完全自由刪除，解除單一分級限制與優化完全空狀態呈現 ([#4](https://github.com/saijo0404/POE-tool/issues/4), [#5](https://github.com/saijo0404/POE-tool/pull/5))。

### 🐛 修復 (Fixed)
- **PoEPlanner 網址載入修復**：修復預設 `poeplanner.com` 輿圖天賦網址格式無法在外部網頁正常載入之問題 ([#2](https://github.com/saijo0404/POE-tool/issues/2), [#3](https://github.com/saijo0404/POE-tool/pull/3))。
- **天賦雙向連線拓撲修復**：修復官方天賦雙向連線拓撲與雙圖層高亮顯示缺失問題 ([#1](https://github.com/saijo0404/POE-tool/issues/1))。
- **繁中翻譯引擎升級**：全面升級輿圖天賦屬性繁中翻譯引擎，並修復畫布在一般/縮小模式下的置中偏移 ([#1](https://github.com/saijo0404/POE-tool/issues/1))。

### 🛠️ 基礎設施 (CI/CD)
- **工程規範範本**：新增 GitHub Issue 與 Pull Request 標準範本，並配置專注 Windows 平台的 CI/CD 工作流程。

---

## [1.1.0] - 2026-08-23

### ✨ 新增 (Added)
- **多來源剪貼簿格式支援**：即時查價介面支援解析 `poe.ninja` 與 `Path of Building` (PoB) 物品剪貼簿複製格式。
- **物品浮動提示卡片 (Tooltip)**：全面強化查價介面與流派計算器之物品 Hover 浮動提示卡片體驗。
- **即時價格持久化**：歷史查價紀錄支援持久化儲存與即時價格重載。

### 🐛 修復 (Fixed)
- **流派造價過濾器修復**：修復流派造價計算器 (Build Calculator) 之市集查詢過濾條件與傳奇物品名稱搜尋。
- **背包物品排除**：在計算流派造價時自動排除角色背包內之非穿戴物品，避免造價重複累加。

---

## [1.0.0] - 2026-08-22

### ✨ 初始發布 (Initial Release)
- **⚔️ 遊戲內極速即時查價 (Instant Price Checker)**：
  - 支援遊戲內 `Ctrl+C` 剪貼簿自動捕捉與即時官方市集行情查詢。
  - 內建 17,600+ 詞綴與 5,100+ 物品名稱中英雙向智慧字典。
  - Rust 原生 Win32 `SendInput` 按鍵指令注入（< 1ms 響應，支援 F5 一鍵前往藏身處）。
  - Tokio 智慧多通道速率限制器 (Rate Limiter)，自動解析 GGG Rate-Limit 標頭並指數退避防 429 阻擋。
- **💰 倉庫資產即時估值 (Wealth Tracker & Stash Valuation)**：
  - 對接官方 Stash API 與即時匯率，精算通貨、碎片、卡片、聖甲蟲與傳奇裝備之 Chaos / Divine 淨值。
  - 支援自選分頁勾選、最低價值門檻過濾與資產分類佔比圖表。
- **🧮 流派造價計算器 (Build Cost Calculator)**：
  - 支援解析 `pobb.in` 與 `poe.ninja` 角色流派網址，自動抓取整套裝備與技能寶石並精算造價。
  - 支援官方即時現貨價一鍵同步與部位造價 Markdown 報表匯出。
- **📖 章節拓荒全指引 (Act Leveling Guide)**：
  - 完整收錄 Act 1 ~ Act 10 最佳主線升級路線、被動天賦點、昇華試煉與職業寶石過濾。
  - 支援懸浮置頂半透明迷你模式。
- **⚡ Tauri 2.0 + Rust 六角架構**：
  - 純單一執行檔（`.exe`），零 Node.js 執行期依賴，記憶體佔用僅 35MB~60MB。
  - 具備完整 Vitest 前端單元測試防護網。

---

[Unreleased]: https://github.com/saijo0404/POE-tool/compare/v2.5.0...HEAD
[2.5.0]: https://github.com/saijo0404/POE-tool/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/saijo0404/POE-tool/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/saijo0404/POE-tool/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/saijo0404/POE-tool/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/saijo0404/POE-tool/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/saijo0404/POE-tool/compare/v1.5.0...v2.0.0
[1.5.0]: https://github.com/saijo0404/POE-tool/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/saijo0404/POE-tool/compare/v1.3.0...v1.4.0
[1.3.0]: https://github.com/saijo0404/POE-tool/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/saijo0404/POE-tool/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/saijo0404/POE-tool/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/saijo0404/POE-tool/releases/tag/v1.0.0
