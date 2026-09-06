import { useState, useEffect, useMemo, useCallback } from 'react';
import type { MappingSession, MapInvestment, MapRun } from '../../domain/mapping/types';
import {
  loadMappingSessions,
  saveMappingSessions,
  loadActiveSessionId,
  saveActiveSessionId,
  createDefaultMappingSession
} from '../../infrastructure/storage/mappingStorage';
import {
  generateDiscordMappingReport,
  exportMappingSessionCsv
} from '../../domain/mapping/mappingExport';
import { computeSessionStats } from '../../domain/mapping/mappingCalculator';

export function useMappingSessionActions({
  league,
  divineRate,
  sessionWallClockSeconds,
  onShowToast,
  onResetTimers
}: {
  league: string;
  divineRate: number;
  sessionWallClockSeconds: number;
  onShowToast: (msg: string) => void;
  onResetTimers: () => void;
}) {
  const [sessions, setSessions] = useState<MappingSession[]>(() => loadMappingSessions(league));
  const [activeSessionId, setActiveSessionId] = useState<string>(() => loadActiveSessionId(sessions));

  const activeSession = useMemo(() => {
    return sessions.find(s => s.id === activeSessionId) || sessions[0] || createDefaultMappingSession(league);
  }, [sessions, activeSessionId, league]);

  useEffect(() => {
    saveMappingSessions(sessions);
  }, [sessions]);

  useEffect(() => {
    if (activeSessionId) saveActiveSessionId(activeSessionId);
  }, [activeSessionId]);

  const addMapRun = useCallback((newRun: MapRun) => {
    setSessions(prev =>
      prev.map(s => (s.id === activeSession.id ? { ...s, runs: [newRun, ...s.runs], updatedAt: Date.now() } : s))
    );
  }, [activeSession.id]);

  const addMapRuns = useCallback((newRuns: MapRun[]) => {
    if (newRuns.length === 0) return;
    setSessions(prev =>
      prev.map(s => (s.id === activeSession.id ? { ...s, runs: [...newRuns, ...s.runs], updatedAt: Date.now() } : s))
    );
  }, [activeSession.id]);

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
    onResetTimers();
    onShowToast('已清除當前 Session 所有場次紀錄');
  }, [activeSession.id, onResetTimers, onShowToast]);

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
    onResetTimers();
    onShowToast(`已建立並切換至「${newSess.name}」！`);
  }, [league, onResetTimers, onShowToast]);

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
    stats,
    addMapRun,
    addMapRuns,
    handleDeleteRun,
    handleClearRuns,
    handleUpdateInvestment,
    handleUpdateSelectedTabs,
    handleCreateSession,
    handleExportDiscord,
    handleExportCsv
  };
}
