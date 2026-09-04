import { useState, useEffect, useCallback } from 'react';
import type { WealthSnapshot, StashTabMeta } from '../types/poe';
import type { MapRun } from '../domain/mapping/types';
import { DEFAULT_MAPPING_TIMER_STATE } from '../domain/mapping/constants';
import { computeItemDeltas, computeMapRunProfit } from '../domain/mapping/mappingCalculator';
import { poeApi } from '../services/api';
import { useMappingTimers } from './mapping/useMappingTimers';
import { useMappingSessionActions } from './mapping/useMappingSessionActions';

export function useMappingTracker({
  league,
  divineRate = 150,
  onShowToast
}: {
  league: string;
  divineRate?: number;
  onShowToast: (msg: string) => void;
}) {
  const [snapshotting, setSnapshotting] = useState<boolean>(false);
  const [snapshotA, setSnapshotA] = useState<WealthSnapshot | null>(null);
  const [availableTabs, setAvailableTabs] = useState<StashTabMeta[]>([]);

  const {
    timerState,
    setTimerState,
    sessionWallClockSeconds,
    handlePauseMap,
    handleResumeMap,
    handleResetTimer
  } = useMappingTimers();

  const handleResetTimers = useCallback(() => {
    setSnapshotA(null);
    setTimerState(DEFAULT_MAPPING_TIMER_STATE);
  }, [setTimerState]);

  const {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    stats,
    addMapRun,
    handleDeleteRun,
    handleClearRuns,
    handleUpdateInvestment,
    handleUpdateSelectedTabs,
    handleCreateSession,
    handleExportDiscord,
    handleExportCsv
  } = useMappingSessionActions({
    league,
    divineRate,
    sessionWallClockSeconds,
    onShowToast,
    onResetTimers: handleResetTimers
  });

  useEffect(() => {
    poeApi.getStashTabs(league).then(tabs => setAvailableTabs(tabs || [])).catch(() => {});
  }, [league]);

  const handleStartMap = useCallback(async () => {
    setTimerState(prev => ({
      ...prev,
      status: 'running',
      elapsedSeconds: 0,
      startTimestamp: Date.now()
    }));
    if (!snapshotA) {
      setSnapshotting(true);
      try {
        const snap = await poeApi.takeWealthSnapshot();
        setSnapshotA(snap);
        onShowToast('⏱️ 計時開始！已自動為您記錄進圖前倉庫快照 A');
      } catch {
        onShowToast('⏱️ 計時開始！(快照記錄需確保 POESESSID 設定正確)');
      } finally {
        setSnapshotting(false);
      }
    } else {
      onShowToast('⏱️ 計時開始！祝您這場掉落高價神聖石！');
    }
  }, [snapshotA, onShowToast, setTimerState]);

  const handleTakeSnapshotA = useCallback(async () => {
    setSnapshotting(true);
    try {
      const snap = await poeApi.takeWealthSnapshot();
      setSnapshotA(snap);
      onShowToast('✅ 已成功手動記錄【進圖前快照 A】！');
    } catch {
      onShowToast('快照建立失敗，請檢查設定與網路連線');
    } finally {
      setSnapshotting(false);
    }
  }, [onShowToast]);

  const handleFinishAndSettle = useCallback(async () => {
    const duration = timerState.elapsedSeconds || 1;
    setSnapshotting(true);
    let snapshotB: WealthSnapshot | null = null;
    try {
      snapshotB = await poeApi.takeWealthSnapshot();
    } catch {}

    const beforeItems = snapshotA?.allItems || snapshotA?.topItems || [];
    const afterItems = snapshotB?.allItems || snapshotB?.topItems || [];
    const drops = computeItemDeltas(beforeItems, afterItems, divineRate, 1.0, activeSession.selectedTabNames);
    const profit = computeMapRunProfit(drops, activeSession.defaultInvestment, divineRate);

    const newRun: MapRun = {
      id: `run_${Date.now()}`,
      runNumber: activeSession.runs.length + 1,
      startTime: timerState.startTimestamp || Date.now() - duration * 1000,
      endTime: Date.now(),
      durationSeconds: duration,
      investment: { ...activeSession.defaultInvestment },
      grossRevenueChaos: profit.grossRevenueChaos,
      grossRevenueDivine: profit.grossRevenueDivine,
      netProfitChaos: profit.netProfitChaos,
      netProfitDivine: profit.netProfitDivine,
      drops,
      tabNames: activeSession.selectedTabNames
    };

    addMapRun(newRun);
    setSnapshotA(snapshotB);
    setTimerState(prev => ({
      status: 'completed',
      currentRunNumber: prev.currentRunNumber + 1,
      elapsedSeconds: 0,
      startTimestamp: null
    }));
    setSnapshotting(false);

    onShowToast(`🎉 第 ${newRun.runNumber} 場結算完成！淨利潤：${profit.netProfitDivine} Div (${profit.netProfitChaos}c)`);
  }, [timerState, snapshotA, activeSession, divineRate, onShowToast, addMapRun, setTimerState]);

  return {
    sessions,
    activeSession,
    activeSessionId,
    setActiveSessionId,
    timerState,
    snapshotting,
    snapshotA,
    availableTabs,
    stats,
    handleStartMap,
    handlePauseMap,
    handleResumeMap,
    handleResetTimer,
    handleTakeSnapshotA,
    handleFinishAndSettle,
    handleDeleteRun,
    handleClearRuns,
    handleUpdateInvestment,
    handleUpdateSelectedTabs,
    handleCreateSession,
    handleExportDiscord,
    handleExportCsv
  };
}
