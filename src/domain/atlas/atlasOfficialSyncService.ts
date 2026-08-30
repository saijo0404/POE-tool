import type { AtlasNode, AtlasNodeType, AtlasMechanicCategory } from './types';
import defaultOfficialNodes from './data/officialAtlasTree.json';

export const GGG_ATLASTREE_EXPORT_URL = 'https://raw.githubusercontent.com/grindinggear/atlastree-export/master/data.json';
export const ATLAS_CACHE_KEY = 'poe_official_atlas_tree_cache_v325';
export const ATLAS_SYNC_TIMESTAMP_KEY = 'poe_official_atlas_sync_time';

// Official PoE Orbit Radii from GGG fullscreen-atlas-skill-tree
export const OFFICIAL_ORBIT_RADII = [0, 82, 162, 335, 493, 662, 846];

// Official PoE Skills Per Orbit from GGG fullscreen-atlas-skill-tree
export const OFFICIAL_SKILLS_PER_ORBIT = [1, 6, 16, 16, 40, 72, 72];

// Official PoE Orbit Angles Mapping (in degrees)
export const OFFICIAL_ORBIT_ANGLES_BY_ORBIT: Record<number, number[]> = {
  0: [0],
  1: [0, 60, 120, 180, 240, 300],
  2: [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330],
  3: [0, 30, 45, 60, 90, 120, 135, 150, 180, 210, 225, 240, 270, 300, 315, 330],
  4: [
    0, 10, 20, 30, 40, 45, 50, 60, 70, 80, 90, 100, 110, 120, 130, 135, 140, 150,
    160, 170, 180, 190, 200, 210, 220, 225, 230, 240, 250, 260, 270, 280, 290,
    300, 310, 315, 320, 330, 340, 350
  ],
  5: Array.from({ length: 72 }, (_, i) => (i / 72) * 360),
  6: Array.from({ length: 72 }, (_, i) => (i / 72) * 360)
};

/**
 * Calculates exact angular placement (in degrees) for a node on a given orbit
 */
export function getNodeAngleDeg(orbit: number, orbitIndex: number): number {
  const angles = OFFICIAL_ORBIT_ANGLES_BY_ORBIT[orbit];
  if (angles && orbitIndex >= 0 && orbitIndex < angles.length) {
    return angles[orbitIndex];
  }
  const skillsCount = OFFICIAL_SKILLS_PER_ORBIT[orbit] || 1;
  return (orbitIndex / skillsCount) * 360;
}

