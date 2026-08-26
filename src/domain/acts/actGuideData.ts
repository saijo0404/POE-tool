import type { ActData } from './types';

export const ACT_GUIDE_DATA: ActData[] = [
  // ==================== ACT 1 ====================
  {
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
  },

  // ==================== ACT 2 ====================
  {
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
  },

  // ==================== ACT 3 ====================
  {
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
  },

  // ==================== ACT 4 ====================
  {
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
  },

  // ==================== ACT 5 ====================
  {
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
  },

  // ==================== ACT 6 ====================
  {
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
  },

  // ==================== ACT 7 ====================
  {
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
  },

  // ==================== ACT 8 ====================
  {
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
  },

  // ==================== ACT 9 ====================
  {
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
  },

  // ==================== ACT 10 ====================
  {
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
  }
];
