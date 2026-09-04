import React, { useMemo } from 'react';
import type { AtlasStrategy, AtlasMechanicCategory } from '../../domain/atlas/types';
import { getCategoryMetadata } from '../../domain/atlas/types';
import { X } from 'lucide-react';

interface AtlasCategoryFilterBarProps {
  strategies: AtlasStrategy[];
  filterCategory: AtlasMechanicCategory;
  onFilterCategory: (cat: AtlasMechanicCategory) => void;
  onDeleteCategory?: (cat: AtlasMechanicCategory) => void;
}

export const AtlasCategoryFilterBar: React.FC<AtlasCategoryFilterBarProps> = ({
  strategies,
  filterCategory,
  onFilterCategory,
  onDeleteCategory
}) => {
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: strategies.length };
    strategies.forEach(s => {
      counts[s.category] = (counts[s.category] || 0) + 1;
    });
    return counts;
  }, [strategies]);

  const activeCategories = useMemo(() => {
    const list: Array<{ id: AtlasMechanicCategory; label: string; icon: string; count: number }> = [
      { id: 'all', label: '全部機制', icon: '🌐', count: strategies.length }
    ];

    const distinctCategories = Array.from(new Set(strategies.map(s => s.category)));
    distinctCategories.forEach(catId => {
      if (catId === 'all') return;
      const meta = getCategoryMetadata(catId);
      list.push({
        id: catId as AtlasMechanicCategory,
        label: meta.label,
        icon: meta.icon,
        count: categoryCounts[catId] || 0
      });
    });

    return list;
  }, [strategies, categoryCounts]);

  return (
    <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px', alignItems: 'center' }}>
      {activeCategories.map(cat => {
        const isActive = filterCategory === cat.id;
        return (
          <div
            key={cat.id}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: isActive ? 'linear-gradient(135deg, #c8aa6e 0%, #8c7849 100%)' : 'rgba(255, 255, 255, 0.04)',
              border: isActive ? '1px solid #f3d179' : '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '4px',
              padding: '2px 4px 2px 8px',
              color: isActive ? '#0d121c' : '#cbd5e1',
              cursor: 'pointer',
              fontWeight: isActive ? 600 : 400,
              fontSize: '0.78rem',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
            onClick={() => onFilterCategory(cat.id)}
          >
            <span style={{ marginRight: '5px' }}>{cat.icon}</span>
            <span>{cat.label}</span>
            <span style={{
              marginLeft: '5px',
              fontSize: '0.7rem',
              padding: '1px 5px',
              borderRadius: '10px',
              background: isActive ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.1)',
              color: isActive ? '#fff' : '#94a3b8'
            }}>
              {cat.count}
            </span>

            {cat.id !== 'all' && onDeleteCategory && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCategory(cat.id);
                }}
                title={`刪除【${cat.label}】分類及其下所有策略`}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: isActive ? '#450a0a' : '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px 4px',
                  marginLeft: '4px',
                  borderRadius: '3px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                onMouseLeave={(e) => (e.currentTarget.style.color = isActive ? '#450a0a' : '#94a3b8')}
              >
                <X size={12} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};
