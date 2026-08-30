import type { AtlasTierExtraItem } from './types';

export interface ExtraItemMutationResult {
  items: AtlasTierExtraItem[];
  replacedCraftName?: string;
  isReplaced: boolean;
}

/**
 * Determines whether an extra item is classified as a Map Device Craft.
 */
export function isCraftItem(item: { category: string; name?: string }): boolean {
  if (!item) return false;
  return item.category === 'craft';
}

/**
 * Clamps extra item quantity. Map crafts are strictly locked to 1.
 */
export function clampExtraItemCount(item: AtlasTierExtraItem, requestedCount: number): number {
  if (isCraftItem(item)) {
    return 1;
  }
  return Math.max(1, Math.floor(requestedCount || 1));
}

/**
 * Adds or replaces an extra item adhering to PoE Map Device craft mutual exclusion rules.
 * If adding a craft item when another craft exists, it replaces the existing craft item.
 */
export function addOrReplaceExtraItem(
  existingItems: AtlasTierExtraItem[],
  newItem: AtlasTierExtraItem
): ExtraItemMutationResult {
  const safeItems = Array.isArray(existingItems) ? existingItems : [];
  const normalizedItem: AtlasTierExtraItem = {
    ...newItem,
    count: clampExtraItemCount(newItem, newItem.count)
  };

  if (!isCraftItem(normalizedItem)) {
    return {
      items: [...safeItems, normalizedItem],
      isReplaced: false
    };
  }

  const existingCraftIndex = safeItems.findIndex(i => isCraftItem(i));
  if (existingCraftIndex === -1) {
    return {
      items: [...safeItems, normalizedItem],
      isReplaced: false
    };
  }

  const replacedCraftName = safeItems[existingCraftIndex].name;
  const nextItems = [...safeItems];
  nextItems[existingCraftIndex] = normalizedItem;

  return {
    items: nextItems,
    replacedCraftName,
    isReplaced: true
  };
}

/**
 * Sanitizes an array of extra items to ensure only at most 1 Map Device Craft exists
 * and its count is strictly locked to 1.
 */
export function sanitizeExtraItems(extraItems?: AtlasTierExtraItem[]): AtlasTierExtraItem[] {
  if (!Array.isArray(extraItems) || extraItems.length === 0) {
    return [];
  }

  let seenCraft = false;
  const result: AtlasTierExtraItem[] = [];

  for (const item of extraItems) {
    if (!item) continue;
    if (isCraftItem(item)) {
      if (seenCraft) continue; // Drop duplicate crafts
      seenCraft = true;
      result.push({
        ...item,
        count: 1
      });
    } else {
      result.push({
        ...item,
        count: Math.max(1, item.count || 1)
      });
    }
  }

  return result;
}
