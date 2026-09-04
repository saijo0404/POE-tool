import React, { useMemo } from 'react';
import { AlertOctagon } from 'lucide-react';
import { usePriceChecker, formatModText } from '../hooks/usePriceChecker';
import { useSettings } from '../hooks/useSettings';
import { evaluateMapDanger } from '../domain/mapMod/dangerEvaluator';
import { DEFAULT_MAP_DANGER_CONFIG } from '../domain/mapMod/dangerPresets';
import { RecentSearchesBar } from './price/RecentSearchesBar';
import { ItemInputPanel } from './price/ItemInputPanel';
import { SessionAuthAlertBanner } from './price/SessionAuthAlertBanner';
import { ParsedItemHeader } from './price/ParsedItemHeader';
import { AffixFilterList } from './price/AffixFilterList';
import { TradeSummaryCard } from './price/TradeSummaryCard';
import { TradeListingView } from './price/TradeListingView';
import { PriceCheckerDebugPanel } from './price/PriceCheckerDebugPanel';
import { GearInspectorCard } from './gear/GearInspectorCard';

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
  const {
    rawText, setRawText,
    parsedItem,
    sortBy, setSortBy,
    loadingMore, handleLoadMore,
    mods,
    tradeStatus, setTradeStatus,
    linksMin, setLinksMin,
    corruptedFilter, setCorruptedFilter,
    itemLevelMin, setItemLevelMin,
    rollPercentage, setRollPercentage,
    searching,
    tradeResults,
    copiedId,
    authError,
    clearAuthError,
    recentSearches,
    handleSearchTrade,
    toggleMod,
    updateModMinValue,
    updateModMaxValue,
    handleCopyWhisper,
    handleSelectRecent,
    clearRecentSearches
  } = usePriceChecker({ league, onShowToast, externalText });

  const { settings } = useSettings();
  const dangerEvaluation = useMemo(() => {
    if (!parsedItem) return null;
    const cfg = settings.mapDangerConfig || DEFAULT_MAP_DANGER_CONFIG;
    return evaluateMapDanger(parsedItem, cfg);
  }, [parsedItem, settings.mapDangerConfig]);

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <RecentSearchesBar
        recentSearches={recentSearches}
        onSelectSearch={handleSelectRecent}
        onClearSearches={clearRecentSearches}
      />

      {authError && (
        <SessionAuthAlertBanner
          errorMessage={authError}
          onDismiss={clearAuthError}
          onReauthorized={() => {
            clearAuthError();
            handleSearchTrade();
          }}
        />
      )}

      <ItemInputPanel
        rawText={rawText}
        onChangeRawText={setRawText}
        onInsertSample={() => setRawText(MOCK_SAMPLE_ZH_ITEM)}
        onSearchTrade={handleSearchTrade}
        searching={searching}
      />

      {dangerEvaluation?.hasDanger && (
        <div
          style={{
            background: 'rgba(229, 80, 57, 0.18)',
            border: '1px solid rgba(229, 80, 57, 0.6)',
            borderRadius: '6px',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            boxShadow: '0 0 16px rgba(229, 80, 57, 0.2)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff7675', fontWeight: 'bold' }}>
            <AlertOctagon size={18} color="#ff7675" />
            <span>⚠️ 致命地圖警報：此地圖包含 {dangerEvaluation.matchedDangerMods.length + dangerEvaluation.matchedCustomKeywords.length} 個流派危險詞綴！</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '2px' }}>
            {dangerEvaluation.matchedDangerMods.map((m, idx) => (
              <span
                key={idx}
                style={{
                  background: 'rgba(0, 0, 0, 0.4)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  color: '#ff7675',
                  border: '1px solid rgba(229, 80, 57, 0.4)'
                }}
              >
                ❌ {m.def.nameZh} ({m.def.nameEn}): <code>{m.matchedLine}</code>
              </span>
            ))}
          </div>
        </div>
      )}

      {parsedItem && (
        <TradeSummaryCard
          tradeResults={tradeResults}
          searching={searching}
          onRefreshSearch={handleSearchTrade}
          rawText={rawText}
        />
      )}

      {parsedItem && (parsedItem.rarity === 'Rare' || parsedItem.rarity === 'Magic') && (
        <GearInspectorCard item={parsedItem} />
      )}

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
            rollPercentage={rollPercentage}
            setRollPercentage={setRollPercentage}
            onToggleMod={(idx) => {
              const target = mods[idx];
              if (target) toggleMod(target.id, !target.enabled);
            }}
            onChangeMinValue={(idx, val) => {
              const target = mods[idx];
              if (target) updateModMinValue(target.id, val);
            }}
            onChangeMaxValue={(idx, val) => {
              const target = mods[idx];
              if (target) updateModMaxValue(target.id, val);
            }}
            formatModText={formatModText}
            onSearchTrade={handleSearchTrade}
            searching={searching}
          />
        </div>
      )}

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

      {parsedItem && (
        <PriceCheckerDebugPanel
          parsedItem={parsedItem}
          mods={mods}
          linksMin={linksMin}
          corruptedFilter={corruptedFilter}
          tradeResults={tradeResults}
        />
      )}
    </div>
  );
};

export default PriceChecker;
