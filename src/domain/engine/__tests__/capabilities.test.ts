import { describe, it, expect } from 'vitest';
import {
  isFeatureSupported,
  getFeaturesForEngine,
  getTabsForEngine,
  getEngineBadgeInfo,
  FEATURE_CAPABILITIES,
  type FeatureId
} from '../capabilities';

describe('capabilities domain logic', () => {
  describe('isFeatureSupported', () => {
    it('returns true for common features in both engines', () => {
      expect(isFeatureSupported('price', 'poe1')).toBe(true);
      expect(isFeatureSupported('price', 'poe2')).toBe(true);
      expect(isFeatureSupported('exchange', 'poe1')).toBe(true);
      expect(isFeatureSupported('exchange', 'poe2')).toBe(true);
    });

    it('returns true for PoE 1 exclusive features only on poe1', () => {
      expect(isFeatureSupported('atlas', 'poe1')).toBe(true);
      expect(isFeatureSupported('atlas', 'poe2')).toBe(false);

      expect(isFeatureSupported('craft', 'poe1')).toBe(true);
      expect(isFeatureSupported('craft', 'poe2')).toBe(false);

      expect(isFeatureSupported('scarabs', 'poe1')).toBe(true);
      expect(isFeatureSupported('scarabs', 'poe2')).toBe(false);
    });

    it('returns true for PoE 2 exclusive features only on poe2', () => {
      expect(isFeatureSupported('dualSpec', 'poe1')).toBe(false);
      expect(isFeatureSupported('dualSpec', 'poe2')).toBe(true);

      expect(isFeatureSupported('spiritReservation', 'poe1')).toBe(false);
      expect(isFeatureSupported('spiritReservation', 'poe2')).toBe(true);

      expect(isFeatureSupported('runes', 'poe1')).toBe(false);
      expect(isFeatureSupported('runes', 'poe2')).toBe(true);
    });

    it('returns false for invalid feature id', () => {
      expect(isFeatureSupported('invalid_id' as FeatureId, 'poe1')).toBe(false);
    });
  });

  describe('getFeaturesForEngine', () => {
    it('filters all capabilities for poe1', () => {
      const poe1Features = getFeaturesForEngine('poe1');
      expect(poe1Features.every(f => f.supportedEngines.includes('poe1'))).toBe(true);
      expect(poe1Features.some(f => f.id === 'atlas')).toBe(true);
      expect(poe1Features.some(f => f.id === 'dualSpec')).toBe(false);
    });

    it('filters all capabilities for poe2', () => {
      const poe2Features = getFeaturesForEngine('poe2');
      expect(poe2Features.every(f => f.supportedEngines.includes('poe2'))).toBe(true);
      expect(poe2Features.some(f => f.id === 'dualSpec')).toBe(true);
      expect(poe2Features.some(f => f.id === 'atlas')).toBe(false);
    });
  });

  describe('getTabsForEngine', () => {
    it('returns all tabs when focusMode is false', () => {
      const tabs = getTabsForEngine('poe2', false);
      const totalTabs = Object.values(FEATURE_CAPABILITIES).filter(c => c.isTab);
      expect(tabs.length).toBe(totalTabs.length);
    });

    it('filters out unsupported tabs when focusMode is true for poe2', () => {
      const poe2FocusTabs = getTabsForEngine('poe2', true);
      const tabIds = poe2FocusTabs.map(t => t.id);

      expect(tabIds).toContain('price');
      expect(tabIds).toContain('exchange');
      expect(tabIds).toContain('wealth');
      expect(tabIds).not.toContain('atlas');
      expect(tabIds).not.toContain('craft');
    });

    it('retains poe1 tabs when focusMode is true for poe1', () => {
      const poe1FocusTabs = getTabsForEngine('poe1', true);
      const tabIds = poe1FocusTabs.map(t => t.id);

      expect(tabIds).toContain('atlas');
      expect(tabIds).toContain('craft');
      expect(tabIds).toContain('price');
    });
  });

  describe('getEngineBadgeInfo', () => {
    it('returns correct label and variant for both engines', () => {
      expect(getEngineBadgeInfo(['poe1', 'poe2'])).toEqual({
        label: '雙版本',
        variant: 'both'
      });
    });

    it('returns correct label and variant for poe1 only', () => {
      expect(getEngineBadgeInfo(['poe1'])).toEqual({
        label: 'PoE 1',
        variant: 'poe1'
      });
    });

    it('returns correct label and variant for poe2 only', () => {
      expect(getEngineBadgeInfo(['poe2'])).toEqual({
        label: 'PoE 2',
        variant: 'poe2'
      });
    });
  });
});
