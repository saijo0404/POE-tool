import type {
  PlayerDefensiveProfile,
  WaystoneEvaluation,
  MatchedWaystoneMod,
  WaystoneRiskLevel,
  WaystoneModDefinition
} from './types';
import { WAYSTONE_MODS_CATALOG, DEFAULT_PLAYER_PROFILE } from './waystoneModsCatalog';
import { parseWaystone, type ParsedWaystoneData } from './waystoneParser';

function matchModDefinition(line: string): WaystoneModDefinition | undefined {
  const lower = line.toLowerCase();
  return WAYSTONE_MODS_CATALOG.find(def => {
    const zhMatch = def.matchPatternsZh.some(p => line.includes(p));
    const enMatch = def.matchPatternsEn.some(p => lower.includes(p.toLowerCase()));
    return zhMatch || enMatch;
  });
}

function adjustRiskForPlayer(
  def: WaystoneModDefinition,
  player: PlayerDefensiveProfile
): { risk: WaystoneRiskLevel; reason?: string } {
  if (def.id === 'extra_chaos') {
    if (player.chaosRes < 0) {
      return { risk: 'fatal', reason: `混沌抗性 (${player.chaosRes}%) 為負值，此詞綴極易造成瞬間猝死！` };
    }
    if (player.chaosRes >= 70) {
      return { risk: 'caution', reason: `混沌抗性達標 (${player.chaosRes}%)，威脅大幅降低` };
    }
  }

  if (def.id === 'cannot_leech') {
    if (player.recoveryMechanism === 'leech') {
      return { risk: 'fatal', reason: '流派完全依賴偷取 (Leech) 維持生存，無法偷取將導致續航中斷' };
    }
    return { risk: 'caution', reason: '非依賴偷取流派，威脅有限' };
  }

  if (def.id === 'reduced_recovery') {
    if (player.recoveryMechanism === 'regen' || player.recoveryMechanism === 'recharge') {
      return { risk: 'fatal', reason: '流派依賴秒回/充能機制，大幅降低回復將使生存能力驟降' };
    }
    return { risk: 'warning', reason: '回復減緩，需注意持久戰生命消耗' };
  }

  if (def.id === 'ele_penetration') {
    return { risk: 'fatal', reason: '怪物穿透元素抗性將無視部分防護，為全流派最高危險詞綴' };
  }

  return { risk: def.baseRisk };
}

function calculateSafetyScore(mods: MatchedWaystoneMod[]): number {
  let score = 100;
  for (const m of mods) {
    if (m.adjustedRisk === 'fatal') score -= 35;
    else if (m.adjustedRisk === 'warning') score -= 15;
    else if (m.adjustedRisk === 'caution') score -= 5;
  }
  return Math.max(0, Math.min(100, score));
}

function determineOverallRisk(fatals: number, warnings: number, score: number): WaystoneRiskLevel {
  if (fatals > 0) return 'fatal';
  if (warnings >= 2 || score < 60) return 'warning';
  if (warnings === 1 || score < 95) return 'caution';
  return 'safe';
}

function generateSuggestions(fatals: number, warnings: number, mods: MatchedWaystoneMod[]): string[] {
  const suggestions: string[] = [];
  if (fatals > 0) {
    suggestions.push(`⚠️ 檢測到 ${fatals} 條致命詞綴，強烈建議使用重鑄石或混沌石洗掉後再開圖。`);
  }
  for (const m of mods) {
    if (m.riskReason && m.adjustedRisk === 'fatal') {
      suggestions.push(`• 【${m.definition.nameZh}】：${m.riskReason}`);
    }
  }
  if (warnings > 0 && fatals === 0) {
    suggestions.push(`⚠️ 包含 ${warnings} 條中高危險詞綴，建議攜帶減傷藥劑與提高走位謹慎度。`);
  }
  if (suggestions.length === 0) {
    suggestions.push('✅ 此銘刻地圖詞綴安全，適合高速刷圖與拓荒升級！');
  }
  return suggestions;
}

export function evaluateWaystone(
  input: string | ParsedWaystoneData,
  playerProfile: PlayerDefensiveProfile = DEFAULT_PLAYER_PROFILE
): WaystoneEvaluation {
  const parsed = typeof input === 'string' ? parseWaystone(input) : input;
  const matchedMods: MatchedWaystoneMod[] = [];

  for (const rawLine of parsed.rawMods) {
    const def = matchModDefinition(rawLine);
    if (def) {
      const { risk, reason } = adjustRiskForPlayer(def, playerProfile);
      matchedMods.push({
        definition: def,
        rawText: rawLine,
        adjustedRisk: risk,
        riskReason: reason
      });
    }
  }

  const fatalCount = matchedMods.filter(m => m.adjustedRisk === 'fatal').length;
  const warningCount = matchedMods.filter(m => m.adjustedRisk === 'warning').length;
  const safetyScore = calculateSafetyScore(matchedMods);
  const overallRiskLevel = determineOverallRisk(fatalCount, warningCount, safetyScore);
  const suggestions = generateSuggestions(fatalCount, warningCount, matchedMods);

  return {
    isWaystone: parsed.isWaystone,
    tier: parsed.tier,
    rarity: parsed.rarity,
    itemQuantity: parsed.itemQuantity,
    itemRarity: parsed.itemRarity,
    waystoneDropChance: parsed.waystoneDropChance,
    mods: matchedMods,
    safetyScore,
    overallRiskLevel,
    fatalCount,
    warningCount,
    suggestions
  };
}
