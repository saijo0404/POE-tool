export type CharacterClass =
  | 'witch'      // 女巫
  | 'shadow'     // 暗影
  | 'ranger'     // 遊俠
  | 'duelist'    // 決鬥者
  | 'marauder'   // 野蠻人
  | 'templar'    // 聖堂武僧
  | 'scion';     // 貴族

export interface QuestReward {
  questName: string;
  npc: string;
  // 各職業推薦選擇的寶石或裝備
  recommendedPicks: Record<CharacterClass, string>;
  isSkillPoint: boolean;    // 是否為天賦點任務 (⭐ 24點之一)
  isRespecPoint?: boolean;  // 是否為重置點任務
  note?: string;            // 補充說明 (例如: "若未掉落綠綠藍 3 連線，優先向 NPC 購買")
}

export interface ActStep {
  id: string;
  zoneName: string;         // 地區名稱 (e.g. "暮光海灘 (The Twilight Strand)")
  zoneLevel?: number;       // 怪物等級 (e.g. 1)
  hasWaypoint: boolean;     // 是否有傳送點
  hasTrial: boolean;        // 是否有昇華試煉
  isPassivePoint: boolean;  // 是否有必解天賦點
  hasPantheon?: boolean;    // 是否為萬神殿神力 (Act 6~10)
  mainObjective: string;    // 核心推進目標
  tips?: string;            // 地形特徵與走法技巧
  rewards?: QuestReward[];  // 該步驟或任務獎勵推薦
}

export interface ActCheckpoint {
  title: string;
  description: string;
  category: 'resistance' | 'gem_links' | 'bandits' | 'ascendancy' | 'gear';
}

export interface ActData {
  act: number;              // 1 ~ 10
  title: string;            // 章節名稱
  recommendedLevel: string; // 建議角色等級 (e.g. "Lv 1 ~ 12")
  townName: string;         // 該章主城 (e.g. "獅眼守望 (Lioneye's Watch)")
  banditRecommendation?: string; // 盜賊選擇推薦 (Act 2)
  ascendancyAdvice?: string;     // 昇華迷宮試煉提醒
  checkpoints: ActCheckpoint[];  // 本章重要檢查點
  steps: ActStep[];              // 地圖路線步驟清單
}
