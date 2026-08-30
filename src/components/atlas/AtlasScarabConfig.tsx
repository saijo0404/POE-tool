import React, { useState } from 'react';
import type { AtlasTierScarab } from '../../domain/atlas/types';
import type { ScarabDef } from '../../domain/atlas/scarabDatabase';
import { resolveScarabPrice } from '../../domain/atlas/atlasHelpers';
import { ScarabListItem } from './scarab/ScarabListItem';
import { ScarabPickerModal } from './scarab/ScarabPickerModal';
import { Plus, Bug } from 'lucide-react';

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

  const totalScarabCount = scarabs.reduce((acc, s) => acc + (s.count || 0), 0);
  const totalScarabCost = scarabs.reduce((acc, s) => acc + (s.count || 0) * resolveScarabPrice(s, ninjaRates), 0);

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
          {scarabs.map(scarab => (
            <ScarabListItem
              key={scarab.id}
              scarab={scarab}
              ninjaRates={ninjaRates}
              onRemove={onRemoveScarab}
              onUpdate={onUpdateScarab}
            />
          ))}
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
      <ScarabPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectScarab={handleSelectScarabFromDb}
        ninjaRates={ninjaRates}
      />
    </div>
  );
};
