import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { usePriceChecker, formatModText } from '../hooks/usePriceChecker';
import { RecentSearchesBar } from './price/RecentSearchesBar';
import { ItemInputPanel } from './price/ItemInputPanel';
import { ParsedItemHeader } from './price/ParsedItemHeader';
import { AffixFilterList } from './price/AffixFilterList';
import { TradeSummaryCard } from './price/TradeSummaryCard';
import { TradeListingView } from './price/TradeListingView';

const MOCK_SAMPLE_ZH_ITEM = `物品種類: 頭部
稀有度: 稀有
暴怒 避難所
罪魔邪冠
--------
護甲: 195
能量護盾: 40
無形性: 75%
--------
需求:
等級: 75
力量: 79
智慧: 79
--------
插槽: W 
--------
物品等級: 85
--------
{ 固定詞綴 }
此物品插槽中輔助寶石等級 -2
此物品插槽中技能寶石等級 +2
--------
{ 前綴 "龍膽的"(階層：5)— 魔力 }
+54(50-54) 最大魔力
{ 前綴 "健壯之"(階層：10)— 生命 }
+5(3-9) 最大生命
{ 後綴 "精髓之"— 傷害,元素,寶石 }
插槽中的寶石造成 30% 更多元素傷害
{ 後綴 "暴風雨之"(階層：4)— 元素,閃電,抗性 }
+30(30-35)% 閃電抗性
{ 後綴 "火龍之"(階層：6)— 元素,火焰,抗性 }
+22(18-23)% 火焰抗性
--------
塑者之物`;

interface PriceCheckerProps {
  league: string;
  onShowToast: (msg: string) => void;
  externalText?: string;
}

export const PriceChecker: React.FC<PriceCheckerProps> = ({
  league,
  onShowToast,
  externalText
}) => {
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const {
    rawText,
    setRawText,
    parsedItem,
    sortBy,
    setSortBy,
    loadingMore,
    handleLoadMore,
    mods,
    tradeStatus,
    setTradeStatus,
    linksMin,
    setLinksMin,
    corruptedFilter,
    setCorruptedFilter,
    itemLevelMin,
    setItemLevelMin,
    searching,
    tradeResults,
    copiedId,
    recentSearches,
    handleSearchTrade,
    handleToggleMod,
    handleChangeMinValue,
    handleChangeMaxValue,
    handleReadClipboard,
    handleCopyWhisper,
    handleSelectRecentSearch,
    handleClearRecentSearches,
    handleAddCustomMod,
    handleRemoveMod
  } = usePriceChecker({ league, onShowToast, externalText });

  const activeModsCount = mods.filter(m => m.enabled).length;

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* 1. Recent Searches Bar */}
      <RecentSearchesBar
        recentSearches={recentSearches}
        onSelectSearch={handleSelectRecentSearch}
        onClearSearches={handleClearRecentSearches}
      />

      {/* 2. Raw Text Input Panel */}
      <ItemInputPanel
        rawText={rawText}
        onChangeRawText={setRawText}
        onReadClipboard={handleReadClipboard}
        onInsertSample={() => setRawText(MOCK_SAMPLE_ZH_ITEM)}
        onSearchTrade={handleSearchTrade}
        searching={searching}
      />

      {/* 3. Trade Summary & Quick Search Action */}
      {parsedItem && (
        <TradeSummaryCard
          tradeResults={tradeResults}
          searching={searching}
          onRefreshSearch={handleSearchTrade}
        />
      )}

      {/* 4. Parsed Item Info & Affix Filters */}
      {parsedItem && (
        <div className="poe-card">
          <ParsedItemHeader
            parsedItem={parsedItem}
            itemIconUrl={tradeResults?.listings?.[0]?.item?.icon}
          />

          <AffixFilterList
            mods={mods}
            tradeStatus={tradeStatus}
            setTradeStatus={setTradeStatus}
            linksMin={linksMin}
            setLinksMin={setLinksMin}
            corruptedFilter={corruptedFilter}
            setCorruptedFilter={setCorruptedFilter}
            itemLevelMin={itemLevelMin}
            setItemLevelMin={setItemLevelMin}
            onToggleMod={handleToggleMod}
            onChangeMinValue={handleChangeMinValue}
            onChangeMaxValue={handleChangeMaxValue}
            formatModText={formatModText}
            onAddCustomMod={handleAddCustomMod}
            onRemoveMod={handleRemoveMod}
            onSearchTrade={handleSearchTrade}
            searching={searching}
          />
        </div>
      )}

      {/* 5. Trade Listings Detailed View */}
      <TradeListingView
        tradeResults={tradeResults}
        copiedId={copiedId}
        onCopyWhisper={handleCopyWhisper}
        sortBy={sortBy}
        onChangeSortBy={setSortBy}
        onLoadMore={handleLoadMore}
        loadingMore={loadingMore}
        league={league}
        onShowToast={onShowToast}
      />

      {/* 6. Collapsible Debug & Log Inspector */}
      {parsedItem && (
        <div className="poe-card" style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <button
            type="button"
            onClick={() => setShowDebug(prev => !prev)}
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px 0',
              fontSize: '0.85rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Terminal size={16} color="var(--accent-blue)" />
              <span style={{ color: 'var(--text-gold)', fontWeight: 600 }}>
                🛠️ 查價詞綴與 GGG 搜尋 Payload 除錯資訊 (Debug Logs)
              </span>
              <span style={{ fontSize: '0.78rem', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '1px 6px', borderRadius: '3px' }}>
                已選詞綴: {activeModsCount} / {mods.length}
              </span>
            </div>
            {showDebug ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {showDebug && (
            <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#cbd5e1' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                <div style={{ background: '#090d14', padding: '10px', borderRadius: '4px' }}>
                  <strong style={{ color: 'var(--text-gold)' }}>📦 裝備解析屬性:</strong>
                  <div>名稱 (Name): {parsedItem.name || '(無)'}</div>
                  <div>底材 (BaseType): {parsedItem.baseType}</div>
                  <div>稀有度 (Rarity): {parsedItem.rarity}</div>
                  <div>物品等級 (iLvl): {parsedItem.itemLevel ?? '無'}</div>
                  <div>連線 (Links): {linksMin ?? '無'}</div>
                  <div>已汙染 (Corrupted): {corruptedFilter === undefined ? '不限' : corruptedFilter ? '是' : '否'}</div>
                </div>

                <div style={{ background: '#090d14', padding: '10px', borderRadius: '4px' }}>
                  <strong style={{ color: 'var(--text-gold)' }}>🎯 詞綴清單與 GGG Stat ID:</strong>
                  <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                    {mods.map((m, i) => (
                      <li key={i} style={{ color: m.enabled ? '#4ade80' : 'var(--text-muted)' }}>
                        [{m.enabled ? '✓ 已勾選' : '✗ 未選'}] {m.text} ➔ <code>{m.id}</code> (Min: {m.minValue ?? '無'}, Max: {m.maxValue ?? '無'})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {tradeResults && (
                <div style={{ background: '#090d14', padding: '10px', borderRadius: '4px' }}>
                  <strong style={{ color: 'var(--text-gold)' }}>🌐 GGG 市集查詢結果:</strong>
                  <div>Search ID: <code>{tradeResults.searchId || tradeResults.id || 'N/A'}</code></div>
                  <div>Total Results: <strong>{tradeResults.total}</strong> 筆</div>
                  {tradeResults.tradeUrl && (
                    <div>
                      Official URL: <a href={tradeResults.tradeUrl} target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>{tradeResults.tradeUrl}</a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PriceChecker;
