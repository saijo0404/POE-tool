import type { GameEngine } from './types';
import {
  FEATURE_CAPABILITIES
} from './capabilityDefinitions';
import type {
  FeatureId,
  FeatureCapability
} from './capabilityTypes';

export {
  FEATURE_CAPABILITIES
} from './capabilityDefinitions';
export type {
  FeatureId,
  FeatureCategory,
  FeatureCapability
} from './capabilityTypes';

export function isFeatureSupported(featureId: FeatureId, engine: GameEngine): boolean {
  const cap = FEATURE_CAPABILITIES[featureId];
  if (!cap) return false;
  return cap.supportedEngines.includes(engine);
}

export function getFeaturesForEngine(engine: GameEngine): FeatureCapability[] {
  return Object.values(FEATURE_CAPABILITIES).filter(cap =>
    cap.supportedEngines.includes(engine)
  );
}

export function getTabsForEngine(engine: GameEngine, focusMode = false): FeatureCapability[] {
  const allTabs = Object.values(FEATURE_CAPABILITIES).filter(c => c.isTab);
  if (!focusMode) {
    return allTabs;
  }
  return allTabs.filter(cap => cap.supportedEngines.includes(engine));
}

export function getEngineBadgeInfo(supportedEngines: readonly GameEngine[]): {
  label: string;
  variant: 'poe1' | 'poe2' | 'both';
} {
  const hasPoe1 = supportedEngines.includes('poe1');
  const hasPoe2 = supportedEngines.includes('poe2');
  if (hasPoe1 && hasPoe2) {
    return { label: '雙版本', variant: 'both' };
  }
  if (hasPoe2) {
    return { label: 'PoE 2', variant: 'poe2' };
  }
  return { label: 'PoE 1', variant: 'poe1' };
}
