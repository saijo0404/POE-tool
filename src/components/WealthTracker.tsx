import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { WealthSnapshot, StashProgress } from '../types/poe';
import { WealthChart } from './WealthChart';
import { TabBreakdown } from './TabBreakdown';
import { TrendingUp, RefreshCw, Clock, Coins, ArrowUpRight, ShieldAlert, Trash2, Download, Share2, FileSpreadsheet } from 'lucide-react';
import { getImageUrl } from '../utils/image';
import { poeApi } from '../services/api';
import { useAppState } from '../hooks/useAppState';

interface WealthTrackerProps {
  league: string;
  onShowToast: (msg: string) => void;
}

const DEFAULT_WEALTH_FILTER = {
  minValueChaos: 0,
  ignoredTabNames: [] as string[],
  selectedCategory: 'ALL'
};

export const WealthTracker: React.FC<WealthTrackerProps> = ({ league, onShowToast }) => {
  let appState: any = null;
  try {
    appState = useAppState();
  } catch {}

  const [snapshots, setSnapshots] = useState<WealthSnapshot[]>(appState?.cachedSnapshots || []);
  const [snapshotting, setSnapshotting] = useState<boolean>(false);
  const [progress, setProgress] = useState<StashProgress | null>(null);
  const progressTimerRef = useRef<any>(null);

  const filterState = appState?.wealthFilterState || DEFAULT_WEALTH_FILTER;
  const setCachedSnapshots = appState?.setCachedSnapshots;

  // Reliable PoE Official CDN icons for Divine Orb and Chaos Orb
  const divIconUrl = getImageUrl('https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png');
  const chaosIconUrl = getImageUrl('https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png');

  useEffect(() => {
    if (snapshots.length === 0) {
      fetchSnapshots();
    }
  }, [snapshots.length]);

  useEffect(() => {
    if (setCachedSnapshots) {
      setCachedSnapshots(snapshots);
    }
  }, [snapshots, setCachedSnapshots]);

  const fetchSnapshots = async () => {
    try {
      const data = await poeApi.getWealthSnapshots();
      setSnapshots(data || []);
    } catch (err) {
      console.error('Fetch snapshots error:', err);
    }
  };

  const handleCreateSnapshot = async () => {
    setSnapshotting(true);
    setProgress({ active: true, currentTab: 0, totalTabs: 10, currentTabName: '準備載入資料...', stage: 'init' });

    // Poll progress
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
  };

  const handleClearHistory = async () => {
    try {
      await poeApi.clearWealthSnapshots();
      setSnapshots([]);
      onShowToast('已清除歷史快照資料');
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleIgnoreTab = (tabName: string) => {
    if (!appState?.updateWealthFilterState) return;
    const current = filterState.ignoredTabNames || [];
    const updated = current.includes(tabName)
      ? current.filter((t: string) => t !== tabName)
      : [...current, tabName];
    appState.updateWealthFilterState({ ignoredTabNames: updated });
  };

  const handleChangeMinValueChaos = (val: number) => {
    if (appState?.updateWealthFilterState) {
      appState.updateWealthFilterState({ minValueChaos: val });
    }
  };

  const handleChangeCategory = (cat: string) => {
    if (appState?.updateWealthFilterState) {
      appState.updateWealthFilterState({ selectedCategory: cat });
    }
  };

  const handleResetFilters = () => {
    if (appState?.updateWealthFilterState) {
      appState.updateWealthFilterState({
        minValueChaos: 0,
        ignoredTabNames: [],
        selectedCategory: 'ALL'
      });
    }
  };

  const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;

  // Real-time custom filtering calculations
  const filteredData = useMemo(() => {
    if (!latestSnapshot) {
      return {
        totalChaos: 0,
        totalDivine: 0,
        tabSummaries: [],
        topItems: [],
        allItems: []
      };
    }

    const { minValueChaos, ignoredTabNames, selectedCategory } = filterState;
    const isFilterApplied = (minValueChaos && minValueChaos > 0) || (ignoredTabNames && ignoredTabNames.length > 0) || (selectedCategory && selectedCategory !== 'ALL');

    if (!isFilterApplied && (!latestSnapshot.allItems || latestSnapshot.allItems.length === 0)) {
      return {
        totalChaos: latestSnapshot.totalChaos,
        totalDivine: latestSnapshot.totalDivine,
        tabSummaries: latestSnapshot.tabSummaries || [],
        topItems: latestSnapshot.topItems || [],
        allItems: latestSnapshot.allItems || []
      };
    }

    const allItems = latestSnapshot.allItems || latestSnapshot.topItems || [];
    const divRate = latestSnapshot.chaosRate || 150;

    const filteredItems = allItems.filter(item => {
      if (minValueChaos && minValueChaos > 0 && (item.unitPriceChaos || item.totalPriceChaos) < minValueChaos) {
        return false;
      }
      if (ignoredTabNames && ignoredTabNames.includes(item.tabName)) {
        return false;
      }
      if (selectedCategory && selectedCategory !== 'ALL' && item.category !== selectedCategory) {
        return false;
      }
      return true;
    });

    let totalChaos = 0;
    const tabMap: Record<string, { category: string; count: number; totalChaos: number }> = {};

    for (const item of filteredItems) {
      totalChaos += item.totalPriceChaos;
      if (!tabMap[item.tabName]) {
        tabMap[item.tabName] = { category: item.category, count: 0, totalChaos: 0 };
      }
      tabMap[item.tabName].count += item.stackSize || 1;
      tabMap[item.tabName].totalChaos += item.totalPriceChaos;
    }

    totalChaos = Math.round(totalChaos * 100) / 100;
    const totalDivine = Math.round((totalChaos / divRate) * 100) / 100;

    const tabSummaries = Object.keys(tabMap).map(tabName => ({
      tabName,
      category: tabMap[tabName].category,
      itemCount: tabMap[tabName].count,
      totalValueChaos: Math.round(tabMap[tabName].totalChaos * 100) / 100,
      totalValueDivine: Math.round((tabMap[tabName].totalChaos / divRate) * 100) / 100
    })).sort((a, b) => b.totalValueChaos - a.totalValueChaos);

    if (latestSnapshot.tabSummaries) {
      for (const origTab of latestSnapshot.tabSummaries) {
        if (!tabMap[origTab.tabName]) {
          tabSummaries.push({
            tabName: origTab.tabName,
            category: origTab.category || 'General',
            itemCount: 0,
            totalValueChaos: 0,
            totalValueDivine: 0
          });
        }
      }
    }

    const topItems = [...filteredItems].sort((a, b) => b.totalPriceChaos - a.totalPriceChaos).slice(0, 20);

    return {
      totalChaos,
      totalDivine,
      tabSummaries,
      topItems,
      allItems: filteredItems
    };
  }, [latestSnapshot, filterState]);

  // 1. Export CSV File
  const handleExportCSV = () => {
    if (snapshots.length === 0) {
      onShowToast('目前尚無快照資料可匯出');
      return;
    }

    const headers = ['時間 (Timestamp)', '聯盟 (League)', '總價值 (Chaos)', '總價值 (Divine)', 'Divine 匯率', '時薪變化 (Chaos/hr)', '時薪變化 (Divine/hr)'];
    const rows = snapshots.map(s => [
      `"${new Date(s.timestamp).toLocaleString()}"`,
      `"${s.league}"`,
      s.totalChaos,
      s.totalDivine,
      s.chaosRate,
      s.hourlyChangeChaos || 0,
      s.hourlyChangeDivine || 0
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `poe_wealth_history_${league || 'settlers'}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast('已成功匯出資產歷程 CSV 報表！');
  };

  // 2. Copy Discord Markdown Summary
  const handleCopyDiscordMarkdown = async () => {
    if (!latestSnapshot) {
      onShowToast('目前尚無快照資料可複製');
      return;
    }

    const dateStr = new Date(latestSnapshot.timestamp).toLocaleString();
    const displayDiv = filteredData.totalDivine || latestSnapshot.totalDivine;
    const displayChaos = filteredData.totalChaos || latestSnapshot.totalChaos;

    let md = `📊 **Path of Exile 資產統計報表 (${latestSnapshot.league})**\n`;
    md += `⏰ **紀錄時間**: ${dateStr}\n`;
    md += `💰 **總資產估算**: **${displayDiv.toLocaleString()} Divine** (${displayChaos.toLocaleString()} Chaos)\n`;
    md += `📈 **當前時薪變化**: **${latestSnapshot.hourlyChangeDivine || 0} Div/hr** (${latestSnapshot.hourlyChangeChaos || 0} C/hr)\n`;
    md += `🪙 **Divine 匯率**: 1 Divine = ${latestSnapshot.chaosRate} Chaos\n\n`;

    const tabsToDisplay = filteredData.tabSummaries.length > 0 ? filteredData.tabSummaries : latestSnapshot.tabSummaries;
    if (tabsToDisplay && tabsToDisplay.length > 0) {
      md += `📂 **前 5 大倉庫頁面價值**:\n`;
      tabsToDisplay.slice(0, 5).forEach((tab, idx) => {
        md += `${idx + 1}. **${tab.tabName}**: ${tab.totalValueDivine} Div (${tab.itemCount} 件物品)\n`;
      });
    }

    try {
      await navigator.clipboard.writeText(md);
      onShowToast('已複製 Discord 格式資產摘要！可直接在聊天室貼上分享');
    } catch {
      onShowToast('複製失敗');
    }
  };

  const hasRealData = latestSnapshot && latestSnapshot.totalChaos > 0;
  const isFilterActive = (filterState.minValueChaos && filterState.minValueChaos > 0) ||
    (filterState.ignoredTabNames && filterState.ignoredTabNames.length > 0) ||
    (filterState.selectedCategory && filterState.selectedCategory !== 'ALL');

  const displayTotalDivine = isFilterActive ? filteredData.totalDivine : (latestSnapshot?.totalDivine || 0);
  const displayTotalChaos = isFilterActive ? filteredData.totalChaos : (latestSnapshot?.totalChaos || 0);

  const progressPercent = progress && progress.totalTabs > 0
    ? Math.min(100, Math.round((progress.currentTab / progress.totalTabs) * 100))
    : 0;

  return (
    <div style={{ padding: '20px', maxWidth: '1600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header & Controls Bar */}
      <div className="poe-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="poe-font" style={{ color: 'var(--text-gold)', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={20} color="var(--border-gold)" />
            每小時資產估算與倉庫價值追蹤 (Hourly Wealth Tracker)
          </h2>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            自動彙整角色身上與倉庫物品，並即時轉換為混沌石 (c) 與神聖石 (div) 價值
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {snapshots.length > 0 && (
            <>
              <button className="poe-btn" onClick={handleCopyDiscordMarkdown} style={{ padding: '6px 12px', fontSize: '0.8rem' }} title="複製 Discord Markdown 格式">
                <Share2 size={14} /> 分享摘要
              </button>

              <button className="poe-btn" onClick={handleExportCSV} style={{ padding: '6px 12px', fontSize: '0.8rem' }} title="下載完整歷程 CSV 報表">
                <Download size={14} /> 匯出 CSV
              </button>

              <button className="poe-btn" onClick={handleClearHistory} style={{ padding: '6px 10px', fontSize: '0.8rem' }} title="重置快照紀錄">
                <Trash2 size={14} /> 清除
              </button>
            </>
          )}

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', background: '#090c10', padding: '6px 12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <Clock size={14} color="var(--accent-green)" />
            每 60 分鐘自動紀錄
          </span>

          <button
            className="poe-btn poe-btn-primary"
            onClick={handleCreateSnapshot}
            disabled={snapshotting}
            style={{ padding: '8px 16px' }}
          >
            <RefreshCw size={14} className={snapshotting ? 'spin' : ''} />
            {snapshotting ? '計算中...' : '立即計算目前資產快照'}
          </button>
        </div>
      </div>

      {/* Real-time Progress Bar */}
      {snapshotting && progress && (
        <div className="poe-card" style={{ background: 'linear-gradient(90deg, rgba(200, 170, 110, 0.1), rgba(56, 189, 248, 0.08))', border: '1px solid rgba(200, 170, 110, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-gold)', fontWeight: 600 }}>
              🔄 正在拉取官方倉庫與背包資料：{progress.currentTabName || '準備中...'}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
              {progress.currentTab} / {progress.totalTabs} 頁 ({progressPercent}%)
            </span>
          </div>

          {/* Progress track */}
          <div style={{ width: '100%', height: '8px', background: 'rgba(0, 0, 0, 0.5)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${Math.max(5, progressPercent)}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #f3d179, #38bdf8)',
                transition: 'width 0.2s ease',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      )}

      {/* Top 4 Summary Cards */}
      {latestSnapshot && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Card 1: Total Value */}
          <div className="poe-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                總資產估算 (Total Wealth) {isFilterActive && <span style={{ color: 'var(--accent-blue)' }}>(篩選後)</span>}
              </span>
              <Coins size={16} color="var(--text-gold)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="poe-font" style={{ fontSize: '1.8rem', color: 'var(--text-gold)', fontWeight: 700 }}>
                {displayTotalDivine.toLocaleString()}
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--text-gold)' }}>Divine</span>
              <img src={divIconUrl} alt="div" referrerPolicy="no-referrer" style={{ width: '20px', height: '20px', verticalAlign: 'middle' }} />
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              約等於 {displayTotalChaos.toLocaleString()} Chaos
            </div>
          </div>

          {/* Card 2: Hourly Rate */}
          <div className="poe-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>打寶時薪 (Hourly Profit)</span>
              <ArrowUpRight size={16} color={latestSnapshot.hourlyChangeChaos && latestSnapshot.hourlyChangeChaos >= 0 ? '#4ade80' : '#f87171'} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="poe-font" style={{
                fontSize: '1.8rem',
                color: latestSnapshot.hourlyChangeDivine && latestSnapshot.hourlyChangeDivine >= 0 ? '#4ade80' : '#f87171',
                fontWeight: 700
              }}>
                {(latestSnapshot.hourlyChangeDivine || 0) > 0 ? `+${latestSnapshot.hourlyChangeDivine}` : (latestSnapshot.hourlyChangeDivine || 0)}
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Div / hr</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {(latestSnapshot.hourlyChangeChaos || 0) > 0 ? `+${latestSnapshot.hourlyChangeChaos}` : (latestSnapshot.hourlyChangeChaos || 0)} Chaos / hr
            </div>
          </div>

          {/* Card 3: Tracked Tabs */}
          <div className="poe-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>已追蹤倉庫頁 (Tracked Tabs)</span>
              <FileSpreadsheet size={16} color="var(--accent-blue)" />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="poe-font" style={{ fontSize: '1.8rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
                {filteredData.tabSummaries?.length || latestSnapshot.tabSummaries?.length || 0}
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)' }}>個頁面</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {filterState.ignoredTabNames.length > 0 ? `已排除 ${filterState.ignoredTabNames.length} 頁` : '含角色身上裝備與主要倉庫'}
            </div>
          </div>

          {/* Card 4: Rate & League */}
          <div className="poe-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>當前匯率基準 (Divine Rate)</span>
              <img src={chaosIconUrl} alt="chaos" referrerPolicy="no-referrer" style={{ width: '16px', height: '16px' }} />
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="poe-font" style={{ fontSize: '1.8rem', color: '#facc15', fontWeight: 700 }}>
                1 : {latestSnapshot.chaosRate}
              </span>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Chaos</span>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              聯盟: {latestSnapshot.league}
            </div>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <WealthChart snapshots={snapshots} />

      {/* Tabs Breakdown */}
      {hasRealData && latestSnapshot && (
        <TabBreakdown
          tabSummaries={filteredData.tabSummaries.length > 0 ? filteredData.tabSummaries : (latestSnapshot.tabSummaries || [])}
          topItems={filteredData.topItems.length > 0 ? filteredData.topItems : (latestSnapshot.topItems || [])}
          totalChaos={displayTotalChaos}
          totalDivine={displayTotalDivine}
          allItems={latestSnapshot.allItems || []}
          ignoredTabNames={filterState.ignoredTabNames || []}
          onToggleIgnoreTab={handleToggleIgnoreTab}
          minValueChaos={filterState.minValueChaos || 0}
          onChangeMinValueChaos={handleChangeMinValueChaos}
          selectedCategory={filterState.selectedCategory || 'ALL'}
          onChangeCategory={handleChangeCategory}
          onResetFilters={handleResetFilters}
        />
      )}

      {!hasRealData && (
        <div className="poe-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
          <ShieldAlert size={36} color="var(--border-gold)" style={{ margin: '0 auto 12px auto' }} />
          <h3 className="poe-font" style={{ color: 'var(--text-gold)', marginBottom: '8px' }}>尚未讀取到真實資產數據</h3>
          <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '0.9rem', lineHeight: '1.6' }}>
            請點擊右上角 ⚙️ <strong>「系統設定」</strong> 填入您的官方 <strong>POESESSID</strong> 與 <strong>帳號名稱</strong>，並確認選擇正確的賽季聯盟，然後點擊上方「立即計算目前資產快照」。
          </p>
        </div>
      )}
    </div>
  );
};

export default WealthTracker;
