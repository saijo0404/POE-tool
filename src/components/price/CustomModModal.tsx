import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { COMMON_STAT_PRESETS, type CommonStatPreset } from '../../domain/trade/constants';

interface CustomModModalProps {
  onAddCustomMod: (mod: { text: string; englishText?: string; value?: number; minValue?: number; maxValue?: number }) => void;
  onClose: () => void;
}

export const CustomModModal: React.FC<CustomModModalProps> = ({ onAddCustomMod, onClose }) => {
  const [customText, setCustomText] = useState<string>('');
  const [customMinVal, setCustomMinVal] = useState<string>('');

  const handleAddPreset = (preset: CommonStatPreset) => {
    onAddCustomMod({ text: preset.text, englishText: preset.englishText, value: preset.defaultValue, minValue: preset.defaultValue });
    onClose();
  };

  const handleAddManual = () => {
    if (!customText.trim()) return;
    const min = customMinVal ? Number(customMinVal) : undefined;
    onAddCustomMod({ text: customText.trim(), englishText: customText.trim(), value: min, minValue: min });
    setCustomText('');
    setCustomMinVal('');
    onClose();
  };

  return (
    <div style={{ marginBottom: '14px', padding: '12px', background: 'rgba(0, 0, 0, 0.4)', borderRadius: '6px', border: '1px solid rgba(200, 170, 110, 0.2)' }}>
      <div style={{ fontSize: '0.82rem', color: 'var(--text-gold)', marginBottom: '8px', fontWeight: 600 }}>選擇常用熱門詞綴或手動輸入：</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
        {COMMON_STAT_PRESETS.map((preset, pIdx) => (
          <button key={pIdx} type="button" onClick={() => handleAddPreset(preset)} className="poe-button-secondary" style={{ padding: '3px 8px', fontSize: '0.75rem', borderRadius: '4px' }}>
            + {preset.text} ({preset.defaultValue})
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input type="text" className="poe-input" placeholder="自訂詞綴名稱 (如: +# to maximum Life)..." value={customText} onChange={e => setCustomText(e.target.value)} style={{ flex: 1, padding: '4px 8px', fontSize: '0.82rem' }} />
        <input type="number" className="poe-input" placeholder="Min" value={customMinVal} onChange={e => setCustomMinVal(e.target.value)} style={{ width: '65px', padding: '4px 6px', fontSize: '0.82rem', textAlign: 'center' }} />
        <button type="button" onClick={handleAddManual} className="poe-button" style={{ padding: '4px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Plus size={14} /> 確認新增
        </button>
        <button type="button" onClick={onClose} className="poe-button-secondary" style={{ padding: '4px 10px', fontSize: '0.82rem' }}>
          取消
        </button>
      </div>
    </div>
  );
};
