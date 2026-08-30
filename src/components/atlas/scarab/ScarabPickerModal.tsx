import React, { useState } from 'react';
import { SCARAB_DATABASE, type ScarabDef } from '../../../domain/atlas/scarabDatabase';
import { Bug, Search, X } from 'lucide-react';

interface ScarabPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScarab: (scarabDef: ScarabDef) => void;
  ninjaRates: Record<string, number>;
}

export const ScarabPickerModal: React.FC<ScarabPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectScarab,
  ninjaRates
}) => {
  const [pickerSearch, setPickerSearch] = useState<string>('');
  const [pickerCategory, setPickerCategory] = useState<string>('all');

  if (!isOpen) return null;

  const filteredDatabase = SCARAB_DATABASE.filter(s => {
    const matchCat = pickerCategory === 'all' || s.category === pickerCategory;
    if (!matchCat) return false;
    if (!pickerSearch.trim()) return true;
    const q = pickerSearch.toLowerCase().trim();
    return s.name.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
  });

  return (
    <div
      style={{
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
      }}
    >
      <div
        className="poe-card"
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          backgroundColor: '#0e131d',
          border: '1px solid var(--border-gold)'
        }}
      >
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bug size={20} color="var(--text-gold)" />
            <h3 className="poe-font" style={{ fontSize: '1.15rem', color: 'var(--text-gold)', margin: 0 }}>
              選擇聖甲蟲 (PoE 1 Scarabs)
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

        {/* Search and Category Filter */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="poe-input"
              value={pickerSearch}
              onChange={e => setPickerSearch(e.target.value)}
              placeholder="搜尋甲蟲中文、英文或效果..."
              style={{ width: '100%', paddingLeft: '32px', height: '34px', fontSize: '0.82rem' }}
              autoFocus
            />
          </div>

          <select
            className="poe-input"
            value={pickerCategory}
            onChange={e => setPickerCategory(e.target.value)}
            style={{ height: '34px', fontSize: '0.82rem', padding: '0 8px' }}
          >
            <option value="all">全部分類</option>
            <option value="essence">精髓 (Essence)</option>
            <option value="ambush">伏擊 (Ambush)</option>
            <option value="harvest">收割 (Harvest)</option>
            <option value="expedition">探險 (Expedition)</option>
            <option value="legion">戰亂 (Legion)</option>
            <option value="breach">破滅裂痕 (Breach)</option>
            <option value="delirium">瞻妄 (Delirium)</option>
            <option value="divination">命運卡 (Divination)</option>
            <option value="torment">苦痛/流亡者 (Torment)</option>
            <option value="boss">製圖/守護者 (Boss)</option>
            <option value="ritual">儀式 (Ritual)</option>
            <option value="ultimatum">通牒 (Ultimatum)</option>
            <option value="bestiary">野獸 (Bestiary)</option>
          </select>
        </div>

        {/* Scarabs Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '8px', overflowY: 'auto', maxHeight: '450px', paddingRight: '4px' }}>
          {filteredDatabase.map(scarab => {
            const liveRate = ninjaRates[scarab.nameEn] ?? scarab.basePriceChaos ?? 5;
            return (
              <div
                key={scarab.id}
                onClick={() => onSelectScarab(scarab)}
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(200, 170, 110, 0.2)',
                  borderRadius: '5px',
                  padding: '8px 10px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-gold)'; e.currentTarget.style.background = 'rgba(200, 170, 110, 0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200, 170, 110, 0.2)'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: '#e2e8f0' }}>{scarab.name}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-gold)', fontWeight: 700 }}>
                    {liveRate} C
                  </span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{scarab.nameEn}</div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>{scarab.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
