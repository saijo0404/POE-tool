import type { ActData } from '../types';

export const act2Data: ActData = {
    act: 2,
    title: '第二章：瓦爾森林與盜賊領主 (Act 2: The Forest & Bandits)',
    townName: '森林營地 (The Forest Encampment)',
    recommendedLevel: 'Lv 12 ~ 22',
    banditRecommendation: '【全殺 (Kill All)】獲得 +1 天賦點數（適合 90% 終局 Build）；或幫助【阿爾里拉 (Alira)】拿 +15% 全抗與 20% 暴擊加成（適合拓荒缺抗性與爆擊流派）。',
    ascendancyAdvice: '完成【罪孽之殿 (Chamber of Sins)】與【地下墓穴 (The Crypt)】的一階帝國試煉',
    checkpoints: [
      {
        title: '三位盜賊領主選擇',
        description: '歐克 (Oak - 濕地)、克拉辛 (Kraityn - 破碎大橋)、阿爾里拉 (Alira - 西部樹林)。拓荒若想省心選全殺拿天賦點，或留阿爾里拉補抗性。',
        category: 'bandits'
      },
      {
        title: '昇華試煉 2 處',
        description: '1. 罪孽之殿第 2 層。 2. 地下墓穴第 1 層。',
        category: 'ascendancy'
      }
    ],
    steps: [
      {
        id: 'act2_crossroads',
        zoneName: '河道十字路 (The Crossroads)',
        zoneLevel: 14,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: false,
        mainObjective: '踩 WP。此處為分岔樞紐：往左去【罪孽之殿】，往上去【罪惡之橋】，往下走【長生嶺】。',
        tips: '優先順著石板路往左走罪孽之殿。'
      },
      {
        id: 'act2_chamber_of_sins',
        zoneName: '罪孽之殿 (The Chamber of Sins 1 & 2)',
        zoneLevel: 15,
        hasWaypoint: true,
        hasTrial: true,
        isPassivePoint: false,
        mainObjective: '在第 2 層解開【帝國試煉】，擊殺【費得利塔斯 (Fidelitas)】拯救海倫娜，取得巴貝魯古印 (Baleful Gem)。',
        tips: '第 2 層沿著中央帶有藍色地毯的走廊前進即可找到試煉與首領。',
        rewards: [
          {
            questName: '古印之迷 (Intruders in Black)',
            npc: '格魯斯特 (Greust)',
            isSkillPoint: false,
            recommendedPicks: {
              witch: '褻瀆 (Desecrate) / 秘術烙印 (Arcanist Brand)',
              shadow: '暗影迷蹤 (Withering Step)',
              ranger: '捷光 (Herald of Ash/Ice/Thunder)',
              duelist: '純淨之捷 (Herald of Purity)',
              marauder: '灰燼之捷 (Herald of Ash)',
              templar: '定罪波 (Wave of Conviction)',
              scion: '風暴之盾'
            }
          }
        ]
      },
      {
        id: 'act2_western_forest',
        zoneName: '西部樹林 (The Western Forest)',
        zoneLevel: 17,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '1. 沿主路找到阿爾里拉 (Alira)。 2. 找到黑石通道擊殺守衛拿阿爾瓦標誌。 3. 找到【織網者巢穴 (The Weaver\'s Chambers)】拿劇毒之針。',
        tips: '主幹石板路旁邊有一處破損並延伸出火把火堆的小徑，沿著火把走必通往織網者巢穴！',
        rewards: [
          {
            questName: '黑石通道與西部路通 (The Way Forward)',
            npc: '第一章最佳獎勵 - 貝斯特 (Bestel)',
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
        id: 'act2_crypt',
        zoneName: '地下墓穴 (The Crypt)',
        zoneLevel: 18,
        hasWaypoint: true,
        hasTrial: true,
        isPassivePoint: false,
        mainObjective: '從長生嶺進入地下墓穴第 1 層，完成【帝國試煉】。',
        tips: '墓穴中小心移動式鋸齒陷阱與毒氣機關。'
      },
      {
        id: 'act2_vaal_ruins',
        zoneName: '瓦爾廢墟與北部森林 (The Vaal Ruins)',
        zoneLevel: 19,
        hasWaypoint: false,
        hasTrial: false,
        isPassivePoint: false,
        mainObjective: '打破瓦爾古印封印古球，解除黑幕，進入濕地 (The Wetlands)。'
      },
      {
        id: 'act2_pyramid',
        zoneName: '瓦爾金字塔 (The Ancient Pyramid)',
        zoneLevel: 20,
        hasWaypoint: false,
        hasTrial: false,
        isPassivePoint: false,
        mainObjective: '攀登至金字塔頂端，擊殺【瓦爾超靈 (Vaal Oversoul)】，穿過出口抵達第三章薩恩城。',
        tips: '瓦爾超靈砸下大鐵鎚時有明顯蓄力動作，務必往兩側跑開避免被一擊秒殺。'
      }
    ]
  };
