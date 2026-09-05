import type { ParsedItem } from '../item/types';

export interface GearStatsSummary {
  life: number;
  mana: number;
  energyShield: number;
  armour: number;
  evasion: number;
  fireRes: number;
  coldRes: number;
  lightningRes: number;
  chaosRes: number;
  totalEleRes: number;
  spellSuppression: number;
  movementSpeed: number;
  attackSpeed: number;
  strength: number;
  dexterity: number;
  intelligence: number;
}

export interface StatDelta {
  statKey: keyof GearStatsSummary;
  label: string;
  currentValue: number;
  newValue: number;
  delta: number;
  isPositive: boolean;
  isNegative: boolean;
  unit: string;
}

export interface GearDeltaReport {
  slot: string;
  currentName: string;
  newName: string;
  currentStats: GearStatsSummary;
  newStats: GearStatsSummary;
  deltas: StatDelta[];
  gains: StatDelta[];
  losses: StatDelta[];
  neutral: StatDelta[];
  netResistDelta: number;
  recommendation: 'upgrade' | 'sidegrade' | 'downgrade';
  summaryNote: string;
}

export function detectSlotFromItem(item: ParsedItem): string {
  const text = `${item.baseType} ${item.itemClass || ''}`.toLowerCase();
  if (/helmet|burgonet|circlet|pelt|sallet|bascinet|casque|crown|hood|cap|mask|頭部|輕盔|戰盔|頭盔|面具|軟帽|王冠|兜帽/.test(text)) return 'helmet';
  if (/boots|greaves|shoes|slippers|鞋|長靴|短靴|鐵靴|踏靴/.test(text)) return 'boots';
  if (/gloves|gauntlets|mitts|手套|護手|夾手/.test(text)) return 'gloves';
  if (/belt|sash|vise|腰帶|飾帶|繫帶/.test(text)) return 'belt';
  if (/amulet|talisman|護身符|項鍊|魔符/.test(text)) return 'amulet';
  if (/ring|戒指/.test(text)) return 'ring';
  if (/armour|plate|vest|regalia|tunic|mail|robe|garb|silks|leathers|胸甲|護甲|法衣|戰甲|長袍|外衣/.test(text)) return 'body_armour';
  if (/shield|盾/.test(text)) return 'shield';
  return 'weapon';
}

function parseModNumber(text: string, pattern: RegExp): number {
  const m = text.match(pattern);
  if (!m) return 0;
  const numStr = m[1] || m[2] || m[3];
  return numStr ? parseInt(numStr, 10) : 0;
}

function applyResistanceMods(mod: string, stats: GearStatsSummary): void {
  const allRes = parseModNumber(mod, /\+(\d+)%\s*(?:to\s*)?all elemental resistances|\+(\d+)%\s*全部元素抗性/i);
  if (allRes) {
    stats.fireRes += allRes;
    stats.coldRes += allRes;
    stats.lightningRes += allRes;
  }
  const fireCold = parseModNumber(mod, /\+(\d+)%\s*(?:to\s*)?fire and cold resistances|\+(\d+)%\s*火焰與冰冷抗性/i);
  if (fireCold) {
    stats.fireRes += fireCold;
    stats.coldRes += fireCold;
  }
  const fireLight = parseModNumber(mod, /\+(\d+)%\s*(?:to\s*)?fire and lightning resistances|\+(\d+)%\s*火焰與閃電抗性/i);
  if (fireLight) {
    stats.fireRes += fireLight;
    stats.lightningRes += fireLight;
  }
  const coldLight = parseModNumber(mod, /\+(\d+)%\s*(?:to\s*)?cold and lightning resistances|\+(\d+)%\s*冰冷與閃電抗性/i);
  if (coldLight) {
    stats.coldRes += coldLight;
    stats.lightningRes += coldLight;
  }
  stats.fireRes += parseModNumber(mod, /\+(\d+)%\s*(?:to\s*)?fire resistance|\+(\d+)%\s*火焰抗性/i);
  stats.coldRes += parseModNumber(mod, /\+(\d+)%\s*(?:to\s*)?cold resistance|\+(\d+)%\s*冰冷抗性/i);
  stats.lightningRes += parseModNumber(mod, /\+(\d+)%\s*(?:to\s*)?lightning resistance|\+(\d+)%\s*閃電抗性/i);
  stats.chaosRes += parseModNumber(mod, /\+(\d+)%\s*(?:to\s*)?chaos resistance|\+(\d+)%\s*混沌抗性/i);
}

