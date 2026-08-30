import type { ActData } from '../types';

export const act7Data: ActData = {
    act: 7,
    title: '第七章：瓦爾隱密與葛魯斯特 (Act 7: The Master of Sin)',
    townName: '橋底營地 (The Bridge Encampment)',
    recommendedLevel: 'Lv 50 ~ 55',
    ascendancyAdvice: '完成【罪孽之殿 (Chamber of Sins)】與【地下墓穴 (The Crypt)】的二階帝國試煉，並可挑戰第二次昇華迷宮 (Cruel Lab)！',
    checkpoints: [
      {
        title: '第二次昇華迷宮 (Cruel Labyrinth)',
        description: '建議等級 Lv 53+，在挑戰葛魯斯特與艾拉卡莉前完成殘酷迷宮，獲得第 3、4 點昇華天賦。',
        category: 'ascendancy'
      }
    ],
    steps: [
      {
        id: 'act7_crossroads',
        zoneName: '破碎大橋與罪孽之殿 (The Crossroads & Chamber of Sins)',
        zoneLevel: 51,
        hasWaypoint: true,
        hasTrial: true,
        isPassivePoint: true,
        mainObjective: '於罪孽之殿完成【帝國試煉】，擊殺【惡毒者馬雷葛羅 (Maligaro)】拿黑曜之鑰。',
        rewards: [
          {
            questName: '木乃伊蛛絲 (Web of Secrets)',
            npc: '海倫娜 (Helena)',
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
        id: 'act7_crypt',
        zoneName: '地下墓穴 (The Crypt)',
        zoneLevel: 52,
        hasWaypoint: true,
        hasTrial: true,
        isPassivePoint: false,
        mainObjective: '完成第七章最後一個二階【帝國試煉】，找到馬魯卡之容器。'
      },
      {
        id: 'act7_dread_thicket',
        zoneName: '恐懼樹叢 (The Dread Thicket)',
        zoneLevel: 53,
        hasWaypoint: false,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '收集 7 隻螢火蟲，擊殺【葛魯斯特 (Greust)】。',
        rewards: [
          {
            questName: '墮落的隊長 (The Master of a Million Faces)',
            npc: '艾米爾 (Eramir)',
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
        id: 'act7_arakaali',
        zoneName: '蜘蛛之塚 (The Temple of Decay)',
        zoneLevel: 54,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '深入腐朽神殿最底層，擊殺蜘蛛之神【艾拉卡莉 (Arakaali)】，進入第八章薩恩大橋。',
        rewards: [
          {
            questName: '八足母神 (Lighting the Way)',
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
