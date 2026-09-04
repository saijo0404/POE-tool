import type { CharacterClass } from './types';
import type { GemSwapLevel, GemSwapMilestone, GemAttribute } from './gemSwapTypes';
export * from './gemSwapTypes';

export function getAttributeWarningForGem(
  cls: CharacterClass,
  attr: GemAttribute,
  reqVal: number
): string | null {
  if (reqVal < 30) return null;
  if (cls === 'witch') {
    if (attr === 'dexterity') return '⚠️ 女巫缺少敏捷，需準備翡翠護身符或海玉護身符 (Jade/Turquoise Amulet)';
    if (attr === 'strength') return '⚠️ 女巫缺少力量，需準備琥珀護身符或重革腰帶 (Amber Amulet / Heavy Belt)';
  } else if (cls === 'marauder') {
    if (attr === 'intelligence') return '⚠️ 野蠻人缺少智慧，需準備青金石護身符 (Lapis Amulet)';
    if (attr === 'dexterity') return '⚠️ 野蠻人缺少敏捷，需準備翡翠護身符 (Jade Amulet)';
  } else if (cls === 'ranger') {
    if (attr === 'strength') return '⚠️ 遊俠缺少力量，需準備琥珀護身符或重革腰帶 (Amber Amulet / Heavy Belt)';
    if (attr === 'intelligence') return '⚠️ 遊俠缺少智慧，需準備青金石護身符 (Lapis Amulet)';
  } else if (cls === 'shadow' && attr === 'strength') {
    return '⚠️ 暗影缺少力量，需準備琥珀護身符 (Amber Amulet)';
  } else if (cls === 'duelist' && attr === 'intelligence') {
    return '⚠️ 決鬥者缺少智慧，需準備青金石護身符 (Lapis Amulet)';
  } else if (cls === 'templar' && attr === 'dexterity') {
    return '⚠️ 聖堂武僧缺少敏捷，需準備海玉或翡翠護身符 (Turquoise / Jade Amulet)';
  }
  return null;
}

