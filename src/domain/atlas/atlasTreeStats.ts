import type { AtlasNode, AtlasTreeStatsSummary, AggregatedStatItem } from './types';

// Clean PoE BBCode tags like [ContainsAbyss|Abysses] -> Abysses
export function cleanPoEBBCode(text: string): string {
  return text.replace(/\[(?:[^|\]]+\|)?([^\]]+)\]/g, '$1').replace(/\s+/g, ' ').trim();
}

// 1. High-precision full template rules
const STAT_TRANSLATION_MAP: Array<{ pattern: RegExp; replace: (...args: any[]) => string }> = [
  // Scarabs
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Scarabs found in your Maps$/i,
    replace: (_, val) => `在地圖中找到的聖甲蟲增加 ${val}`
  },
  {
    pattern: /^Scarabs dropped in your Maps have (\+?\d+(?:\.\d+)?%?)\s*increased chance to be (.*)$/i,
    replace: (_, val, type) => `地圖中掉落的聖甲蟲有 ${val} 增加機率為 ${translatePhrase(type)}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased chance for Scarabs found in your Maps to be (.*)$/i,
    replace: (_, val, type) => `地圖中找到的聖甲蟲為 ${translatePhrase(type)} 的機率增加 ${val}`
  },
  // Map Modifiers & Quant / Rarity / Pack Size
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased effect of Modifiers on your Non-Unique Maps$/i,
    replace: (_, val) => `非傳奇地圖詞綴效果增加 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased effect of Modifiers on your Maps$/i,
    replace: (_, val) => `地圖詞綴效果增加 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Explicit Modifier magnitudes on your Maps$/i,
    replace: (_, val) => `地圖顯性前綴與後綴詞綴效果增加 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Quantity of Items found in your Maps$/i,
    replace: (_, val) => `地圖掉落物品數量增加 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Rarity of Items found in your Maps$/i,
    replace: (_, val) => `地圖掉落物品稀有度增加 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Monster Pack Size in your Maps$/i,
    replace: (_, val) => `地圖怪物群規模增加 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Quantity of Lifeforce dropped by Harvest Monsters in your Maps$/i,
    replace: (_, val) => `地圖中莊園怪物掉落的命能數量增加 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Quantity of Lifeforce dropped by Harvest Monsters$/i,
    replace: (_, val) => `莊園怪物掉落的命能數量增加 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*increased Quantity of Wombgifts found in your Maps$/i,
    replace: (_, val) => `地圖中找到的胎囊贈禮數量增加 ${val}`
  },
  // Map Drops & Bosses
  {
    pattern: /^Maps found in your Maps have (\+?\d+(?:\.\d+)?%?)\s*chance to be 1 tier higher$/i,
    replace: (_, val) => `在地圖中找到的地圖有 ${val} 機率階級提升 1 階`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for a Tier 1-15 Map to drop as a Tier higher$/i,
    replace: (_, val) => `掉落的 T1-15 地圖提升 1 個階級機率 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for a connected Map to drop from Unique Boss$/i,
    replace: (_, val) => `傳奇首領掉落相連地圖機率 ${val}`
  },
  {
    pattern: /^Map Bosses have (\+?\d+(?:\.\d+)?%?)\s*chance to drop an additional connected Map$/i,
    replace: (_, val) => `地圖首領有 ${val} 機率掉落額外相連地圖`
  },
  {
    pattern: /^Final Map Boss in each Map has (\+?\d+(?:\.\d+)?%?)\s*chance to drop an additional (.*)$/i,
    replace: (_, val, item) => `地圖最終首領有 ${val} 機率額外掉落 ${translatePhrase(item)}`
  },
  {
    pattern: /^Final Map Boss in each Map has (\+?\d+(?:\.\d+)?%?)\s*chance to (.*)$/i,
    replace: (_, val, act) => `地圖最終首領有 ${val} 機率 ${translatePhrase(act)}`
  },
  {
    pattern: /^Map Bosses have (\+?\d+(?:\.\d+)?%?)\s*chance to (.*)$/i,
    replace: (_, val, act) => `地圖首領有 ${val} 機率 ${translatePhrase(act)}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for a Synthesis Map to drop from Final Map Boss$/i,
    replace: (_, val) => `最終首領掉落憶境地圖機率 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for a Shaper Guardian Map to drop from Final Map Boss$/i,
    replace: (_, val) => `最終首領掉落塑界守護者地圖機率 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for an Elder Guardian Map to drop from Final Map Boss$/i,
    replace: (_, val) => `最終首領掉落尊師守護者地圖機率 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for a Conqueror Map to drop from Final Map Boss$/i,
    replace: (_, val) => `最終首領掉落征服者地圖機率 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance on Completing a Map to gain a free Kirac Mission$/i,
    replace: (_, val) => `完成地圖時獲得基拉克任務機率 ${val}`
  },
  // Mechanics Contain Chance
  {
    pattern: /^Your Maps have (\+?\d+(?:\.\d+)?%?)\s*chance to contain an? (.*) Encounter$/i,
    replace: (_, val, type) => `你的地圖有 ${val} 機率包含 ${translatePhrase(type)} 遭遇`
  },
  {
    pattern: /^Your Maps have (\+?\d+(?:\.\d+)?%?)\s*chance to contain an? (.*)$/i,
    replace: (_, val, type) => `你的地圖有 ${val} 機率包含 ${translatePhrase(type)}`
  },
  {
    pattern: /^Your Maps have (\+?\d+(?:\.\d+)?%?)\s*increased chance to contain an? (.*)$/i,
    replace: (_, val, type) => `你的地圖包含 ${translatePhrase(type)} 的機率增加 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance for Maps to contain an Essence$/i,
    replace: (_, val) => `區域含有精髓機率 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for an additional Strongbox$/i,
    replace: (_, val) => `區域含有額外保險箱機率 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for an additional Legion Encounter$/i,
    replace: (_, val) => `區域含有軍團遭遇機率 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for an additional Breach$/i,
    replace: (_, val) => `區域含有裂痕遭遇機率 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for an additional Harvest Encounter$/i,
    replace: (_, val) => `區域含有莊園收割遭遇機率 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for an additional Expedition Encounter$/i,
    replace: (_, val) => `區域含有探險遭遇機率 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for a Mirror of Delirium$/i,
    replace: (_, val) => `區域含有譫妄之鏡機率 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance in Areas for a Ritual Altar$/i,
    replace: (_, val) => `區域含有祭祀神壇機率 ${val}`
  },
  {
    pattern: /^(\+?\d+(?:\.\d+)?%?)\s*chance in Areas to contain Sacred Grove$/i,
    replace: (_, val) => `區域含有聖林莊園機率 ${val}`
  },
  // Specific Monsters / Boxes
  {
    pattern: /^Imprisoned Monsters in your Maps have (\+?\d+(?:\.\d+)?%?)\s*chance to (.*)$/i,
    replace: (_, val, act) => `地圖中被禁錮的怪物有 ${val} 機率 ${translatePhrase(act)}`
  },
  {
    pattern: /^Strongboxes in your Maps have (\+?\d+(?:\.\d+)?%?)\s*chance to (.*)$/i,
    replace: (_, val, act) => `地圖中的保險箱有 ${val} 機率 ${translatePhrase(act)}`
  },
  {
    pattern: /^Harvest Monsters in your Maps have (\+?\d+(?:\.\d+)?%?)\s*chance to (.*)$/i,
    replace: (_, val, act) => `地圖中的莊園怪物有 ${val} 機率 ${translatePhrase(act)}`
  },
  {
    pattern: /^Ritual Altars in your Maps have (\+?\d+(?:\.\d+)?%?)\s*(.*)$/i,
    replace: (_, val, act) => `地圖中的祭祀神壇有 ${val} ${translatePhrase(act)}`
  },
  {
    pattern: /^Blight Chests in your Maps have (\+?\d+(?:\.\d+)?%?)\s*chance to (.*)$/i,
    replace: (_, val, act) => `地圖中的枯萎寶箱有 ${val} 機率 ${translatePhrase(act)}`
  },
  {
    pattern: /^Breaches in your Maps have (\+?\d+(?:\.\d+)?%?)\s*(.*)$/i,
    replace: (_, val, act) => `地圖中的裂痕有 ${val} ${translatePhrase(act)}`
  },
  {
    pattern: /^Beyond Portals in your Maps have (\+?\d+(?:\.\d+)?%?)\s*(.*)$/i,
    replace: (_, val, act) => `地圖中的超越傳送門有 ${val} ${translatePhrase(act)}`
  },
  {
    pattern: /^Delirious Monsters in your Maps have (\+?\d+(?:\.\d+)?%?)\s*(.*)$/i,
    replace: (_, val, act) => `地圖中的譫妄怪物有 ${val} ${translatePhrase(act)}`
  },
  {
    pattern: /^Ultimatum Encounters in your Maps have (\+?\d+(?:\.\d+)?%?)\s*(.*)$/i,
    replace: (_, val, act) => `地圖中的最後通牒遭遇有 ${val} ${translatePhrase(act)}`
  }
];

// Dictionary of terms & keywords for fallback phrase replacement
const POE_TERMS: Array<[RegExp, string]> = [
  // Mechanics & Entities
  [/Essence Modifier/gi, '精髓詞綴'],
  [/Essence Encounters?/gi, '精髓遭遇'],
  [/Essences?/gi, '精髓'],
  [/Harvest Monsters?/gi, '莊園怪物'],
  [/Harvest Encounters?/gi, '莊園遭遇'],
  [/Harvest Crops?/gi, '莊園農作'],
  [/Sacred Grove/gi, '聖林莊園'],
  [/Lifeforce/gi, '命能'],
  [/Wild Lifeforce/gi, '荒野命能(紫色)'],
  [/Vivid Lifeforce/gi, '生動命能(黃色)'],
  [/Primal Lifeforce/gi, '原初命能(藍色)'],
  [/Expedition Encounters?/gi, '探險遭遇'],
  [/Expedition Monsters?/gi, '探險怪物'],
  [/Expedition Logbooks?/gi, '探險日誌'],
  [/Runic Monsters?/gi, '符文怪物'],
  [/Remnants?/gi, '遺跡'],
  [/Detonation Chains?/gi, '引爆鏈'],
  [/Expedition/gi, '探險'],
  [/Legion Encounters?/gi, '軍團遭遇'],
  [/Legion Monsters?/gi, '軍團怪物'],
  [/Legion Monoliths?/gi, '軍團方尖碑'],
  [/Legion Splinters?/gi, '軍團碎片'],
  [/Timeless Splinters?/gi, '永恆碎片'],
  [/Timeless Emblems?/gi, '永恆徽章'],
  [/Legion/gi, '軍團'],
  [/Ritual Altars?/gi, '祭祀神壇'],
  [/Ritual Encounters?/gi, '祭祀遭遇'],
  [/Ritual Splinters?/gi, '祭祀碎片'],
  [/Ritual/gi, '祭祀'],
  [/Breachstones?/gi, '裂痕石'],
  [/Breach Splinters?/gi, '裂痕碎片'],
  [/Breach Hands?/gi, '裂痕之手'],
  [/Breaches?/gi, '裂痕'],
  [/Breach/gi, '裂痕'],
  [/Delirium Mirrors?/gi, '譫妄之鏡'],
  [/Mirror of Delirium/gi, '譫妄之鏡'],
  [/Delirious Monsters?/gi, '譫妄怪物'],
  [/Delirium Fog/gi, '譫妄迷霧'],
  [/Delirium Orbs?/gi, '譫妄玉'],
  [/Simulacrum Splinters?/gi, '幻像異界碎片'],
  [/Delirium/gi, '譫妄'],
  [/Blight Encounters?/gi, '枯萎遭遇'],
  [/Blight Chests?/gi, '枯萎寶箱'],
  [/Blighted Maps?/gi, '枯萎地圖'],
  [/Blight-ravaged Maps?/gi, '滅絕枯萎地圖'],
  [/Blight Bosses?/gi, '枯萎首領'],
  [/Blight Oils?/gi, '枯萎聖油'],
  [/Blight/gi, '枯萎'],
  [/Ultimatum Encounters?/gi, '最後通牒遭遇'],
  [/Ultimatum Stone Circles?/gi, '最後通牒石圈'],
  [/Inscribed Ultimatums?/gi, '銘刻最後通牒'],
  [/Ultimatum/gi, '最後通牒'],
  [/Beyond Encounters?/gi, '超越遭遇'],
  [/Beyond Portals?/gi, '超越傳送門'],
  [/Beyond Demons?/gi, '超越惡魔'],
  [/Beyond Bosses?/gi, '超越首領'],
  [/Beyond/gi, '超越'],
  [/Tainted Currency/gi, '污損通貨'],
  [/Abysses?/gi, '深淵'],
  [/Abyssal Troves?/gi, '深淵寶箱'],
  [/Abyssal Depths/gi, '深淵地下城'],
  [/Abyssal Spires?/gi, '深淵尖塔'],
  [/Abyss Jewels?/gi, '深淵珠寶'],
  [/Abyss/gi, '深淵'],
  [/Tormented Spirits?/gi, '罪魂'],
  [/Possessed Monsters?/gi, '附身怪物'],
  [/Touched Monsters?/gi, '觸摸怪物'],
  [/Einhar/gi, '伊恩哈爾(獵魔)'],
  [/Niko/gi, '尼可(掘獄)'],
  [/Alva/gi, '艾瓦(穿越)'],
  [/Jun/gi, '瓊(密教)'],
  [/Kirac/gi, '基拉克'],
  [/Voltaxic Sulphite/gi, '赤藍亞硫酸'],
  [/Sulphite/gi, '亞硫酸'],
  [/Incursion/gi, '穿越時空'],
  [/Betrayal/gi, '背叛密教'],
  [/Bestiary/gi, '獵魔'],
  [/Red Beasts?/gi, '紅獸'],
  [/Yellow Beasts?/gi, '黃獸'],
  [/Strongboxes?/gi, '保險箱'],
  [/Diviner's Strongbox/gi, '命運卡保險箱'],
  [/Arcanist's Strongbox/gi, '奧術師保險箱'],
  [/Cartographer's Strongbox/gi, '製圖師保險箱'],
  [/Operative's Strongbox/gi, '密探保險箱'],
  [/Scarabs?/gi, '聖甲蟲'],
  [/Synthesis Maps?/gi, '憶境地圖'],
  [/Conqueror Maps?/gi, '征服者地圖'],
  [/Elder Guardian Maps?/gi, '尊師守護者地圖'],
  [/Shaper Guardian Maps?/gi, '塑界守護者地圖'],
  [/Tier 16 Maps?/gi, 'T16 地圖'],
  [/Tier 1-15 Maps?/gi, 'T1-15 地圖'],
  [/connected Maps?/gi, '相連地圖'],
  [/Non-Unique Maps?/gi, '非傳奇地圖'],
  [/Unique Maps?/gi, '傳奇地圖'],
  [/Vaal Side Areas?/gi, '瓦爾密室'],
  [/Ore Deposits?/gi, '礦石礦脈'],
  [/Wombgifts?/gi, '胎囊贈禮'],
  [/Provisioning/gi, '補給物資'],
  [/Rare Items?/gi, '稀有物品'],
  [/Unique Items?/gi, '傳奇物品'],
  [/Currency Items?/gi, '通貨物品'],
  [/Divination Cards?/gi, '命運卡'],
  [/Gems?/gi, '寶石'],
  // Modifiers & Math
  [/increased chance to be/gi, '增加機率為'],
  [/increased chance to contain/gi, '增加機率包含'],
  [/increased chance to drop/gi, '增加機率掉落'],
  [/increased chance to/gi, '增加機率'],
  [/increased chance for/gi, '機率增加'],
  [/increased chance/gi, '增加機率'],
  [/reduced chance/gi, '減少機率'],
  [/more chance/gi, '更多機率'],
  [/less chance/gi, '更少機率'],
  [/chance to contain/gi, '機率包含'],
  [/chance to drop/gi, '機率掉落'],
  [/chance to be/gi, '機率為'],
  [/chance for/gi, '機率使'],
  [/chance on/gi, '機率於'],
  [/chance/gi, '機率'],
  [/increased/gi, '增加'],
  [/reduced/gi, '減少'],
  [/more/gi, '更多'],
  [/less/gi, '更少'],
  [/additional/gi, '額外'],
  [/Duplicated/gi, '被複製'],
  [/Duplicate/gi, '複製'],
  [/Experience/gi, '經驗值'],
  [/Stack Size/gi, '堆疊數量'],
  [/Lucky/gi, '為幸運'],
  [/Reward Progress/gi, '獎勵進度'],
  [/rare varieties/gi, '更稀有種類'],
  [/Cooldown Recovery Rate/gi, '冷卻時間恢復率'],
  [/Damage to Unique Monsters/gi, '對傳奇怪物的傷害'],
  [/Monster Pack Size/gi, '怪物群規模'],
  [/Merging Radius/gi, '融合範圍'],
  [/radius/gi, '範圍'],
  [/travel (\d+%) faster/gi, '引爆速度加快 $1'],
  [/travel faster/gi, '引爆速度加快'],
  [/be guarded by/gi, '由其守衛'],
  [/Magic Packs?/gi, '魔法怪物群'],
  [/Shrines?/gi, '神殿'],
  [/Final Map Boss in each Map/gi, '地圖最終首領'],
  [/Final Map Boss/gi, '地圖最終首領'],
  [/Map Bosses?/gi, '地圖首領'],
  [/Unique Monsters?/gi, '傳奇怪物'],
  [/Rare Monsters?/gi, '稀有怪物'],
  [/Magic Monsters?/gi, '魔法怪物'],
  [/Normal Monsters?/gi, '普通怪物'],
  [/Monsters Killed/gi, '擊殺怪物'],
  [/Monsters?/gi, '怪物'],
  [/in your Maps/gi, '在你的地圖中'],
  [/found in your Maps/gi, '在你的地圖中找到的'],
  [/dropped in your Maps/gi, '在你的地圖中掉落的'],
  [/Your Maps/gi, '你的地圖'],
  [/Maps/gi, '地圖'],
  [/on Completion/gi, '地圖完成時'],
  [/on Completing a Map/gi, '完成地圖時'],
  [/White Tier Maps?/gi, '白階地圖'],
  [/Yellow Tier Maps?/gi, '黃階地圖'],
  [/Red Tier Maps?/gi, '紅階地圖'],
  [/Tier (\d+)\+/gi, 'T$1+ 階級'],
  [/Tier (\d+)/gi, 'T$1 階級']
];

export function translatePhrase(str: string): string {
  let res = cleanPoEBBCode(str);
  for (const [pattern, replacement] of POE_TERMS) {
    res = res.replace(pattern, replacement);
  }
  return res;
}

export function translateStatToZh(statEn: string): string {
  const cleaned = cleanPoEBBCode(statEn);
  for (const item of STAT_TRANSLATION_MAP) {
    if (item.pattern.test(cleaned)) {
      return cleaned.replace(item.pattern, item.replace);
    }
  }
  // Fallback to phrase-by-phrase dictionary replacement
  return translatePhrase(cleaned);
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
