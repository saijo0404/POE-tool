import type { ParsedItem, ParsedItemMod } from '../item/types';
import { calculatePseudoStats } from './pseudoStats';

const HIGH_VALUE_MOD_PATTERNS = [
  /更多.*傷害/i,
  /more.*damage/i,
  /技能寶石等級/i,
  /to level of.*gems/i,
  /暴擊加成/i,
  /critical strike multiplier/i,
  /壓抑法術傷害/i,
  /suppress spell damage/i,
  /移動速度/i,
  /increased movement speed/i,
  /額外詛咒/i,
  /additional curse/i,
  /撲殺/i,
  /culling strike/i,
  /狂怒球|暴擊球|耐力球/i,
  /frenzy charge|power charge|endurance charge/i,
  /每秒獲得.*充能/i,
];

const JUNK_MOD_PATTERNS = [
  /眩暈|暈眩/i,
  /stun and block/i,
  /照亮範圍/i,
  /light radius/i,
  /反射.*傷害/i,
  /reflect.*damage/i,
  /每秒生命回復/i,
  /life regenerated per second/i,
  /每秒魔力回復/i,
  /mana regenerated per second/i,
  /減少需求|降低需求/i,
  /reduced attribute requirements/i,
];

export function buildSmartDefaultMods(item: ParsedItem, rollPercentage = 80): ParsedItemMod[] {
  const isUnique = item.rarity === 'Unique';
  const ratio = rollPercentage / 100;

  if (isUnique) {
    const implicits = (item.implicits || []).map(m => ({
      ...m,
      enabled: false,
      minValue: calculateMinValue(m.value, ratio, m.minValue)
    }));
    const explicits = (item.explicits || []).map((m, idx) => ({
      ...m,
      enabled: idx < 2,
      minValue: calculateMinValue(m.value, ratio, m.minValue)
    }));
    return [...implicits, ...explicits];
  }

  const pseudos = calculatePseudoStats(item).map(p => ({
    ...p,
    minValue: calculateMinValue(p.value, ratio, p.minValue)
  }));

  const hasPseudoEle = pseudos.some(p => p.id === 'pseudo.pseudo_total_elemental_resistance' && p.enabled);
  const hasPseudoLife = pseudos.some(p => p.id === 'pseudo.pseudo_total_life' && p.enabled);
  const hasPseudoEs = pseudos.some(p => p.id === 'pseudo.pseudo_total_energy_shield' && p.enabled);

  const implicits = (item.implicits || []).map(m => {
    const isHighValue = isHighValueMod(m);
    return {
      ...m,
      enabled: isHighValue,
      minValue: calculateMinValue(m.value, ratio, m.minValue)
    };
  });

  const explicits = (item.explicits || []).map(m => {
    const isCovered = isCoveredByPseudo(m, hasPseudoEle, hasPseudoLife, hasPseudoEs);
    let enabled = false;

    if (!isCovered) {
      if (m.tier !== undefined && m.tier <= 2) {
        enabled = true;
      } else if (isHighValueMod(m)) {
        enabled = true;
      } else if (!isJunkMod(m) && m.tier === undefined && (m.value ?? 0) > 0) {
        // Un-tiered mod that isn't junk (e.g. crafted/essence)
        enabled = true;
      }
    }

    return {
      ...m,
      enabled,
      minValue: calculateMinValue(m.value, ratio, m.minValue)
    };
  });

  return [...pseudos, ...implicits, ...explicits];
}

export function applyRollPercentage(mods: ParsedItemMod[], rollPercentage: number): ParsedItemMod[] {
  const ratio = rollPercentage / 100;
  return mods.map(m => {
    if (m.value !== undefined && m.value > 0) {
      return {
        ...m,
        minValue: Math.floor(m.value * ratio)
      };
    }
    return m;
  });
}

function calculateMinValue(val?: number, ratio = 0.8, existingMin?: number): number | undefined {
  if (val !== undefined && val > 0) {
    return Math.floor(val * ratio);
  }
  return existingMin ?? val;
}

function isCoveredByPseudo(
  m: ParsedItemMod,
  hasPseudoEle: boolean,
  hasPseudoLife: boolean,
  hasPseudoEs: boolean
): boolean {
  const text = `${m.text} ${m.englishText || ''}`.toLowerCase();

  if (hasPseudoEle) {
    if (
      text.includes('火焰抗性') || text.includes('fire resistance') ||
      text.includes('冰冷抗性') || text.includes('cold resistance') ||
      text.includes('閃電抗性') || text.includes('lightning resistance') ||
      text.includes('全部元素抗性') || text.includes('all elemental resistances')
    ) {
      return true;
    }
  }

  if (hasPseudoLife) {
    if ((text.includes('最大生命') || text.includes('maximum life')) && !text.includes('%') && !text.includes('每秒')) {
      return true;
    }
  }

  if (hasPseudoEs) {
    if ((text.includes('最大能量護盾') || text.includes('maximum energy shield')) && !text.includes('%')) {
      return true;
    }
  }

  return false;
}

function isHighValueMod(m: ParsedItemMod): boolean {
  const text = `${m.text} ${m.englishText || ''}`;
  for (const pattern of HIGH_VALUE_MOD_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  return false;
}

function isJunkMod(m: ParsedItemMod): boolean {
  if (m.tier !== undefined && m.tier >= 3) return true;
  const text = `${m.text} ${m.englishText || ''}`;
  for (const pattern of JUNK_MOD_PATTERNS) {
    if (pattern.test(text)) return true;
  }
  return false;
}
