export type SanctumFloor = 1 | 2 | 3 | 4;

export type SanctumRoomType = 'combat' | 'merchant' | 'fountain' | 'boss' | 'treasure';

export type SanctumPlaystyle = 'high_yield' | 'balanced' | 'safe_clear';

export interface SanctumRelicAffix {
  id: string;
  nameZh: string;
  nameEn: string;
  statKey: string;
  value: number;
}

export interface SanctumRelic {
  id: string;
  name: string;
  affixes: SanctumRelicAffix[];
}

export interface SanctumStrategyConfig {
  relics: SanctumRelic[];
  preferredPlaystyle: SanctumPlaystyle;
}

export interface RoomEVEstimate {
  roomType: SanctumRoomType;
  floor: SanctumFloor;
  baseRiskScore: number;
  adjustedRiskScore: number;
  expectedChaos: number;
  expectedDivine: number;
}

export interface SanctumForecastResult {
  aggregatedStats: Record<string, number>;
  survivalRatePct: number;
  expectedTotalNetChaos: number;
  expectedTotalNetDivine: number;
  roomEstimates: RoomEVEstimate[];
  recommendedPath: string[];
  strategicNotes: string[];
}
