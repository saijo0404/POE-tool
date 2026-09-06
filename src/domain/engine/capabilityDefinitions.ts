import type { FeatureId, FeatureCapability } from './capabilityTypes';

export const FEATURE_CAPABILITIES: Record<FeatureId, FeatureCapability> = {
  price: {
    id: 'price',
    name: '裝備即時查價',
    description: '多國語言裝備解析、數值過濾與官方市集即時查價',
    supportedEngines: ['poe1', 'poe2'],
    category: 'trade',
    isTab: true
  },
  exchange: {
    id: 'exchange',
    name: '大宗交易所',
    description: 'Faustus 大宗通貨與物資即時匯率、跨市場套利矩陣',
    supportedEngines: ['poe1', 'poe2'],
    category: 'trade',
    isTab: true
  },
  wealth: {
    id: 'wealth',
    name: '每小時資產估算',
    description: '倉庫分頁自動估值、時薪資產淨值歷史趨勢',
    supportedEngines: ['poe1', 'poe2'],
    category: 'wealth',
    isTab: true
  },
  mapping: {
    id: 'mapping',
    name: '刷圖收益追蹤',
    description: '地圖開圖計時器、單張刷圖掉落與時薪投報率分析',
    supportedEngines: ['poe1', 'poe2'],
    category: 'progression',
    isTab: true
  },
  build: {
    id: 'build',
    name: 'Build 成本計算',
    description: 'PoB / poe.ninja 人物流派裝備匯入與造價精算',
    supportedEngines: ['poe1', 'poe2'],
    category: 'progression',
    isTab: true
  },
  acts: {
    id: 'acts',
    name: '拓荒攻略指南',
    description: '章節主線與支線天賦、昇華試煉與過境提醒',
    supportedEngines: ['poe1', 'poe2'],
    category: 'progression',
    isTab: true
  },
  atlas: {
    id: 'atlas',
    name: '輿圖天賦策略',
    description: 'PoE 1 輿圖天賦樹節點、聖甲蟲連動與賽季收益組合',
    supportedEngines: ['poe1'],
    category: 'endgame',
    isTab: true,
    poe2Alternative: 'PoE 2 改採銘刻地圖 (Waystone) 與塔樓機制定向推進'
  },
  mapmod: {
    id: 'mapmod',
    name: '地圖過濾 / Regex',
    description: '地圖與銘刻地圖詞綴致命危險辨識與過濾 Regex 產生',
    supportedEngines: ['poe1', 'poe2'],
    category: 'endgame',
    isTab: true
  },
  craft: {
    id: 'craft',
    name: '工藝期望精算',
    description: 'PoE 1 詞綴工藝台、化石、精華與莊園重鑄期望值模擬',
    supportedEngines: ['poe1'],
    category: 'crafting',
    isTab: true,
    poe2Alternative: 'PoE 2 移除舊版工藝台，改採純粹通貨重鑄與符文插槽系統'
  },
  dualSpec: {
    id: 'dualSpec',
    name: '雙天賦與武器切換',
    description: '雙武器套組與雙技能天賦點數分離配置',
    supportedEngines: ['poe2'],
    category: 'progression',
    isTab: false
  },
  spiritReservation: {
    id: 'spiritReservation',
    name: '精魂保留池 (Spirit)',
    description: 'PoE 2 專屬獨立光狂與召喚物精魂計量',
    supportedEngines: ['poe2'],
    category: 'progression',
    isTab: false
  },
  runes: {
    id: 'runes',
    name: '符文插槽系統 (Runes)',
    description: 'PoE 2 裝備符文鑲嵌與基底強化',
    supportedEngines: ['poe2'],
    category: 'crafting',
    isTab: false
  },
  waystones: {
    id: 'waystones',
    name: '銘刻地圖 (Waystones)',
    description: 'PoE 2 終局地圖等階推進機制',
    supportedEngines: ['poe2'],
    category: 'endgame',
    isTab: false
  },
  uncutGems: {
    id: 'uncutGems',
    name: '未切割寶石 (Uncut Gems)',
    description: 'PoE 2 寶石自選升級與寶石內置插槽鑲嵌',
    supportedEngines: ['poe2'],
    category: 'progression',
    isTab: false
  },
  scarabs: {
    id: 'scarabs',
    name: '聖甲蟲配置 (Scarabs)',
    description: 'PoE 1 輿圖儀聖甲蟲搭配與收益倍率',
    supportedEngines: ['poe1'],
    category: 'endgame',
    isTab: false,
    poe2Alternative: 'PoE 2 改採地圖碑塔與特定前綴銘刻'
  },
  bestiary: {
    id: 'bestiary',
    name: '魔物園野獸工藝',
    description: 'PoE 1 獵捕野獸與魔物之血封印工藝',
    supportedEngines: ['poe1'],
    category: 'crafting',
    isTab: false,
    poe2Alternative: 'PoE 2 目前尚未包含野獸工藝機制'
  },
  blight: {
    id: 'blight',
    name: '凋落聖油提煉',
    description: 'PoE 1 聖油塗抹飾品與防禦塔配置',
    supportedEngines: ['poe1'],
    category: 'endgame',
    isTab: false,
    poe2Alternative: 'PoE 2 尚無凋落塗油系統'
  },
  timelessJewels: {
    id: 'timelessJewels',
    name: '軍團永恆珠寶',
    description: 'PoE 1 永恆珠寶種子轉換核心天賦',
    supportedEngines: ['poe1'],
    category: 'progression',
    isTab: false,
    poe2Alternative: 'PoE 2 天賦樹架構不同，不支援軍團種子珠寶'
  },
  sanctum: {
    id: 'sanctum',
    name: '禁忌聖所 (Sanctum)',
    description: 'PoE 1 聖所恩惠、詛咒與聖物盤模擬',
    supportedEngines: ['poe1'],
    category: 'endgame',
    isTab: false,
    poe2Alternative: 'PoE 2 尚無禁忌聖所機制'
  },
  tradeWhisper: {
    id: 'tradeWhisper',
    name: '交易密語助理',
    description: '官方市集即時密語推播、交易狀態追蹤與快捷回覆',
    supportedEngines: ['poe1', 'poe2'],
    category: 'trade',
    isTab: false
  },
  overlay: {
    id: 'overlay',
    name: '懸浮查價小卡',
    description: '遊戲內 Ctrl+D 快速懸浮卡片與數值分析',
    supportedEngines: ['poe1', 'poe2'],
    category: 'trade',
    isTab: false
  }
};