function applyAttributeAndDefMods(mod: string, stats: GearStatsSummary): void {
  const allAttr = parseModNumber(mod, /\+(\d+)\s*(?:to\s*)?all attributes|\+(\d+)\s*全能力/i);
  if (allAttr) {
    stats.strength += allAttr;
    stats.dexterity += allAttr;
    stats.intelligence += allAttr;
  }
  stats.life += parseModNumber(mod, /\+(\d+)\s*(?:to\s*)?maximum life|\+(\d+)\s*最大生命/i);
  stats.mana += parseModNumber(mod, /\+(\d+)\s*(?:to\s*)?maximum mana|\+(\d+)\s*最大魔力/i);
  stats.energyShield += parseModNumber(mod, /\+(\d+)\s*(?:to\s*)?maximum energy shield|\+(\d+)\s*能量護盾/i);
  stats.strength += parseModNumber(mod, /\+(\d+)\s*(?:to\s*)?strength|\+(\d+)\s*力量/i);
  stats.dexterity += parseModNumber(mod, /\+(\d+)\s*(?:to\s*)?dexterity|\+(\d+)\s*敏捷/i);
  stats.intelligence += parseModNumber(mod, /\+(\d+)\s*(?:to\s*)?intelligence|\+(\d+)\s*智慧/i);
  stats.spellSuppression += parseModNumber(mod, /\+(\d+)%\s*(?:chance to\s*)?suppress spell damage|\+(\d+)%\s*壓抑法術傷害/i);
  stats.movementSpeed += parseModNumber(mod, /(\d+)%\s*(?:increased\s*)?movement speed|增加\s*(\d+)%\s*移動速度/i);
  stats.attackSpeed += parseModNumber(mod, /(\d+)%\s*(?:increased\s*)?attack speed|增加\s*(\d+)%\s*攻擊速度/i);
}

export function extractGearStats(item: ParsedItem): GearStatsSummary {
  const stats: GearStatsSummary = {
    life: 0, mana: 0, energyShield: 0, armour: 0, evasion: 0,
    fireRes: 0, coldRes: 0, lightningRes: 0, chaosRes: 0, totalEleRes: 0,
    spellSuppression: 0, movementSpeed: 0, attackSpeed: 0,
    strength: 0, dexterity: 0, intelligence: 0
  };
  const allMods = [...(item.implicits || []), ...(item.explicits || [])].map(m => m.text);
  for (const mod of allMods) {
    applyResistanceMods(mod, stats);
    applyAttributeAndDefMods(mod, stats);
  }
  stats.totalEleRes = stats.fireRes + stats.coldRes + stats.lightningRes;
  return stats;
}

const STAT_CONFIG: Array<{ key: keyof GearStatsSummary; label: string; unit: string }> = [
  { key: 'life', label: '最大生命', unit: '' },
  { key: 'totalEleRes', label: '總元素抗性', unit: '%' },
  { key: 'chaosRes', label: '混沌抗性', unit: '%' },
  { key: 'fireRes', label: '火焰抗性', unit: '%' },
  { key: 'coldRes', label: '冰冷抗性', unit: '%' },
  { key: 'lightningRes', label: '閃電抗性', unit: '%' },
  { key: 'spellSuppression', label: '法術壓抑', unit: '%' },
  { key: 'energyShield', label: '能量護盾', unit: '' },
  { key: 'mana', label: '最大魔力', unit: '' },
  { key: 'movementSpeed', label: '移動速度', unit: '%' },
  { key: 'attackSpeed', label: '攻擊速度', unit: '%' },
  { key: 'strength', label: '力量', unit: '' },
  { key: 'dexterity', label: '敏捷', unit: '' },
  { key: 'intelligence', label: '智慧', unit: '' }
];

export function compareGearStats(currentGear: ParsedItem, newGear: ParsedItem): GearDeltaReport {
  const currentStats = extractGearStats(currentGear);
  const newStats = extractGearStats(newGear);
  const slot = detectSlotFromItem(newGear);

  const deltas: StatDelta[] = STAT_CONFIG.map(({ key, label, unit }) => {
    const curVal = currentStats[key];
    const newVal = newStats[key];
    const delta = newVal - curVal;
    return {
      statKey: key, label, currentValue: curVal, newValue: newVal,
      delta, isPositive: delta > 0, isNegative: delta < 0, unit
    };
  });

  const activeDeltas = deltas.filter(d => d.currentValue > 0 || d.newValue > 0);
  const gains = activeDeltas.filter(d => d.isPositive);
  const losses = activeDeltas.filter(d => d.isNegative);
  const neutral = activeDeltas.filter(d => d.delta === 0);

  const netResistDelta = (newStats.totalEleRes + newStats.chaosRes) - (currentStats.totalEleRes + currentStats.chaosRes);
  const lifeDelta = newStats.life - currentStats.life;

  let recommendation: 'upgrade' | 'sidegrade' | 'downgrade' = 'sidegrade';
  if (gains.length > losses.length && (lifeDelta >= 0 || netResistDelta >= 0)) {
    recommendation = 'upgrade';
  } else if (losses.length > gains.length && lifeDelta <= 0 && netResistDelta <= 0) {
    recommendation = 'downgrade';
  }

  const summaryNote = recommendation === 'upgrade'
    ? `推薦更換：總體獲得 ${gains.length} 項屬性提升，淨抗性差額 ${netResistDelta >= 0 ? '+' : ''}${netResistDelta}%。`
    : recommendation === 'downgrade'
    ? `不建議更換：多項核心屬性損失 (${losses.map(l => `${l.label} ${l.delta}${l.unit}`).join(', ')})。`
    : `各有千秋：兼具提升與抗性取捨，請依機體需求搭配。`;

  return {
    slot, currentName: currentGear.name || currentGear.baseType,
    newName: newGear.name || newGear.baseType,
    currentStats, newStats, deltas, gains, losses, neutral,
    netResistDelta, recommendation, summaryNote
  };
}
