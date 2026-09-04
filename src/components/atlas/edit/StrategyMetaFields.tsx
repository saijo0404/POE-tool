import React, { useMemo } from 'react';
import type { AtlasMechanicCategory } from '../../../domain/atlas/types';
import { ATLAS_CATEGORIES_METADATA } from '../../../domain/atlas/types';

const POPULAR_TAGS = [
  '速刷',
  '高利潤',
  '低成本',
  'T17',
  '8詞綴',
  '命運卡',
  '精髓',
  '甲蟲收益',
  '休閒',
  '炸墳',
  '軍團',
  '莊園',
  '通牒'
];

interface StrategyMetaFieldsProps {
  name: string;
  category: AtlasMechanicCategory;
  tagsInput: string;
  description: string;
  onChangeName: (name: string) => void;
  onChangeCategory: (category: AtlasMechanicCategory) => void;
  onChangeTagsInput: (tags: string) => void;
  onToggleTag: (tag: string) => void;
  onChangeDescription: (description: string) => void;
}

export const StrategyMetaFields: React.FC<StrategyMetaFieldsProps> = ({
  name,
  category,
  tagsInput,
  description,
  onChangeName,
  onChangeCategory,
  onChangeTagsInput,
  onToggleTag,
  onChangeDescription
}) => {
  const categoryOptions = useMemo(() => {
    return Object.values(ATLAS_CATEGORIES_METADATA)
      .filter(meta => meta.id !== 'all')
      .map(meta => ({
        value: meta.id as AtlasMechanicCategory,
        label: `${meta.icon} ${meta.label} (${meta.labelEn})`
      }));
  }, []);

  return (
    <>
      <div>
        <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
          策略名稱 (Strategy Name)：
        </label>
        <input
          type="text"
          className="poe-input"
          value={name}
          onChange={e => onChangeName(e.target.value)}
          required
          style={{ width: '100%', height: '34px', fontSize: '0.86rem' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <div>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            機制分類 (Category)：
          </label>
          <select
            className="poe-input"
            value={category}
            onChange={e => onChangeCategory(e.target.value as AtlasMechanicCategory)}
            style={{ width: '100%', height: '34px', fontSize: '0.86rem', padding: '0 8px' }}
          >
            {categoryOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
            標籤 (Tags, 逗號分隔)：
          </label>
          <input
            type="text"
            className="poe-input"
            value={tagsInput}
            onChange={e => onChangeTagsInput(e.target.value)}
            placeholder="例如: 速刷, 高利潤, 命運卡"
            style={{ width: '100%', height: '34px', fontSize: '0.86rem' }}
          />
        </div>
      </div>

      <div>
        <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: '3px' }}>
          常用標籤快速增減：
        </div>
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
          {POPULAR_TAGS.map(tag => {
            const active = tagsInput
              .split(/[,，]/)
              .map(s => s.trim())
              .includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => onToggleTag(tag)}
                style={{
                  background: active ? 'rgba(243, 209, 121, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                  border: active ? '1px solid var(--border-gold-bright)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: active ? 'var(--text-gold)' : '#94a3b8',
                  borderRadius: '3px',
                  padding: '2px 6px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {active ? `✓ ${tag}` : `+ ${tag}`}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
          策略簡介說明 (Description)：
        </label>
        <textarea
          className="poe-input"
          value={description}
          onChange={e => onChangeDescription(e.target.value)}
          rows={2}
          style={{ width: '100%', fontSize: '0.84rem', resize: 'vertical' }}
        />
      </div>
    </>
  );
};
