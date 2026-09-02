/**
 * Wealth Breakdown Domain Constants
 */

import type { StashItemCategory } from './types';

export interface CategoryTab {
  key: StashItemCategory | 'ALL';
  label: string;
}

export interface PriceThreshold {
  value: number;
  label: string;
}

export const CATEGORY_TABS: readonly CategoryTab[] = [
  { key: 'ALL', label: '全部' },
  { key: 'Currency', label: '通貨 Currency' },
  { key: 'Fragment', label: '碎片 Fragment' },
  { key: 'DivCard', label: '命運卡 Cards' },
  { key: 'Essence', label: '精髓 Essence' },
  { key: 'Scarab', label: '甲蟲 Scarab' },
  { key: 'Map', label: '地圖 Maps' },
  { key: 'Equipment', label: '裝備 Equipment' },
];

export const PRICE_THRESHOLDS: readonly PriceThreshold[] = [
  { value: 0, label: '全部 (0c+)' },
  { value: 1, label: '≥ 1 c' },
  { value: 5, label: '≥ 5 c' },
  { value: 10, label: '≥ 10 c' },
  { value: 50, label: '≥ 50 c' },
  { value: 150, label: '≥ 1 Div (150c+)' },
];
