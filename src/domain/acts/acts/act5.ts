import type { ActData } from '../types';

export const act5Data: ActData = {
    act: 5,
    title: '第五章：奧瑞亞的淪陷 (Act 5: The Fall of Oriath)',
    townName: '監督者之塔 (Overseer\'s Tower)',
    recommendedLevel: 'Lv 38 ~ 45',
    checkpoints: [
      {
        title: '⚠️ 奇塔弗的詛咒 (抗性懲罰)',
        description: '擊殺 Act 5 奇塔弗後，玩家的所有元素抗性與混沌抗性將被永久扣除 -30%！請在此前準備好抗性戒指與裝備。',
        category: 'resistance'
      }
    ],
    steps: [
      {
        id: 'act5_chambers',
        zoneName: '控制區與無罪之室 (The Chamber of Innocence)',
        zoneLevel: 42,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '擊破【聖者無罪 (High Templar Avarius / Innocence)】，使奇塔弗覺醒。',
        tips: '無罪釋放全屏巨大金色彈幕與火球時，躲在場地周圍的石柱後方。',
        rewards: [
          {
            questName: '無罪的逝去 (Death to Purity)',
            npc: '班恩 (Bannon)',
            isSkillPoint: true,
            recommendedPicks: {
              witch: '⭐ +1 天賦點數 (Passive Skill Point)',
              shadow: '⭐ +1 天賦點數 (Passive Skill Point)',
              ranger: '⭐ +1 天賦點數 (Passive Skill Point)',
              duelist: '⭐ +1 天賦點數 (Passive Skill Point)',
              marauder: '⭐ +1 天賦點數 (Passive Skill Point)',
              templar: '⭐ +1 天賦點數 (Passive Skill Point)',
              scion: '⭐ +1 天賦點數 (Passive Skill Point)'
            }
          }
        ]
      },
      {
        id: 'act5_reliquary',
        zoneName: '聖物室 (The Reliquary)',
        zoneLevel: 43,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '在 3 個角落尋找聖堂武僧聖物（純潔之號角、聖典等）。',
        rewards: [
          {
            questName: '聖堂教團之寶 (Kitava\'s Torments)',
            npc: '蘭特 (Lani)',
            isSkillPoint: true,
            recommendedPicks: {
              witch: '⭐ +1 天賦點數 (Passive Skill Point)',
              shadow: '⭐ +1 天賦點數 (Passive Skill Point)',
              ranger: '⭐ +1 天賦點數 (Passive Skill Point)',
              duelist: '⭐ +1 天賦點數 (Passive Skill Point)',
              marauder: '⭐ +1 天賦點數 (Passive Skill Point)',
              templar: '⭐ +1 天賦點數 (Passive Skill Point)',
              scion: '⭐ +1 天賦點數 (Passive Skill Point)'
            }
          }
        ]
      },
      {
        id: 'act5_kitava',
        zoneName: '大聖堂屋頂 (The Cathedral Rooftop)',
        zoneLevel: 45,
        hasWaypoint: false,
        hasTrial: false,
        isPassivePoint: false,
        mainObjective: '與【奇塔弗 (Kitava, the Insatiable)】展開初次戰鬥，戰敗後乘船逃往第六章獅眼守望。',
        tips: '奇塔弗掃動巨臂與噴發岩漿時注意地板紅圈預警。'
      }
    ]
  };
