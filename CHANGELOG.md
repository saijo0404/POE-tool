# 📝 版本更新日誌 (Changelog)

本專案的所有重要變更均會記錄於此文件中。

本更新日誌格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-TW/1.1.0/) 標準，並嚴格遵循 [語意化版本 (Semantic Versioning)](https://semver.org/lang/zh-TW/) 規範。

---

## [Unreleased]

---

## [3.2.0] - 2026-09-05

### ✨ 新增 (Added)
- **PoE 2 雙武器組與雙天賦分配領域模型 (Dual Weapon Sets & Dual Spec Domain Model)**：
  - 建立 `WeaponSet` (`'Set1' | 'Set2'`)、`EquippedWeapon` 與 `DualSpecAllocation` 領域模型與不可變資料結構 ([#183](https://github.com/saijo0404/POE-tool/issues/183), [#186](https://github.com/saijo0404/POE-tool/pull/186))。
  - 實作雙語基底類型分類器 `classifyWeaponType` 與副手合法性校驗 `isValidOffHand`（完整支援弓/十字弓配備箭袋，近戰雙手武器互斥保護）。
  - 實作技能武器需求自動綁定解析器 `resolveSkillWeaponRequirements` 與主動切換邏輯。
  - 實作武器專屬雙天賦點數分離校驗器 `validateDualSpec` 與本地命名空間持久化儲存 `DualWeaponStorage`。
- **雙武器組屬性差額與連段協同運算引擎 (Dual Setup Stat Delta & Combo Synergy Engine)**：
  - 實作 `calculateWeaponSetDelta` 精算攻擊/法術點傷、攻速、暴擊、防禦與抗性之相對及百分比差額 ([#184](https://github.com/saijo0404/POE-tool/issues/184), [#187](https://github.com/saijo0404/POE-tool/pull/187))。
  - 實作 PoE 2 特色連段異常狀態協同引擎 `calculateComboSynergy`，精算焦油點燃、冰凍碎裂猛擊、破甲割裂等連鎖乘數與加成覆蓋。
  - 實作情境權重評分引擎 `calculateScenarioScore`，針對拓荒清圖 (Mapping) 與攻堅王戰 (Bossing) 智慧評估兩組武器之契合度得分。
- **遊戲內雙武器即時切換懸浮指引與狀態條 (Weapon Swap In-Game HUD & Active Setup Overlay)**：
  - 實作 `useWeaponSwap` Hook 監聽全域與本機切換熱鍵（預設 `X`），支援 Set 1 / Set 2 快速切換與即時狀態同步 ([#185](https://github.com/saijo0404/POE-tool/issues/185), [#188](https://github.com/saijo0404/POE-tool/pull/188))。
  - 打造 `WeaponSwapIndicator` 懸浮 HUD 元件，具備主副手武器類型徽章、天賦點數分配進度條、不相容技能警示與差額矩陣展開卡片。
  - 整合至 `OverlayApp`，於 PoE 2 引擎模式自適應渲染，並提供極簡模式快速收合。

---

## [3.1.0] - 2026-09-05

### ✨ 新增 (Added)
- **PoE 2 官方市集 API Client 與多引擎請求分發器 (PoE 2 Official Trade API Client & Multi-Engine Dispatcher)**：
  - 擴充 Rust 後端 `trade_urls.rs`、`trade_client.rs` 與前端 `ApiClientFactory`、`useTradeSearchExecution`，依 `GameEngine` 狀態動態路由請求至 PoE 2 Trade API 端點（`/api/trade2/search/{league}` 與台服對應端點）([#175](https://github.com/saijo0404/POE-tool/issues/175), [#178](https://github.com/saijo0404/POE-tool/pull/178))。
  - 實作 PoE 2 專屬聯盟清單快取、隔離的 Rate Limiter 速率通道與階梯退避防禦。
  - 支援 PoE 2 特有之查詢 Payloads（精魂需求、符文孔位、銘刻地圖階級、未切割寶石階級過濾）。
- **PoE 2 專屬基底與雙向繁中/英文詞綴數據字典庫 (PoE 2 Stat Dictionary & Bi-directional Lookup)**：
  - 建立 PoE 2 專屬詞綴映射庫，收錄精魂保留、翻滾冷卻、能量護盾充能、積蓄、破甲等專屬屬性 ([#176](https://github.com/saijo0404/POE-tool/issues/176), [#180](https://github.com/saijo0404/POE-tool/pull/180))。
  - 擴充繁中/英文雙向模糊匹配與 Rust Aho-Corasick 高速比對引擎，並支援銘刻地圖（Waystone）與未切割技能/輔助寶石（Uncut Gem）基底類型反查。
  - 前端導出 `lookupPoe2Stat` 與 `lookupPoe2Base` 提供毫秒級雙向查表。
- **PoE 2 剪貼簿一鍵智慧查價與自適應篩選 (PoE 2 Clipboard Price Checking & Smart Query Generation)**：
  - 整合 `Poe2ItemParser`，將剪貼簿解析結果智慧轉譯為官方 Trade2 JSON 查詢結構 ([#177](https://github.com/saijo0404/POE-tool/issues/177), [#181](https://github.com/saijo0404/POE-tool/pull/181))。
  - 自動套用精魂需求（Spirit）、符文插槽（Rune Sockets）、銘刻地圖/尋路石階級（Waystone Tier T1-T16）與未切割寶石階級（Uncut Gem Tier T1-T20）之數值篩選條件與公差區間。
  - `OverlayHeader` 與查價介面自適應渲染 PoE 2 專屬徽章與標籤，懸浮查價即時分析中位數與市場行情。

---

## [3.0.0] - 2026-09-05

### ✨ 新增 (Added)
- **PoE 2 次世代雙核心獨立架構 (PoE 2 Next-Gen Dual Engine Architecture)**：
  - 建立 `GameEngine` 領域模型 (`'poe1' | 'poe2'`) 與全域狀態機 `GameEngineStore`，支援手動鎖定與自動感應雙模式 ([#166](https://github.com/saijo0404/POE-tool/issues/166), [#169](https://github.com/saijo0404/POE-tool/pull/169))。
  - Rust 後端微核心跨平台實作 `get_foreground_window_info`，監控前景視窗進程名稱與標題以實現無縫自動引擎識別。
  - 抽象化 `ItemParserStrategy` 與 `ItemParserFactory` 工廠模式，實作前端 `Poe2ItemParser` 與後端 `poe2_parser.rs`，支援精魂 (Spirit)、符文插槽 (Rune Sockets)、銘刻地圖 (Waystone) 與未切割寶石 (Uncut Gem) ([#167](https://github.com/saijo0404/POE-tool/issues/167), [#170](https://github.com/saijo0404/POE-tool/pull/170))。
  - 打造 `EngineSwitcher` 全域切換器並整合至導覽列 `Navbar`，裝備檢視卡片 `GearInspectorCard` 與估價表頭 `ParsedItemHeader` 全面適配 PoE 2 專屬欄位與引擎徽章 ([#168](https://github.com/saijo0404/POE-tool/issues/168), [#171](https://github.com/saijo0404/POE-tool/pull/171))。

### ♻️ 重構與架構收斂 (Refactored)
- **儲存命名空間隔離與型別健全性 (Storage Namespace Isolation & Typing Remediation)**：
  - 實作 `StorageNamespaceAdapter` 並匯出 `namespacedStorage`，將物價快照、增量快取與剪貼簿歷史按遊戲引擎獨立隔離，並提供 Legacy 舊資料平滑相容 ([#173](https://github.com/saijo0404/POE-tool/issues/173), [#174](https://github.com/saijo0404/POE-tool/pull/174))。
  - 清理 `src/utils/tauri.test.ts` 弱型別技術債，全專案達到 100% 零顯式 `any`。
  - 專案依賴與設定全數升級至 `v3.0.0`。

---

## [2.12.0] - 2026-09-05

### ♻️ 重構與架構收斂 (Refactored & Architectural Convergence)
- **Rust 後端核心服務與超長測試模組化拆分 (Rust Services & Test Modularization)**：
  - 拆分 `services/build_calc/tests.rs` (553 行) 為細粒度模組 (`character_json_tests.rs`, `pob_parse_tests.rs`, `query_gen_tests.rs`) ([#158](https://github.com/saijo0404/POE-tool/issues/158), [#161](https://github.com/saijo0404/POE-tool/pull/161))。
  - 拆分 `services/parser/tests.rs` (503 行) 為細粒度模組 (`gear_tests.rs`, `map_gem_tests.rs`, `ninja_tests.rs`, `tier_tests.rs`)。
  - 解耦 `services/parser/mod.rs` (422 行)、`services/trade/listing_parser.rs` (398 行) 與 `services/stash/valuation.rs` (396 行) 至獨立單一職責子模組。
  - 修復 Win32 `WNDCLASSEXW.cbWndExtra` 欄位型別，所有後端檔案與測試全數符合 $\le 200$ 行架構標準。
- **UI 原語元件全面普及與設計 Token 收斂 (Design System Primitives Ubiquitous Adoption)**：
  - 將 `src/components/ui/` 原子原語（`Card`, `Button`）全面推廣至全專案剩餘 28 個 Card 與容器元件 ([#159](https://github.com/saijo0404/POE-tool/issues/159), [#162](https://github.com/saijo0404/POE-tool/pull/162))。
  - 涵蓋 `atlas`, `build`, `crafting`, `delirium`, `gear`, `jewel`, `mapMod`, `mapping`, `price`, `sanctum`, `scarab`, `settings`, `ultimatum`, `wealth`, `whisper`, `wildwood` 等領域模組。
  - 徹底消弭散落於各業務模組之重複 Tailwind 類別與內聯樣式，確保全站視覺一致性且單檔 $\le 300$ 行。
- **前端遺留測試嚴格型別化與相依安全性修復 (Test Typing Cleanup & Dependency Vulnerability Remediation)**：
  - 拆分 `TradeListingView.test.tsx` (268 行) 與 `AffixFilterList.test.tsx` (254 行) 為模組化子測試，單檔全數 $\le 132$ 行 ([#160](https://github.com/saijo0404/POE-tool/issues/160), [#163](https://github.com/saijo0404/POE-tool/pull/163))。
  - 消除 `TradeListingView.test.tsx` 中殘留之 `let writeTextMock: any;` 與 `as any` 強制轉型，達成全專案 0 顯式 `any`。
  - 修剪無用依賴並升級 `nanoid` 至 3.3.18，消除所有安全性弱點警告（`npm audit` 0 個弱點）。

---

## [2.11.0] - 2026-09-05

### ♻️ 重構與品質提升 (Refactored)
- **測試套件模組化拆分與 100% 行數健康度達標 (Test Suite Modularization & Limit Compliance)**：
  - 拆分 8 個超長測試檔案為細粒度情境模組（渲染、互動、計算邏輯、API 隔離等），全專案 100% 測試檔案與生產檔案全數合規（Domain/Hooks/Utils/Tests $\le 200$ 行，UI $\le 300$ 行）([#152](https://github.com/saijo0404/POE-tool/issues/152), [#155](https://github.com/saijo0404/POE-tool/pull/155))。
- **App.tsx 路由解耦與全域監聽器抽象化 (App Router Extraction & Global Hotkey Hook)**：
  - 抽離 `AppRouter.tsx`，消除 9 層巢狀三元運算子分頁渲染，採用宣告式分頁調度並封裝加載骨架 ([#153](https://github.com/saijo0404/POE-tool/issues/153), [#156](https://github.com/saijo0404/POE-tool/pull/156))。
  - 封裝 `useGlobalHotkeys.ts` 處理全域按鍵監聽，並抽離 `isHotkeyTriggered` 純邏輯校驗。
  - 封裝 `useToastNotification.ts` 處理 Toast 狀態、重置防抖與自動定時消除。
  - `App.tsx` 行數由 193 行精簡至 115 行，所有函式 $\le 20$ 行。
- **統一 UI 設計系統原子元件與樣式收斂 (UI Design System Primitives & Token Unification)**：
  - 於 `src/components/ui/` 封裝核心原子元件庫：`Card.tsx`、`Badge.tsx`、`StatBadge.tsx`、`Button.tsx` ([#154](https://github.com/saijo0404/POE-tool/issues/154), [#157](https://github.com/saijo0404/POE-tool/pull/157))。
  - 替換 `BestiaryCraftCard.tsx`、`BlightOilCard.tsx` 與 `ExpeditionOptimizerCard.tsx` 等重複的內嵌容器與按鈕樣式。
  - 新增 `uiPrimitives.test.tsx` 完整測試套件。

---

## [2.10.0] - 2026-09-05

### ✨ 新增 (Added)
- **魔物園獵捕效益精算與野獸工藝配方查詢器 (Bestiary Beastcrafting & Mission EV Engine)**：
  - 純領域野獸工藝精算核心 (`beastcraftingEngine.ts`, `bestiaryData.ts`)，完整收錄 4 大勢力傳奇紅野獸庫與 7 大核心工藝配方（拓印魔法物品、分裂、加前綴移後綴、瓦爾 30% 品質等）([#146](https://github.com/saijo0404/POE-tool/issues/146), [#149](https://github.com/saijo0404/POE-tool/pull/149))。
  - 精算野獸工藝成本、利潤空間、ROI 評等與一鍵產生大宗紅野獸採購密語。
  - 建立白/黃/紅圖魔物園任務掉落機率模型，精算單場任務期望總產值 (EV) 與淨回報。
  - 野獸工藝卡片組件 (`BestiaryCraftCard.tsx`)，整合至工藝模擬中心，支援配方分類篩選與即時搜尋。
- **凋落聖油提煉配比與真菌地圖收益期望精算器 (Blight Oil Combinator & Blighted Map EV Forecaster)**：
  - 純領域聖油精算核心 (`blightOilEngine.ts`, `blightData.ts`)，收錄 13 種聖油階級階梯與 3:1 向上升級轉換率，精算直接販售 vs 向上提煉之套利價差與建議標籤 ([#147](https://github.com/saijo0404/POE-tool/issues/147), [#150](https://github.com/saijo0404/POE-tool/pull/150))。
  - 支援主流關鍵天賦塗油配方反向查詢（輸入天賦名稱即可查出所需 3 聖油組合）。
  - 精算凋落圖 (3聖油) 與凋落蔓延圖 (9聖油) 組合之掉落數量、怪群規模、幸運寶箱與預期淨回報 (EV)。
  - 凋落精算卡片組件 (`BlightOilCard.tsx`)，整合至輿圖規劃中心。
- **探險先祖秘寶出價談判最佳化與日誌收益精算器 (Expedition Haggle Optimizer & Logbook EV Forecaster)**：
  - 純領域探險精算核心 (`expeditionEngine.ts`, `expeditionData.ts`)，建立圖貞 (Tujen) 議價出價區間最佳化模型，計算第一次安全出價 (52%)、進取出價 (45%) 與回價 (68%) 之成交率與文物節省期望值 ([#148](https://github.com/saijo0404/POE-tool/issues/148), [#151](https://github.com/saijo0404/POE-tool/pull/151))。
  - 丹尼格 (Dannig) 文物匯率換算器，精算以太陽文物向丹尼格折扣兌換黑鐮/卡古爾/秩序文物的套利淨值。
  - 探險日誌殘骸詞綴（Remnants）權重與期望回報模型，自動檢測致命不可打詞綴（免疫元素/混沌/物理）並發出警示。
  - 探險精算卡片組件 (`ExpeditionOptimizerCard.tsx`)，整合至刷圖收益中心。

---

## [2.9.0] - 2026-09-05

### ✨ 新增 (Added)
- **荒野野靈荒野昇華天賦與符咒效果精算器 (Wildwood Ascendancy & Charms Evaluator)**：
  - 純領域符咒精算核心 (`charmEvaluator.ts`, `wildwoodData.ts`)，完整支援 3 大荒野昇華派系（原始獵手、林地看守者、夜詠者）與 15 種跨職業昇華符咒詞綴效果庫 ([#140](https://github.com/saijo0404/POE-tool/issues/140), [#143](https://github.com/saijo0404/POE-tool/pull/143))。
  - 支援 1~3 個符咒插槽組合驗證，即時計算累積抗性、生命/魔力加成與特殊旗標，並產出流派契合度評級（S/A/B/C）與裝備配置建議。
  - 荒野符咒卡片組件 (`WildwoodCharmsCard.tsx`)，整合至流派配裝面板，支援即時詞綴搜尋與快速清除。
- **禁忌聖所試煉聖物詞綴相乘評估與房型收益推估器 (Forbidden Sanctum Relic & Room EV Evaluator)**：
  - 純領域聖所精算核心 (`sanctumRelicEngine.ts`, `sanctumData.ts`)，收錄 4 大層聖所房型難度與基礎獎勵池模型，支援 12 種聖物詞綴相乘評估（決心抗性、商人折扣、額外視野等）([#141](https://github.com/saijo0404/POE-tool/issues/141), [#144](https://github.com/saijo0404/POE-tool/pull/144))。
  - 精算各房型期望淨利（EV in Chaos/Divine）與通關生存率預測，提供「首選挺進 / 審慎考慮 / 極高風險」房型建議。
  - 聖物精算卡片組件 (`SanctumRelicCard.tsx`)，整合至刷圖收益面板，支援層數切換與自訂金幣估值。
- **聖甲蟲庫存自動盤點與套裝成套率精算器 (Scarab Inventory Stock & Set Completion Engine)**：
  - 純領域甲蟲盤點核心 (`scarabStockEngine.ts`, `scarabData.ts`)，支援 4~5 槽位策略聖甲蟲配置與短板瓶頸精算 ([#142](https://github.com/saijo0404/POE-tool/issues/142), [#145](https://github.com/saijo0404/POE-tool/pull/145))。
  - 根據當前庫存精算成套場次，依據目標場次精算各甲蟲缺口數量與補貨總成本，並產出官方市集大宗採購鏈接與批次購買密語。
  - 甲蟲盤點卡片組件 (`ScarabStockAuditCard.tsx`)，整合至輿圖規劃中心，支援一鍵加載預設甲蟲組合與補貨清單複製。

---

## [2.8.0] - 2026-09-05

### ✨ 新增 (Added)
- **幻境瞻妄階級層數回報模擬與迷霧寶珠成本效益精算器 (Delirium Fog Layer EV & Simulacrum Splinter Forecaster)**：
  - 純領域瞻妄精算核心 (`deliriumEvEngine.ts`)，完整支援瞻妄擊殺進度階梯模型、各階層獎勵期望值（EV）與 17 種迷霧寶珠加成成本效益計算 ([#134](https://github.com/saijo0404/POE-tool/issues/134), [#137](https://github.com/saijo0404/POE-tool/pull/137))。
  - 精算幻境裂片掉落機率與整張門票折算淨回報，產出投資建議評級（強烈推薦 / 保守打平 / 高風險虧損）。
  - 瞻妄精算卡片組件 (`DeliriumForecasterCard.tsx`)，整合至刷圖收益記錄器，支援一鍵套用寶珠成本至刷圖門票。
- **永恆軍團珠寶種子碼鑑定與核心基石變更查詢器 (Timeless Jewel Seed Evaluator & Keystone Lookup)**：
  - 純領域鑑定核心 (`timelessEvaluator.ts`, `timelessData.ts`)，完整收錄 5 大軍團勢力、所有歷史將領與其對應核心基石效果 ([#135](https://github.com/saijo0404/POE-tool/issues/135), [#138](https://github.com/saijo0404/POE-tool/pull/138))。
  - 支援種子碼數值雜湊與被動點額外天賦加成推估，產出主流流派契合度評級（S/A/B/C）與市場參考身價。
  - 軍團珠寶鑑定卡片 (`TimelessJewelCard.tsx`)，整合至流派配裝面板，支援即時搜尋與勢力過濾。
- **遊戲內剪貼簿歷史回溯面板與多物品比價暫存列 (Clipboard History Log & Multi-Item Comparison Tray)**：
  - 純領域剪貼簿歷史管理器 (`clipboardHistoryManager.ts`)，提供 FIFO 佇列自動保留最新 20 筆查價紀錄，支援重複去重與本機持久化 ([#136](https://github.com/saijo0404/POE-tool/issues/136), [#139](https://github.com/saijo0404/POE-tool/pull/139))。
  - 多物品比價暫存列（最多 4 件），即時計算多物品價格中位數、物等區間與各詞綴卷值橫向對比表格。
  - 剪貼簿歷史卡片 (`ClipboardHistoryTray.tsx`) 與地圖危險警示條 (`MapDangerBanner.tsx`) 整合至查價中心，支援一鍵回溯重查與快速清空。

---

## [2.7.0] - 2026-09-05

### ✨ 新增 (Added)
- **地圖歷史掉落價值分析與地形收益熱力圖 (Map Drops Value Analytics & Tier Performance Heatmap)**：
  - 純領域熱力圖評估核心 (`mapDropHeatmap.ts`)，依據歷史刷圖場次按地圖名稱與階級自動聚合分析，精算平均淨利、時薪 Divine/hr、星級評等與綜合熱力指數 ([#128](https://github.com/saijo0404/POE-tool/issues/128), [#131](https://github.com/saijo0404/POE-tool/pull/131))。
  - 收益熱力圖卡片組件 (`MapPerformanceHeatmap.tsx`)，視覺化展示各地形收益條與頂級掉落紀錄，智慧標示首選刷圖地形。
- **通牒命運試煉期望回報精算與致命詞綴風險評級引擎 (Ultimatum Trial & EV Risk Engine)**：
  - 純領域通牒精算核心 (`ultimatumEvEngine.ts`, `ultimatumMods.ts`)，完整收錄通牒 1~10 輪獎勵池模型與 22 種負面致命詞綴危險度階級權重 ([#129](https://github.com/saijo0404/POE-tool/issues/129), [#132](https://github.com/saijo0404/POE-tool/pull/132))。
  - 結合機體弱點勾選（禁回、低抗、位移緩慢等）即時檢測致命衝突與發出警示，精算挺進下一輪的期望淨利 (EV)、通關機率與風險報酬比，提供「強烈挺進 / 謹慎挑戰 / 見好就收」決策建議。
  - 試煉精算卡片 (`UltimatumEvCard.tsx`)，整合至刷圖收益面板，提供快速輪次選擇、獎勵試算與 10 輪生存率預測。
- **自訂全域快捷鍵綁定管理與懸浮視窗自適應釘選 (Custom Global Hotkey Manager & Overlay Pinning)**：
  - 純領域快捷鍵核心 (`hotkeyManager.ts`, `hotkeyPresets.ts`)，支援單鍵、雙鍵與三鍵組合（Ctrl / Alt / Shift + Key）正規化、按鍵校驗與衝突檢測器 ([#130](https://github.com/saijo0404/POE-tool/issues/130), [#133](https://github.com/saijo0404/POE-tool/pull/133))。
  - 內建 5 種快捷方案（標準經典、左手人體工學、MMO 數字側鍵、Alt 映射、F 功能鍵直覺）。
  - 快捷鍵管理卡片 (`HotkeySettingsCard.tsx`)，整合至系統設定中心，支援即時按鍵錄製（Press-to-record）、衝突警示、懸浮視窗一鍵置頂釘選與透光度滑動調節。

---

## [2.6.0] - 2026-09-05

### ✨ 新增 (Added)
- **輿圖天賦配置與聖甲蟲組合協同推薦引擎 (Atlas Tree & Scarab Synergy Recommender)**：
  - 純領域協同計算核心 (`scarabSynergyEngine.ts`)，根據當前輿圖配置天賦節點與策略標籤，即時計算機制投入權重並比對聖甲蟲庫，產出乘數倍增推薦組合與 S/A/B 級評級 ([#122](https://github.com/saijo0404/POE-tool/issues/122), [#125](https://github.com/saijo0404/POE-tool/pull/125))。
  - 推薦卡片組件 (`ScarabSynergyCard.tsx`)，整合至輿圖規劃中心，支援槽位防呆校驗與一鍵套用組合至當前策略分級。
- **地圖儀工藝成本收益損益平衡預測精算器 (Map Device Craft Break-even Forecaster)**：
  - 純領域損益精算核心 (`deviceCraftBreakEven.ts`)，收錄主流地圖儀工藝選項（精髓、伏擊、瞻妄、戰亂、收割、破滅裂痕、探險、超越、命運），結合掉落數量與怪群加成模型計算預期淨利與 ROI ([#123](https://github.com/saijo0404/POE-tool/issues/123), [#126](https://github.com/saijo0404/POE-tool/pull/126))。
  - 計算達成損益平衡所需的「最低掉落閾值」，並提供預測卡片組件 (`DeviceBreakEvenCard.tsx`) 整合至刷圖收益記錄器，支援一鍵套用工藝成本至單場門票。
- **地圖洗詞期望成本精算與安全詞綴模擬器 (Map Rolling Simulator & Currency Cost Estimator)**：
  - 純領域洗圖機率模型核心 (`mapRollingSimulator.ts`)，支援重鑄點金（Scour + Alch）、混沌直骰（Chaos Spam）與點金瓦寶（Vaal Corrupt）三種策略 ([#124](https://github.com/saijo0404/POE-tool/issues/124), [#127](https://github.com/saijo0404/POE-tool/pull/127))。
  - 幾何分佈與 95% 信心區間精算，結合避開危險詞綴數量、目標掉落數量與怪群規模門檻，計算單場與批次（如 50 張圖）期望骰數與通貨花費。
  - 模擬精算卡片 (`MapRollingSimulatorCard.tsx`) 整合至地圖詞綴警示中心，提供各方案性價比評估與最佳推薦標籤。

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

[Unreleased]: https://github.com/saijo0404/POE-tool/compare/v3.2.0...HEAD
[3.2.0]: https://github.com/saijo0404/POE-tool/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/saijo0404/POE-tool/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/saijo0404/POE-tool/compare/v2.12.0...v3.0.0
[2.12.0]: https://github.com/saijo0404/POE-tool/compare/v2.11.0...v2.12.0
[2.11.0]: https://github.com/saijo0404/POE-tool/compare/v2.10.0...v2.11.0
[2.10.0]: https://github.com/saijo0404/POE-tool/compare/v2.9.0...v2.10.0
[2.9.0]: https://github.com/saijo0404/POE-tool/compare/v2.8.0...v2.9.0
[2.8.0]: https://github.com/saijo0404/POE-tool/compare/v2.7.0...v2.8.0
[2.7.0]: https://github.com/saijo0404/POE-tool/compare/v2.6.0...v2.7.0
[2.6.0]: https://github.com/saijo0404/POE-tool/compare/v2.5.0...v2.6.0
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
