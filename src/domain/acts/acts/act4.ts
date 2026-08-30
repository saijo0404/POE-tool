import type { ActData } from '../types';

export const act4Data: ActData = {
    act: 4,
    title: '第四章：巨獸之腹與岡姆/德瑞索 (Act 4: The Beast Within)',
    townName: '統治者之殿 (Highgate)',
    recommendedLevel: 'Lv 32 ~ 38',
    checkpoints: [
      {
        title: '擊殺達勒索與岡姆之魂',
        description: '在乾涸湖岸擊殺火山雄鷹拿羽毛後，進入大競技場與岡姆要塞收集 2 個首領靈魂之眼。',
        category: 'gear'
      }
    ],
    steps: [
      {
        id: 'act4_dried_lake',
        zoneName: '乾涸湖岸 (The Dried Lake)',
        zoneLevel: 33,
        hasWaypoint: false,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '擊殺【福爾 (Voll, Emperor of Purity)】拾取迪虛瑞特的紅旗。',
        rewards: [
          {
            questName: '被封印的迪虛瑞特 (Deshret\'s Spirit)',
            npc: '塔蘇尼 (Tarkleigh / Tasuni)',
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
        id: 'act4_belly_beast',
        zoneName: '巨獸之腹與黑靈核心 (Belly of the Beast & The Black Core)',
        zoneLevel: 37,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '穿過巨獸之腹，擊殺德瑞、馬雷葛羅、薛朗三使徒後，擊殺【馬拉凱 (Malachai, The Nightmare)】。',
        tips: '馬拉凱戰鬥中當場上出現跳動的黑色心臟時，優先轉火打掉心臟解除馬拉凱的無敵護盾。',
        rewards: [
          {
            questName: '永恆夢魘 (An Indomitable Spirit)',
            npc: '達拉夫人 (Lady Dialla)',
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
