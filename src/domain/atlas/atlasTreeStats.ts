import type { AtlasNode, AtlasTreeStatsSummary, AggregatedStatItem } from './types';

// Common pattern translations for English Atlas passives to Traditional Chinese
const STAT_TRANSLATION_MAP: Array<{ pattern: RegExp; replace: (...args: any[]) => string }> = [
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*increased Scarabs found in your Maps/i,
    replace: (_, val) => `在地圖中找到的聖甲蟲增加 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*increased effect of Modifiers on your Non-Unique Maps/i,
    replace: (_, val) => `非傳奇地圖詞綴效果增加 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance for Maps to contain an Essence/i,
    replace: (_, val) => `區域含有精髓機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for an additional Strongbox/i,
    replace: (_, val) => `區域含有額外保險箱機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for an additional Legion Encounter/i,
    replace: (_, val) => `區域含有軍團遭遇機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for an additional Breach/i,
    replace: (_, val) => `區域含有裂痕遭遇機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for an additional Harvest Encounter/i,
    replace: (_, val) => `區域含有莊園收割遭遇機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for an additional Expedition Encounter/i,
    replace: (_, val) => `區域含有探險遭遇機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for a Mirror of Delirium/i,
    replace: (_, val) => `區域含有譫妄之鏡機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for a Ritual Altar/i,
    replace: (_, val) => `區域含有祭祀神壇機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance in Areas to contain Sacred Grove/i,
    replace: (_, val) => `區域含有聖林莊園機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance for a connected Map to drop from Unique Boss/i,
    replace: (_, val) => `傳奇首領掉落相連地圖機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance for a Tier 1-15 Map to drop as a Tier higher/i,
    replace: (_, val) => `掉落的 T1-15 地圖提升 1 個階級機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*increased Quantity of Items found in your Maps/i,
    replace: (_, val) => `地圖掉落物品數量增加 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*increased Rarity of Items found in your Maps/i,
    replace: (_, val) => `地圖掉落物品稀有度增加 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*increased Monster Pack Size in your Maps/i,
    replace: (_, val) => `地圖怪物群規模增加 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance on Completing a Map to gain a free Kirac Mission/i,
    replace: (_, val) => `完成地圖時獲得基拉克任務機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance for a Synthesis Map to drop from Final Map Boss/i,
    replace: (_, val) => `最終首領掉落憶境地圖機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance for a Shaper Guardian Map to drop from Final Map Boss/i,
    replace: (_, val) => `最終首領掉落塑界守護者地圖機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance for an Elder Guardian Map to drop from Final Map Boss/i,
    replace: (_, val) => `最終首領掉落尊師守護者地圖機率 ${val}`
  },
  {
    pattern: /(\+?\d+(?:\.\d+)?%?)\s*chance for a Conqueror Map to drop from Final Map Boss/i,
    replace: (_, val) => `最終首領掉落征服者地圖機率 ${val}`
  }
];

export function translateStatToZh(statEn: string): string {
  const trimmed = statEn.trim();
  for (const item of STAT_TRANSLATION_MAP) {
    if (item.pattern.test(trimmed)) {
      return trimmed.replace(item.pattern, item.replace);
    }
  }
  return trimmed;
}

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
    if (allocatedIds.has(node.id)) {
      // Exclude origin start node from points cost
      if (node.type !== 'start' && node.id !== 'start_origin' && node.id !== '29045') {
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
    }
  });

  // Aggregate stats with numeric summing & deduplication
  const groupMap = new Map<string, StatGroupAccumulator>();

  rawStatsList.forEach(statStr => {
    // Match leading or inline numbers like "+10%", "4%", "8% increased"
    const match = statStr.match(/^(.*?)(\+?)(\d+(?:\.\d+)?)(%?)(.*)$/);

    if (match) {
      const prefix = match[1];
      const hasPlus = match[2] === '+';
      const numVal = parseFloat(match[3]);
      const unit = match[4]; // "%" or ""
      const suffix = match[5];

      // Key for grouping identical stat templates
      const key = `${prefix}{VAL}${unit}${suffix}`.toLowerCase().trim();

      const existing = groupMap.get(key);
      if (existing) {
        existing.totalValue += numVal;
        existing.count += 1;
      } else {
        groupMap.set(key, {
          prefix,
          suffix,
          unit,
          hasPlus,
          totalValue: numVal,
          count: 1,
          isNumeric: true,
          rawSample: statStr
        });
      }
    } else {
      // Non-numeric stat
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
  });

  const aggregatedStats: AggregatedStatItem[] = [];
  const statsList: string[] = [];

  groupMap.forEach(group => {
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

    aggregatedStats.push({
      text: formattedZh,
      textEn: formattedEn,
      count: group.count,
      totalValue: group.isNumeric ? group.totalValue : undefined,
      isNumeric: group.isNumeric
    });

    statsList.push(formattedZh);
  });

  return {
    pointsSpent,
    activeKeystones,
    statsList,
    aggregatedStats,
    categoryCounts
  };
}
