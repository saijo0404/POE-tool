import type { ParsedItemMod } from '../item/types';
import type { AffixClassification } from './types';

const PREFIX_PATTERNS = [
  /life|生命/i,
  /movement speed|移動速度/i,
  /physical damage|物理傷害/i,
  /spell damage|法術傷害/i,
  /maximum mana|最大魔力/i,
  /armour|evasion|energy shield|護甲|閃避|能量護盾/i,
  /added .* damage|附加.*傷害/i,
  /level of all .* gems|\+.*等級/i
];

const SUFFIX_PATTERNS = [
  /resistance|抗性/i,
  /attack speed|攻擊速度/i,
  /cast speed|施法速度/i,
  /critical|暴擊/i,
  /strength|dexterity|intelligence|all attributes|力量|敏捷|智慧|能力/i,
  /accuracy rating|命中值/i,
  /suppress .* damage|壓抑.*傷害/i
];

export function classifyAffix(mod: ParsedItemMod): AffixClassification {
  if (mod.type === 'implicit') return 'implicit';

  const combined = `${mod.englishText || ''} ${mod.text || ''}`;
  if (PREFIX_PATTERNS.some(p => p.test(combined))) {
    return 'prefix';
  }
  if (SUFFIX_PATTERNS.some(p => p.test(combined))) {
    return 'suffix';
  }
  return 'prefix';
}
