import type {
  AtlasTierScarab,
  AtlasTierExtraItem
} from './types';
import { SCARAB_DATABASE, POPULAR_EXTRA_ITEMS } from './scarabDatabase';

export {
  generateShoppingListText,
  generateTradeKeywordsText,
  generatePoeItemFormatListText,
  formatItemAsPoeClipboard,
  resolveItemTradeMeta
} from './atlasShoppingList';

export {
  isCraftItem,
  clampExtraItemCount,
  addOrReplaceExtraItem,
  sanitizeExtraItems
} from './atlasCraftRules';

export { computeAtlasSummary } from './atlasCostSummary';

export function resolveScarabPrice(
  scarab: AtlasTierScarab,
  ninjaRates: Record<string, number> = {}
): number {
  if (scarab.customPriceChaos !== undefined && scarab.customPriceChaos >= 0) {
    return scarab.customPriceChaos;
  }
  if (scarab.nameEn && ninjaRates[scarab.nameEn] !== undefined) {
    return ninjaRates[scarab.nameEn];
  }
  if (scarab.name && ninjaRates[scarab.name] !== undefined) {
    return ninjaRates[scarab.name];
  }
  const dbEntry = SCARAB_DATABASE.find(
    s => s.name === scarab.name || (scarab.nameEn && s.nameEn === scarab.nameEn)
  );
  if (dbEntry) {
    if (dbEntry.nameEn && ninjaRates[dbEntry.nameEn] !== undefined) {
      return ninjaRates[dbEntry.nameEn];
    }
    return dbEntry.basePriceChaos ?? 5;
  }
  return 5;
}

export function resolveExtraItemPrice(
  item: AtlasTierExtraItem,
  ninjaRates: Record<string, number> = {},
  divineRate: number = 150
): number {
  if (item.unitPriceDivine !== undefined && item.unitPriceDivine > 0) {
    return Math.round(item.unitPriceDivine * divineRate * 100) / 100;
  }
  if (item.unitPriceChaos !== undefined && item.unitPriceChaos >= 0) {
    return item.unitPriceChaos;
  }
  if (item.nameEn && ninjaRates[item.nameEn] !== undefined) {
    return ninjaRates[item.nameEn];
  }
  if (item.name && ninjaRates[item.name] !== undefined) {
    return ninjaRates[item.name];
  }
  const preset = POPULAR_EXTRA_ITEMS.find(
    p => p.name === item.name ||
      (item.nameEn && p.nameEn === item.nameEn) ||
      item.name.includes(p.name.split(' (')[0]) ||
      p.name.includes(item.name)
  );
  if (preset) {
    if (preset.nameEn && ninjaRates[preset.nameEn] !== undefined) {
      return ninjaRates[preset.nameEn];
    }
    return preset.defaultPriceChaos;
  }
  return item.unitPriceChaos ?? 0;
}

export {
  ATLAS_STORAGE_KEY,
  DEFAULT_ATLAS_TREE_URL,
  sanitizeAtlasTreeUrl,
  loadStrategiesFromStorage,
  saveStrategiesToStorage
} from './atlasStorage';
