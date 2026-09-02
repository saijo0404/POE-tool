export type MapDangerSeverity = 'deadly' | 'dangerous' | 'warning';

export type MapDangerCategory =
  | 'reflect'
  | 'recovery'
  | 'defense'
  | 'monster_buff'
  | 'curse'
  | 'other';

export interface MapDangerModDefinition {
  id: string;
  nameZh: string;
  nameEn: string;
  category: MapDangerCategory;
  severity: MapDangerSeverity;
  descriptionZh: string;
  descriptionEn: string;
  /** Patterns to match in item mods (case-insensitive substring or regex) */
  matchPatternsZh: string[];
  matchPatternsEn: string[];
  /** Compact token for PoE in-game regex search bar */
  regexTokenZh: string;
  regexTokenEn: string;
}

export interface BuildArchetypePreset {
  id: string;
  nameZh: string;
  nameEn: string;
  icon: string;
  descriptionZh: string;
  descriptionEn: string;
  defaultBlacklistIds: string[];
}

export interface MapDangerConfig {
  blacklistedModIds: string[];
  customKeywords: string[];
  soundAlertEnabled: boolean;
  visualAlertEnabled: boolean;
  activePresetId?: string;
}

export interface MatchedDangerMod {
  def: MapDangerModDefinition;
  matchedLine: string;
  modType: 'implicit' | 'explicit' | 'custom';
}

export interface MapDangerEvaluation {
  isMap: boolean;
  hasDanger: boolean;
  matchedDangerMods: MatchedDangerMod[];
  matchedCustomKeywords: string[];
  dangerScore: number;
  totalModsCount: number;
  mapTier?: number;
}

export interface MapRegexOptions {
  minQuantity?: number;
  minPackSize?: number;
  minQuality?: number;
  excludeModIds: string[];
  language: 'zh' | 'en';
  customExcludeRegex?: string;
  matchAll?: boolean;
}

export interface MapRegexResult {
  regexString: string;
  length: number;
  isWithinLimit: boolean;
  subRegexes?: string[];
}
