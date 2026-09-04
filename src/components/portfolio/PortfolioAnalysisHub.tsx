import React from 'react';
import type { WealthSnapshot } from '../../types/poe';
import { usePortfolioAnalysis } from '../../hooks/usePortfolioAnalysis';
import { PortfolioDonutChart } from './PortfolioDonutChart';
import { CategoryDrilldownList } from './CategoryDrilldownList';
import { NetWorthGrowthChart } from './NetWorthGrowthChart';
import { PortfolioSummaryExportModal } from './PortfolioSummaryExportModal';
import { Briefcase, Share2, TrendingUp } from 'lucide-react';

interface PortfolioAnalysisHubProps {
  snapshots?: WealthSnapshot[];
  latestSnapshot?: WealthSnapshot | null;
  divineRate?: number;
  league?: string;
  onShowToast?: (msg: string) => void;
}

export const PortfolioAnalysisHub: React.FC<PortfolioAnalysisHubProps> = ({
  snapshots = [],
  latestSnapshot,
  divineRate = 150,
  league = 'Settlers',
  onShowToast
}) => {
  const {
    selectedCategory,
    setSelectedCategory,
    currencyMode,
    setCurrencyMode,
    timeframe,
    setTimeframe,
    isExportModalOpen,
    setIsExportModalOpen,
    categoryAllocations,
    selectedCategoryAllocation,
    timeline,
    analysisResult,
    handleCopyMarkdown,
    handleCopyCSV,
    handleCopyDiscord
  } = usePortfolioAnalysis({ snapshots, latestSnapshot, divineRate, league, onShowToast });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header Cards */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 className="poe-font" style={{ margin: 0, fontSize: '1.3rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Briefcase size={20} color="var(--border-gold)" /> 玩家資產組合結構分析與淨值成長報表
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            跨品類資產佔比圓餅圖、品類細項排行榜與賽季淨值飛躍歷程 (聯盟：{league})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Currency Switch */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--bg-dark)', padding: '3px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
            <button type="button" onClick={() => setCurrencyMode('divine')} className={currencyMode === 'divine' ? 'poe-button' : 'poe-button-secondary'} style={{ padding: '4px 10px', fontSize: '0.78rem' }}>Divine</button>
            <button type="button" onClick={() => setCurrencyMode('chaos')} className={currencyMode === 'chaos' ? 'poe-button' : 'poe-button-secondary'} style={{ padding: '4px 10px', fontSize: '0.78rem' }}>Chaos</button>
          </div>

          <button
            type="button"
            onClick={() => setIsExportModalOpen(true)}
            className="poe-button"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '6px 14px' }}
          >
            <Share2 size={14} /> 匯出分析總結
          </button>
        </div>
      </div>

      {/* Summary KPI Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>總倉庫資產淨值</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-gold)', marginTop: '2px' }}>
            {currencyMode === 'divine' ? `${analysisResult.totalDivine} D` : `${analysisResult.totalChaos.toLocaleString()} C`}
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>賽季總淨值增長</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: analysisResult.totalGrowthPercent >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={16} /> +{analysisResult.totalGrowthPercent}%
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>資產分類數</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-bright)', marginTop: '2px' }}>
            {categoryAllocations.length} <span style={{ fontSize: '0.78rem', fontWeight: 400, color: 'var(--text-dim)' }}>大類</span>
          </div>
        </div>
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>最大資產部位</div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700, color: categoryAllocations[0]?.color || 'var(--text-bright)', marginTop: '4px' }}>
            {categoryAllocations[0]?.label.split(' ')[0] || '無'} ({categoryAllocations[0]?.percentage || 0}%)
          </div>
        </div>
      </div>

      {/* Donut & Drilldown Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '16px' }}>
        <PortfolioDonutChart
          categories={categoryAllocations}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          totalChaos={analysisResult.totalChaos}
          totalDivine={analysisResult.totalDivine}
          currencyMode={currencyMode}
        />
        <CategoryDrilldownList
          allocation={selectedCategoryAllocation}
          currencyMode={currencyMode}
        />
      </div>

      {/* Growth Timeline */}
      <NetWorthGrowthChart
        timeline={timeline}
        currencyMode={currencyMode}
        timeframe={timeframe}
        onSelectTimeframe={setTimeframe}
      />

      <PortfolioSummaryExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        analysis={analysisResult}
        league={league}
        onCopyMarkdown={handleCopyMarkdown}
        onCopyCSV={handleCopyCSV}
        onCopyDiscord={handleCopyDiscord}
      />
    </div>
  );
};
