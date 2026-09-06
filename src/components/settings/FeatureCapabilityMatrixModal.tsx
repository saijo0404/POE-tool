import React, { useState, useMemo } from 'react';
import { X, Layers, Check, Minus } from 'lucide-react';
import { FEATURE_CAPABILITIES, type FeatureCapability, type FeatureCategory } from '../../domain/engine/capabilities';
import { EngineBadge } from '../common/EngineBadge';

interface FeatureCapabilityMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_NAMES: Record<FeatureCategory | 'all', string> = {
  all: '全部機制',
  core: '核心基礎',
  trade: '市集交易',
  wealth: '資產時薪',
  progression: '拓荒與流派',
  endgame: '終局與地圖',
  crafting: '裝備工藝'
};

export const FeatureCapabilityMatrixModal: React.FC<FeatureCapabilityMatrixModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<FeatureCategory | 'all'>('all');
  const [engineFilter, setEngineFilter] = useState<'all' | 'poe1' | 'poe2' | 'both'>('all');

  const capabilities = useMemo(() => Object.values(FEATURE_CAPABILITIES), []);

  const filteredCapabilities = useMemo(() => {
    return capabilities.filter(cap => {
      const matchCat = selectedCategory === 'all' || cap.category === selectedCategory;
      if (!matchCat) return false;

      if (engineFilter === 'all') return true;
      if (engineFilter === 'both') return cap.supportedEngines.length === 2;
      if (engineFilter === 'poe1') return cap.supportedEngines.length === 1 && cap.supportedEngines[0] === 'poe1';
      if (engineFilter === 'poe2') return cap.supportedEngines.length === 1 && cap.supportedEngines[0] === 'poe2';
      return true;
    });
  }, [capabilities, selectedCategory, engineFilter]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        className="poe-card"
        style={{
          width: '100%', maxWidth: '880px', maxHeight: '88vh', display: 'flex', flexDirection: 'column',
          background: '#141721', border: '1px solid var(--border-gold)', borderRadius: '8px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.9)', padding: '24px', position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200, 170, 110, 0.25)', paddingBottom: '12px', marginBottom: '16px' }}>
          <h2 className="poe-font" style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Layers size={20} /> PoE 1 vs PoE 2 功能支援與世代能力對照表
          </h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {(['all', 'trade', 'wealth', 'progression', 'endgame', 'crafting'] as const).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={selectedCategory === cat ? 'poe-button' : 'poe-button-secondary'}
                style={{ padding: '3px 9px', fontSize: '0.75rem', borderRadius: '4px' }}
              >
                {CATEGORY_NAMES[cat]}
              </button>
            ))}
          </div>

          <div style={{ width: '1px', height: '22px', background: 'rgba(255,255,255,0.1)' }} />

          <div style={{ display: 'flex', gap: '4px' }}>
            {(['all', 'poe1', 'poe2', 'both'] as const).map(ef => (
              <button
                key={ef}
                type="button"
                onClick={() => setEngineFilter(ef)}
                className={engineFilter === ef ? 'poe-button' : 'poe-button-secondary'}
                style={{ padding: '3px 9px', fontSize: '0.75rem', borderRadius: '4px' }}
              >
                {ef === 'all' ? '全部版本' : ef === 'poe1' ? 'PoE 1 專屬' : ef === 'poe2' ? 'PoE 2 專屬' : '雙版本共用'}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(0, 0, 0, 0.5)', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', color: 'var(--text-gold)' }}>
                <th style={{ padding: '10px 12px', width: '22%' }}>功能機制</th>
                <th style={{ padding: '10px 12px', width: '14%' }}>支援版本</th>
                <th style={{ padding: '10px 12px', width: '32%' }}>PoE 1 機制與支援</th>
                <th style={{ padding: '10px 12px', width: '32%' }}>PoE 2 機制與替代方案</th>
              </tr>
            </thead>
            <tbody>
              {filteredCapabilities.map(cap => (
                <CapabilityRow key={cap.id} cap={cap} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CapabilityRow: React.FC<{ cap: FeatureCapability }> = ({ cap }) => {
  const supportsPoe1 = cap.supportedEngines.includes('poe1');
  const supportsPoe2 = cap.supportedEngines.includes('poe2');

  return (
    <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.01)' }}>
      <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{cap.name}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>{cap.description}</div>
      </td>
      <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
        <EngineBadge supportedEngines={cap.supportedEngines} showBoth size="sm" />
      </td>
      <td style={{ padding: '10px 12px', verticalAlign: 'top', color: supportsPoe1 ? '#a8d5ba' : 'var(--text-muted)' }}>
        {supportsPoe1 ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Check size={14} color="#34d399" /> 完整支援
          </span>
        ) : (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Minus size={14} /> 未支援
          </span>
        )}
      </td>
      <td style={{ padding: '10px 12px', verticalAlign: 'top', color: supportsPoe2 ? '#a5d8ff' : 'var(--text-muted)' }}>
        {supportsPoe2 ? (
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Check size={14} color="#38bdf8" /> 完整支援
          </span>
        ) : (
          <div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f87171' }}>
              <Minus size={14} /> 未支援 / 替代
            </span>
            {cap.poe2Alternative && (
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                💡 {cap.poe2Alternative}
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};
