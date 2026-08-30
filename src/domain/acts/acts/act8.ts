import type { ActData } from '../types';

export const act8Data: ActData = {
    act: 8,
    title: '第八章：日與月的日蝕雙神 (Act 8: Eclipse of the Gods)',
    townName: '薩恩帝國營地 (The Sarn Encampment Part 2)',
    recommendedLevel: 'Lv 55 ~ 60',
    ascendancyAdvice: '完成【浴場 (The Bath House)】的三階帝國試煉',
    checkpoints: [
      {
        title: '4 連線 (4-Link) 核心裝備確認',
        description: '此時主輸出技能必須具備 4 連線（如 1 主技能 + 3 個增傷輔助寶石），傷害才能在 10 秒內清掉章節首領。',
        category: 'gem_links'
      }
    ],
    steps: [
      {
        id: 'act8_doedre_cesspool',
        zoneName: '毒氣下水道 (The Toxic Conduits & Doedre\'s Cesspool)',
        zoneLevel: 56,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: false,
        mainObjective: '轉動閥門排出污水，擊敗【德瑞之毒 (Doedre the Vile)】。'
      },
      {
        id: 'act8_grand_promenade_bath',
        zoneName: '帝國浴場 (The Bath House)',
        zoneLevel: 57,
        hasWaypoint: true,
        hasTrial: true,
        isPassivePoint: true,
        mainObjective: '完成三階【帝國試煉】，並於高階花園擊殺【恐懼之源 - 尤葛爾 (Yugul)】獲得天賦點。',
        rewards: [
          {
            questName: '恐懼之影 (Reflection of Terror)',
            npc: '哈根 (Hargan)',
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
        id: 'act8_solaris_lunaris_temple',
        zoneName: '日耀與月影神殿 (The Temple of the Sun & Moon)',
        zoneLevel: 59,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '分別取得日之寶珠與月之寶珠，深入天空神殿擊殺【日耀女神與月影女神 (Solaris & Lunaris)】。',
        tips: '日月雙神交替攻擊，當日耀女神俯衝時注意躲避烈焰光束，月影女神放冷箭時繞圈走位。',
        rewards: [
          {
            questName: '日蝕大戰 (The Eclipse)',
            npc: '罪 (Sin)',
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
      }
    ]
  };
