import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import type { WealthSnapshot, StashTabMeta } from '../types/poe';
import type {
  MappingSession,
  MappingTimerState,
  MapInvestment,
  MapRun
} from '../domain/mapping/types';
import { DEFAULT_MAPPING_TIMER_STATE } from '../domain/mapping/constants';
import {
  computeItemDeltas,
  computeMapRunProfit,
  computeSessionStats
} from '../domain/mapping/mappingCalculator';
import {
  generateDiscordMappingReport,
  exportMappingSessionCsv
} from '../domain/mapping/mappingExport';
import {
  loadMappingSessions,
  saveMappingSessions,
  loadActiveSessionId,
  saveActiveSessionId,
  createDefaultMappingSession
} from '../infrastructure/storage/mappingStorage';
import { poeApi } from '../services/api';

export function useMappingTracker({
  league,
  divineRate = 150,
  onShowToast
}: {
  league: string;
  divineRate?: number;
  onShowToast: (msg: string) => void;
}) {
  const [sessions, setSessions] = useState<MappingSession[]>(() => loadMappingSessions(league));
  const [activeSessionId, setActiveSessionId] = useState<string>(() => loadActiveSessionId(sessions));
  const [timerState, setTimerState] = useState<MappingTimerState>(DEFAULT_MAPPING_TIMER_STATE);
  const [snapshotting, setSnapshotting] = useState<boolean>(false);
  const [snapshotA, setSnapshotA] = useState<WealthSnapshot | null>(null);
  const [availableTabs, setAvailableTabs] = useState<StashTabMeta[]>([]);
  const [sessionWallClockSeconds, setSessionWallClockSeconds] = useState<number>(0);

  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || sessions[0] || createDefaultMappingSession(league);
  }, [sessions, activeSessionId, league]);

  // Sync sessions to localStorage
  useEffect(() => {
    saveMappingSessions(sessions);
  }, [sessions]);

  // Sync activeSessionId to localStorage
  useEffect(() => {
    if (activeSessionId) saveActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  // Load stash tabs metadata
  useEffect(() => {
    poeApi.getStashTabs(league).then(tabs => setAvailableTabs(tabs || [])).catch(() => {});
  }, [league]);

  // Wall-clock session timer
  useEffect(() => {
    sessionTimerRef.current = setInterval(() => {
      setSessionWallClockSeconds(prev => prev + 1);
    }, 1000);
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, []);

  // Map run stopwatch timer
  useEffect(() => {
    if (timerState.status === 'running') {
      timerIntervalRef.current = setInterval(() => {
        setTimerState(prev => ({ ...prev, elapsedSeconds: prev.elapsedSeconds + 1 }));
      }, 1000);
    } else if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerState.status]);

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
  }, [snapshotA, onShowToast]);

  const handlePauseMap = useCallback(() => {
    setTimerState(prev => ({ ...prev, status: 'paused' }));
  }, []);

  const handleResumeMap = useCallback(() => {
    setTimerState(prev => ({ ...prev, status: 'running' }));
  }, []);

  const handleResetTimer = useCallback(() => {
    setTimerState(prev => ({ ...prev, status: 'idle', elapsedSeconds: 0, startTimestamp: null }));
  }, []);

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

    setSessions(prev =>
      prev.map(s => (s.id === activeSession.id ? { ...s, runs: [newRun, ...s.runs], updatedAt: Date.now() } : s))
    );

    setSnapshotA(snapshotB); // Chain snapshot B as next map's snapshot A
    setTimerState(prev => ({
      status: 'completed',
      currentRunNumber: prev.currentRunNumber + 1,
      elapsedSeconds: 0,
      startTimestamp: null
    }));
    setSnapshotting(false);

    onShowToast(`🎉 第 ${newRun.runNumber} 場結算完成！淨利潤：${profit.netProfitDivine} Div (${profit.netProfitChaos}c)`);
  }, [timerState, snapshotA, activeSession, divineRate, onShowToast]);

  const handleDeleteRun = useCallback((runId: string) => {
    setSessions(prev =>
      prev.map(s => (s.id === activeSession.id ? { ...s, runs: s.runs.filter(r => r.id !== runId) } : s))
    );
    onShowToast('已刪除指定場次紀錄');
  }, [activeSession.id, onShowToast]);

  const handleClearRuns = useCallback(() => {
    setSessions(prev =>
      prev.map(s => (s.id === activeSession.id ? { ...s, runs: [] } : s))
    );
    setSnapshotA(null);
    setTimerState(DEFAULT_MAPPING_TIMER_STATE);
    onShowToast('已清除當前 Session 所有場次紀錄');
  }, [activeSession.id, onShowToast]);

  const handleUpdateInvestment = useCallback((inv: MapInvestment) => {
    setSessions(prev =>
      prev.map(s => (s.id === activeSession.id ? { ...s, defaultInvestment: inv, updatedAt: Date.now() } : s))
    );
    onShowToast('已更新單場門票成本設定');
  }, [activeSession.id, onShowToast]);

  const handleUpdateSelectedTabs = useCallback((tabs: string[]) => {
    setSessions(prev =>
      prev.map(s => (s.id === activeSession.id ? { ...s, selectedTabNames: tabs, updatedAt: Date.now() } : s))
    );
  }, [activeSession.id]);

  const handleCreateSession = useCallback((name: string, strategyName?: string) => {
    const newSess: MappingSession = {
      ...createDefaultMappingSession(league),
      name: name.trim() || '新刷圖 Session',
      strategyName
    };
    setSessions(prev => [newSess, ...prev]);
    setActiveSessionId(newSess.id);
    setSnapshotA(null);
    setTimerState(DEFAULT_MAPPING_TIMER_STATE);
    onShowToast(`已建立並切換至「${newSess.name}」！`);
  }, [league, onShowToast]);

  const stats = useMemo(() => {
    return computeSessionStats(activeSession.runs, sessionWallClockSeconds, divineRate);
  }, [activeSession.runs, sessionWallClockSeconds, divineRate]);

  const handleExportDiscord = useCallback(() => {
    const text = generateDiscordMappingReport(activeSession, stats);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
    }
    onShowToast('已複製 Discord 格式刷圖收益結算報表！可直接在社群分享');
  }, [activeSession, stats, onShowToast]);

  const handleExportCsv = useCallback(() => {
    exportMappingSessionCsv(activeSession, stats, onShowToast);
  }, [activeSession, stats, onShowToast]);

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
