import type { AssetTrend, PricePoint } from './types';
import { calculatePercentageChange, calculateAbsoluteChange, isHighVolatility } from './trendCalculator';

function generateHistory(basePriceChaos: number, multipliers: number[], divineRate: number): { history: PricePoint[]; sparkline7d: number[] } {
  const history: PricePoint[] = [];
  const now = Date.now();
  const dayMs = 86400000;

  multipliers.forEach((mul, index) => {
    const daysAgo = multipliers.length - 1 - index;
    const timestamp = now - daysAgo * dayMs;
    const d = new Date(timestamp);
    const dateLabel = `${d.getMonth() + 1}/${d.getDate()}`;
    const pChaos = Math.round(basePriceChaos * mul);
    const pDivine = Math.round((pChaos / divineRate) * 10) / 10;
    history.push({ timestamp, priceChaos: pChaos, priceDivine: pDivine, dateLabel });
  });

  const sparkline7d = history.map(h => h.priceChaos);
  return { history, sparkline7d };
}

export function createPresetAsset(
  id: string,
  name: string,
  category: AssetTrend['category'],
  baseChaos: number,
  multipliers: number[],
  divineRate: number,
  icon?: string
): AssetTrend {
  const { history, sparkline7d } = generateHistory(baseChaos, multipliers, divineRate);
  const currentPriceChaos = history[history.length - 1].priceChaos;
  const currentPriceDivine = history[history.length - 1].priceDivine;

  const yesterdayChaos = history.length >= 2 ? history[history.length - 2].priceChaos : currentPriceChaos;
  const weekAgoChaos = history.length >= 7 ? history[0].priceChaos : currentPriceChaos;

  const change24hPercent = calculatePercentageChange(currentPriceChaos, yesterdayChaos);
  const change24hChaos = calculateAbsoluteChange(currentPriceChaos, yesterdayChaos);
  const change7dPercent = calculatePercentageChange(currentPriceChaos, weekAgoChaos);
  const change7dChaos = calculateAbsoluteChange(currentPriceChaos, weekAgoChaos);

  return {
    id,
    name,
    category,
    icon,
    currentPriceChaos,
    currentPriceDivine,
    change24hPercent,
    change24hChaos,
    change7dPercent,
    change7dChaos,
    sparkline7d,
    history,
    isVolatile: isHighVolatility(change24hPercent)
  };
}

export function getDefaultTrackedAssets(divineRate: number = 150): AssetTrend[] {
  return [
    createPresetAsset('mageblood', 'Mageblood (魔血)', 'unique', 24000, [0.88, 0.90, 0.93, 0.95, 0.97, 0.98, 1.0], divineRate, 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQXJtb3Vycy9CZWx0cy9NYWdlYmxvb2QiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/3e096472b5/Mageblood.png'),
    createPresetAsset('headhunter', 'Headhunter (獵首)', 'unique', 4200, [1.15, 1.12, 1.08, 1.05, 1.02, 1.01, 1.0], divineRate, 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQXJtb3Vycy9CZWx0cy9IZWFkaHVudGVyIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/05f242372f/Headhunter.png'),
    createPresetAsset('mirror', 'Mirror of Kalandra (卡蘭德之鏡)', 'currency', 92000, [0.92, 0.94, 0.95, 0.97, 0.98, 0.99, 1.0], divineRate, 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lEdXBsaWNhdGUiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/5e8cb5be24/CurrencyDuplicate.png'),
    createPresetAsset('divine', 'Divine Orb (神聖石)', 'currency', 150, [0.93, 0.95, 0.96, 0.98, 0.97, 0.99, 1.0], divineRate, 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png'),
    createPresetAsset('mirror-shard', 'Mirror Shard (卡蘭德魔鏡碎片)', 'currency', 4500, [0.90, 0.92, 0.94, 0.96, 0.98, 0.99, 1.0], divineRate),
    createPresetAsset('apothecary', 'The Apothecary (藥劑師)', 'divcard', 7500, [0.85, 0.88, 0.91, 0.93, 0.96, 0.98, 1.0], divineRate),
    createPresetAsset('the-doctor', 'The Doctor (瘋醫)', 'divcard', 650, [1.12, 1.08, 1.06, 1.04, 1.02, 1.01, 1.0], divineRate),
    createPresetAsset('hinekora', "Hinekora's Lock (辛門寇拉之髮鎖)", 'currency', 18500, [0.95, 0.96, 0.97, 0.98, 0.99, 1.0, 1.0], divineRate),
    createPresetAsset('essence-envy', 'Deafening Essence of Envy (咆哮之妒忌精髓)', 'essence', 35, [0.75, 0.80, 0.85, 0.90, 0.95, 0.98, 1.0], divineRate),
    createPresetAsset('scarab-divination', 'Divination Scarab of Curation (收購聖甲蟲)', 'scarab', 180, [1.25, 1.18, 1.12, 1.08, 1.05, 1.02, 1.0], divineRate)
  ];
}
