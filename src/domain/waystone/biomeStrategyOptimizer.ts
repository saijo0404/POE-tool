import type {
  PoE2BiomeType,
  PoE2FarmingGoal,
  BiomeOptimizationRecommendation,
  BiomeDefinition
} from './towerBiomeTypes';
import { POE2_BIOMES } from './precursorTowerCatalog';

const GOAL_TABLET_MAP: Record<PoE2FarmingGoal, string[]> = {
  gold: ['gold_bounty', 'monster_pack', 'ritual_tablet'],
  currency: ['boss_empower', 'delirium_tablet', 'gold_bounty'],
  waystones: ['waystone_surveyor', 'monster_pack', 'boss_empower'],
  runes: ['runic_essence', 'expedition_tablet', 'monster_pack'],
  mechanics: ['breach_tablet', 'delirium_tablet', 'expedition_tablet'],
  boss: ['boss_empower', 'delirium_tablet', 'waystone_surveyor']
};

const GOAL_AFFIXES_MAP: Record<PoE2FarmingGoal, string[]> = {
  gold: ['掉落物品數量 +50% 以上', '怪物群落大小 +20% 以上', '魔法怪物群增加'],
  currency: ['掉落物品數量 +60% 以上', '稀有怪物群落增加', '地圖首領掉落加成'],
  waystones: ['銘刻地圖掉落機率 (Waystone Drop Chance) +40% 以上', '掉落地圖階級提升機率', '怪物群落大小增加'],
  runes: ['物品稀有度 +60% 以上', '魔法怪物群大小增加', '卡爾葛先祖符文怪物'],
  mechanics: ['遭遇密度提升', '裂痕／譫妄霧氣濃度提升', '怪物群落大小 +25% 以上'],
  boss: ['地圖首領生命與傷害增加 (高風險高收益)', '地圖首領掉落雙倍', '掉落物品數量 +55%']
};

function calculateSynergyScore(biome: BiomeDefinition, goal: PoE2FarmingGoal, towers: number): number {
  let score = 40;
  if (biome.bestGoals.includes(goal)) {
    score += 30;
  }
  score += Math.min(30, towers * 10);
  return Math.min(100, Math.max(20, score));
}

function buildAdvice(biome: BiomeDefinition, goal: PoE2FarmingGoal, score: number): string {
  const isMatch = biome.bestGoals.includes(goal);
  if (isMatch && score >= 80) {
    return `🔥 極致契合！${biome.nameZh} 原生特性完美放大「${goal.toUpperCase()}」收益，搭配交疊先祖塔台可達到最高回報倍率。`;
  }
  if (isMatch) {
    return `✨ 契合良好。${biome.nameZh} 具備顯著收益優勢，建議至少啟用 2 座以上先祖石塔以解鎖連線共振。`;
  }
  return `💡 次選策略。${biome.nameZh} 主要優勢不在「${goal.toUpperCase()}」，可透過專屬碑牌插槽強行拉高產能，或考慮遷移至更契合之生態群落。`;
}

function calculateYieldRatings(biome: BiomeDefinition, goal: PoE2FarmingGoal) {
  const m = biome.nativeMultiplier;
  const goldRating = Math.min(5, Math.max(1, Math.round(m.gold * (goal === 'gold' ? 3.5 : 2.5))));
  const currencyRating = Math.min(5, Math.max(1, Math.round(m.currency * (goal === 'currency' ? 3.5 : 2.5))));
  const progressionRating = Math.min(5, Math.max(1, Math.round(m.waystones * (goal === 'waystones' ? 3.5 : 2.5))));
  return { goldRating, currencyRating, progressionRating };
}

export function optimizeBiomeStrategy(
  biomeType: PoE2BiomeType,
  goal: PoE2FarmingGoal,
  activeTowerCount: number = 2
): BiomeOptimizationRecommendation {
  const biome = POE2_BIOMES[biomeType];
  const expectedSynergyScore = calculateSynergyScore(biome, goal, activeTowerCount);
  const recommendedTabletIds = GOAL_TABLET_MAP[goal] || ['gold_bounty', 'monster_pack'];
  const recommendedWaystoneAffixesZh = GOAL_AFFIXES_MAP[goal] || ['掉落物品數量 +50% 以上'];
  const strategicAdviceZh = buildAdvice(biome, goal, expectedSynergyScore);
  const estimatedYieldSummary = calculateYieldRatings(biome, goal);

  return {
    biome,
    goal,
    recommendedTabletIds,
    recommendedWaystoneAffixesZh,
    expectedSynergyScore,
    strategicAdviceZh,
    estimatedYieldSummary
  };
}
