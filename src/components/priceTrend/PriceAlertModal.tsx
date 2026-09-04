import React, { useState } from 'react';
import type { PriceAlertRule, AlertConditionType, AlertCurrencyType, AssetTrend } from '../../domain/priceTrend/types';
import { playPriceAlertSound } from '../../application/audio/priceAlertSound';
import { Bell, Trash2, Volume2, X, Plus } from 'lucide-react';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: PriceAlertRule[];
  assets: AssetTrend[];
  onAddRule: (assetName: string, condition: AlertConditionType, currency: AlertCurrencyType, threshold: number) => void;
  onToggleRule: (id: string) => void;
  onDeleteRule: (id: string) => void;
}

export const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  rules,
  assets,
  onAddRule,
  onToggleRule,
  onDeleteRule
}) => {
  const [assetName, setAssetName] = useState<string>(assets[0]?.name || 'Mageblood (魔血)');
  const [condition, setCondition] = useState<AlertConditionType>('below');
  const [currency, setCurrency] = useState<AlertCurrencyType>('divine');
  const [threshold, setThreshold] = useState<number>(100);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (threshold <= 0) return;
    onAddRule(assetName, condition, currency, threshold);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-gold)', borderRadius: '10px', width: '100%', maxWidth: '580px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.8)' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="poe-font" style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--border-gold)" /> 自訂價格門檻警報通知
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {/* Add Rule Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', backgroundColor: 'var(--bg-panel)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 1fr', gap: '8px' }}>
            <select value={assetName} onChange={e => setAssetName(e.target.value)} className="poe-input" style={{ fontSize: '0.8rem', padding: '6px' }}>
              {assets.map(a => <option key={a.id} value={a.name}>{a.name}</option>)}
            </select>
            <select value={condition} onChange={e => setCondition(e.target.value as AlertConditionType)} className="poe-input" style={{ fontSize: '0.8rem', padding: '6px' }}>
              <option value="below">價格低於</option>
              <option value="above">價格突破</option>
            </select>
            <select value={currency} onChange={e => setCurrency(e.target.value as AlertCurrencyType)} className="poe-input" style={{ fontSize: '0.8rem', padding: '6px' }}>
              <option value="divine">神聖石 (D)</option>
              <option value="chaos">混沌石 (C)</option>
            </select>
            <input type="number" min={1} step={0.1} value={threshold} onChange={e => setThreshold(Number(e.target.value))} className="poe-input" style={{ fontSize: '0.8rem', padding: '6px' }} placeholder="門檻數值" />
          </div>
          <button type="submit" className="poe-button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px', fontSize: '0.84rem' }}>
            <Plus size={15} /> 新增價格監控警報
          </button>
        </form>

        {/* Rules List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
          {rules.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', padding: '16px' }}>尚未建立自訂警報規則</div>
          ) : (
            rules.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', backgroundColor: 'var(--bg-panel)', borderRadius: '6px', border: '1px solid var(--border-subtle)', opacity: r.enabled ? 1 : 0.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" checked={r.enabled} onChange={() => onToggleRule(r.id)} style={{ cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.84rem', color: 'var(--text-bright)' }}>{r.assetName}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-gold)' }}>{r.condition === 'below' ? '低於' : '高於'} {r.threshold} {r.currency === 'divine' ? 'D' : 'C'}</span>
                </div>
                <button type="button" onClick={() => onDeleteRule(r.id)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer' }}><Trash2 size={15} /></button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="button" onClick={() => playPriceAlertSound()} className="poe-button-secondary" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', padding: '4px 10px' }}>
            <Volume2 size={14} /> 測試警報音效
          </button>
          <button type="button" onClick={onClose} className="poe-button" style={{ fontSize: '0.8rem', padding: '5px 14px' }}>關閉</button>
        </div>
      </div>
    </div>
  );
};
