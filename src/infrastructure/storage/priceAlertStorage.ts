import type { PriceAlertRule } from '../../domain/priceTrend/types';

const STORAGE_KEY = 'poe_tool_price_alerts_v1';

export const DEFAULT_PRICE_ALERT_RULES: PriceAlertRule[] = [
  {
    id: 'default-mb-low',
    assetName: 'Mageblood (魔血)',
    condition: 'below',
    currency: 'divine',
    threshold: 120,
    enabled: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'default-div-high',
    assetName: 'Divine Orb (神聖石)',
    condition: 'above',
    currency: 'chaos',
    threshold: 220,
    enabled: true,
    createdAt: new Date().toISOString()
  }
];

export function loadPriceAlertRules(): PriceAlertRule[] {
  if (typeof window === 'undefined') return DEFAULT_PRICE_ALERT_RULES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PRICE_ALERT_RULES;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_PRICE_ALERT_RULES;
    return parsed.filter(item => item && item.id && item.assetName && item.threshold > 0);
  } catch {
    return DEFAULT_PRICE_ALERT_RULES;
  }
}

export function savePriceAlertRules(rules: PriceAlertRule[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
  } catch (err) {
    console.warn('[PriceAlertStorage] Failed to save rules:', err);
  }
}
