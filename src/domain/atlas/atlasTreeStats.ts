import type { AtlasNode, AtlasTreeStatsSummary, AggregatedStatItem } from './types';
import { ATLAS_ORIGIN_ALIASES } from './constants';
import { cleanPoEBBCode, translateStatToZh } from './translations/atlasTranslator';

export { cleanPoEBBCode, translateStatToZh };

interface StatGroupAccumulator {
  prefix: string;
  suffix: string;
  unit: string;
  hasPlus: boolean;
  totalValue: number;
  count: number;
  isNumeric: boolean;
  rawSample: string;
}

/**
 * Accumulates numeric or text stats into a grouping map
 */
function accumulateStat(groupMap: Map<string, StatGroupAccumulator>, statStr: string): void {
  const match = statStr.match(/^(.*?)(\+?)(\d+(?:\.\d+)?)(%?)(.*)$/);

  if (match) {
    const [, prefix, plusStr, numStr, unit, suffix] = match;
    const key = `${prefix}{VAL}${unit}${suffix}`.toLowerCase().trim();
    const numVal = parseFloat(numStr);
    const existing = groupMap.get(key);

    if (existing) {
      existing.totalValue += numVal;
      existing.count += 1;
    } else {
      groupMap.set(key, {
        prefix,
        suffix,
        unit,
        hasPlus: plusStr === '+',
        totalValue: numVal,
        count: 1,
        isNumeric: true,
        rawSample: statStr
      });
    }
  } else {
    const key = statStr.toLowerCase().trim();
    const existing = groupMap.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      groupMap.set(key, {
        prefix: '',
        suffix: '',
        unit: '',
        hasPlus: false,
        totalValue: 0,
        count: 1,
        isNumeric: false,
        rawSample: statStr
      });
    }
  }
}

/**
 * Formats a single aggregated stat item with zh & en localized strings
 */
function formatAggregatedItem(group: StatGroupAccumulator): { item: AggregatedStatItem; zh: string } {
  let formattedEn: string;
  let formattedZh: string;

  if (group.isNumeric) {
    const roundedVal = Math.round(group.totalValue * 100) / 100;
    const valStr = `${group.hasPlus ? '+' : ''}${roundedVal}${group.unit}`;
    formattedEn = `${group.prefix}${valStr}${group.suffix}`.trim();
    formattedZh = translateStatToZh(formattedEn);
  } else {
    formattedEn = group.rawSample;
    formattedZh = translateStatToZh(formattedEn);
  }

  if (group.count > 1) {
    formattedEn += ` (${group.count} nodes)`;
    formattedZh += ` (${group.count} 個節點)`;
  }

  return {
    item: {
      text: formattedZh,
      textEn: formattedEn,
      count: group.count,
      totalValue: group.isNumeric ? group.totalValue : undefined,
      isNumeric: group.isNumeric
    },
    zh: formattedZh
  };
}

/**
 * Calculates aggregated stats, active keystones, points spent, and category counts
 */
export function calculateAtlasTreeStats(
  allocatedIds: Set<string>,
  nodes: AtlasNode[]
): AtlasTreeStatsSummary {
  const activeKeystones: AtlasNode[] = [];
  const categoryCounts: Record<string, number> = {};
  const rawStatsList: string[] = [];
  let pointsSpent = 0;

  nodes.forEach(node => {
    if (!allocatedIds.has(node.id)) return;

    if (node.type !== 'start' && !ATLAS_ORIGIN_ALIASES.includes(node.id)) {
      pointsSpent += 1;
    }
    if (node.type === 'keystone') {
      activeKeystones.push(node);
    }

    categoryCounts[node.category] = (categoryCounts[node.category] || 0) + 1;

    node.stats.forEach(st => {
      const cleaned = st.trim();
      if (cleaned && !cleaned.includes('輿圖探索起點') && !cleaned.includes('Atlas Origin')) {
        rawStatsList.push(cleaned);
      }
    });
  });

  const groupMap = new Map<string, StatGroupAccumulator>();
  rawStatsList.forEach(statStr => accumulateStat(groupMap, statStr));

  const aggregatedStats: AggregatedStatItem[] = [];
  const statsList: string[] = [];

  groupMap.forEach(group => {
    const { item, zh } = formatAggregatedItem(group);
    aggregatedStats.push(item);
    statsList.push(zh);
  });

  return {
    pointsSpent,
    activeKeystones,
    statsList,
    aggregatedStats,
    categoryCounts
  };
}
