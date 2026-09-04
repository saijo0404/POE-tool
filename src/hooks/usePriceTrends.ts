import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import type { AssetTrend, AssetCategory, PriceAlertRule, PriceAlertTrigger, AlertConditionType, AlertCurrencyType } from '../domain/priceTrend/types';
import { getDefaultTrackedAssets } from '../domain/priceTrend/defaultAssets';
import { checkPriceAlert } from '../domain/priceTrend/trendCalculator';
import { loadPriceAlertRules, savePriceAlertRules } from '../infrastructure/storage/priceAlertStorage';
import { playPriceAlertSound } from '../application/audio/priceAlertSound';

interface UsePriceTrendsOptions {
  league?: string;
  divineRate?: number;
  onShowToast?: (msg: string) => void;
  soundAlertEnabled?: boolean;
}

export function usePriceTrends(options: UsePriceTrendsOptions = {}) {
  const { divineRate = 150, onShowToast, soundAlertEnabled = true } = options;

  const [assets, setAssets] = useState<AssetTrend[]>(() => getDefaultTrackedAssets(divineRate));
  const [categoryFilter, setCategoryFilter] = useState<'all' | AssetCategory>('all');
  const [selectedAssetId, setSelectedAssetId] = useState<string>('mageblood');
  const [currencyMode, setCurrencyMode] = useState<'chaos' | 'divine'>('divine');
  const [alertRules, setAlertRules] = useState<PriceAlertRule[]>(() => loadPriceAlertRules());
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [lastTriggeredAlert, setLastTriggeredAlert] = useState<PriceAlertTrigger | null>(null);

  // Update assets when divineRate changes
  useEffect(() => {
    setAssets(getDefaultTrackedAssets(divineRate));
  }, [divineRate]);

  // Persist alert rules
  useEffect(() => {
    savePriceAlertRules(alertRules);
  }, [alertRules]);

  const filteredAssets = useMemo(() => {
    if (categoryFilter === 'all') return assets;
    return assets.filter(a => a.category === categoryFilter);
  }, [assets, categoryFilter]);

  const selectedAsset = useMemo(() => {
    return assets.find(a => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  const topVolatileAssets = useMemo(() => {
    return [...assets].sort((a, b) => Math.abs(b.change24hPercent) - Math.abs(a.change24hPercent)).slice(0, 3);
  }, [assets]);

  const hasTriggeredRef = useRef<Record<string, boolean>>({});

  const evaluateAlerts = useCallback(() => {
    const triggers: PriceAlertTrigger[] = [];
    alertRules.forEach(rule => {
      if (!rule.enabled) return;
      const target = assets.find(a => a.name.includes(rule.assetName) || rule.assetName.includes(a.name));
      if (!target) return;

      const matched = checkPriceAlert(rule, target.currentPriceChaos, target.currentPriceDivine);
      if (matched && !hasTriggeredRef.current[rule.id]) {
        hasTriggeredRef.current[rule.id] = true;
        const currentVal = rule.currency === 'divine' ? target.currentPriceDivine : target.currentPriceChaos;
        const symbol = rule.currency === 'divine' ? 'D' : 'C';
        const condText = rule.condition === 'below' ? '低於' : '突破';
        const msg = `🔔 價格警報：${rule.assetName} 當前單價 ${currentVal} ${symbol}，已${condText}設定門檻 ${rule.threshold} ${symbol}！`;

        const trigger: PriceAlertTrigger = {
          rule,
          currentValue: currentVal,
          message: msg,
          triggeredAt: new Date().toISOString()
        };
        triggers.push(trigger);
        setLastTriggeredAlert(trigger);

        if (soundAlertEnabled) {
          playPriceAlertSound();
        }
        onShowToast?.(msg);
      }
    });
    return triggers;
  }, [alertRules, assets, soundAlertEnabled, onShowToast]);

  const handleAddAlertRule = useCallback((
    assetName: string,
    condition: AlertConditionType,
    currency: AlertCurrencyType,
    threshold: number
  ) => {
    const newRule: PriceAlertRule = {
      id: `rule-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      assetName,
      condition,
      currency,
      threshold,
      enabled: true,
      createdAt: new Date().toISOString()
    };
    setAlertRules(prev => [newRule, ...prev]);
    onShowToast?.(`✅ 已新增 ${assetName} 價格警報規則！`);
  }, [onShowToast]);

  const handleToggleAlertRule = useCallback((id: string) => {
    setAlertRules(prev => prev.map(r => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }, []);

  const handleDeleteAlertRule = useCallback((id: string) => {
    setAlertRules(prev => prev.filter(r => r.id !== id));
    delete hasTriggeredRef.current[id];
    onShowToast?.('🗑️ 已移除該項價格警報規則。');
  }, [onShowToast]);

  return {
    assets,
    filteredAssets,
    selectedAsset,
    selectedAssetId,
    setSelectedAssetId,
    categoryFilter,
    setCategoryFilter,
    currencyMode,
    setCurrencyMode,
    alertRules,
    isAlertModalOpen,
    setIsAlertModalOpen,
    lastTriggeredAlert,
    topVolatileAssets,
    evaluateAlerts,
    handleAddAlertRule,
    handleToggleAlertRule,
    handleDeleteAlertRule
  };
}
