import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { WealthSnapshot, StashProgress, WealthFilterState } from '../types/poe';
import { poeApi } from '../services/api';
import { useAppState } from './useAppState';
import { exportWealthHistoryCsv, copyDiscordWealthSummary } from '../utils/wealthExport';
import { computeFilteredWealthData } from '../utils/wealthCalculator';

export const DEFAULT_WEALTH_FILTER: WealthFilterState = {
  minValueChaos: 0,
  ignoredTabNames: [],
  selectedCategory: 'ALL'
};

export function useWealthTracker({
  league,
  onShowToast
}: {
  league: string;
  onShowToast: (msg: string) => void;
}) {
  const appState = useAppStateSafe();
  const [snapshots, setSnapshots] = useState<WealthSnapshot[]>(appState?.cachedSnapshots || []);
  const [snapshotting, setSnapshotting] = useState<boolean>(false);
  const [progress, setProgress] = useState<StashProgress | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);


  const filterState = appState?.wealthFilterState || DEFAULT_WEALTH_FILTER;
  const setCachedSnapshots = appState?.setCachedSnapshots;

  useEffect(() => {
    if (snapshots.length === 0) {
      poeApi.getWealthSnapshots().then(data => setSnapshots(data || [])).catch(() => {});
    }
  }, [snapshots.length]);

  useEffect(() => {
    if (setCachedSnapshots) setCachedSnapshots(snapshots);
  }, [snapshots, setCachedSnapshots]);

  const handleCreateSnapshot = useCallback(async () => {
    setSnapshotting(true);
    setProgress({ active: true, currentTab: 0, totalTabs: 10, currentTabName: '準備載入資料...', stage: 'init' });

    progressTimerRef.current = setInterval(async () => {
      try {
        const p = await poeApi.getWealthProgress();
        if (p) setProgress(p);
      } catch {}
    }, 250);

    try {
      const data = await poeApi.takeWealthSnapshot();
      setSnapshots(prev => [...prev, data]);
      if (data.totalChaos > 0) {
        onShowToast('已成功獲取您角色與倉庫的真實資產數據！');
      } else {
        onShowToast('尚未獲取到物品資料，請檢查設定中的 POESESSID、帳號名稱與選擇聯盟');
      }
    } catch (err) {
      console.error('Create snapshot error:', err);
      onShowToast('建立快照失敗');
    } finally {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
      setSnapshotting(false);
      setProgress(null);
    }
  }, [onShowToast]);

  const handleClearHistory = useCallback(async () => {
    try {
      await poeApi.clearWealthSnapshots();
      setSnapshots([]);
      onShowToast('已清除歷史快照資料');
    } catch {}
  }, [onShowToast]);

  const handleToggleIgnoreTab = useCallback((tabName: string) => {
    if (!appState?.updateWealthFilterState) return;
    const current = filterState.ignoredTabNames || [];
    const updated = current.includes(tabName) ? current.filter((t: string) => t !== tabName) : [...current, tabName];
    appState.updateWealthFilterState({ ignoredTabNames: updated });
  }, [appState, filterState]);

  const handleChangeMinValueChaos = useCallback((val: number) => {
    if (appState?.updateWealthFilterState) appState.updateWealthFilterState({ minValueChaos: val });
  }, [appState]);

  const handleChangeCategory = useCallback((cat: string) => {
    if (appState?.updateWealthFilterState) appState.updateWealthFilterState({ selectedCategory: cat });
  }, [appState]);

  const handleResetFilters = useCallback(() => {
    if (appState?.updateWealthFilterState) {
      appState.updateWealthFilterState({ minValueChaos: 0, ignoredTabNames: [], selectedCategory: 'ALL' });
    }
  }, [appState]);

  const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

  const filteredData = useMemo(() => {
    return computeFilteredWealthData(latestSnapshot, filterState);
  }, [latestSnapshot, filterState]);

  const isFilterActive = (filterState.minValueChaos && filterState.minValueChaos > 0) || (filterState.ignoredTabNames && filterState.ignoredTabNames.length > 0) || (filterState.selectedCategory && filterState.selectedCategory !== 'ALL');
  const displayTotalChaos = isFilterActive ? filteredData.totalChaos : (latestSnapshot?.totalChaos || 0);
  const displayTotalDivine = isFilterActive ? filteredData.totalDivine : (latestSnapshot?.totalDivine || 0);

  const handleExportCSV = useCallback(() => {
    exportWealthHistoryCsv(snapshots, league, onShowToast);
  }, [snapshots, league, onShowToast]);

  const handleCopyDiscordSummary = useCallback(() => {
    copyDiscordWealthSummary(latestSnapshot, filteredData.totalDivine, filteredData.totalChaos, onShowToast);
  }, [latestSnapshot, filteredData, onShowToast]);

  return {
    snapshots,
    snapshotting,
    progress,
    filterState,
    latestSnapshot,
    filteredData,
    displayTotalChaos,
    displayTotalDivine,
    handleCreateSnapshot,
    handleClearHistory,
    handleToggleIgnoreTab,
    handleChangeMinValueChaos,
    handleChangeCategory,
    handleResetFilters,
    handleExportCSV,
    handleCopyDiscordSummary
  };
}

function useAppStateSafe() {
  try { return useAppState(); } catch { return null; }
}
