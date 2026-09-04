import React, { useState, useEffect, useCallback } from 'react';
import type { AtlasStrategy } from '../../domain/atlas/types';
import { parseAtlasUrlOrBase64 } from '../../domain/atlas/atlasTreeEncoder';
import { X, Save, Edit3, Trash2 } from 'lucide-react';
import { StrategyMetaFields } from './edit/StrategyMetaFields';
import { StrategyTierFields } from './edit/StrategyTierFields';

interface AtlasEditStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  strategy: AtlasStrategy | null;
  onSave: (strategy: AtlasStrategy) => void;
  onDelete?: (strategyId: string) => void;
}

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

  const handleToggleTag = useCallback((tag: string) => {
    const current = tagsInput.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    const next = current.includes(tag) ? current.filter(t => t !== tag) : [...current, tag];
    setTagsInput(next.join(', '));
  }, [tagsInput]);

  if (!isOpen || !formData) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const recommendedMaps = mapsInput.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    const coreKeystones = keystonesInput.split(/[,，]/).map(s => s.trim()).filter(Boolean);
    const tags = tagsInput.split(/[,，]/).map(s => s.trim()).filter(Boolean);

    const updatedTiers = formData.tiers.map((t, idx) => {
      let allocatedNodes = t.allocatedNodes;
      if (idx === 0 && t.atlasTreeUrl?.trim()) {
        const decoded = parseAtlasUrlOrBase64(t.atlasTreeUrl.trim());
        if (decoded.isOk() && decoded.value.nodeIds.length > 0) {
          allocatedNodes = decoded.value.nodeIds;
        }
      }
      return { ...t, allocatedNodes, recommendedMaps, coreKeystones };
    });

    onSave({ ...formData, tags, tiers: updatedTiers, updatedAt: Date.now() });
  };

  const handleDelete = () => {
    if (onDelete && window.confirm(`確定要刪除策略「${formData.name}」嗎？`)) {
      onDelete(formData.id);
      onClose();
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="poe-card" style={{
        width: '100%', maxWidth: '650px', maxHeight: '90vh', overflowY: 'auto',
        backgroundColor: '#0d121c', border: '1.5px solid var(--border-gold)',
        display: 'flex', flexDirection: 'column', gap: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Edit3 size={18} color="var(--text-gold)" />
            <h3 className="poe-font" style={{ fontSize: '1.15rem', color: 'var(--text-gold)', margin: 0 }}>
              編輯輿圖策略設定
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StrategyMetaFields
            name={formData.name}
            category={formData.category}
            tagsInput={tagsInput}
            description={formData.description}
            onChangeName={val => setFormData({ ...formData, name: val })}
            onChangeCategory={cat => setFormData({ ...formData, category: cat })}
            onChangeTagsInput={setTagsInput}
            onToggleTag={handleToggleTag}
            onChangeDescription={desc => setFormData({ ...formData, description: desc })}
          />

          <StrategyTierFields
            mapsInput={mapsInput}
            keystonesInput={keystonesInput}
            atlasTreeUrl={formData.tiers[0]?.atlasTreeUrl || ''}
            mechanicNotes={formData.tiers[0]?.mechanicNotes || ''}
            onChangeMapsInput={setMapsInput}
            onChangeKeystonesInput={setKeystonesInput}
            onChangeAtlasTreeUrl={url => {
              const newTiers = formData.tiers.map((t, i) => (i === 0 ? { ...t, atlasTreeUrl: url } : t));
              setFormData({ ...formData, tiers: newTiers });
            }}
            onChangeMechanicNotes={notes => {
              const newTiers = formData.tiers.map((t, i) => (i === 0 ? { ...t, mechanicNotes: notes } : t));
              setFormData({ ...formData, tiers: newTiers });
            }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px', gap: '8px' }}>
            {onDelete ? (
              <button
                type="button"
                onClick={handleDelete}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)',
                  color: '#f87171', padding: '6px 14px', borderRadius: '4px', fontSize: '0.84rem',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Trash2 size={14} /> 刪除策略
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="poe-button-secondary" onClick={onClose} style={{ padding: '6px 16px', fontSize: '0.84rem' }}>
                取消
              </button>
              <button type="submit" className="poe-button" style={{ padding: '6px 20px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Save size={15} /> 儲存策略設定
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
