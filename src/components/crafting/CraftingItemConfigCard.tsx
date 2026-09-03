import React from 'react';
import { Shield, Layers } from 'lucide-react';
import { ITEM_CLASSES } from '../../domain/crafting/basesDatabase';
import type { CraftBaseItem, ItemClass } from '../../domain/crafting/types';

interface CraftingItemConfigCardProps {
  selectedClass: ItemClass;
  selectedBase: CraftBaseItem;
  availableBases: CraftBaseItem[];
  ilvl: number;
  onClassChange: (c: ItemClass) => void;
  onBaseChange: (baseId: string) => void;
  onIlvlChange: (ilvl: number) => void;
}

export const CraftingItemConfigCard: React.FC<CraftingItemConfigCardProps> = ({
  selectedClass,
  selectedBase,
  availableBases,
  ilvl,
  onClassChange,
  onBaseChange,
  onIlvlChange,
}) => {
  return (
    <div className="poe-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', paddingBottom: '10px' }}>
        <Shield size={18} color="var(--text-gold)" />
        <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-gold)' }}>1. 裝備部位與基底設定</h3>
      </div>

      {/* Item Class Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>裝備類別 (Item Class)：</label>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {ITEM_CLASSES.map(cls => (
            <button
              key={cls.id}
              type="button"
              onClick={() => onClassChange(cls.id)}
              className={selectedClass === cls.id ? 'poe-button' : 'poe-button-secondary'}
              style={{ padding: '5px 10px', fontSize: '0.78rem', borderRadius: '4px' }}
            >
              {cls.nameZh}
            </button>
          ))}
        </div>
      </div>

      {/* Base Item Selection & ilvl Slider */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>基底選擇 (Base Type)：</label>
          <select
            value={selectedBase.id}
            onChange={e => onBaseChange(e.target.value)}
            className="poe-select"
            style={{
              padding: '8px 12px',
              borderRadius: '6px',
              backgroundColor: '#141822',
              color: '#f3d179',
              border: '1px solid rgba(200, 170, 110, 0.3)',
              fontSize: '0.85rem',
            }}
          >
            {availableBases.map(base => (
              <option key={base.id} value={base.id}>
                {base.nameZh} ({base.name})
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>物品等級 (Item Level)：</label>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 600 }}>ilvl {ilvl}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <input
              type="range"
              min={1}
              max={100}
              value={ilvl}
              onChange={e => onIlvlChange(Number(e.target.value))}
              style={{ flex: 1, accentColor: '#f3d179' }}
            />
            <input
              type="number"
              min={1}
              max={100}
              value={ilvl}
              onChange={e => onIlvlChange(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
              style={{
                width: '54px',
                padding: '4px 6px',
                borderRadius: '4px',
                backgroundColor: '#10141e',
                border: '1px solid rgba(200, 170, 110, 0.3)',
                color: '#fff',
                textAlign: 'center',
                fontSize: '0.85rem',
              }}
            />
          </div>
        </div>
      </div>

      {/* Base Stats & Implicit Summary */}
      <div
        style={{
          padding: '8px 12px',
          borderRadius: '6px',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          border: '1px dashed rgba(200, 170, 110, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} color="var(--text-gold)" />
          <span>基底屬性需求：{selectedBase.attributeType.toUpperCase()}</span>
        </div>
        {selectedBase.implicit && (
          <span style={{ color: '#68c4ff' }}>固定詞綴：{selectedBase.implicit}</span>
        )}
      </div>
    </div>
  );
};
