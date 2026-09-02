import React, { useState } from 'react';
import { X, Layers, Save, Sparkles } from 'lucide-react';
import type { MapInvestment } from '../../domain/mapping/types';
import { INVESTMENT_PRESETS } from '../../domain/mapping/constants';
import { calculateInvestmentTotals } from '../../domain/mapping/mappingCalculator';

interface MappingInvestmentModalProps {
  isOpen: boolean;
  investment: MapInvestment;
  divineRate: number;
  onClose: () => void;
  onSave: (inv: MapInvestment) => void;
}

export const MappingInvestmentModal: React.FC<MappingInvestmentModalProps> = ({
  isOpen,
  investment: initialInv,
  divineRate,
  onClose,
  onSave
}) => {
  const [mapCost, setMapCost] = useState(initialInv.mapCostChaos);
  const [scarabsCost, setScarabsCost] = useState(initialInv.scarabsCostChaos);
  const [craftCost, setCraftCost] = useState(initialInv.craftCostChaos);
  const [otherCost, setOtherCost] = useState(initialInv.otherCostChaos);

  if (!isOpen) return null;

  const currentTotals = calculateInvestmentTotals(
    {
      mapCostChaos: mapCost || 0,
      scarabsCostChaos: scarabsCost || 0,
      craftCostChaos: craftCost || 0,
      otherCostChaos: otherCost || 0
    },
    divineRate
  );

  const handleApplyPreset = (presetId: string) => {
    const p = INVESTMENT_PRESETS.find(x => x.id === presetId);
    if (!p) return;
    setMapCost(p.investment.mapCostChaos);
    setScarabsCost(p.investment.scarabsCostChaos);
    setCraftCost(p.investment.craftCostChaos);
    setOtherCost(p.investment.otherCostChaos);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(currentTotals);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
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
          maxWidth: '540px',
          backgroundColor: '#121620',
          border: '1px solid rgba(200, 170, 110, 0.4)',
          borderRadius: '8px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid rgba(200, 170, 110, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-gold)' }}>
            <Layers size={20} />
            <h2 className="poe-font" style={{ fontSize: '1.15rem', margin: 0 }}>
              單場門票投資成本設定 (Map Investment)
            </h2>
          </div>
          <button type="button" onClick={onClose} className="poe-button-secondary" style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Quick Preset Selector */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
              <Sparkles size={14} color="var(--text-gold)" /> 一鍵載入預設策略門票範本：
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {INVESTMENT_PRESETS.map(preset => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.id)}
                  className="poe-button-secondary"
                  style={{ fontSize: '0.78rem', padding: '4px 8px', borderRadius: '4px' }}
                  title={preset.description}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                地圖本體成本 (Chaos)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={mapCost}
                onChange={e => setMapCost(Number(e.target.value))}
                className="poe-input"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                聖甲蟲總成本 (Chaos)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={scarabsCost}
                onChange={e => setScarabsCost(Number(e.target.value))}
                className="poe-input"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                地圖儀工藝成本 (Chaos)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={craftCost}
                onChange={e => setCraftCost(Number(e.target.value))}
                className="poe-input"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                其他雜項 (釘子/瓦爾/譫妄等)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={otherCost}
                onChange={e => setOtherCost(Number(e.target.value))}
                className="poe-input"
                style={{ width: '100%', padding: '8px' }}
              />
            </div>
          </div>

          {/* Cost Summary Preview */}
          <div
            style={{
              backgroundColor: '#0a0d14',
              padding: '12px 16px',
              borderRadius: '6px',
              border: '1px solid rgba(200, 170, 110, 0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>單場結算總成本：</span>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--text-gold)' }}>
                {currentTotals.totalCostChaos} <span style={{ fontSize: '0.85rem' }}>Chaos</span>
              </span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '8px' }}>
                (≈ {currentTotals.totalCostDivine} Div)
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} className="poe-button-secondary" style={{ padding: '8px 16px' }}>
              取消
            </button>
            <button type="submit" className="poe-button" style={{ padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Save size={16} /> 儲存設定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