// Traditional Chinese Translation Table for all Keystones & Key Notables
export const KEYSTONE_TRANSLATIONS: Record<string, string> = {
  // Official Atlas 27 Keystones
  'Arbitrary Tenets': '隨意教條 (Arbitrary Tenets)',
  'Wellspring of Creation': '造物之泉 (Wellspring of Creation)',
  'Gruelling Gauntlet': '艱難挑戰 (Gruelling Gauntlet)',
  'Dimensional Foothold': '次元立足點 (Dimensional Foothold)',
  'Extreme Archaeology': '極限考古 (Extreme Archaeology)',
  'The Paths Not Taken': '未擇之路 (The Paths Not Taken)',
  "Cassia's Pride": "卡西亞的自豪 (Cassia's Pride)",
  'Enemy at the Gates': '大敵當前 (Enemy at the Gates)',
  'Synthesised Stability': '憶境穩定 (Synthesised Stability)',
  'Eldritch Gaze': '古靈凝視 (Eldritch Gaze)',
  'Destructive Play': '破壞性競賽 (Destructive Play)',
  'Twist of Fate': '命運扭曲 (Twist of Fate)',
  'Immutable Dogma': '不變教條 (Immutable Dogma)',
  'Dance of Destruction': '毀滅之舞 (Dance of Destruction)',
  'Lucid Dreams': '清醒夢境 (Lucid Dreams)',
  'Unending Nightmare': '無盡夢魘 (Unending Nightmare)',
  "Refiner's Bargain": '精煉者的交易 (Refiner\'s Bargain)',
  'Timeless Conflict': '永恆之戰 (Timeless Conflict)',
  'Wrath of the Cosmos': '寰宇之怒 (Wrath of the Cosmos)',
  'Crop Rotation': '農作輪替 (Crop Rotation)',
  'Overloaded Circuits': '超載迴路 (Overloaded Circuits)',
  'Endless Tide': '無盡潮汐 (Endless Tide)',
  'Speaker of the Dead': '逝者之言 (Speaker of the Dead)',
  'Thorough Exploration': '徹底探索 (Thorough Exploration)',
  'Ruinous Wager': '毀滅賭注 (Ruinous Wager)',
  'Meticulous Appraiser': '嚴苛鑑價師 (Meticulous Appraiser)',
  'Unwavering Vision': '不屈之志 (Unwavering Vision)',

  // Additional / Classic Keystones
  'All Hands': '全員到齊 (All Hands)',
  'Singular Focus': '專注單一 (Singular Focus)',
  'The Seventh Gate': '第七道門 (The Seventh Gate)',
  'Stream of Consciousness': '意識流 (Stream of Consciousness)',
  'Bold Undertakings': '大膽嘗試 (Bold Undertakings)',
  'Overloaded Outposts': '超載前哨 (Overloaded Outposts)',
  'Wandering Path': '流浪之路 (Wandering Path)',
  'Grand Design': '大計畫 (Grand Design)',
  'Dance with Death': '與死共舞 (Dance with Death)',
  'Back to Basics': '回歸初衷 (Back to Basics)',
  'Unrelenting Torment': '無盡苦痛 (Unrelenting Torment)',

  // Key Notables
  'Conquer The Stones': '征服石圈 (Conquer The Stones)',
  'Vivid Memories': '生動記憶 (Vivid Memories)',
  'Prolific Essence': '豐產精髓 (Prolific Essence)',
  'Amplified Energies': '能量放大 (Amplified Energies)',
  'Heart of the Grove': '古樹之心 (Heart of the Grove)',
  'Ancient Decay': '遠古腐化 (Ancient Decay)',
  'Dimensional Barrier': '維度屏障 (Dimensional Barrier)',
  'Mighty Hunter': '強大獵手 (Mighty Hunter)',
  "Fortune's Favour": '命運眷顧 (Fortune\'s Favour)',
  'Drawn to Power': '汲取力量 (Drawn to Power)',
  'Sulphite Infusion': '赤藍注入 (Sulphite Infusion)',
  'The Singular Eternity': '單一永恆 (The Singular Eternity)',
  'Yield Upon Yield': '產量豐饒 (Yield Upon Yield)',
  'Sturdy Construction': '堅固構造 (Sturdy Construction)',
  'Harrowing Carapaces': '可怖甲殼 (Harrowing Carapaces)',
  'Time Dilation': '時間膨脹 (Time Dilation)',
  'Prove Yourself Worthy': '證明實力 (Prove Yourself Worthy)',
  'Fiendish Opulence': '邪靈富裕 (Fiendish Opulence)',
  'A Noble Quest': '崇高任務 (A Noble Quest)',
  'Emblematic': '象徵標誌 (Emblematic)'
};

