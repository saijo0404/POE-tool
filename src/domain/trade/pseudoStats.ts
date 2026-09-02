import type { ParsedItem, ParsedItemMod } from '../item/types';

export function calculatePseudoStats(item: ParsedItem): ParsedItemMod[] {
  const allMods = [...(item.implicits || []), ...(item.explicits || [])];
  const pseudos: ParsedItemMod[] = [];

  let fireRes = 0;
  let coldRes = 0;
  let lightRes = 0;
  let chaosRes = 0;
  let totalLife = 0;
  let totalEs = 0;

  for (const m of allMods) {
    if (m.type === 'pseudo' || !m.value) continue;
    const v = m.value;
    const text = `${m.text} ${m.englishText || ''}`.toLowerCase();

    // All elemental resistance (+#% to all Elemental Resistances)
    if (text.includes('全部元素抗性') || text.includes('所有元素抗性') || text.includes('to all elemental resistances')) {
      fireRes += v;
      coldRes += v;
      lightRes += v;
    } else if (text.includes('火焰與冰冷抗性') || text.includes('fire and cold resistances')) {
      fireRes += v;
      coldRes += v;
    } else if (text.includes('火焰與閃電抗性') || text.includes('fire and lightning resistances')) {
      fireRes += v;
      lightRes += v;
    } else if (text.includes('冰冷與閃電抗性') || text.includes('cold and lightning resistances')) {
      coldRes += v;
      lightRes += v;
    } else {
      if (text.includes('火焰抗性') || text.includes('fire resistance')) fireRes += v;
      if (text.includes('冰冷抗性') || text.includes('cold resistance')) coldRes += v;
      if (text.includes('閃電抗性') || text.includes('lightning resistance')) lightRes += v;
      if (text.includes('混沌抗性') || text.includes('chaos resistance')) chaosRes += v;
    }

    // Flat maximum life (exclude regen / mana)
    if ((text.includes('最大生命') || text.includes('maximum life')) && !text.includes('%') && !text.includes('每秒')) {
      totalLife += v;
    }

    // Flat maximum energy shield (exclude increased %)
    if ((text.includes('最大能量護盾') || text.includes('maximum energy shield')) && !text.includes('%')) {
      totalEs += v;
    }
  }

  const totalEleRes = fireRes + coldRes + lightRes;
  const totalRes = totalEleRes + chaosRes;

  if (totalEleRes > 0) {
    pseudos.push({
      id: 'pseudo.pseudo_total_elemental_resistance',
      text: `+#% 總元素抗性 (Pseudo)`,
      englishText: `+#% total Elemental Resistance`,
      type: 'pseudo',
      value: totalEleRes,
      minValue: Math.floor(totalEleRes * 0.8),
      enabled: true
    });
  }

  if (chaosRes > 0 || (totalRes > 0 && totalRes !== totalEleRes)) {
    pseudos.push({
      id: 'pseudo.pseudo_total_resistance',
      text: `+#% 總抗性 (Pseudo)`,
      englishText: `+#% total Resistance`,
      type: 'pseudo',
      value: totalRes,
      minValue: Math.floor(totalRes * 0.8),
      enabled: false
    });
  }

  if (totalLife > 0) {
    pseudos.push({
      id: 'pseudo.pseudo_total_life',
      text: `+# 總生命 (Pseudo)`,
      englishText: `+# to total maximum Life`,
      type: 'pseudo',
      value: totalLife,
      minValue: Math.floor(totalLife * 0.8),
      enabled: true
    });
  }

  if (totalEs > 0) {
    pseudos.push({
      id: 'pseudo.pseudo_total_energy_shield',
      text: `+# 總能量護盾 (Pseudo)`,
      englishText: `+# to total maximum Energy Shield`,
      type: 'pseudo',
      value: totalEs,
      minValue: Math.floor(totalEs * 0.8),
      enabled: true
    });
  }

  return pseudos;
}
