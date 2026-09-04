import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadPriceAlertRules,
  savePriceAlertRules,
  DEFAULT_PRICE_ALERT_RULES
} from '../priceAlertStorage';
import type { PriceAlertRule } from '../../../domain/priceTrend/types';

describe('priceAlertStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('loads default rules when storage is empty', () => {
    const rules = loadPriceAlertRules();
    expect(rules).toEqual(DEFAULT_PRICE_ALERT_RULES);
    expect(rules.length).toBeGreaterThan(0);
  });

  it('saves and reloads custom alert rules', () => {
    const customRules: PriceAlertRule[] = [
      {
        id: 'custom-1',
        assetName: 'Headhunter (獵首)',
        condition: 'below',
        currency: 'divine',
        threshold: 25,
        enabled: true,
        createdAt: new Date().toISOString()
      }
    ];

    savePriceAlertRules(customRules);
    const loaded = loadPriceAlertRules();
    expect(loaded).toEqual(customRules);
  });

  it('filters out corrupted entries safely', () => {
    window.localStorage.setItem(
      'poe_tool_price_alerts_v1',
      JSON.stringify([{ invalid: true }, null, { id: 'valid-1', assetName: 'Mirror', condition: 'below', currency: 'divine', threshold: 500, enabled: true }])
    );
    const loaded = loadPriceAlertRules();
    expect(loaded.length).toBe(1);
    expect(loaded[0].id).toBe('valid-1');
  });

  it('allows user to clear all rules and returns empty array on reload', () => {
    savePriceAlertRules([]);
    const loaded = loadPriceAlertRules();
    expect(loaded).toEqual([]);
  });
});