// Mechanic Category Classification Helper
export function detectMechanicCategory(name: string, stats: string[], icon?: string): AtlasMechanicCategory {
  const combined = `${name} ${stats.join(' ')} ${icon || ''}`.toLowerCase();

  if (combined.includes('essence') || combined.includes('精髓') || combined.includes('shrieking') || combined.includes('remnant')) {
    return 'essence';
  }
  if (combined.includes('strongbox') || combined.includes('ambush') || combined.includes('伏擊') || combined.includes('arcanist') || combined.includes('diviner')) {
    return 'ambush';
  }
  if (combined.includes('harvest') || combined.includes('lifeforce') || combined.includes('莊園') || combined.includes('crop') || combined.includes('oshabi') || combined.includes('sacred grove')) {
    return 'harvest';
  }
  if (combined.includes('expedition') || combined.includes('探險') || combined.includes('logbook') || combined.includes('runic') || combined.includes('dannig') || combined.includes('tujen') || combined.includes('gwennen') || combined.includes('rog')) {
    return 'expedition';
  }
  if (combined.includes('delirium') || combined.includes('譫妄') || combined.includes('simulacrum') || combined.includes('mirror of delirium') || combined.includes('cluster jewel')) {
    return 'delirium';
  }
  if (combined.includes('ritual') || combined.includes('祭祀') || combined.includes('tribute') || combined.includes('blood-filled')) {
    return 'ritual';
  }
  if (combined.includes('breach') || combined.includes('裂痕') || combined.includes('chayula') || combined.includes('breachstone') || combined.includes('clasped hand')) {
    return 'breach';
  }
  if (combined.includes('legion') || combined.includes('軍團') || combined.includes('timeless') || combined.includes('emblem') || combined.includes('maraketh') || combined.includes('templar')) {
    return 'legion';
  }
  if (combined.includes('beyond') || combined.includes('超越') || combined.includes('scourge') || combined.includes('demon') || combined.includes('tainted')) {
    return 'beyond';
  }
  if (combined.includes('blight') || combined.includes('枯萎') || combined.includes('cassia') || combined.includes('oil') || combined.includes('pump') || combined.includes('blighted map')) {
    return 'blight';
  }
  if (combined.includes('scarab') || combined.includes('聖甲蟲') || combined.includes('甲蟲')) {
    return 'scarab';
  }
  if (combined.includes('maven') || combined.includes('eater of worlds') || combined.includes('searing exarch') || combined.includes('eldritch') || combined.includes('boss') || combined.includes('首領') || combined.includes('conqueror') || combined.includes('guardian') || combined.includes('shaper') || combined.includes('elder') || combined.includes('invitation') || combined.includes('cortex')) {
    return 'boss';
  }
  if (combined.includes('einhar') || combined.includes('bestiary') || combined.includes('beast') || combined.includes('獵魔') || combined.includes('red beast')) {
    return 'bestiary';
  }
  if (combined.includes('torment') || combined.includes('苦痛') || combined.includes('spirit') || combined.includes('possess') || combined.includes('seance')) {
    return 'torment';
  }
  if (combined.includes('map') || combined.includes('地圖') || combined.includes('tier') || combined.includes('kirac') || combined.includes('scouting report') || combined.includes('adjacent') || combined.includes('connected map')) {
    return 'map';
  }

  return 'general';
}

export interface RawGggNodeGroup {
  x: number;
  y: number;
  orbits?: number[];
  nodes?: (string | number)[];
}

export interface RawGggNode {
  skill?: number;
  name?: string;
  icon?: string;
  isKeystone?: boolean;
  isNotable?: boolean;
  stats?: string[];
  reminderText?: string[];
  group?: number | string;
  orbit?: number;
  orbitIndex?: number;
  out?: (string | number)[];
  in?: (string | number)[];
}

export interface RawGggAtlasTreeData {
  tree?: string;
  groups: Record<string, RawGggNodeGroup>;
  nodes: Record<string, RawGggNode>;
}

/**
 * Parses raw official GGG Atlas Tree JSON and transforms into 1:1 AtlasNode[]
 */
