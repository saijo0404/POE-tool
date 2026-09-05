import type { BuildPreset } from './types';

const DEFAULT_THRESHOLDS = { s: 250, a: 180, b: 120, c: 60 };

export const DEFAULT_BUILD_PRESETS: BuildPreset[] = [
  {
    id: 'life_fire_rf',
    name: '正火純火生命流 (RF / Fire Dot)',
    archetype: 'life_fire_rf',
    description: '專注於最大生命、每秒生命回復、火焰持續傷害加成與各類元素混沌抗性',
    scoreThresholds: DEFAULT_THRESHOLDS,
    rules: [
      { id: 'rf_life', name: '最大生命', pattern: /maximum life|最大生命/i, weight: 1.0 },
      { id: 'rf_fire_dot', name: '火焰持續傷害加成', pattern: /fire damage over time multiplier|火焰持續傷害加成/i, weight: 2.0 },
      { id: 'rf_dot', name: '持續傷害加成', pattern: /damage over time multiplier|持續傷害加成/i, weight: 1.8 },
      { id: 'rf_fire_res', name: '火焰抗性', pattern: /fire resistance|火焰抗性/i, weight: 0.8 },
      { id: 'rf_chaos_res', name: '混沌抗性', pattern: /chaos resistance|混沌抗性/i, weight: 1.0 },
      { id: 'rf_all_res', name: '全元素抗性', pattern: /all elemental resistances|全部元素抗性/i, weight: 1.5 },
      { id: 'rf_ele_res', name: '冰/電抗性', pattern: /(?:cold|lightning) resistance|(?:冰冷|閃電)抗性/i, weight: 0.6 },
      { id: 'rf_regen', name: '每秒生命回復', pattern: /regenerate .* life per second|每秒回復 .* 生命/i, weight: 1.5 },
      { id: 'rf_fire_dmg', name: '火焰傷害', pattern: /increased fire damage|增加火焰傷害/i, weight: 0.8 },
      { id: 'rf_aoe', name: '範圍傷害', pattern: /area damage|範圍傷害/i, weight: 0.5 }
    ]
  },
  {
    id: 'ele_bow_crit',
    name: '元素弓箭暴擊流 (Ele Bow Crit)',
    archetype: 'ele_bow_crit',
    description: '專注於附加三元素點傷、攻擊速度、暴擊加成、暴擊率與攻擊元素傷害',
    scoreThresholds: DEFAULT_THRESHOLDS,
    rules: [
      { id: 'bow_cold', name: '附加冰冷傷害', pattern: /adds .* cold damage|附加 .* 冰冷傷害/i, weight: 1.2 },
      { id: 'bow_light', name: '附加閃電傷害', pattern: /adds .* lightning damage|附加 .* 閃電傷害/i, weight: 1.2 },
      { id: 'bow_fire', name: '附加火焰傷害', pattern: /adds .* fire damage|附加 .* 火焰傷害/i, weight: 1.2 },
      { id: 'bow_crit_multi', name: '暴擊傷害加成', pattern: /critical strike multiplier|暴擊加成/i, weight: 1.5 },
      { id: 'bow_crit_chance', name: '暴擊率', pattern: /critical strike chance|暴擊率/i, weight: 0.8 },
      { id: 'bow_as', name: '攻擊速度', pattern: /attack speed|攻擊速度/i, weight: 1.4 },
      { id: 'bow_edwa', name: '攻擊元素傷害', pattern: /elemental damage with attack skills|增加攻擊技能元素傷害/i, weight: 1.2 },
      { id: 'bow_life', name: '最大生命', pattern: /maximum life|最大生命/i, weight: 0.8 },
      { id: 'bow_suppress', name: '法術傷害壓抑', pattern: /suppress spell damage|壓抑法術傷害/i, weight: 1.2 }
    ]
  },
  {
    id: 'poison_chaos_dot',
    name: '中毒混沌持續流 (Poison / Chaos Dot)',
    archetype: 'poison_chaos_dot',
    description: '專注於混沌持續加成、中毒傷害、施法/攻速、法術壓抑與混抗生命',
    scoreThresholds: DEFAULT_THRESHOLDS,
    rules: [
      { id: 'p_chaos_dot', name: '混沌持續加成', pattern: /chaos damage over time multiplier|混沌持續傷害加成/i, weight: 2.0 },
      { id: 'p_dot', name: '持續傷害加成', pattern: /damage over time multiplier|持續傷害加成/i, weight: 1.8 },
      { id: 'p_chaos_dmg', name: '混沌傷害', pattern: /chaos damage|混沌傷害/i, weight: 1.0 },
      { id: 'p_speed', name: '攻速/施法速度', pattern: /(?:attack|cast) speed|(?:攻擊|施法)速度/i, weight: 1.0 },
      { id: 'p_suppress', name: '法術壓抑', pattern: /suppress spell damage|壓抑法術傷害/i, weight: 1.5 },
      { id: 'p_chaos_res', name: '混沌抗性', pattern: /chaos resistance|混沌抗性/i, weight: 1.2 },
      { id: 'p_life', name: '最大生命', pattern: /maximum life|最大生命/i, weight: 1.0 }
    ]
  },
  {
    id: 'pure_phys_cyclone',
    name: '旋風斬純物理流 (Pure Phys Cyclone)',
    archetype: 'pure_phys_cyclone',
    description: '專注於附加物理傷害、物理百分比傷害、攻擊速度、穿刺機率與生命護甲',
    scoreThresholds: DEFAULT_THRESHOLDS,
    rules: [
      { id: 'c_add_phys', name: '附加物理傷害', pattern: /adds .* physical damage|附加 .* 點物理傷害/i, weight: 2.0 },
      { id: 'c_inc_phys', name: '增加物理傷害', pattern: /increased physical damage|增加物理傷害/i, weight: 1.2 },
      { id: 'c_as', name: '攻擊速度', pattern: /attack speed|攻擊速度/i, weight: 1.2 },
      { id: 'c_impale', name: '穿刺效果', pattern: /impale effect|穿刺效果/i, weight: 1.5 },
      { id: 'c_life', name: '最大生命', pattern: /maximum life|最大生命/i, weight: 1.0 },
      { id: 'c_armor', name: '護甲', pattern: /armour|護甲/i, weight: 0.2 }
    ]
  }
];

export function getBuildPresetById(id: string): BuildPreset | undefined {
  return DEFAULT_BUILD_PRESETS.find(p => p.id === id);
}
