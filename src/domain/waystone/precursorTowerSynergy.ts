import type { TowerSlotConfig, TowerSynergyResult } from './towerBiomeTypes';
import { getTabletById } from './precursorTowerCatalog';

export function calculateTowerResonanceMultiplier(activeTowerCount: number): number {
  if (activeTowerCount >= 3) return 1.35;
  if (activeTowerCount === 2) return 1.15;
  return 1.0;
}

export function createDefaultTowerSlots(): TowerSlotConfig[] {
  return [
    { id: 'tower_alpha', name: '先祖石塔 · 北部哨塔 (Tower North)', active: true, socketedTabletIds: ['gold_bounty'] },
    { id: 'tower_beta', name: '先祖石塔 · 東側方尖柱 (Tower East)', active: true, socketedTabletIds: ['monster_pack'] },
    { id: 'tower_gamma', name: '先祖石塔 · 西南古祭壇 (Tower Southwest)', active: false, socketedTabletIds: [] }
  ];
}

interface RawBonusAcc {
  packSize: number;
  quantity: number;
  rarity: number;
  goldExtra: number;
  waystoneChance: number;
  runeChance: number;
  bossLootExtra: number;
  mechanics: Map<string, number>;
}

function accumulateBonuses(tabletIds: string[]): RawBonusAcc {
  const acc: RawBonusAcc = {
    packSize: 0,
    quantity: 0,
    rarity: 0,
    goldExtra: 0,
    waystoneChance: 0,
    runeChance: 0,
    bossLootExtra: 0,
    mechanics: new Map()
  };

  for (const tid of tabletIds) {
    const tablet = getTabletById(tid);
    if (!tablet) continue;
    const b = tablet.bonuses;
    acc.packSize += b.packSize || 0;
    acc.quantity += b.quantity || 0;
    acc.rarity += b.rarity || 0;
    if (b.goldMultiplier && b.goldMultiplier > 1) acc.goldExtra += b.goldMultiplier - 1;
    acc.waystoneChance += b.waystoneChance || 0;
    acc.runeChance += b.runeChance || 0;
    if (b.bossLootMultiplier && b.bossLootMultiplier > 1) acc.bossLootExtra += b.bossLootMultiplier - 1;
    if (b.mechanicType && b.mechanicChance) {
      const current = acc.mechanics.get(b.mechanicType) || 0;
      acc.mechanics.set(b.mechanicType, current + b.mechanicChance);
    }
  }
  return acc;
}

export function calculateTowerSynergy(towers: TowerSlotConfig[]): TowerSynergyResult {
  const activeTowers = towers.filter(t => t.active);
  const activeTowerCount = activeTowers.length;
  const resonanceMultiplier = calculateTowerResonanceMultiplier(activeTowerCount);

  const allTabletIds = activeTowers.flatMap(t => t.socketedTabletIds);
  const raw = accumulateBonuses(allTabletIds);

  const totalPackSizeBonus = Math.round(raw.packSize * resonanceMultiplier + 0.0001);
  const totalQuantityBonus = Math.round(raw.quantity * resonanceMultiplier + 0.0001);
  const totalRarityBonus = Math.round(raw.rarity * resonanceMultiplier + 0.0001);
  const totalGoldMultiplier = Number((1 + raw.goldExtra * resonanceMultiplier).toFixed(2));
  const totalWaystoneChanceBonus = Math.round(raw.waystoneChance * resonanceMultiplier + 0.0001);
  const totalRuneChanceBonus = Math.round(raw.runeChance * resonanceMultiplier + 0.0001);
  const totalBossLootMultiplier = Number((1 + raw.bossLootExtra * resonanceMultiplier).toFixed(2));

  const activeMechanics = Array.from(raw.mechanics.entries()).map(([mechanicType, totalChance]) => ({
    mechanicType,
    totalChance: Math.min(100, Math.round(totalChance * resonanceMultiplier + 0.0001))
  }));

  return {
    activeTowerCount,
    resonanceMultiplier,
    totalPackSizeBonus,
    totalQuantityBonus,
    totalRarityBonus,
    totalGoldMultiplier,
    totalWaystoneChanceBonus,
    totalRuneChanceBonus,
    totalBossLootMultiplier,
    activeMechanics
  };
}
