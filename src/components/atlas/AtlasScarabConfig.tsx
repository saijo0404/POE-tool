import React, { useState } from 'react';
import type { AtlasTierScarab } from '../../domain/atlas/types';
import { SCARAB_DATABASE, type ScarabDef } from '../../domain/atlas/scarabDatabase';
import { resolveScarabPrice } from '../../domain/atlas/atlasHelpers';
import { Plus, Trash2, Search, X, Bug, Zap } from 'lucide-react';

interface AtlasScarabConfigProps {
  scarabs: AtlasTierScarab[];
  onAddScarab: (scarab: AtlasTierScarab) => void;
  onRemoveScarab: (id: string) => void;
  onUpdateScarab: (id: string, updates: Partial<AtlasTierScarab>) => void;
  ninjaRates: Record<string, number>;
  divineRate: number;
}

export const AtlasScarabConfig: React.FC<AtlasScarabConfigProps> = ({
  scarabs,
  onAddScarab,
  onRemoveScarab,
  onUpdateScarab,
  ninjaRates,
  divineRate
}) => {
  const [isPickerOpen, setIsPickerOpen] = useState<boolean>(false);
  const [pickerSearch, setPickerSearch] = useState<string>('');
  const [pickerCategory, setPickerCategory] = useState<string>('all');
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [customPriceInput, setCustomPriceInput] = useState<string>('');

  const totalScarabCount = scarabs.reduce((acc, s) => acc + (s.count || 0), 0);
  const totalScarabCost = scarabs.reduce((acc, s) => acc + (s.count || 0) * resolveScarabPrice(s, ninjaRates), 0);

  // Filtered scarabs for picker
  const filteredDatabase = SCARAB_DATABASE.filter(s => {
    const matchCat = pickerCategory === 'all' || s.category === pickerCategory;
    if (!matchCat) return false;
    if (!pickerSearch.trim()) return true;
    const q = pickerSearch.toLowerCase().trim();
    return s.name.toLowerCase().includes(q) || s.nameEn.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
  });

  const handleSelectScarabFromDb = (scarabDef: ScarabDef) => {
    const livePrice = ninjaRates[scarabDef.nameEn] ?? scarabDef.basePriceChaos ?? 5;
    const newScarab: AtlasTierScarab = {
      id: `sc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: scarabDef.name,
      nameEn: scarabDef.nameEn,
      count: 1,
      customPriceChaos: livePrice
    };
    onAddScarab(newScarab);
    setIsPickerOpen(false);
  };

  const handleStartEditPrice = (scarab: AtlasTierScarab) => {
    setEditingPriceId(scarab.id);
    const currentPrice = resolveScarabPrice(scarab, ninjaRates);
    setCustomPriceInput(String(currentPrice));
  };

  const handleSavePrice = (scarabId: string) => {
    const num = parseFloat(customPriceInput);
    if (!isNaN(num) && num >= 0) {
      onUpdateScarab(scarabId, { customPriceChaos: num });
    }
    setEditingPriceId(null);
  };

  return (
    <div className="poe-card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bug size={18} color="var(--text-gold)" />
          <h3 className="poe-font" style={{ fontSize: '1.05rem', color: 'var(--text-gold)', margin: 0 }}>
            聖甲蟲配置 (Scarabs)
          </h3>
          <span style={{
            fontSize: '0.74rem',
            padding: '2px 7px',
            borderRadius: '10px',
            background: totalScarabCount <= 5 ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.2)',
            color: totalScarabCount <= 5 ? '#86efac' : '#fca5a5',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            已使用 {totalScarabCount} / 5 槽位
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            甲蟲單場成本：
            <span style={{ color: 'var(--text-gold)', fontWeight: 700, marginLeft: '4px' }}>
              {Math.round(totalScarabCost * 10) / 10} C
            </span>
            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', marginLeft: '4px' }}>
              (~{Math.round((totalScarabCost / (divineRate || 150)) * 100) / 100} Div)
            </span>
          </div>

          <button
            type="button"
            className="poe-button"
            onClick={() => setIsPickerOpen(true)}
            style={{ fontSize: '0.8rem', padding: '5px 12px', height: '32px' }}
          >
            <Plus size={14} /> 新增聖甲蟲
          </button>
        </div>
      </div>

      {/* Scarabs List */}
      {scarabs.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {scarabs.map(scarab => {
            const unitPrice = resolveScarabPrice(scarab, ninjaRates);
            const totalItemCost = Math.round((scarab.count || 0) * unitPrice * 10) / 10;
            const isEditingPrice = editingPriceId === scarab.id;
            const hasLiveRate = scarab.nameEn && ninjaRates[scarab.nameEn] !== undefined;

            return (
              <div
                key={scarab.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '10px',
                  padding: '8px 12px',
                  background: 'rgba(0, 0, 0, 0.3)',
                  border: '1px solid rgba(200, 170, 110, 0.18)',
                  borderRadius: '6px'
                }}
              >
                {/* Left: Scarab Info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1 1 200px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '4px',
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    border: '1px solid rgba(200, 170, 110, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.1rem'
                  }}>
                    🪲
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#e2e8f0' }}>
                      {scarab.name}
                    </div>
                    {scarab.nameEn && (
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                        {scarab.nameEn}
                      </div>
                    )}
                  </div>
                </div>

                {/* Center: Count Stepper */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>數量：</span>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(200, 170, 110, 0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => onUpdateScarab(scarab.id, { count: Math.max((scarab.count || 1) - 1, 1) })}
                      style={{ background: '#121722', border: 'none', color: '#fff', width: '26px', height: '26px', cursor: 'pointer' }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '28px', textAlign: 'center', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-gold)' }}>
                      {scarab.count || 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateScarab(scarab.id, { count: Math.min((scarab.count || 1) + 1, 4) })}
                      style={{ background: '#121722', border: 'none', color: '#fff', width: '26px', height: '26px', cursor: 'pointer' }}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Right: Unit Price & Subtotal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Unit price with override option */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      {hasLiveRate && (
                        <span title="poe.ninja 即時市價" style={{ display: 'inline-flex', alignItems: 'center' }}>
                          <Zap size={11} color="#f59e0b" />
                        </span>
                      )}
                      單價：
                    </div>
                    {isEditingPrice ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <input
                          type="number"
                          className="poe-input"
                          value={customPriceInput}
                          onChange={e => setCustomPriceInput(e.target.value)}
                          style={{ width: '60px', height: '24px', padding: '0 4px', fontSize: '0.78rem' }}
                          autoFocus
                          onKeyDown={e => { if (e.key === 'Enter') handleSavePrice(scarab.id); }}
                        />
                        <button
                          type="button"
                          className="poe-button"
                          onClick={() => handleSavePrice(scarab.id)}
                          style={{ padding: '0 4px', height: '24px', fontSize: '0.72rem' }}
                        >
                          OK
                        </button>
                      </div>
                    ) : (
                      <span
                        onClick={() => handleStartEditPrice(scarab)}
                        style={{
                          fontSize: '0.84rem',
                          color: '#e2e8f0',
                          cursor: 'pointer',
                          textDecoration: 'underline dotted rgba(200, 170, 110, 0.5)'
                        }}
                        title="點擊自訂單價"
                      >
                        {unitPrice} C
                      </span>
                    )}
                  </div>

                  {/* Subtotal */}
                  <div style={{ textAlign: 'right', minWidth: '70px' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>小計</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-gold)' }}>
                      {totalItemCost} C
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => onRemoveScarab(scarab.id)}
                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                    title="移除此甲蟲"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{
          padding: '24px',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.2)',
          borderRadius: '6px',
          border: '1px dashed rgba(200, 170, 110, 0.2)',
          color: 'var(--text-dim)',
          fontSize: '0.85rem'
        }}>
          此分級尚未加入聖甲蟲，點擊右上角「+ 新增聖甲蟲」自資料庫挑選！
        </div>
      )}

      {/* Scarab Picker Modal */}
      {isPickerOpen && (
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
            maxWidth: '680px',
            maxHeight: '85vh',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: '#0e131d',
            border: '1px solid var(--border-gold)'
          }}>
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
                onClick={() => setIsPickerOpen(false)}
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
                    onClick={() => handleSelectScarabFromDb(scarab)}
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
      )}
    </div>
  );
};
