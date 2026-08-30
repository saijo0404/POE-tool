import React, { useState, useEffect, useMemo } from 'react';
import type { AtlasStrategy, AtlasMechanicCategory } from '../../domain/atlas/types';
import { ATLAS_CATEGORIES_METADATA } from '../../domain/atlas/types';
import { parseAtlasUrlOrBase64 } from '../../domain/atlas/atlasTreeEncoder';
import { X, Save, Edit3, Shield, MapPin, Link2, Trash2 } from 'lucide-react';

interface AtlasEditStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: AtlasStrategy | null;
  onSave: (strategy: AtlasStrategy) => void;
  onDelete?: (strategyId: string) => void;
}

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

export const AtlasEditStrategyModal: React.FC<AtlasEditStrategyModalProps> = ({
  isOpen,
  onClose,
  strategy,
  onSave,
  onDelete
}) => {
  const [formData, setFormData] = useState<AtlasStrategy | null>(null);
  const [mapsInput, setMapsInput] = useState<string>('');
  const [keystonesInput, setKeystonesInput] = useState<string>('');
  const [tagsInput, setTagsInput] = useState<string>('');

  useEffect(() => {
    if (strategy) {
      setFormData(JSON.parse(JSON.stringify(strategy)));
      const firstTier = strategy.tiers[0];
      setMapsInput(firstTier?.recommendedMaps?.join(', ') || '');
      setKeystonesInput(firstTier?.coreKeystones?.join(', ') || '');
      setTagsInput(strategy.tags?.join(', ') || '');
    }
  }, [strategy]);

  const categoryOptions = useMemo(() => {
    return Object.values(ATLAS_CATEGORIES_METADATA)
      .filter(meta => meta.id !== 'all')
      .map(meta => ({
        value: meta.id as AtlasMechanicCategory,
        label: `${meta.icon} ${meta.label} (${meta.labelEn})`
      }));
  }, []);

  const handleToggleTag = (tag: string) => {
    const currentTags = tagsInput
      .split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean);
    const nextTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setTagsInput(nextTags.join(', '));
  };

  if (!isOpen || !formData) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    // Parse maps, keystones, and tags with support for English & Chinese commas
    const recommendedMaps = mapsInput
      .split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean);

    const coreKeystones = keystonesInput
      .split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean);

    const tags = tagsInput
      .split(/[,，]/)
      .map(s => s.trim())
      .filter(Boolean);

    // Apply to tiers and sync allocatedNodes if valid atlasTreeUrl is provided
    const updatedTiers = formData.tiers.map((t, idx) => {
      let allocatedNodes = t.allocatedNodes;
      if (idx === 0 && t.atlasTreeUrl && t.atlasTreeUrl.trim()) {
        const decoded = parseAtlasUrlOrBase64(t.atlasTreeUrl.trim());
        if (decoded.isOk() && decoded.value.nodeIds.length > 0) {
          allocatedNodes = decoded.value.nodeIds;
        }
      }
      return {
        ...t,
        allocatedNodes,
        recommendedMaps,
        coreKeystones
      };
    });

    const updatedStrategy: AtlasStrategy = {
      ...formData,
      tags,
      tiers: updatedTiers,
      updatedAt: Date.now()
    };

    onSave(updatedStrategy);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="poe-card" style={{
        width: '100%',
        maxWidth: '650px',
        maxHeight: '90vh',
        overflowY: 'auto',
        backgroundColor: '#0d121c',
        border: '1.5px solid var(--border-gold)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={18} color="var(--text-gold)" />
            <h3 className="poe-font" style={{ fontSize: '1.15rem', color: 'var(--text-gold)', margin: 0 }}>
              編輯輿圖策略設定
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Strategy Name */}
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              策略名稱 (Strategy Name)：
            </label>
            <input
              type="text"
              className="poe-input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ width: '100%', height: '34px', fontSize: '0.86rem' }}
            />
          </div>

          {/* Mechanic Category & Tags */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                機制分類 (Category)：
              </label>
              <select
                className="poe-input"
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value as AtlasMechanicCategory })}
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
                onChange={e => setTagsInput(e.target.value)}
                placeholder="例如: 速刷, 高利潤, 命運卡"
                style={{ width: '100%', height: '34px', fontSize: '0.86rem' }}
              />
            </div>
          </div>

          {/* Quick Tag Pills */}
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
                    onClick={() => handleToggleTag(tag)}
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

          {/* Description */}
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              策略簡介說明 (Description)：
            </label>
            <textarea
              className="poe-input"
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              style={{ width: '100%', fontSize: '0.84rem', resize: 'vertical' }}
            />
          </div>

          {/* Recommended Maps */}
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <MapPin size={14} /> 推薦地圖清單 (Recommended Maps, 逗號分隔)：
            </label>
            <input
              type="text"
              className="poe-input"
              value={mapsInput}
              onChange={e => setMapsInput(e.target.value)}
              placeholder="例如: T16 地圖, T17 地圖, T16 8詞已污染地圖"
              style={{ width: '100%', height: '34px', fontSize: '0.84rem' }}
            />
          </div>

          {/* Core Keystones */}
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Shield size={14} /> 核心輿圖基石天賦 (Keystones, 逗號分隔)：
            </label>
            <input
              type="text"
              className="poe-input"
              value={keystonesInput}
              onChange={e => setKeystonesInput(e.target.value)}
              placeholder="例如: 第七道門, 不屈之志, 專注單一, 命運扭曲"
              style={{ width: '100%', height: '34px', fontSize: '0.84rem' }}
            />
          </div>

          {/* Atlas Tree URL */}
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <Link2 size={14} /> 輿圖天賦樹網址 / 代碼 (PoEPlanner / 官方網址 / Base64)：
            </label>
            <input
              type="text"
              className="poe-input"
              value={formData.tiers[0]?.atlasTreeUrl || ''}
              onChange={e => {
                const url = e.target.value;
                const newTiers = formData.tiers.map((t, idx) => (idx === 0 ? { ...t, atlasTreeUrl: url } : t));
                setFormData({ ...formData, tiers: newTiers });
              }}
              placeholder="https://poeplanner.com/atlas-tree/... 或 官方天賦網址 或 Base64"
              style={{ width: '100%', height: '34px', fontSize: '0.84rem' }}
            />
            <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginTop: '3px' }}>
              💡 提示：儲存時將自動解析天賦節點並同步至內建輿圖規劃器畫布。
            </div>
          </div>

          {/* Mechanic Notes */}
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              刷圖技巧與機制要點說明 (Mechanic Notes)：
            </label>
            <textarea
              className="poe-input"
              value={formData.tiers[0]?.mechanicNotes || ''}
              onChange={e => {
                const notes = e.target.value;
                const newTiers = formData.tiers.map((t, idx) => (idx === 0 ? { ...t, mechanicNotes: notes } : t));
                setFormData({ ...formData, tiers: newTiers });
              }}
              rows={2}
              placeholder="例如: 瓦爾寶珠點恐懼/忌妒/傲慢/輕蔑；一鍵引爆避開免疫詞綴..."
              style={{ width: '100%', fontSize: '0.84rem', resize: 'vertical' }}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', gap: '8px' }}>
            {onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`確定要刪除策略「${formData.name}」嗎？`)) {
                    onDelete(formData.id);
                    onClose();
                  }
                }}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171',
                  padding: '6px 14px',
                  borderRadius: '4px',
                  fontSize: '0.84rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Trash2 size={14} /> 刪除策略
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className="poe-button-secondary"
                onClick={onClose}
                style={{ padding: '6px 16px', fontSize: '0.84rem' }}
              >
                取消
              </button>
              <button
                type="submit"
                className="poe-button"
                style={{ padding: '6px 20px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Save size={15} /> 儲存策略設定
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
