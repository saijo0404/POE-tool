import React, { useMemo, useEffect } from 'react';
import { usePriceChecker, formatModText } from '../hooks/usePriceChecker';
import { useSettings } from '../hooks/useSettings';
import { useClipboardHistory } from '../hooks/useClipboardHistory';
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
import { GearComparisonView } from './gear/GearComparisonView';
import { BuildFitScoreBadge } from './buildFit/BuildFitScoreBadge';
import { useBuildFit } from '../hooks/useBuildFit';
import { PriceSnapshotBadge } from './price/PriceSnapshotBadge';
import { MapDangerBanner } from './price/MapDangerBanner';
import { ClipboardHistoryTray } from './history/ClipboardHistoryTray';
import { MOCK_SAMPLE_ZH_ITEM } from './price/mockData';
import { loadPriceSnapshot, savePriceSnapshot } from '../infrastructure/storage/priceSnapshotStorage';
import type { PriceSnapshot } from '../domain/price/priceSnapshotEngine';
import type { ParsedItem } from '../types/poe';

interface PriceCheckerProps {
  league: string;
  onShowToast: (msg: string) => void;
  externalText?: string;
}

export const PriceChecker: React.FC<PriceCheckerProps> = (props) => {
  const pc = usePriceChecker({ league: props.league, onShowToast: props.onShowToast, externalText: props.externalText });
  const { settings } = useSettings();
  const [snapshot, setSnapshot] = React.useState<PriceSnapshot | null>(() => loadPriceSnapshot());
  const { history, tray, recordHistory, handleAddToTray, handleRemoveFromTray, handleClearTray, handleClearHistory } = useClipboardHistory();

  useEffect(() => {
    if (pc.parsedItem && pc.rawText.trim()) {
      recordHistory(pc.rawText, pc.parsedItem, pc.tradeResults?.estimatedMedianPriceChaos);
    }
  }, [pc.parsedItem, pc.rawText, pc.tradeResults?.estimatedMedianPriceChaos, recordHistory]);

  const danger = useMemo(() => {
    if (!pc.parsedItem) return null;
    return evaluateMapDanger(pc.parsedItem, settings.mapDangerConfig || DEFAULT_MAP_DANGER_CONFIG);
  }, [pc.parsedItem, settings.mapDangerConfig]);

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <TopControls pc={pc} snapshot={snapshot} onSnapshotChange={(s) => { setSnapshot(s); savePriceSnapshot(s); }} onShowToast={props.onShowToast} danger={danger} />
      <ClipboardHistoryTray
        history={history}
        tray={tray}
        onSelectHistoryItem={(item) => pc.setRawText(item.rawText)}
        onAddToComparison={handleAddToTray}
        onRemoveFromComparison={handleRemoveFromTray}
        onClearComparison={handleClearTray}
        onClearHistory={handleClearHistory}
      />
      {pc.parsedItem && <ParsedDetails pc={pc} />}
      <TradeListingView tradeResults={pc.tradeResults} copiedId={pc.copiedId} onCopyWhisper={pc.handleCopyWhisper} sortBy={pc.sortBy} onChangeSortBy={pc.setSortBy} onLoadMore={pc.handleLoadMore} loadingMore={pc.loadingMore} league={props.league} onShowToast={props.onShowToast} />
      {pc.parsedItem && <PriceCheckerDebugPanel parsedItem={pc.parsedItem} mods={pc.mods} linksMin={pc.linksMin} corruptedFilter={pc.corruptedFilter} tradeResults={pc.tradeResults} />}
    </div>
  );
};

const TopControls: React.FC<{
  pc: ReturnType<typeof usePriceChecker>;
  snapshot: PriceSnapshot | null;
  onSnapshotChange: (s: PriceSnapshot) => void;
  onShowToast: (msg: string) => void;
  danger: ReturnType<typeof evaluateMapDanger> | null;
}> = ({ pc, snapshot, onSnapshotChange, onShowToast, danger }) => (
  <>
    <RecentSearchesBar recentSearches={pc.recentSearches} onSelectSearch={pc.handleSelectRecent} onClearSearches={pc.clearRecentSearches} />
    <PriceSnapshotBadge snapshot={snapshot} onImportSnapshot={onSnapshotChange} onShowToast={onShowToast} />
    {pc.authError && <SessionAuthAlertBanner errorMessage={pc.authError} onDismiss={pc.clearAuthError} onReauthorized={() => { pc.clearAuthError(); pc.handleSearchTrade(); }} />}
    <ItemInputPanel rawText={pc.rawText} onChangeRawText={pc.setRawText} onInsertSample={() => pc.setRawText(MOCK_SAMPLE_ZH_ITEM)} onSearchTrade={pc.handleSearchTrade} searching={pc.searching} />
    <MapDangerBanner evaluation={danger} />
  </>
);

const ParsedDetails: React.FC<{ pc: ReturnType<typeof usePriceChecker> }> = ({ pc }) => (
  <>
    <TradeSummaryCard tradeResults={pc.tradeResults} searching={pc.searching} onRefreshSearch={pc.handleSearchTrade} rawText={pc.rawText} />
    {pc.parsedItem && (pc.parsedItem.rarity === 'Rare' || pc.parsedItem.rarity === 'Magic') && (
      <>
        <GearInspectorCard item={pc.parsedItem} />
        <BuildFitSection item={pc.parsedItem} />
        <GearComparisonView item={pc.parsedItem} />
      </>
    )}
    {pc.parsedItem && <AffixSection pc={pc} item={pc.parsedItem} />}
  </>
);

const AffixSection: React.FC<{ pc: ReturnType<typeof usePriceChecker>; item: ParsedItem }> = ({ pc, item }) => (
  <div className="poe-card">
    <ParsedItemHeader parsedItem={item} itemIconUrl={pc.tradeResults?.listings?.[0]?.item?.icon} />
    <AffixFilterList
      mods={pc.mods}
      tradeStatus={pc.tradeStatus}
      setTradeStatus={pc.setTradeStatus}
      linksMin={pc.linksMin}
      setLinksMin={pc.setLinksMin}
      corruptedFilter={pc.corruptedFilter}
      setCorruptedFilter={pc.setCorruptedFilter}
      itemLevelMin={pc.itemLevelMin}
      setItemLevelMin={pc.setItemLevelMin}
      rollPercentage={pc.rollPercentage}
      setRollPercentage={pc.setRollPercentage}
      onToggleMod={(idx) => { const t = pc.mods[idx]; if (t) pc.toggleMod(t.id, !t.enabled); }}
      onChangeMinValue={(idx, val) => { const t = pc.mods[idx]; if (t) pc.updateModMinValue(t.id, val); }}
      onChangeMaxValue={(idx, val) => { const t = pc.mods[idx]; if (t) pc.updateModMaxValue(t.id, val); }}
      formatModText={formatModText}
      onSearchTrade={pc.handleSearchTrade}
      searching={pc.searching}
    />
  </div>
);

const BuildFitSection: React.FC<{ item: ParsedItem }> = ({ item }) => {
  const { evaluation, presets, selectedPresetId, handleSelectPreset } = useBuildFit(item);
  return <BuildFitScoreBadge evaluation={evaluation} presets={presets} selectedPresetId={selectedPresetId} onSelectPreset={handleSelectPreset} />;
};

export default PriceChecker;
