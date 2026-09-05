import type { SanctumRoomType, SanctumRelicAffix } from './types';

export interface RoomBaseMetrics {
  type: SanctumRoomType;
  nameZh: string;
  baseRisk: number; // 0~50
  baseChaos: number;
  baseDivine: number;
}

export const ROOM_BASE_METRICS: Record<SanctumRoomType, RoomBaseMetrics> = {
  combat: { type: 'combat', nameZh: '戰鬥房間 (Combat)', baseRisk: 10, baseChaos: 15, baseDivine: 0.05 },
  merchant: { type: 'merchant', nameZh: '商人房 (Merchant)', baseRisk: 0, baseChaos: 25, baseDivine: 0.1 },
  fountain: { type: 'fountain', nameZh: '神龕泉水 (Fountain)', baseRisk: 2, baseChaos: 5, baseDivine: 0.02 },
  treasure: { type: 'treasure', nameZh: '寶藏房 (Treasure)', baseRisk: 8, baseChaos: 60, baseDivine: 0.3 },
  boss: { type: 'boss', nameZh: '樓層守衛與頭目 (Boss)', baseRisk: 25, baseChaos: 100, baseDivine: 0.8 }
};

export const COMMON_RELIC_AFFIXES: SanctumRelicAffix[] = [
  { id: 'relic_mitigation_high', nameZh: '決心承受減免 +25%', nameEn: '25% reduced Resolve loss', statKey: 'resolveMitigation', value: 25 },
  { id: 'relic_mitigation_mid', nameZh: '決心承受減免 +15%', nameEn: '15% reduced Resolve loss', statKey: 'resolveMitigation', value: 15 },
  { id: 'relic_discount_high', nameZh: '商人商品折扣 30%', nameEn: '30% reduced Merchant prices', statKey: 'merchantDiscount', value: 30 },
  { id: 'relic_divine_drop_2', nameZh: '完成試煉額外掉落 2 神聖石', nameEn: '2 additional Divine Orbs on completing Sanctum', statKey: 'additionalDivineDrop', value: 2 },
  { id: 'relic_divine_drop_1', nameZh: '完成試煉額外掉落 1 神聖石', nameEn: '1 additional Divine Orb on completing Sanctum', statKey: 'additionalDivineDrop', value: 1 },
  { id: 'relic_max_resolve', nameZh: '最大決心上限 +100', nameEn: '+100 to Maximum Resolve', statKey: 'maxResolve', value: 100 },
  { id: 'relic_room_vision', nameZh: '額外顯示 1 個相鄰房間', nameEn: '1 additional Room revealed on Sanctum Map', statKey: 'roomVision', value: 1 }
];
