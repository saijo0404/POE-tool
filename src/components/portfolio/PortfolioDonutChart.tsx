import React, { useState } from 'react';
import type { CategoryAllocation } from '../../domain/portfolio/types';
import type { StashItemCategory } from '../../types/poe';
import { generateDonutChartPaths } from '../../domain/portfolio/portfolioCalculator';
import { PieChart } from 'lucide-react';

interface PortfolioDonutChartProps {
  categories: CategoryAllocation[];
  selectedCategory: StashItemCategory | 'All';
  onSelectCategory: (cat: StashItemCategory | 'All') => void;
  totalChaos: number;
  totalDivine: number;
  currencyMode: 'chaos' | 'divine';
}

export const PortfolioDonutChart: React.FC<PortfolioDonutChartProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  totalChaos,
  totalDivine,
  currencyMode
}) => {
  const [hoveredCategory, setHoveredCategory] = useState<CategoryAllocation | null>(null);

  const radius = 100;
  const innerRadius = 60;
  const size = radius * 2;
  const paths = generateDonutChartPaths(categories, radius, innerRadius);

  const activeCategory = hoveredCategory || categories.find(c => c.category === selectedCategory);
  const centerValue = activeCategory
    ? currencyMode === 'divine' ? `${activeCategory.totalDivine} D` : `${activeCategory.totalChaos.toLocaleString()} C`
    : currencyMode === 'divine' ? `${totalDivine} D` : `${totalChaos.toLocaleString()} C`;

  const centerLabel = activeCategory ? activeCategory.label.split(' ')[0] : '總資產淨值';
  const centerSub = activeCategory ? `${activeCategory.percentage}% 佔比` : `${categories.length} 類資產`;

  return (
    <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 className="poe-font" style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PieChart size={17} /> 資產組合分類佔比 (Portfolio Allocation)
        </h3>
        {selectedCategory !== 'All' && (
          <button type="button" onClick={() => onSelectCategory('All')} className="poe-button-secondary" style={{ padding: '2px 8px', fontSize: '0.72rem' }}>顯示全部</button>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px' }}>
        {/* SVG Donut */}
        <div style={{ position: 'relative', width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: 'visible' }}>
            {paths.map(({ path, category }) => {
              const isSelected = selectedCategory === category.category;
              const isHovered = hoveredCategory?.category === category.category;
              return (
                <path
                  key={category.category}
                  d={path}
                  fill={category.color}
                  opacity={isSelected || isHovered ? 1 : selectedCategory === 'All' ? 0.85 : 0.4}
                  stroke="var(--bg-card)"
                  strokeWidth="2"
                  style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  onClick={() => onSelectCategory(category.category)}
                  onMouseEnter={() => setHoveredCategory(category)}
                  onMouseLeave={() => setHoveredCategory(null)}
                />
              );
            })}
          </svg>

          {/* Center Info */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{centerLabel}</span>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-gold)' }}>{centerValue}</span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>{centerSub}</span>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '170px' }}>
          {categories.map(c => {
            const isSelected = selectedCategory === c.category;
            return (
              <div
                key={c.category}
                onClick={() => onSelectCategory(c.category)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  backgroundColor: isSelected ? 'var(--bg-card-hover)' : 'transparent',
                  border: isSelected ? `1px solid ${c.color}` : '1px solid transparent',
                  cursor: 'pointer',
                  fontSize: '0.78rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color }} />
                  <span style={{ color: 'var(--text-bright)' }}>{c.label.split(' ')[0]}</span>
                </div>
                <span style={{ fontWeight: 600, color: c.color }}>{c.percentage}%</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
