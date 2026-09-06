import type { GameEngine } from './types';

export type FeatureCategory = 'core' | 'trade' | 'wealth' | 'progression' | 'endgame' | 'crafting';

export type FeatureId =
  | 'dashboard'
  | 'price'
  | 'exchange'
  | 'wealth'
  | 'mapping'
  | 'build'
  | 'acts'
  | 'atlas'
  | 'mapmod'
  | 'craft'
  | 'dualSpec'
  | 'spiritReservation'
  | 'runes'
  | 'waystones'
  | 'uncutGems'
  | 'scarabs'
  | 'bestiary'
  | 'blight'
  | 'timelessJewels'
  | 'sanctum'
  | 'tradeWhisper'
  | 'overlay';

export interface FeatureCapability {
  readonly id: FeatureId;
  readonly name: string;
  readonly description: string;
  readonly supportedEngines: readonly GameEngine[];
  readonly category: FeatureCategory;
  readonly isTab: boolean;
  readonly poe2Alternative?: string;
}
