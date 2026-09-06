import { useGameEngine } from './useGameEngine';
import { isFeatureSupported, type FeatureId } from '../domain/engine/capabilities';

export function useFeatureEnabled(featureId: FeatureId): boolean {
  const { currentEngine } = useGameEngine();
  return isFeatureSupported(featureId, currentEngine);
}
