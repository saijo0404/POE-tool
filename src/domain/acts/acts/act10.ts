import type { ActData } from '../types';

export const act10Data: ActData = {
    act: 10,
    title: '第十章：終局降臨與奇塔弗終戰 (Act 10: End of Innocence)',
    townName: '奧瑞亞碼頭 (Oriath Docks)',
    recommendedLevel: 'Lv 64 ~ 68+',
    ascendancyAdvice: '完成【藏骨堂 (The Ossuary)】的三階最後試煉，全 6 處試煉完成！',
    checkpoints: [
      {
        title: '⚠️ 奇塔弗第二次抗性懲罰 (-60% 總懲罰)',
        description: '擊殺 Act 10 奇塔弗後，抗性將再次被扣除 -30%（累計 -60% 抗性懲罰）。擊殺前務必將面板火/冰/電抗撐到 105% 以上，確保進異界地圖時維持 75% 滿抗！',
        category: 'resistance'
      },
      {
        title: '完成全部 24 點天賦點任務檢查',
        description: '在遊戲聊天框輸入【/passives】，確認顯示「You have 24 passive skill points from quests」，若有漏解可立即對照補解！',
        category: 'gem_links'
      }
    ],
    steps: [
      {
        id: 'act10_cathedral_bannon',
        zoneName: '大聖堂屋頂與控制區 (Cathedral Rooftop & Ravaged Square)',
        zoneLevel: 65,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '拯救班恩 (Bannon)，擊殺【維列托 (Vilenta)】奪回奧瑞亞。',
        rewards: [
          {
            questName: '維列托的背叛 (Vilenta\'s Vengeance)',
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
        id: 'act10_ossuary',
        zoneName: '藏骨堂 (The Ossuary)',
        zoneLevel: 66,
        hasWaypoint: false,
        hasTrial: true,
        isPassivePoint: false,
        mainObjective: '完成三階帝國試煉的最後一個【帝國試煉】，取得純潔之骨。'
      },
      {
        id: 'act10_control_blocks',
        zoneName: '控制區 (The Control Blocks)',
        zoneLevel: 66,
        hasWaypoint: false,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '擊殺【無罪之裁決者】，釋放無罪之神力。',
        rewards: [
          {
            questName: '純潔之安全 (Safe Passage)',
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
        id: 'act10_kitava_final',
        zoneName: '渴望祭壇 (The Feeding Trough & Kitava)',
        zoneLevel: 67,
        hasWaypoint: false,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '在渴望祭壇徹底擊殺【奇塔弗 (Kitava, the Insatiable)】，拯救奧瑞亞，進軍異界輿圖 (Maps)！',
        tips: '奇塔弗心臟階段會召喚大量暗金怪物，注意走位；擊殺後在尾聲 (Epilogue) 向蘭特領取最後 2 點天賦點數獎勵！',
        rewards: [
          {
            questName: '終結與新生 (An End to Hunger)',
            npc: '蘭特 (Lani - 尾聲)',
            isSkillPoint: true,
            recommendedPicks: {
              witch: '⭐ +2 天賦點數 (Passive Skill Points)',
              shadow: '⭐ +2 天賦點數 (Passive Skill Points)',
              ranger: '⭐ +2 天賦點數 (Passive Skill Points)',
              duelist: '⭐ +2 天賦點數 (Passive Skill Points)',
              marauder: '⭐ +2 天賦點數 (Passive Skill Points)',
              templar: '⭐ +2 天賦點數 (Passive Skill Points)',
              scion: '⭐ +2 天賦點數 (Passive Skill Points)'
            }
          }
        ]
      }
    ]
  };
