import type { ActData } from '../types';

export const act6Data: ActData = {
    act: 6,
    title: '第六章：諸神甦醒與暮光歸來 (Act 6: The Awakening)',
    townName: '獅眼守望 (Lioneye\'s Watch Part 2)',
    recommendedLevel: 'Lv 45 ~ 50',
    ascendancyAdvice: '完成【禁靈之獄 (The Lower Prison)】的二階帝國試煉',
    checkpoints: [
      {
        title: '補滿 75% 元素抗性',
        description: '因奇塔弗 -30% 抗性懲罰，進入 Act 6 後立即使用工藝台 (Crafting Bench) 在防具飾品附魔補足火冰電抗！',
        category: 'resistance'
      },
      {
        title: '奈莎的技能寶石商店開放',
        description: '完成莉莉．羅斯 (Lily Roth) 的清理黃昏海灘任務後，莉莉將販售全遊戲所有主動與輔助技能寶石！',
        category: 'gem_links'
      }
    ],
    steps: [
      {
        id: 'act6_twilight_strand',
        zoneName: '暮光海灘 (The Twilight Strand)',
        zoneLevel: 45,
        hasWaypoint: false,
        hasTrial: false,
        isPassivePoint: false,
        mainObjective: '清理全圖所有殘留怪物，解鎖莉莉．羅斯寶石商店。'
      },
      {
        id: 'act6_tarkleigh_father',
        zoneName: '絕望岩灘與熾熱泥沼 (The Coast & Mud Flats)',
        zoneLevel: 46,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '擊殺【卡魯之父 - 圖克哈瑪 (Tukohama)】取得萬神殿次級神力與天賦點。',
        rewards: [
          {
            questName: '戰爭之神 (The Father of War)',
            npc: '塔格拉 (Tarkleigh)',
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
        id: 'act6_shavronne_tower',
        zoneName: '薛朗之塔與監獄 (Shavronne\'s Tower / Prison)',
        zoneLevel: 49,
        hasWaypoint: true,
        hasTrial: true,
        isPassivePoint: false,
        mainObjective: '完成二階【帝國試煉】，於塔頂擊殺【布魯特斯與薛朗之魂】。'
      },
      {
        id: 'act6_brine_king',
        zoneName: '海王之礁 (The Brine King\'s Reef)',
        zoneLevel: 50,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '擊殺【海王 - 索沃斯 (The Brine King)】，解鎖海王主神神力（免疫冰凍與防暈眩），乘船前往第七章。',
        rewards: [
          {
            questName: '海王之死 (The Brine King)',
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
