import React from 'react';
import { usePriceTrends } from '../../hooks/usePriceTrends';
import { PriceTrendChart } from './PriceTrendChart';
import { PriceTrendAssetList } from './PriceTrendAssetList';
import { PriceAlertModal } from './PriceAlertModal';
import { TrendingUp, Bell, Flame, CheckCircle } from 'lucide-react';
import { formatTrendPercentage } from '../../domain/priceTrend/trendCalculator';

interface PriceTrendHubProps {
  league?: string;
  divineRate?: number;
  onShowToast?: (msg: string) => void;
}

export const PriceTrendHub: React.FC<PriceTrendHubProps> = ({
  league = 'Settlers',
  divineRate = 150,
  onShowToast
}) => {
  const {
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
    topVolatileAssets,
    evaluateAlerts,
    handleAddAlertRule,
    handleToggleAlertRule,
    handleDeleteAlertRule
  } = usePriceTrends({ league, divineRate, onShowToast });

  const activeAlertCount = alertRules.filter(r => r.enabled).length;

  const handleCheckAlerts = () => {
    const triggers = evaluateAlerts();
    if (triggers.length === 0) {
      onShowToast?.('✅ 價格檢查完畢：目前所有高價資產價格均未觸發警報門檻。');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Top Banner & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="poe-font" style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--border-gold)" /> 高價值資產價格走勢與波動預警
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            7~14 天歷史市場曲線、24h/7d 價格波動率精算與自訂價格推播 (當前匯率：1D = {divineRate}C)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={handleCheckAlerts}
            className="poe-button-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '6px 12px' }}
          >
            <CheckCircle size={14} color="var(--accent-green)" /> 立即檢查價格
          </button>
          <button
            type="button"
            onClick={() => setIsAlertModalOpen(true)}
            className="poe-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '6px 14px' }}
          >
            <Bell size={14} /> 自訂價格警報 ({activeAlertCount})
          </button>
        </div>
      </div>

      {/* Volatile Assets Spotlight Banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '8px 14px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b', fontSize: '0.78rem', fontWeight: 600, whiteSpace: 'nowrap' }}>
          <Flame size={14} /> 24h 急遽波動資產：
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', overflowX: 'auto' }}>
          {topVolatileAssets.map(item => (
            <div
              key={item.id}
              onClick={() => setSelectedAssetId(item.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', cursor: 'pointer', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'var(--bg-card)' }}
            >
              <span style={{ color: 'var(--text-bright)' }}>{item.name.split(' ')[0]}</span>
              <span style={{ fontWeight: 600, color: item.change24hPercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {formatTrendPercentage(item.change24hPercent)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: List on Left, Chart on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.35fr', gap: '16px' }}>
        <PriceTrendAssetList
          assets={filteredAssets}
          selectedId={selectedAssetId}
          onSelect={setSelectedAssetId}
          categoryFilter={categoryFilter}
          onSelectCategory={setCategoryFilter}
          currencyMode={currencyMode}
        />

        <PriceTrendChart
          asset={selectedAsset}
          currencyMode={currencyMode}
          onToggleCurrency={setCurrencyMode}
        />
      </div>

      <PriceAlertModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        rules={alertRules}
        assets={assets}
        onAddRule={handleAddAlertRule}
        onToggleRule={handleToggleAlertRule}
        onDeleteRule={handleDeleteAlertRule}
      />
    </div>
  );
};
