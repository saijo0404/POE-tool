import React, { useState } from 'react';
import type { AtlasStrategyTier } from '../../domain/atlas/types';
import { Plus, Edit2, Copy, Trash2, Check, X, Layers } from 'lucide-react';

interface AtlasTierSelectorProps {
  tiers: AtlasStrategyTier[];
  selectedTierId: string;
  onSelectTier: (id: string) => void;
  onAddTier: (name: string) => void;
  onDuplicateTier: (id: string) => void;
  onDeleteTier: (id: string) => void;
  onRenameTier: (id: string, newName: string) => void;
}

export const AtlasTierSelector: React.FC<AtlasTierSelectorProps> = ({
  tiers,
  selectedTierId,
  onSelectTier,
  onAddTier,
  onDuplicateTier,
  onDeleteTier,
  onRenameTier
}) => {
  const [isAddingTier, setIsAddingTier] = useState<boolean>(false);
  const [newTierName, setNewTierName] = useState<string>('');
  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editTierName, setEditTierName] = useState<string>('');

  const handleStartRename = (tier: AtlasStrategyTier, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTierId(tier.id);
    setEditTierName(tier.name);
  };

  const handleSaveRename = (tierId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (editTierName.trim()) {
      onRenameTier(tierId, editTierName.trim());
    }
    setEditingTierId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingTierId(null);
  };

  const handleCreateTier = () => {
    if (newTierName.trim()) {
      onAddTier(newTierName.trim());
      setNewTierName('');
      setIsAddingTier(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px',
      padding: '8px 14px',
      background: 'rgba(0, 0, 0, 0.3)',
      borderRadius: '6px',
      border: '1px solid rgba(200, 170, 110, 0.15)',
      marginBottom: '16px'
    }}>
      {/* Tiers List */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gold)', fontSize: '0.85rem', fontWeight: 600, marginRight: '4px' }}>
          <Layers size={16} />
          <span>分級策略 (Tiers)：</span>
        </div>

        {tiers.map((tier, idx) => {
          const isSelected = tier.id === selectedTierId;
          const isEditing = editingTierId === tier.id;

          if (isEditing) {
            return (
              <div key={tier.id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <input
                  type="text"
                  className="poe-input"
                  value={editTierName}
                  onChange={e => setEditTierName(e.target.value)}
                  style={{ height: '32px', fontSize: '0.82rem', padding: '0 8px', width: '150px' }}
                  autoFocus
                />
                <button
                  type="button"
                  className="poe-button"
                  onClick={e => handleSaveRename(tier.id, e)}
                  style={{ padding: '0 6px', height: '32px' }}
                  title="確認"
                >
                  <Check size={14} />
                </button>
                <button
                  type="button"
                  className="poe-button-secondary"
                  onClick={handleCancelRename}
                  style={{ padding: '0 6px', height: '32px' }}
                  title="取消"
                >
                  <X size={14} />
                </button>
              </div>
            );
          }

          // Badge style by index (Tier 0: Green, Tier 1: Gold, Tier 2: Purple)
          const tierColors = ['#22c55e', '#f59e0b', '#a855f7', '#38bdf8'];
          const dotColor = tierColors[idx % tierColors.length];

          return (
            <div
              key={tier.id}
              onClick={() => onSelectTier(tier.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 12px',
                borderRadius: '6px',
                background: isSelected ? 'linear-gradient(180deg, #2b3346 0%, #171d2b 100%)' : 'rgba(255, 255, 255, 0.04)',
                border: isSelected ? '1px solid var(--border-gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                color: isSelected ? '#ffffff' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.83rem',
                fontWeight: isSelected ? 600 : 500,
                boxShadow: isSelected ? '0 0 8px rgba(200, 170, 110, 0.25)' : 'none',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dotColor }} />
              <span>{tier.name}</span>

              {/* Action Icons for active tier */}
              {isSelected && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
                  <button
                    type="button"
                    onClick={e => handleStartRename(tier, e)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-gold)', cursor: 'pointer', padding: '2px' }}
                    title="重新命名此分級"
                  >
                    <Edit2 size={12} />
                  </button>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); onDuplicateTier(tier.id); }}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '2px' }}
                    title="複製此分級"
                  >
                    <Copy size={12} />
                  </button>
                  {tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        if (window.confirm(`確定要刪除分級「${tier.name}」嗎？`)) {
                          onDeleteTier(tier.id);
                        }
                      }}
                      style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '2px' }}
                      title="刪除此分級"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Add Tier Inline Form */}
        {isAddingTier ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input
              type="text"
              className="poe-input"
              value={newTierName}
              onChange={e => setNewTierName(e.target.value)}
              placeholder="輸入新分級名稱 (例: T16極速刷)"
              style={{ height: '32px', fontSize: '0.82rem', padding: '0 8px', width: '170px' }}
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') handleCreateTier(); }}
            />
            <button
              type="button"
              className="poe-button"
              onClick={handleCreateTier}
              style={{ padding: '0 8px', height: '32px', fontSize: '0.78rem' }}
            >
              建立
            </button>
            <button
              type="button"
              className="poe-button-secondary"
              onClick={() => { setIsAddingTier(false); setNewTierName(''); }}
              style={{ padding: '0 6px', height: '32px' }}
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="poe-button-secondary"
            onClick={() => setIsAddingTier(true)}
            style={{ padding: '5px 10px', fontSize: '0.78rem', height: '30px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Plus size={13} /> 新增自訂分級
          </button>
        )}
      </div>
    </div>
  );
};
