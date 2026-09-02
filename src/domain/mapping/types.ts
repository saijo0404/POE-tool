import type { StashItemCategory } from '../wealth/types';

export interface MapInvestment {
  mapCostChaos: number;
  scarabsCostChaos: number;
  craftCostChaos: number;
  otherCostChaos: number;
  totalCostChaos: number;
  totalCostDivine: number;
}

export interface MapDropItem {
  id: string;
  name: string;
  typeLine: string;
  icon: string;
  category: StashItemCategory;
  deltaCount: number;
  unitPriceChaos: number;
  totalPriceChaos: number;
  unitPriceDivine: number;
  totalPriceDivine: number;
}

export interface MapRun {
  id: string;
  runNumber: number;
  startTime: number;
  endTime: number;
  durationSeconds: number;
  investment: MapInvestment;
  grossRevenueChaos: number;
  grossRevenueDivine: number;
  netProfitChaos: number;
  netProfitDivine: number;
  drops: MapDropItem[];
  tabNames: string[];
}

export interface MappingSession {
  id: string;
  name: string;
  league: string;
  strategyName?: string;
  defaultInvestment: MapInvestment;
  selectedTabNames: string[];
  runs: MapRun[];
  createdAt: number;
  updatedAt: number;
}

export interface MappingSessionStats {
  totalRuns: number;
  totalDurationSeconds: number;
  avgDurationSeconds: number;
  totalCostChaos: number;
  totalCostDivine: number;
  totalRevenueChaos: number;
  totalRevenueDivine: number;
  totalNetProfitChaos: number;
  totalNetProfitDivine: number;
  activeMappingDivPerHour: number;
  activeMappingChaosPerHour: number;
  sessionTotalDivPerHour: number;
  sessionTotalChaosPerHour: number;
  topDrops: MapDropItem[];
}

export type MappingTimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface MappingTimerState {
  status: MappingTimerStatus;
  currentRunNumber: number;
  elapsedSeconds: number;
  startTimestamp: number | null;
}
