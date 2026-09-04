import { useState, useMemo, useCallback } from 'react';
import type { WealthSnapshot, StashItemCategory } from '../types/poe';
import type { PortfolioAnalysisResult } from '../domain/portfolio/types';
import {
  calculateCategoryAllocations,
  calculateNetWorthTimeline,
  detectWealthLeapPoints,
  exportPortfolioToMarkdown,
  exportPortfolioToCSV,
  exportPortfolioToDiscord
} from '../domain/portfolio/portfolioCalculator';

interface UsePortfolioAnalysisOptions {
  snapshots?: WealthSnapshot[];
  latestSnapshot?: WealthSnapshot | null;
  divineRate?: number;
  league?: string;
  onShowToast?: (msg: string) => void;
}

export function usePortfolioAnalysis(options: UsePortfolioAnalysisOptions = {}) {
  const {
    snapshots = [],
    latestSnapshot,
    divineRate = 150,
    league = 'Settlers',
    onShowToast
  } = options;

  const [selectedCategory, setSelectedCategory] = useState<StashItemCategory | 'All'>('All');
  const [currencyMode, setCurrencyMode] = useState<'chaos' | 'divine'>('divine');
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [activeExportFormat, setActiveExportFormat] = useState<'markdown' | 'csv' | 'discord'>('markdown');

  // Items from latest snapshot or fallback
  const items = useMemo(() => {
    if (latestSnapshot && latestSnapshot.allItems && latestSnapshot.allItems.length > 0) {
      return latestSnapshot.allItems;
    }
    if (latestSnapshot && latestSnapshot.topItems) {
      return latestSnapshot.topItems;
    }
    const lastSnap = snapshots[snapshots.length - 1];
    return lastSnap?.allItems || lastSnap?.topItems || [];
  }, [latestSnapshot, snapshots]);

  const categoryAllocations = useMemo(() => {
    return calculateCategoryAllocations(items, divineRate);
  }, [items, divineRate]);

  const timeline = useMemo(() => {
    const rawPoints = calculateNetWorthTimeline(snapshots);
    const withLeaps = detectWealthLeapPoints(rawPoints);

    if (timeframe === 'all' || withLeaps.length <= 7) return withLeaps;
    const count = timeframe === '7d' ? 7 : 30;
    return withLeaps.slice(-count);
  }, [snapshots, timeframe]);

  const analysisResult = useMemo<PortfolioAnalysisResult>(() => {
    const totalChaos = latestSnapshot?.totalChaos ?? snapshots[snapshots.length - 1]?.totalChaos ?? 0;
    const totalDivine = latestSnapshot?.totalDivine ?? snapshots[snapshots.length - 1]?.totalDivine ?? 0;
    const firstChaos = snapshots[0]?.totalChaos ?? totalChaos;
    const totalGrowthChaos = totalChaos - firstChaos;
    const totalGrowthPercent = firstChaos > 0 ? Math.round(((totalChaos - firstChaos) / firstChaos) * 1000) / 10 : 0;

    return {
      totalChaos,
      totalDivine,
      divineRate,
      categories: categoryAllocations,
      timeline,
      totalGrowthPercent,
      totalGrowthChaos
    };
  }, [latestSnapshot, snapshots, divineRate, categoryAllocations, timeline]);

  const selectedCategoryAllocation = useMemo(() => {
    if (selectedCategory === 'All') return categoryAllocations[0];
    return categoryAllocations.find(c => c.category === selectedCategory);
  }, [categoryAllocations, selectedCategory]);

  const copyToClipboard = useCallback(async (text: string, successMsg: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
      onShowToast?.(successMsg);
    } catch {
      onShowToast?.('❌ 複製至剪貼簿失敗。');
    }
  }, [onShowToast]);

  const handleCopyMarkdown = useCallback(async () => {
    const md = exportPortfolioToMarkdown(analysisResult, league);
    await copyToClipboard(md, '📋 已將資產組合分析報表 (Markdown) 複製至剪貼簿！');
  }, [analysisResult, league, copyToClipboard]);

  const handleCopyCSV = useCallback(async () => {
    const csv = exportPortfolioToCSV(categoryAllocations);
    await copyToClipboard(csv, '📊 已將資產結構資料 (CSV) 複製至剪貼簿！');
  }, [categoryAllocations, copyToClipboard]);

  const handleCopyDiscord = useCallback(async () => {
    const discord = exportPortfolioToDiscord(analysisResult, league);
    await copyToClipboard(discord, '💬 已將 Discord 分享摘要複製至剪貼簿！');
  }, [analysisResult, league, copyToClipboard]);

  return {
    selectedCategory,
    setSelectedCategory,
    currencyMode,
    setCurrencyMode,
    timeframe,
    setTimeframe,
    isExportModalOpen,
    setIsExportModalOpen,
    activeExportFormat,
    setActiveExportFormat,
    categoryAllocations,
    selectedCategoryAllocation,
    timeline,
    analysisResult,
    handleCopyMarkdown,
    handleCopyCSV,
    handleCopyDiscord
  };
}
