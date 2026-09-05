import type { UltimatumMod } from './types';

export const ULTIMATUM_ROUND_BASE_REWARDS: Record<number, number> = {
  1: 4,
  2: 8,
  3: 15,
  4: 25,
  5: 45,
  6: 70,
  7: 110,
  8: 160,
  9: 220,
  10: 380
};

export const ULTIMATUM_MODS: UltimatumMod[] = [
  { id: 'razor_sharp', name: 'Razor Sharp', nameZh: '鋒利刀刃 (流血與額外物理)', baseRisk: 6, tags: ['phys', 'bleed'], description: '怪物附加額外物理傷害並造成流血' },
  { id: 'blood_offering', name: 'Blood Offering', nameZh: '鮮血獻祭 (禁回/禁吸血)', baseRisk: 9, tags: ['recovery', 'flask'], description: '減少藥劑充能，無法偷取生命或護盾' },
  { id: 'escalating_toxins', name: 'Escalating Toxins', nameZh: '劇毒蔓延 (混沌地面 DoT)', baseRisk: 8, tags: ['chaos_res'], description: '區域內產生大量混沌持續傷害毒潭' },
  { id: 'stalking_ruin', name: 'Stalking Ruin', nameZh: '匿蹤毀滅 (幻影毀滅印記)', baseRisk: 8, tags: ['movement', 'ruin'], description: '召喚無敵幻影追擊玩家，命中累積毀滅印記' },
  { id: 'choking_miasma', name: 'Choking Miasma', nameZh: '窒息瘴氣 (減速與迷霧)', baseRisk: 5, tags: ['movement'], description: '釋放迷霧，大幅降低玩家視野與跑速' },
  { id: 'blistering_cold', name: 'Blistering Cold', nameZh: '刺骨嚴寒 (冰霜追蹤骷髏)', baseRisk: 6, tags: ['movement'], description: '週期性召喚冰霜追蹤骷髏，接觸引爆' },
  { id: 'scorching_ground', name: 'Scorching Ground', nameZh: '焦灼大地 (燃燒地面)', baseRisk: 5, tags: ['movement'], description: ' arena 內出現移動的火焰燃燒地面' },
  { id: 'lightning_totems', name: 'Lightning Totems', nameZh: '雷霆圖騰 (閃電風暴)', baseRisk: 6, tags: ['movement'], description: '定期召喚閃電圖騰連續釋放雷暴' },
  { id: 'limited_arena', name: 'Limited Arena', nameZh: '狹窄死鬥 (縮小戰場範圍)', baseRisk: 7, tags: ['movement'], description: '縮減通牒場地半徑，邊界外造成沉重負面效果' },
  { id: 'raging_dead', name: 'Raging Dead', nameZh: '暴怒死靈 (自爆亡靈群)', baseRisk: 7, tags: ['movement'], description: '召喚快速接近並自爆的火屬性不死怪物' },
  { id: 'searing_blood', name: 'Searing Blood', nameZh: '灼熱射線 (旋轉血之光束)', baseRisk: 7, tags: ['movement'], description: '中心生成向外旋轉的致命火燄射線' },
  { id: 'treacherous_ground', name: 'Treacherous Ground', nameZh: '糾纏荊棘 (藤蔓緩速)', baseRisk: 6, tags: ['movement'], description: '隨機在腳下生成藤蔓，限制位移技能' },
  { id: 'sapping_spire', name: 'Sapping Spire', nameZh: '吸魔尖塔 (魔力燃燒)', baseRisk: 6, tags: ['mana'], description: '大幅提高技能魔力消耗並持續吸取魔力' },
  { id: 'coordinated_assault', name: 'Coordinated Assault', nameZh: '協同突襲 (金怪詞綴強化)', baseRisk: 7, tags: ['crit'], description: '稀有怪物數量增加 50% 且攻速爆擊提升' },
  { id: 'restricted_cooldowns', name: 'Restricted Cooldowns', nameZh: '冷卻禁錮 (冷卻回復 -50%)', baseRisk: 8, tags: ['cooldown'], description: '所有技能與位移冷卻回復速度減少 50%' },
  { id: 'overwhelming_impale', name: 'Overwhelming Impale', nameZh: '壓倒刺穿 (百穿穿刺)', baseRisk: 7, tags: ['phys'], description: '怪物必定造成刺穿且無視物理傷害減免' },
  { id: 'corrupted_blood', name: 'Corrupted Blood', nameZh: '腐化之血 (擊殺堆疊腐血)', baseRisk: 8, tags: ['bleed', 'recovery'], description: '擊殺怪物會在玩家身上累積腐化之血 DoT' },
  { id: 'fatal_criticals', name: 'Fatal Criticals', nameZh: '致命暴擊 (怪物高爆傷)', baseRisk: 8, tags: ['crit'], description: '怪物獲得 400% 暴擊加成，極易造成秒殺' },
  { id: 'debilitating_malediction', name: 'Debilitating Malediction', nameZh: '衰弱詛咒 (常駐虛弱)', baseRisk: 5, tags: ['phys'], description: '玩家常駐虛弱與衰弱狀態，傷害與護甲降低' },
  { id: 'unstoppable_hordes', name: 'Unstoppable Hordes', nameZh: '勢不可擋 (怪物免控場)', baseRisk: 6, tags: ['movement'], description: '怪物無法被冰凍、擊退、緩速或暈眩' },
  { id: 'vulnerability_aura', name: 'Vulnerability Aura', nameZh: '易傷光環 (承受物理 +30%)', baseRisk: 7, tags: ['phys'], description: '全場施加易傷詛咒，承受物理傷害額外 +30%' },
  { id: 'lingering_ruin', name: 'Lingering Ruin', nameZh: '遲緩毀滅 (低移速毀滅印記)', baseRisk: 8, tags: ['movement', 'ruin'], description: '移速低於標準值時承受攻擊立即疊加毀滅印記' }
];

export function getModById(id: string): UltimatumMod | undefined {
  return ULTIMATUM_MODS.find(m => m.id === id);
}
