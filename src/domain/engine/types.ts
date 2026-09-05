export type GameEngine = 'poe1' | 'poe2';

export type EngineMode = 'auto' | 'manual';

export interface GameEngineFeatures {
  readonly spirit: boolean;
  readonly weaponSets: boolean;
  readonly socketsOnGems: boolean;
  readonly uncutGems: boolean;
  readonly goldEconomy: boolean;
  readonly runes: boolean;
  readonly waystones: boolean;
}

export interface GameEngineInfo {
  readonly id: GameEngine;
  readonly name: string;
  readonly shortName: string;
  readonly executablePatterns: readonly string[];
  readonly windowTitlePatterns: readonly string[];
  readonly defaultTradeLeague: string;
  readonly features: GameEngineFeatures;
}

export const ENGINE_METADATA: Record<GameEngine, GameEngineInfo> = {
  poe1: {
    id: 'poe1',
    name: 'Path of Exile 1',
    shortName: 'PoE 1',
    executablePatterns: [
      'pathofexile.exe',
      'pathofexile_x64.exe',
      'pathofexilesteam.exe',
      'pathofexile_x64steam.exe'
    ],
    windowTitlePatterns: ['Path of Exile'],
    defaultTradeLeague: 'Standard',
    features: {
      spirit: false,
      weaponSets: false,
      socketsOnGems: false,
      uncutGems: false,
      goldEconomy: false,
      runes: false,
      waystones: false
    }
  },
  poe2: {
    id: 'poe2',
    name: 'Path of Exile 2',
    shortName: 'PoE 2',
    executablePatterns: [
      'pathofexile2.exe',
      'pathofexile2_x64.exe',
      'pathofexile2steam.exe',
      'pathofexile2_x64steam.exe'
    ],
    windowTitlePatterns: ['Path of Exile 2'],
    defaultTradeLeague: 'Standard',
    features: {
      spirit: true,
      weaponSets: true,
      socketsOnGems: true,
      uncutGems: true,
      goldEconomy: true,
      runes: true,
      waystones: true
    }
  }
};

export function isEngineFeatureSupported(
  engine: GameEngine,
  feature: keyof GameEngineFeatures
): boolean {
  return ENGINE_METADATA[engine]?.features[feature] ?? false;
}
