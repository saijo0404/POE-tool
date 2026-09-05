import type {
  WildwoodConfig,
  WildwoodEvaluationResult,
  WildwoodMajorNode,
  CharmAffixDef,
  WildwoodTier
} from './types';
import { WILDWOOD_NODES, CHARM_AFFIXES } from './wildwoodData';

export function getMajorNodeById(id: string): WildwoodMajorNode | undefined {
  return WILDWOOD_NODES.find(n => n.id === id);
}

export function getCharmAffixById(id: string): CharmAffixDef | undefined {
  return CHARM_AFFIXES.find(a => a.id === id);
}

function aggregateCharmStats(charms: WildwoodConfig['charms']): Record<string, number> {
  const stats: Record<string, number> = {};
  for (const charm of charms) {
    if (charm.affix1Id && charm.affix1Roll != null) {
      const def = getCharmAffixById(charm.affix1Id);
      if (def) stats[def.statKey] = (stats[def.statKey] || 0) + charm.affix1Roll;
    }
    if (charm.affix2Id && charm.affix2Roll != null) {
      const def = getCharmAffixById(charm.affix2Id);
      if (def) stats[def.statKey] = (stats[def.statKey] || 0) + charm.affix2Roll;
    }
  }
  return stats;
}

function computeScoreAndTier(
  allocatedNodes: number,
  charmSlotsUsed: number,
  isPrimalist: boolean
): { score: number; tier: WildwoodTier } {
  let score = allocatedNodes * 20;
  if (isPrimalist) {
    score += charmSlotsUsed * 15;
  }
  score = Math.min(100, Math.max(0, score));
  let tier: WildwoodTier = 'C';
  if (score >= 85) tier = 'S';
  else if (score >= 65) tier = 'A';
  else if (score >= 40) tier = 'B';
  return { score, tier };
}

function buildRecommendations(config: WildwoodConfig): string[] {
  const recs: string[] = [];
  if (config.ascendancy !== 'primalist' && config.charms.length > 0) {
    recs.push('注意：只有「荒野追獵者 (Wildwood Primalist)」具備符咒插槽，當前選擇的昇華無法生效符咒屬性。');
  }
  if (config.ascendancy === 'primalist' && config.charms.length < 3) {
    recs.push('建議填滿 3 個符咒插槽，並優先挑選雙詞綴（例如生命 + 法壓/抗性）以最大化機體增益。');
  }
  if (config.allocatedNodeIds.length === 0) {
    recs.push('請至少配置 1 個主要昇華節點以啟用荒野專屬機制。');
  }
  return recs;
}

export function evaluateWildwoodBuild(config: WildwoodConfig): WildwoodEvaluationResult {
  const flags: string[] = [];
  const baseStats: Record<string, number> = {};

  for (const nodeId of config.allocatedNodeIds) {
    const node = getMajorNodeById(nodeId);
    if (!node) continue;
    if (node.specialFlag) flags.push(node.specialFlag);
    if (node.stats) {
      for (const [k, v] of Object.entries(node.stats)) {
        baseStats[k] = (baseStats[k] || 0) + v;
      }
    }
  }

  const isPrimalist = config.ascendancy === 'primalist';
  const charmStats = isPrimalist ? aggregateCharmStats(config.charms) : {};
  const aggregateStats = { ...baseStats, ...charmStats };

  const { score, tier } = computeScoreAndTier(config.allocatedNodeIds.length, config.charms.length, isPrimalist);
  const recommendations = buildRecommendations(config);

  return {
    ascendancy: config.ascendancy,
    aggregateStats,
    specialFlags: flags,
    fitScore: score,
    fitTier: tier,
    recommendations
  };
}
