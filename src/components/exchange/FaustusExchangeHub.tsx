import React, { useState } from 'react';
import { RefreshCw, Search, Sparkles, TrendingUp } from 'lucide-react';
import { useFaustusExchange } from '../../hooks/useFaustusExchange';
import { EXCHANGE_CATEGORIES } from '../../domain/exchange/constants';
import { CurrencyMatrixWidget } from './CurrencyMatrixWidget';
import { GoldCalculatorWidget } from './GoldCalculatorWidget';
import { ArbitrageOpportunityPanel } from './ArbitrageOpportunityPanel';
import { ExchangeOrderBookTable } from './ExchangeOrderBookTable';
import { PriceTrendHub } from '../priceTrend/PriceTrendHub';

interface FaustusExchangeHubProps {
  league?: string;
  onShowToast?: (msg: string) => void;
}

export const FaustusExchangeHub: React.FC<FaustusExchangeHubProps> = ({ league = 'Settlers', onShowToast }) => {
  const [activeView, setActiveView] = useState<'exchange' | 'trends'>('exchange');
  const {
    marketData,
    loading,
    error,
    filter,
    setFilter,
    filteredItems,
    arbitrageOpportunities,
    rates,
    refresh,
    selectedItemForGoldCalc,
    setSelectedItemForGoldCalc,
    goldCalcQuantity,
    setGoldCalcQuantity,
    goldFeeCalculation,
  } = useFaustusExchange({ league });

  const handleRefresh = async () => {
    await refresh();
    onShowToast?.('🔄 Faustus 交易所即時行情與套利資料已更新！');
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="poe-font" style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#f1c40f" />
            Faustus 官方黑市大宗通貨交易所
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            PoE 3.25+ 訂單簿即時行情、金幣手續費精算與跨市場套利分析 (聯盟：{league})
          </span>
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          className="poe-button"
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 14px', fontSize: '0.82rem' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          {loading ? '更新中...' : '重新整理行情'}
        </button>
      </div>

      {/* Sub-navigation Switch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <button
          type="button"
          onClick={() => setActiveView('exchange')}
          className={activeView === 'exchange' ? 'poe-button' : 'poe-button-secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '6px 14px' }}
        >
          <Sparkles size={14} /> Faustus 交易所即時訂單簿
        </button>
        <button
          type="button"
          onClick={() => setActiveView('trends')}
          className={activeView === 'trends' ? 'poe-button' : 'poe-button-secondary'}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '6px 14px' }}
        >
          <TrendingUp size={14} /> 7天高價資產走勢與價格警報
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px 14px', backgroundColor: 'rgba(231, 76, 60, 0.15)', border: '1px solid #e74c3c', borderRadius: '6px', color: '#ff6b6b', fontSize: '0.84rem' }}>
          ⚠️ {error}
        </div>
      )}

      {activeView === 'trends' ? (
        <PriceTrendHub league={league} divineRate={rates?.divineChaosRate || 150} onShowToast={onShowToast} />
      ) : (
        <>
          {/* Top Widgets: Conversion Matrix & Arbitrage */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '14px' }}>
        <CurrencyMatrixWidget rates={rates} />
        <GoldCalculatorWidget
          selectedItem={selectedItemForGoldCalc}
          items={marketData?.items || []}
          onSelectItem={setSelectedItemForGoldCalc}
          quantity={goldCalcQuantity}
          onChangeQuantity={setGoldCalcQuantity}
          calculation={goldFeeCalculation}
        />
      </div>

      {/* Arbitrage Opportunities Spotlight */}
      <ArbitrageOpportunityPanel opportunities={arbitrageOpportunities} league={league} />

      {/* Category Tabs & Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', backgroundColor: '#0d111a', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(200, 170, 110, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflowX: 'auto' }}>
          {EXCHANGE_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter((prev) => ({ ...prev, category: cat.id }))}
              className={filter.category === cat.id ? 'poe-button' : 'poe-button-secondary'}
              style={{ padding: '4px 10px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#2ecc71', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={filter.onlyArbitrage}
              onChange={(e) => setFilter((prev) => ({ ...prev, onlyArbitrage: e.target.checked }))}
            />
            🔥 僅顯示套利物資
          </label>

          <div style={{ position: 'relative', minWidth: '180px' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '8px', top: '8px' }} />
            <input
              type="text"
              placeholder="搜尋名稱 (中/英)..."
              value={filter.searchQuery}
              onChange={(e) => setFilter((prev) => ({ ...prev, searchQuery: e.target.value }))}
              style={{
                padding: '4px 8px 4px 28px',
                backgroundColor: '#0a0d14',
                border: '1px solid rgba(200, 170, 110, 0.3)',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '0.8rem',
                width: '100%',
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Order Book Table */}
      <ExchangeOrderBookTable
        items={filteredItems}
        league={league}
        selectedItemId={selectedItemForGoldCalc?.id}
        onSelectItemForGold={setSelectedItemForGoldCalc}
      />
        </>
      )}
    </div>
  );
};

export default FaustusExchangeHub;
