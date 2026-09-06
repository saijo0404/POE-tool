import type { StashItemCategory } from '../wealth/types';
import type { GameEngine } from '../engine/types';

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
  mapName?: string;
  mapTier?: number;
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
  engine?: GameEngine;
  goldEarned?: number;
  goldPerHour?: number;
  waystonesFound?: number;
  runesFound?: number;
  bossSlain?: boolean;
  deathCount?: number;
}

export interface MappingSession {
  id: string;
  name: string;
  league: string;
  engine?: GameEngine;
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
  totalGoldEarned?: number;
  avgGoldPerRun?: number;
  activeMappingGoldPerHour?: number;
  sessionTotalGoldPerHour?: number;
  totalBossSlain?: number;
  bossSlainRate?: number;
  totalDeaths?: number;
  totalWaystonesFound?: number;
  totalRunesFound?: number;
}

export type MappingTimerStatus = 'idle' | 'running' | 'paused' | 'completed';

export interface MappingTimerState {
  status: MappingTimerStatus;
  currentRunNumber: number;
  elapsedSeconds: number;
  startTimestamp: number | null;
}

export type Poe2LogEventType =
  | 'AREA_GENERATED'
  | 'AREA_ENTERED'
  | 'BOSS_SLAIN'
  | 'PLAYER_DIED'
  | 'GOLD_RECEIVED'
  | 'ITEM_RECEIVED';

export interface Poe2LogEventBase {
  readonly type: Poe2LogEventType;
  readonly timestamp: number;
  readonly rawText: string;
}

export interface Poe2AreaGeneratedEvent extends Poe2LogEventBase {
  readonly type: 'AREA_GENERATED';
  readonly areaName: string;
  readonly level: number;
  readonly mapTier: number;
  readonly seed?: string;
}

export interface Poe2AreaEnteredEvent extends Poe2LogEventBase {
  readonly type: 'AREA_ENTERED';
  readonly areaName: string;
  readonly isTown: boolean;
  readonly isHideout: boolean;
  readonly isEndgameMap: boolean;
}

export interface Poe2BossSlainEvent extends Poe2LogEventBase {
  readonly type: 'BOSS_SLAIN';
  readonly bossName?: string;
}

export interface Poe2PlayerDiedEvent extends Poe2LogEventBase {
  readonly type: 'PLAYER_DIED';
  readonly playerName?: string;
}

export interface Poe2GoldReceivedEvent extends Poe2LogEventBase {
  readonly type: 'GOLD_RECEIVED';
  readonly amount: number;
}

export interface Poe2ItemReceivedEvent extends Poe2LogEventBase {
  readonly type: 'ITEM_RECEIVED';
  readonly itemName: string;
  readonly category: 'waystone' | 'rune' | 'currency' | 'other';
  readonly tier?: number;
  readonly amount: number;
}

export type Poe2LogEvent =
  | Poe2AreaGeneratedEvent
  | Poe2AreaEnteredEvent
  | Poe2BossSlainEvent
  | Poe2PlayerDiedEvent
  | Poe2GoldReceivedEvent
  | Poe2ItemReceivedEvent;

