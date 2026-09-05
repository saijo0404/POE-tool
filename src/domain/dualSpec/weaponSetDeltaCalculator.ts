import type {
  WeaponSetConfiguration,
  DualWeaponLoadout,
  DualSpecPassiveNode
} from './types';
import type {
  AggregatedWeaponStats,
  StatDeltaMetric,
  WeaponSetDeltaReport
} from './deltaTypes';

export function calculateAggregatedStats(
  config: WeaponSetConfiguration,
  passives: DualSpecPassiveNode[] = []
): AggregatedWeaponStats {
  const main = config.mainHand;
  const off = config.offHand;

  const isDual = !!(main && off && !main.isTwoHanded && off.category === 'OneHanded');
  const hasShield = off?.weaponType === 'Shield';

  let rawPhys = (main?.physicalDps ?? 0) + (isDual ? (off?.physicalDps ?? 0) : 0);
  let rawElem = (main?.elementalDps ?? 0) + (isDual ? (off?.elementalDps ?? 0) : 0);
  let rawSpeed = main?.attacksPerSecond ?? (off?.attacksPerSecond ?? 1.2);
  let rawCrit = main?.critChance ?? (off?.critChance ?? 5.0);
  const spirit = (main?.spirit ?? 0) + (off?.spirit ?? 0);

  if (isDual) {
    rawSpeed = ((main?.attacksPerSecond ?? 1.2) + (off?.attacksPerSecond ?? 1.2)) / 2 * 1.1;
    rawCrit = ((main?.critChance ?? 5.0) + (off?.critChance ?? 5.0)) / 2;
  }

  // Apply weapon-specific passives modifiers
  let incDmg = 0;
  let incSpeed = 0;
  let incCrit = 0;

  for (const node of passives) {
    if (node.stats) {
      incDmg += node.stats.increased_damage ?? node.stats.damage ?? 0;
      incSpeed += node.stats.increased_attack_speed ?? node.stats.attack_speed ?? 0;
      incCrit += node.stats.increased_critical_strike_chance ?? node.stats.critical_strike_chance ?? 0;
    }
  }

  const speedMod = 1 + incSpeed / 100;
  const dmgMod = 1 + incDmg / 100;
  const critMod = 1 + incCrit / 100;

  const physicalDps = Math.round(rawPhys * dmgMod * speedMod * 10) / 10;
  const elementalDps = Math.round(rawElem * dmgMod * speedMod * 10) / 10;
  const totalDps = Math.round((physicalDps + elementalDps) * 10) / 10;
  const attacksPerSecond = Math.round(rawSpeed * speedMod * 100) / 100;
  const critChance = Math.round(rawCrit * critMod * 10) / 10;

  return {
    physicalDps,
    elementalDps,
    totalDps,
    attacksPerSecond,
    critChance,
    spirit,
    isDualWield: isDual,
    hasShield
  };
}

export function calculateMetric(set1Val: number, set2Val: number): StatDeltaMetric {
  const delta = Math.round((set2Val - set1Val) * 10) / 10;
  let percentChange = 0;
  if (set1Val > 0) {
    percentChange = Math.round(((set2Val - set1Val) / set1Val) * 1000) / 10;
  } else if (set2Val > 0) {
    percentChange = 100;
  }
  return {
    set1Value: set1Val,
    set2Value: set2Val,
    delta,
    percentChange
  };
}

export function calculateWeaponSetDelta(
  loadout: DualWeaponLoadout,
  passivesSet1: DualSpecPassiveNode[] = [],
  passivesSet2: DualSpecPassiveNode[] = []
): WeaponSetDeltaReport {
  const set1Stats = calculateAggregatedStats(loadout.set1, passivesSet1);
  const set2Stats = calculateAggregatedStats(loadout.set2, passivesSet2);

  const deltas = {
    physicalDps: calculateMetric(set1Stats.physicalDps, set2Stats.physicalDps),
    elementalDps: calculateMetric(set1Stats.elementalDps, set2Stats.elementalDps),
    totalDps: calculateMetric(set1Stats.totalDps, set2Stats.totalDps),
    attacksPerSecond: calculateMetric(set1Stats.attacksPerSecond, set2Stats.attacksPerSecond),
    critChance: calculateMetric(set1Stats.critChance, set2Stats.critChance),
    spirit: calculateMetric(set1Stats.spirit, set2Stats.spirit)
  };

  const summary: string[] = [];
  if (deltas.totalDps.delta !== 0) {
    const sign = deltas.totalDps.delta > 0 ? '+' : '';
    summary.push(`武器組 2 總 DPS: ${sign}${deltas.totalDps.delta} (${sign}${deltas.totalDps.percentChange}%)`);
  }
  if (deltas.attacksPerSecond.delta !== 0) {
    const sign = deltas.attacksPerSecond.delta > 0 ? '+' : '';
    summary.push(`攻速變更: ${sign}${deltas.attacksPerSecond.delta}/s (${sign}${deltas.attacksPerSecond.percentChange}%)`);
  }
  if (deltas.spirit.delta !== 0) {
    const sign = deltas.spirit.delta > 0 ? '+' : '';
    summary.push(`精魂容量變更: ${sign}${deltas.spirit.delta}`);
  }
  if (set1Stats.hasShield !== set2Stats.hasShield) {
    summary.push(set2Stats.hasShield ? '武器組 2 啟用盾牌防禦' : '武器組 2 卸下盾牌');
  }

  return {
    set1Stats,
    set2Stats,
    deltas,
    summary
  };
}
