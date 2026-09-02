/**
 * Trade and Mod Search Domain Constants
 */

export interface CommonStatPreset {
  text: string;
  englishText: string;
  defaultValue: number;
}

export const COMMON_STAT_PRESETS: readonly CommonStatPreset[] = [
  { text: '+# 最大生命', englishText: '+# to Maximum Life', defaultValue: 70 },
  { text: '+#% 全部元素抗性', englishText: '+#% to all Elemental Resistances', defaultValue: 12 },
  { text: '+#% 火焰抗性', englishText: '+#% to Fire Resistance', defaultValue: 35 },
  { text: '+#% 冰冷抗性', englishText: '+#% to Cold Resistance', defaultValue: 35 },
  { text: '+#% 閃電抗性', englishText: '+#% to Lightning Resistance', defaultValue: 35 },
  { text: '+#% 混沌抗性', englishText: '+#% to Chaos Resistance', defaultValue: 25 },
  { text: '增加 #% 移動速度', englishText: '#% increased Movement Speed', defaultValue: 30 },
  { text: '增加 #% 攻擊速度', englishText: '#% increased Attack Speed', defaultValue: 15 },
  { text: '增加 #% 施法速度', englishText: '#% increased Cast Speed', defaultValue: 15 },
  { text: '+#% 暴擊加成', englishText: '+#% to Critical Strike Multiplier', defaultValue: 30 },
  { text: '增加 #% 暴擊率', englishText: '#% increased Critical Strike Chance', defaultValue: 50 },
  { text: '增加 #% 法術傷害', englishText: '#% increased Spell Damage', defaultValue: 60 },
  { text: '增加 #% 物理傷害', englishText: '#% increased Physical Damage', defaultValue: 80 },
  { text: '+# 點能量護盾', englishText: '+# to maximum Energy Shield', defaultValue: 50 },
  { text: '+# 點護甲', englishText: '+# to Armour', defaultValue: 200 },
];
