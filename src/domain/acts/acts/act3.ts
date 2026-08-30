import type { ActData } from '../types';

export const act3Data: ActData = {
    act: 3,
    title: '第三章：薩恩帝國與神主之死 (Act 3: The City of Sarn)',
    townName: '薩恩營地 (The Sarn Encampment)',
    recommendedLevel: 'Lv 22 ~ 32',
    ascendancyAdvice: '完成【火葬場 (Crematorium)】與【地下墓穴 (Catacombs)】的一階帝國試煉，並可於 Lv 30+ 挑戰第一次昇華迷宮！',
    checkpoints: [
      {
        title: '第一次昇華迷宮 (Normal Labyrinth)',
        description: '在進入神主之塔前或擊殺派蒂後，回薩恩營地廣場進入帝國迷宮，完成昇華轉職並取得前 2 點昇華天賦！',
        category: 'ascendancy'
      },
      {
        title: '下水道 3 尊半身像 (Busts)',
        description: '在薩恩下水道尋找 3 尊赫克特半身像，可向哈根 (Hargan) 領取 +1 天賦點數。',
        category: 'resistance'
      }
    ],
    steps: [
      {
        id: 'act3_crematorium',
        zoneName: '火葬場 (The Crematorium)',
        zoneLevel: 24,
        hasWaypoint: true,
        hasTrial: true,
        isPassivePoint: false,
        mainObjective: '完成【帝國試煉】，擊敗【派蒂 (Piety)】拾取托剛泰之鑰。',
        tips: '派蒂釋放雷暴時貼身輸出或躲在柱子後。'
      },
      {
        id: 'act3_sewers',
        zoneName: '薩恩下水道 (The Sewers)',
        zoneLevel: 25,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '沿途收集 3 尊【赫克特半身像 (Victario\'s Busts)】，開啟通往市場街的出口。',
        rewards: [
          {
            questName: '維克塔里奧的秘密 (Victario\'s Secrets)',
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
        id: 'act3_catacombs',
        zoneName: '地下墓穴 (The Catacombs)',
        zoneLevel: 26,
        hasWaypoint: true,
        hasTrial: true,
        isPassivePoint: false,
        mainObjective: '從市集街進入地下墓穴，完成第一階段最後一個【帝國試煉】。'
      },
      {
        id: 'act3_solaris_lunaris',
        zoneName: '日耀神殿與月影神殿 (Solaris & Lunaris Temples)',
        zoneLevel: 28,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '在日耀神殿 2 層向達拉夫人拿鍊金絲線；深入月影神殿 2 層擊殺【派蒂 (Piety)】取得神塔之鑰。',
        rewards: [
          {
            questName: '派蒂之寵 (Piety\'s Pets)',
            npc: '格拉維奇將軍後續 - 格里戈 (Grigor)',
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
        id: 'act3_sceptre_dominus',
        zoneName: '神權之塔 (The Sceptre of God)',
        zoneLevel: 31,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: false,
        mainObjective: '攀登神權之塔頂層，擊殺【神主 (Dominus, High Templar)】，進入第四章統治者之殿。',
        tips: '神主第二形態（野獸）釋放血雨時，必須站在神主周圍的金色光罩內，否則會快速失血暴斃！'
      }
    ]
  };
