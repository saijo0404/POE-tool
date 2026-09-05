import React, { useMemo } from 'react';
import { Flame, Star, Trophy, MapPin, Compass } from 'lucide-react';
import {
  calculateMapPerformanceHeatmap,
  type MapPerformanceStats
} from '../../domain/mapping/mapDropHeatmap';
import type { MapRun } from '../../domain/mapping/types';

interface MapPerformanceHeatmapProps {
  runs: MapRun[];
  divineRate?: number;
}

function StarRating({ count }: { count: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px', color: '#facc15' }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={12}
          fill={i < count ? '#facc15' : 'transparent'}
          color={i < count ? '#facc15' : 'rgba(255,255,255,0.2)'}
        />
      ))}
    </div>
  );
}

function getHeatmapBarColor(score: number): string {
  if (score >= 80) return 'linear-gradient(90deg, #f59e0b, #ef4444)';
  if (score >= 60) return 'linear-gradient(90deg, #10b981, #f59e0b)';
  if (score >= 40) return 'linear-gradient(90deg, #3b82f6, #10b981)';
  return 'linear-gradient(90deg, #6b7280, #3b82f6)';
}

function HeatmapProgressBar({ score }: { score: number }) {
  return (
    <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
      <div
        style={{
          width: `${score}%`,
          height: '100%',
          background: getHeatmapBarColor(score),
          borderRadius: '2px'
        }}
      />
    </div>
  );
}

function EmptyHeatmap() {
  return (
    <div className="poe-card" style={{ padding: '20px', textAlign: 'center' }}>
      <Compass size={28} color="var(--text-dim)" style={{ margin: '0 auto 8px auto' }} />
      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        尚無足夠的地圖場次資料，完成地圖刷圖結算後將自動生成地形收益熱力圖。
      </div>
    </div>
  );
}

interface HeaderProps {
  totalAnalyzedRuns: number;
  totalUniqueMaps: number;
  bestYieldMap?: MapPerformanceStats;
}

function HeatmapHeader({ totalAnalyzedRuns, totalUniqueMaps, bestYieldMap }: HeaderProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Flame size={18} color="#f97316" />
        <h3 className="poe-font" style={{ fontSize: '1.05rem', color: 'var(--text-gold)', margin: 0 }}>
          地圖歷史地形收益熱力圖 (Map Performance Heatmap)
        </h3>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          已分析 {totalAnalyzedRuns} 場，共 {totalUniqueMaps} 種地形
        </span>
      </div>

      {bestYieldMap && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.78rem',
          background: 'rgba(234, 179, 8, 0.15)',
          border: '1px solid rgba(234, 179, 8, 0.3)',
          padding: '3px 10px',
          borderRadius: '12px',
          color: '#fde047'
        }}>
          <Trophy size={13} />
          <span>首選地形：<strong>{bestYieldMap.mapName}</strong> ({bestYieldMap.yieldScore} 分)</span>
        </div>
      )}
    </div>
  );
}

function HeatmapItemHeader({ stat, idx }: { stat: MapPerformanceStats; idx: number }) {
  const isTop = idx === 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isTop ? 'var(--text-gold)' : 'var(--text-dim)', minWidth: '22px' }}>
        #{idx + 1}
      </span>
      <MapPin size={14} color="var(--text-gold)" />
      <span style={{ fontWeight: 600, color: 'var(--text-light)', fontSize: '0.88rem' }}>{stat.mapName}</span>
      {stat.tier && (
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', padding: '1px 5px', borderRadius: '3px' }}>
          T{stat.tier}
        </span>
      )}
      <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>({stat.totalRuns} 場)</span>
    </div>
  );
}

function HeatmapItemYield({ stat }: { stat: MapPerformanceStats }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#86efac' }}>
          +{stat.avgNetProfitChaos} C <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>/場</span>
        </div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>~{stat.divinePerHour} Div/hr</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
        <StarRating count={stat.recommendationStars} />
        <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>熱力指數: {stat.yieldScore}</span>
      </div>
    </div>
  );
}

function HeatmapCardItem({ stat, idx }: { stat: MapPerformanceStats; idx: number }) {
  const isTop = idx === 0;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '10px 14px',
        background: isTop ? 'rgba(243, 209, 121, 0.05)' : 'rgba(255, 255, 255, 0.02)',
        border: isTop ? '1px solid rgba(243, 209, 121, 0.25)' : '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '6px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <HeatmapItemHeader stat={stat} idx={idx} />
        <HeatmapItemYield stat={stat} />
      </div>
      <HeatmapProgressBar score={stat.yieldScore} />
      {stat.topDropName && (
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
          ✨ 頂級掉落紀錄：<strong style={{ color: 'var(--text-light)' }}>{stat.topDropName}</strong> (~{stat.topDropValueChaos} C)
        </div>
      )}
    </div>
  );
}

export const MapPerformanceHeatmap: React.FC<MapPerformanceHeatmapProps> = ({
  runs,
  divineRate = 150
}) => {
  const analysis = useMemo(() => {
    return calculateMapPerformanceHeatmap(runs, divineRate);
  }, [runs, divineRate]);

  if (analysis.maps.length === 0) {
    return <EmptyHeatmap />;
  }

  return (
    <div className="poe-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <HeatmapHeader
        totalAnalyzedRuns={analysis.totalAnalyzedRuns}
        totalUniqueMaps={analysis.totalUniqueMaps}
        bestYieldMap={analysis.bestYieldMap}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {analysis.maps.map((stat: MapPerformanceStats, idx: number) => (
          <HeatmapCardItem key={stat.mapName} stat={stat} idx={idx} />
        ))}
      </div>
    </div>
  );
};
