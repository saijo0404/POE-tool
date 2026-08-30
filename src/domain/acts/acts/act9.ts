import type { ActData } from '../types';

export const act9Data: ActData = {
    act: 9,
    title: '第九章：沙漠巨獸與不朽之血 (Act 9: Blood & Sand)',
    townName: '統治者之殿 (Highgate Part 2)',
    recommendedLevel: 'Lv 60 ~ 64',
    ascendancyAdvice: '完成【通道 (The Tunnel)】的三階帝國試煉',
    checkpoints: [
      {
        title: '第三次昇華迷宮 (Merciless Lab)',
        description: '在進入第十章前完成無情迷宮，獲得第 5、6 點昇華天賦（共 6 點昇華）。',
        category: 'ascendancy'
      }
    ],
    steps: [
      {
        id: 'act9_vastiri_desert',
        zoneName: '瓦斯提里荒漠 (The Vastiri Desert)',
        zoneLevel: 61,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '尋找風暴風暴之瓶，擊殺【沙暴狂蠍 - 沙卡麗 (Shakari)】獲得次級神力與天賦點。',
        rewards: [
          {
            questName: '沙漠之后 (Queen of the Sands)',
            npc: '伊拉米爾 (Petarus and Vanja / Tasuni)',
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
        id: 'act9_tunnel',
        zoneName: '通道 (The Tunnel)',
        zoneLevel: 62,
        hasWaypoint: true,
        hasTrial: true,
        isPassivePoint: false,
        mainObjective: '完成三階【帝國試煉】。'
      },
      {
        id: 'act9_quarry_garukhan',
        zoneName: '採石場與風暴之神 (The Quarry)',
        zoneLevel: 63,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '1. 擊殺風暴之神【卡魯漢 (Garukhan)】。 2. 深入精煉廠拿到瑟卡瑪羽毛。',
        rewards: [
          {
            questName: '風暴的統治 (The Ruler of Highgate)',
            npc: '塔蘇尼 (Tasuni / Irasha)',
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
        id: 'act9_rot_core',
        zoneName: '腐爛之核 (The Rotting Core)',
        zoneLevel: 64,
        hasWaypoint: false,
        hasTrial: false,
        isPassivePoint: false,
        mainObjective: '再次擊殺三使徒之魂，徹底摧毀腐爛巨獸核心，乘船前往第十章奧瑞亞碼頭。'
      }
    ]
  };