export function parseOfficialGggData(rawGggJson: RawGggAtlasTreeData | unknown, scaleFactor: number = 0.22): AtlasNode[] {
  if (!rawGggJson || typeof rawGggJson !== 'object' || !('groups' in rawGggJson) || !('nodes' in rawGggJson)) {
    throw new Error('無效的 GGG 官方輿圖天賦 JSON 格式');
  }

  const gggData = rawGggJson as RawGggAtlasTreeData;
  const groups = gggData.groups;
  const nodesDict = gggData.nodes;
  const parsedNodes: AtlasNode[] = [];

  // Process all official nodes
  Object.keys(nodesDict).forEach(nodeIdStr => {
    if (nodeIdStr === 'root') return;
    const rawNode = nodesDict[nodeIdStr];
    if (!rawNode) return;

    const group = groups[String(rawNode.group)];
    if (!group) return;

    const orbit = rawNode.orbit ?? 0;
    const orbitIndex = rawNode.orbitIndex ?? 0;
    const radius = OFFICIAL_ORBIT_RADII[orbit] ?? 0;
    const angleDeg = getNodeAngleDeg(orbit, orbitIndex);
    const rad = (angleDeg * Math.PI) / 180;

    // Exact official trigonometric position: 0 deg is UP (negative Y), 90 deg is RIGHT (positive X)
    const rawX = group.x + radius * Math.sin(rad);
    const rawY = group.y - radius * Math.cos(rad);

    const x = Math.round(rawX * scaleFactor * 10) / 10;
    const y = Math.round(rawY * scaleFactor * 10) / 10;

    const numId = Number(rawNode.skill || nodeIdStr) || Number(nodeIdStr) || 0;
    let nameEn = rawNode.name || '';
    if (!nameEn && nodeIdStr === '29045') {
      nameEn = 'Atlas Origin';
    } else if (!nameEn) {
      nameEn = `Atlas Node ${nodeIdStr}`;
    }

    let name = KEYSTONE_TRANSLATIONS[nameEn] || nameEn;
    if (nodeIdStr === '29045') {
      name = '輿圖起點 (Atlas Origin)';
    }

    let type: AtlasNodeType = 'small';
    if (rawNode.isKeystone) {
      type = 'keystone';
    } else if (rawNode.isNotable) {
      type = 'notable';
    } else if (nodeIdStr === '29045') {
      type = 'start';
    }

    const stats: string[] = Array.isArray(rawNode.stats) ? rawNode.stats : [];
    const category = detectMechanicCategory(nameEn, stats, rawNode.icon);

    // Build bidirectional connections
    const connectionsSet = new Set<string>();
    (rawNode.out || []).forEach((tId: string | number) => connectionsSet.add(String(tId)));
    (rawNode.in || []).forEach((sId: string | number) => connectionsSet.add(String(sId)));

    parsedNodes.push({
      id: String(nodeIdStr),
      numId,
      name,
      nameEn,
      type,
      category,
      description: rawNode.reminderText ? rawNode.reminderText.join('\n') : '',
      stats,
      x,
      y,
      connections: Array.from(connectionsSet),
      icon: rawNode.icon || (nodeIdStr === '29045' ? '🏛️' : undefined)
    });
  });

  return parsedNodes;
}

/**
 * Fetch and auto-update latest Atlas Tree from GGG official GitHub repository
 */
export async function syncOfficialAtlasTree(): Promise<{ success: boolean; nodeCount: number; message: string }> {
  try {
    const response = await fetch(GGG_ATLASTREE_EXPORT_URL, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-cache'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const rawJson = await response.json();
    const parsed = parseOfficialGggData(rawJson);

    if (parsed.length < 500) {
      throw new Error(`解析節點數異常 (${parsed.length} 個節點)`);
    }

    const serialized = JSON.stringify(parsed);
    localStorage.setItem(ATLAS_CACHE_KEY, serialized);
    localStorage.setItem(ATLAS_SYNC_TIMESTAMP_KEY, new Date().toISOString());

    return {
      success: true,
      nodeCount: parsed.length,
      message: `✨ 已成功自 GGG 官方同步最新聯盟輿圖天賦樹 (${parsed.length} 個節點)！`
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      nodeCount: defaultOfficialNodes.length,
      message: `同步失敗 (${errorMsg})，已自動切換為本地離線打包資料。`
    };
  }
}

/**
 * Load Atlas Tree nodes with cache-first strategy
 */
export function loadCachedAtlasTreeData(): AtlasNode[] {
  try {
    const cached = localStorage.getItem(ATLAS_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed) && parsed.length > 500) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return defaultOfficialNodes as AtlasNode[];
}

export function getAtlasTreeLastSyncTime(): string | null {
  try {
    return localStorage.getItem(ATLAS_SYNC_TIMESTAMP_KEY);
  } catch {
    return null;
  }
}
