import type { ActData } from '../types';

export const act1Data: ActData = {
    act: 1,
    title: '第一章：絕望海灘 (Act 1: Despair on the Strand)',
    townName: '獅眼守望 (Lioneye\'s Watch)',
    recommendedLevel: 'Lv 1 ~ 12',
    ascendancyAdvice: '完成【監獄 (The Prison)】的一階帝國試煉',
    checkpoints: [
      {
        title: '檢查裝備插槽與顏色',
        description: '在城鎮向奈莎 (Nessa) 或塔格拉 (Tarkleigh) 尋找具有 3 連線 (3-Link) 的裝備（如 綠綠綠、綠綠藍、藍藍藍），有跑速屬性的鞋子優先購買！',
        category: 'gem_links'
      },
      {
        title: '移動技能獲取',
        description: 'Lv 10 到達監獄門口後，回城領取【烈焰衝刺】、【冰霜閃現】或【躍擊】，拓荒跑圖速度倍增。',
        category: 'gear'
      }
    ],
    steps: [
      {
        id: 'act1_strand',
        zoneName: '暮光海灘 (The Twilight Strand)',
        zoneLevel: 1,
        hasWaypoint: false,
        hasTrial: false,
        isPassivePoint: false,
        mainObjective: '一路向東北奔跑，擊殺【希拉克 (Hillock)】拾取大劍進城。',
        tips: '沿著海水邊緣往上走，途中不需打小怪，直衝希拉克。',
        rewards: [
          {
            questName: '大敵當前 (Enemy at the Gate)',
            npc: '塔格拉 (Tarkleigh)',
            isSkillPoint: false,
            recommendedPicks: {
              witch: '爆發火球 (Rolling Magma) / 冰霜脈衝 (Freezing Pulse)',
              shadow: '毒蛇打擊 / 腐蝕箭雨 (Caustic Arrow)',
              ranger: '閃電箭矢 (Lightning Arrow) / 冰霜射擊',
              duelist: '分裂鋼刃 (Splitting Steel)',
              marauder: '熔岩之擊 (Molten Strike) / 重擊',
              templar: '聖焰圖騰 (Holy Flame Totem) / 冰霜脈衝',
              scion: '靈魂吸取 / 閃電箭矢'
            }
          }
        ]
      },
      {
        id: 'act1_coast',
        zoneName: '絕望岩灘 (The Coast)',
        zoneLevel: 2,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: false,
        mainObjective: '沿海岸線踩點 WP，往右進入【海潮孤島 (The Tidal Island)】拿醫藥箱。',
        tips: '順著泥沙路跑，看到傳送點後往海邊走即是海潮孤島入口。'
      },
      {
        id: 'act1_tidal',
        zoneName: '海潮孤島 (The Tidal Island)',
        zoneLevel: 3,
        hasWaypoint: false,
        hasTrial: false,
        isPassivePoint: false,
        mainObjective: '擊殺【海妖之歌 (Hailrake)】拾取醫藥箱，直接登出角色 (Logout) 或開傳送門回城。',
        tips: '海妖之歌會釋放冰川之刺，保持移動繞背輸出避免被連續冰凍。',
        rewards: [
          {
            questName: '慈愛者之悲 (Mercy Mission)',
            npc: '奈莎 (Nessa)',
            isSkillPoint: false,
            note: '⭐ 必拿【水銀藥劑 (Quicksilver Flask)】增加 40% 跑速！',
            recommendedPicks: {
              witch: '生機鏈接 (Lifetap) / 幻化守衛 / 冰霜閃現',
              shadow: '幻步 (Dash) / 枯萎',
              ranger: '狙擊者印記 (Sniper\'s Mark) / 幻步',
              duelist: '躍擊 (Leap Slam) / 機會',
              marauder: '躍擊 (Leap Slam) / 剛毅打擊',
              templar: '冰霜閃現 (Frostblink) / 聖火圖騰',
              scion: '水銀藥劑'
            }
          }
        ]
      },
      {
        id: 'act1_mud_flats',
        zoneName: '泥沼地 (The Mud Flats)',
        zoneLevel: 4,
        hasWaypoint: false,
        hasTrial: false,
        isPassivePoint: false,
        mainObjective: '尋找 3 個【蘿亞鳥巢 (Rhoa Nests)】拾取菊石古印，開啟沉寂海崖通道。',
        tips: '沿著河流與外圈成逆時針方向探索，避開衝鋒鳥的連續突進。'
      },
      {
        id: 'act1_submerged',
        zoneName: '沉寂海崖 (The Submerged Passage)',
        zoneLevel: 5,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: false,
        mainObjective: '踩 WP 後往右下尋找【水聲之淵 (The Flooded Depths)】擊殺大螃蟹拿天賦點。',
        tips: '水聲之淵通常位於傳送點附近的支線小岔路。'
      },
      {
        id: 'act1_flooded_depths',
        zoneName: '水聲之淵 (The Flooded Depths)',
        zoneLevel: 6,
        hasWaypoint: false,
        hasTrial: false,
        isPassivePoint: true,
        mainObjective: '深入最底端擊殺【巨蟹深淵之首 (The Dweller of the Deep)】，登出回城領取天賦點。',
        rewards: [
          {
            questName: '深淵巨蟹 (The Dweller of the Deep)',
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
        id: 'act1_prison',
        zoneName: '禁靈之獄 (The Lower / Upper Prison)',
        zoneLevel: 8,
        hasWaypoint: true,
        hasTrial: true,
        isPassivePoint: false,
        mainObjective: '【下層監獄】踩試煉迷宮踏板；【上層監獄】深入守衛居所擊殺【典獄長布魯特斯 (Brutus)】。',
        tips: '下層監獄沿著地上的血跡走即可找到帝國試煉與上層入口。',
        rewards: [
          {
            questName: '封閉的囚籠 (The Caged Brute)',
            npc: '塔格拉 (Tarkleigh)',
            isSkillPoint: false,
            recommendedPicks: {
              witch: '火葬 (Cremation) / 烈焰魔像 / 火舌圖騰',
              shadow: '重擊 (Whirling Blades) / 毒雨',
              ranger: '劇毒雨 (Toxic Rain) / 弩砲圖騰',
              duelist: '旋風斬 (Cyclone) / 精準打擊',
              marauder: '破擊碎石 (Sunder) / 先祖戰士',
              templar: '熾熱魔域 / 先祖守衛',
              scion: '投射物穿透'
            }
          }
        ]
      },
      {
        id: 'act1_cavern_wrath',
        zoneName: '怨恨之窟 (The Cavern of Wrath / Anger)',
        zoneLevel: 11,
        hasWaypoint: true,
        hasTrial: false,
        isPassivePoint: false,
        mainObjective: '在怨恨之窟深處擊殺【莫薇兒 (Merveil, the Siren)】，穿過出口到達第二章南部森林。',
        tips: '莫薇兒第二階段會召喚冰風暴與水龍捲，若冰抗偏低可配戴 2 個藍寶石戒指 (+30% 冰抗) 硬吃過關。'
      }
    ]
  };
