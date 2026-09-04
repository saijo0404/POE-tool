import type { StashItem, StashItemCategory } from '../wealth/types';

export interface CategoryAllocation {
  category: StashItemCategory;
  label: string;
  totalChaos: number;
  totalDivine: number;
  percentage: number;
  itemCount: number;
  topItems: StashItem[];
  color: string;
}

export interface NetWorthPoint {
  timestamp: string;
  dateLabel: string;
  totalChaos: number;
  totalDivine: number;
  isLeapPoint: boolean;
  leapNote?: string;
}

export interface PortfolioAnalysisResult {
  totalChaos: number;
  totalDivine: number;
  divineRate: number;
  categories: CategoryAllocation[];
  timeline: NetWorthPoint[];
  totalGrowthPercent: number;
  totalGrowthChaos: number;
}

export const CATEGORY_META: Record<StashItemCategory, { label: string; color: string }> = {
  Currency: { label: '通貨 (Currency)', color: '#aa9e82' },
  DivCard: { label: '命運卡 (Divination)', color: '#0e8f7f' },
  Scarab: { label: '聖甲蟲 (Scarab)', color: '#38bdf8' },
  Essence: { label: '精髓 (Essence)', color: '#a855f7' },
  Map: { label: '地圖 (Map)', color: '#ef4444' },
  Equipment: { label: '裝備 (Equipment)', color: '#f59e0b' },
  Fragment: { label: '碎片 (Fragment)', color: '#22c55e' }
};
