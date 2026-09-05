import type { BlightOil, NotableAnointment } from './types';

export const BLIGHT_OILS: BlightOil[] = [
  { id: 'clear', nameZh: '透明聖油', nameEn: 'Clear Oil', tier: 1, defaultPriceChaos: 0.2, dropWeight: 300, mapEffectZh: '怪物移速降低 20%' },
  { id: 'sepia', nameZh: '棕黃聖油', nameEn: 'Sepia Oil', tier: 2, defaultPriceChaos: 0.5, dropWeight: 250, mapEffectZh: '塔建造費用減少 20%' },
  { id: 'amber', nameZh: '琥珀聖油', nameEn: 'Amber Oil', tier: 3, defaultPriceChaos: 1.0, dropWeight: 200, mapEffectZh: '塔升級費用減少 25%' },
  { id: 'verdant', nameZh: '翠綠聖油', nameEn: 'Verdant Oil', tier: 4, defaultPriceChaos: 1.5, dropWeight: 160, mapEffectZh: '怪群規模提高 15%' },
  { id: 'teal', nameZh: '青藍聖油', nameEn: 'Teal Oil', tier: 5, defaultPriceChaos: 2.0, dropWeight: 120, mapEffectZh: '凋落怪物生成速度加快 40%' },
  { id: 'azure', nameZh: '天藍聖油', nameEn: 'Azure Oil', tier: 6, defaultPriceChaos: 5.0, dropWeight: 90, mapEffectZh: '地圖掉落數量提高 15%' },
  { id: 'indigo', nameZh: '靛青聖油', nameEn: 'Indigo Oil', tier: 7, defaultPriceChaos: 6.0, dropWeight: 70, mapEffectZh: '怪群規模提高 20%' },
  { id: 'violet', nameZh: '紫晶聖油', nameEn: 'Violet Oil', tier: 8, defaultPriceChaos: 10.0, dropWeight: 50, mapEffectZh: '地圖物品稀有度提高 30%' },
  { id: 'crimson', nameZh: '緋紅聖油', nameEn: 'Crimson Oil', tier: 9, defaultPriceChaos: 18.0, dropWeight: 35, mapEffectZh: '凋落寶箱有 10% 機率為幸運寶箱' },
  { id: 'black', nameZh: '幽黑聖油', nameEn: 'Black Oil', tier: 10, defaultPriceChaos: 22.0, dropWeight: 25, mapEffectZh: '有 10% 機率掉落額外精華或甲蟲' },
  { id: 'opal', nameZh: '乳白聖油', nameEn: 'Opal Oil', tier: 11, defaultPriceChaos: 45.0, dropWeight: 15, mapEffectZh: '怪群規模提高 25%，掉落數量提高 20%' },
  { id: 'silver', nameZh: '白銀聖油', nameEn: 'Silver Oil', tier: 12, defaultPriceChaos: 75.0, dropWeight: 8, mapEffectZh: '凋落防禦塔掉落稀有物品' },
  { id: 'golden', nameZh: '金色聖油', nameEn: 'Golden Oil', tier: 13, defaultPriceChaos: 130.0, dropWeight: 4, mapEffectZh: '凋落首領掉落獎勵加倍 15%' },
];

export const NOTABLE_ANOINTMENTS: NotableAnointment[] = [
  {
    id: 'charisma',
    notableNameZh: '魅力天賦 (滅世之召)',
    notableNameEn: 'Charisma',
    requiredOils: ['opal', 'golden', 'golden'],
    effectSummaryZh: '魔力保留效能提高 16%，光環範圍效果提高 10%',
  },
  {
    id: 'sovereignty',
    notableNameZh: '主權',
    notableNameEn: 'Sovereignty',
    requiredOils: ['silver', 'silver', 'silver'],
    effectSummaryZh: '魔力保留效能提高 12%，技能魔力消耗降低 10%',
  },
  {
    id: 'whispers_of_doom',
    notableNameZh: '滅亡低語 (雙詛咒)',
    notableNameEn: 'Whispers of Doom',
    requiredOils: ['sepia', 'black', 'golden'],
    effectSummaryZh: '你可以對敵人施加 1 個額外詛咒',
  },
  {
    id: 'tranquility',
    notableNameZh: '寧靜',
    notableNameEn: 'Tranquility',
    requiredOils: ['azure', 'golden', 'golden'],
    effectSummaryZh: '心靈昇華，最大能量護盾轉換為全域傷害加成',
  },
  {
    id: 'mark_the_prey',
    notableNameZh: '標記獵物',
    notableNameEn: 'Mark the Prey',
    requiredOils: ['sepia', 'amber', 'violet'],
    effectSummaryZh: '被標記的敵人承受傷害提高 10%，暴擊加成提高 30%',
  },
  {
    id: 'soul_raker',
    notableNameZh: '靈魂收割',
    notableNameEn: 'Soul Raker',
    requiredOils: ['amber', 'verdant', 'teal'],
    effectSummaryZh: '爪類攻擊物理傷害吸血與吸魔，攻擊速度提升',
  },
  {
    id: 'doom_cast',
    notableNameZh: '末日施法',
    notableNameEn: 'Doom Cast',
    requiredOils: ['amber', 'violet', 'crimson'],
    effectSummaryZh: '法術暴擊率提高 60%，法術暴擊傷害加成提高 15%',
  },
  {
    id: 'arcane_guarding',
    notableNameZh: '秘術防護',
    notableNameEn: 'Arcane Guarding',
    requiredOils: ['clear', 'teal', 'silver'],
    effectSummaryZh: '持盾時法術傷害提高 40%，全元素抗性 +12%',
  },
];