const RAW_MILESTONES: Array<{
  cls: CharacterClass;
  lvl: GemSwapLevel;
  title: string;
  arch: string;
  res: string;
  gems: Array<[string, string, 'main_skill' | 'support_gem' | 'aura_utility', string, string, GemAttribute, number, string]>;
  note: string;
}> = [
  // Witch
  { cls: 'witch', lvl: 12, title: '女巫 Lv 12: 元素/召喚一階爆發', arch: '召喚/元素法術流', res: '火抗/冰抗 ≥ 40%', gems: [
    ['召喚憤怒狂靈', 'Summon Raging Spirit', 'main_skill', '奈莎 (海妖之歌任務)', 'BBB', 'intelligence', 33, '擊殺海妖之歌後必選，單體與清圖兼備'],
    ['裂痕術', 'Creeping Frost', 'main_skill', '奈莎 (海妖之歌任務)', 'BBB', 'intelligence', 33, '法術起手平滑，自帶冰霜地面減速緩速敵人']
  ], note: '此等級建議取得 3 藍插槽法杖，可使用法術傷害公式合成。' },
  { cls: 'witch', lvl: 28, title: '女巫 Lv 28: 核心烙印與褻瀆爆破', arch: '烙印/死靈引爆流', res: '電抗/火抗 ≥ 60%', gems: [
    ['世界末日烙印', 'Armageddon Brand', 'main_skill', '卡爾麗莎 (鏟除毒瘤任務)', 'BBB', 'intelligence', 42, '自動鎖敵隕石傷害，跑圖邊走邊丟極速通關']
  ], note: '打完派蒂完成鏟除毒瘤任務後取得，立即串聯點燃擴散。' },
  { cls: 'witch', lvl: 38, title: '女巫 Lv 38: 高階施法輔助串聯', arch: '法術全爆發流', res: '三抗滿 75%', gems: [
    ['釋放輔助', 'Unleash Support', 'support_gem', '佩達斯與凡尼 (籠中之鴿任務)', 'BBB', 'intelligence', 54, '積累 3 層釋放連發，爆發瞬間秒殺金怪與章節王']
  ], note: 'Act 4 關鍵質變，法術釋放讓拓荒清圖效率提升倍增。' },

  // Ranger
  { cls: 'ranger', lvl: 12, title: '遊俠 Lv 12: 毒雨/閃電箭矢啟航', arch: '毒雨/元素弓箭流', res: '火抗/冰抗 ≥ 40%', gems: [
    ['毒雨', 'Toxic Rain', 'main_skill', '奈莎 (海妖之歌任務)', 'GGG', 'dexterity', 33, '攻速與投射物疊加混沌持續傷，裝備要求極低'],
    ['閃電箭矢', 'Lightning Arrow', 'main_skill', '奈莎 (海妖之歌任務)', 'GGG', 'dexterity', 33, '大範圍連鎖閃電清怪神技，需搭配好弓']
  ], note: '海妖之歌完成後切換主技能，店鋪購買綠綠綠 3 連弓箭。' },
  { cls: 'ranger', lvl: 28, title: '遊俠 Lv 28: 腐蝕箭矢/龍捲射擊', arch: '毒雲/物理暴擊弓', res: '電抗/火抗 ≥ 60%', gems: [
    ['腐蝕箭矢', 'Caustic Arrow', 'main_skill', '卡爾麗莎 (鏟除毒瘤任務)', 'GGG', 'dexterity', 42, '地面強效腐蝕毒雲，秒殺群怪']
  ], note: '注意力量屬性需求，若不足配戴琥珀護身符。' },
  { cls: 'ranger', lvl: 38, title: '遊俠 Lv 38: 高階多重投射質變', arch: '連鎖全屏弓', res: '三抗滿 75%', gems: [
    ['高階多重投射', 'Greater Multiple Projectiles', 'support_gem', '佩達斯與凡尼 (籠中之鴿任務)', 'GGG', 'dexterity', 54, '+4 額外投射物覆蓋全屏，清圖效率巔峰']
  ], note: '投射物數量倍增，打王改用弩砲圖騰集中火力輸出。' },

  // Marauder
  { cls: 'marauder', lvl: 12, title: '野蠻人 Lv 12: 裂地/大地震擊', arch: '碎地/重擊狂戰流', res: '火抗/冰抗 ≥ 40%', gems: [
    ['裂地之破', 'Sunder', 'main_skill', '奈莎 (海妖之歌任務)', 'RRR', 'strength', 33, '遠程直線衝擊波，安全擊殺各路金怪'],
    ['大地震擊', 'Ground Slam', 'main_skill', '奈莎 (海妖之歌任務)', 'RRR', 'strength', 33, '前方扇形範圍重擊，近身爆發極高']
  ], note: '完成海妖之歌後務必在武器上附魔物理傷害百分比。' },
  { cls: 'marauder', lvl: 28, title: '野蠻人 Lv 28: 碎地重擊爆破', arch: '戰吼爆破重擊流', res: '電抗/火抗 ≥ 60%', gems: [
    ['碎地重擊', 'Earthshatter', 'main_skill', '卡爾麗莎 (鏟除毒瘤任務)', 'RRR', 'strength', 42, '刺針配合戰吼引爆造成多重疊加巨額傷害']
  ], note: '建議搭配堅定戰吼與地層戰吼，手感與回血兩不誤。' },
  { cls: 'marauder', lvl: 38, title: '野蠻人 Lv 38: 殘暴輔助純物爆發', arch: '純物理重擊流', res: '三抗滿 75%', gems: [
    ['殘暴輔助', 'Brutality Support', 'support_gem', '佩達斯與凡尼 (籠中之鴿任務)', 'RRR', 'strength', 54, '巨額更多物理傷害加成，無視任何元素抗性']
  ], note: '注意殘暴輔助無法造成元素傷害，避免搭配光環附加元素。' },

  // Shadow
  { cls: 'shadow', lvl: 12, title: '暗影 Lv 12: 電弧地雷/毒雨', arch: '陷阱地雷/毒性刺客', res: '火抗/冰抗 ≥ 40%', gems: [
    ['電弧地雷', 'Arc Mine', 'main_skill', '奈莎 (海妖之歌任務)', 'GGB', 'intelligence', 33, '高階自動索敵連鎖跳躍，清圖極其安逸']
  ], note: '配合迅捷組裝輔助，一次拋出多個地雷引爆。' },
  { cls: 'shadow', lvl: 28, title: '暗影 Lv 28: 地震陷阱攻堅核彈', arch: '物理地震陷阱流', res: '電抗/火抗 ≥ 60%', gems: [
    ['地震陷阱', 'Seismic Trap', 'main_skill', '卡爾麗莎 (鏟除毒瘤任務)', 'GGB', 'dexterity', 42, '章節王殺手，多重震波重疊瞬間融化血條']
  ], note: '搭配散彈陷阱與陷阱冷卻，專注秒殺章節 Boss。' },
  { cls: 'shadow', lvl: 38, title: '暗影 Lv 38: 陷阱與地雷全階增傷', arch: '地雷全盛爆破流', res: '三抗滿 75%', gems: [
    ['陷阱與地雷傷害', 'Trap and Mine Damage', 'support_gem', '佩達斯與凡尼 (籠中之鴿任務)', 'GGB', 'intelligence', 54, '極大化陷阱與地雷每一下爆破傷害乘區']
  ], note: '進入第 4 章後核心 4 連線成型，可一路直通異界地圖。' },

  // Duelist
  { cls: 'duelist', lvl: 12, title: '決鬥者 Lv 12: 鋼碎/裂地之破', arch: '鋼技/雙手物理流', res: '火抗/冰抗 ≥ 40%', gems: [
    ['鋼碎', 'Splitting Steel', 'main_skill', '奈莎 (海妖之歌任務)', 'RRG', 'dexterity', 33, '鋼之碎屑分裂覆蓋大範圍，傷害倍率優秀']
  ], note: '善用召回鋼刃補充鋼彈，維持滿彈藥射擊。' },
  { cls: 'duelist', lvl: 28, title: '決鬥者 Lv 28: 旋風斬/穿刺流', arch: '穿刺旋風冠軍流', res: '電抗/火抗 ≥ 60%', gems: [
    ['旋風斬', 'Cyclone', 'main_skill', '卡爾麗莎 (鏟除毒瘤任務)', 'RRR', 'strength', 42, '移動旋風不間斷輸出，流暢穿越怪堆不受阻擋']
  ], note: '注意魔力消耗問題，可考慮塗油或戒指減少魔力消耗。' },
  { cls: 'duelist', lvl: 38, title: '決鬥者 Lv 38: 近戰物理傷害極致', arch: '近戰終極串聯', res: '三抗滿 75%', gems: [
    ['近戰物理傷害輔助', 'Melee Physical Damage', 'support_gem', '佩達斯與凡尼 (籠中之鴿任務)', 'RRR', 'strength', 54, '最經典高額近戰增傷，物理重擊不可或缺']
  ], note: '此時若有 4 連紅紅紅綠胸甲，可秒殺神主與馬拉凱。' },

  // Templar
  { cls: 'templar', lvl: 12, title: '聖堂武僧 Lv 12: 神聖圖騰與烙印', arch: '圖騰/法術守護流', res: '火抗/冰抗 ≥ 40%', gems: [
    ['神聖之火圖騰', 'Holy Flame Totem', 'main_skill', '奈莎 (海妖之歌任務)', 'BRR', 'strength', 33, '釋放奉獻地面自帶高額回血免疫詛咒']
  ], note: '雙圖騰成型前手動補火球或電弧增傷。' },
  { cls: 'templar', lvl: 28, title: '聖堂武僧 Lv 28: 電弧圖騰爆發', arch: '多重圖騰爆發流', res: '電抗/火抗 ≥ 60%', gems: [
    ['電弧圖騰', 'Arc Totem', 'main_skill', '卡爾麗莎 (鏟除毒瘤任務)', 'BBB', 'intelligence', 42, '連鎖導電快速清怪，安全距離自動索敵']
  ], note: '昇華聖宗前即可享受多重圖騰帶來的安全輸出環境。' },
  { cls: 'templar', lvl: 38, title: '聖堂武僧 Lv 38: 施法迴網高速施放', arch: '聖堂法術爆破流', res: '三抗滿 75%', gems: [
    ['施法迴網輔助', 'Spell Echo Support', 'support_gem', '佩達斯與凡尼 (籠中之鴿任務)', 'BBB', 'intelligence', 54, '一次吟唱重複兩次，法術發射頻率翻倍']
  ], note: '注意施法迴網無法輔助圖騰，若玩法術直傷極力推薦。' },

  // Scion
  { cls: 'scion', lvl: 12, title: '貴族 Lv 12: 靈活雙棲切換', arch: '全能物理/投射流', res: '火抗/冰抗 ≥ 40%', gems: [
    ['裂地之破', 'Sunder', 'main_skill', '奈莎 (海妖之歌任務)', 'RRR', 'strength', 33, '穩健物理中距離拓荒，容錯率極高'],
    ['閃電箭矢', 'Lightning Arrow', 'main_skill', '奈莎 (海妖之歌任務)', 'GGG', 'dexterity', 33, '走遊俠右側天賦時最佳清怪技能']
  ], note: '貴族初始點數向外發散，根據預定昇華選擇主屬性。' },
  { cls: 'scion', lvl: 28, title: '貴族 Lv 28: 昇華前夕核心定型', arch: '核心進階技能流', res: '電抗/火抗 ≥ 60%', gems: [
    ['旋風斬', 'Cyclone', 'main_skill', '卡爾麗莎 (鏟除毒瘤任務)', 'RRR', 'strength', 42, '適用近戰全能天賦，提供無阻礙走位體驗']
  ], note: '準備挑戰第一昇華試煉前，確保防禦面血量與抗性達標。' },
  { cls: 'scion', lvl: 38, title: '貴族 Lv 38: 終極 4 連輔助串聯', arch: '昇華質變流', res: '三抗滿 75%', gems: [
    ['殘暴輔助', 'Brutality Support', 'support_gem', '佩達斯與凡尼 (籠中之鴿任務)', 'RRR', 'strength', 54, '純物理流派核心傷害乘區放大']
  ], note: '完成籠中之鴿任務後，在第四章商店備齊核心連線。' }
];

export const GEM_SWAP_MILESTONES: GemSwapMilestone[] = RAW_MILESTONES.map(item => ({
  level: item.lvl,
  title: item.title,
  characterClass: item.cls,
  archetypeName: item.arch,
  gearResistanceTarget: item.res,
  gems: item.gems.map((g, idx) => ({
    id: `${item.cls}-${item.lvl}-${idx}`,
    name: g[0],
    nameEn: g[1],
    slotType: g[2],
    sourceNpc: g[3],
    recommendedColors: g[4],
    primaryAttribute: g[5],
    requiredAttributeValue: g[6],
    attributeWarning: getAttributeWarningForGem(item.cls, g[5], g[6]) || undefined,
    usageTips: g[7]
  })),
  summaryNote: item.note
}));

export function getGemSwapMilestonesByClass(cls: CharacterClass): GemSwapMilestone[] {
  return GEM_SWAP_MILESTONES.filter(m => m.characterClass === cls);
}

export function getGemSwapMilestonesByLevel(lvl: GemSwapLevel): GemSwapMilestone[] {
  return GEM_SWAP_MILESTONES.filter(m => m.level === lvl);
}
