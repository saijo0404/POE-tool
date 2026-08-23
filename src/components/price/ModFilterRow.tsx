import React from 'react';
import type { ParsedItemMod } from '../../types/poe';
import { Trash2 } from 'lucide-react';

interface ModFilterRowProps {
  mod: ParsedItemMod;
  index: number;
  onToggleMod: (index: number) => void;
  onChangeMinValue: (index: number, val: number | undefined) => void;
  onChangeMaxValue: (index: number, val: number | undefined) => void;
  formatModText: (mod: ParsedItemMod) => string;
  onRemoveMod?: (index: number) => void;
}

export const ModFilterRow: React.FC<ModFilterRowProps> = ({
  mod,
  index,
  onToggleMod,
  onChangeMinValue,
  onChangeMaxValue,
  formatModText,
  onRemoveMod
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: mod.enabled ? 'rgba(200, 170, 110, 0.08)' : 'rgba(255, 255, 255, 0.02)',
        borderRadius: '6px',
        border: mod.enabled ? '1px solid rgba(200, 170, 110, 0.3)' : '1px solid rgba(255, 255, 255, 0.05)',
        transition: 'all 0.2s ease',
        gap: '12px'
      }}
    >
      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1, minWidth: 0 }}>
        <input
          type="checkbox"
          checked={mod.enabled}
          onChange={() => onToggleMod(index)}
          style={{ width: '16px', height: '16px', accentColor: 'var(--text-gold)', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
          <span style={{ fontSize: '0.88rem', color: mod.enabled ? 'var(--text-bright)' : 'var(--text-muted)', wordBreak: 'break-word', fontWeight: mod.enabled ? 500 : 400 }}>
            {formatModText(mod)}
          </span>
          {mod.englishText && mod.englishText !== mod.text && (
            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', wordBreak: 'break-word' }}>
              {mod.englishText}
            </span>
          )}
        </div>
      </label>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Min:</span>
          <input
            type="number"
            className="poe-input"
            disabled={!mod.enabled}
            value={mod.minValue ?? ''}
            placeholder={mod.value !== undefined ? String(mod.value) : '-'}
            onChange={e => onChangeMinValue(index, e.target.value === '' ? undefined : Number(e.target.value))}
            style={{ width: '60px', padding: '4px 6px', fontSize: '0.82rem', textAlign: 'center', opacity: mod.enabled ? 1 : 0.4 }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Max:</span>
          <input
            type="number"
            className="poe-input"
            disabled={!mod.enabled}
            value={mod.maxValue ?? ''}
            placeholder="-"
            onChange={e => onChangeMaxValue(index, e.target.value === '' ? undefined : Number(e.target.value))}
            style={{ width: '60px', padding: '4px 6px', fontSize: '0.82rem', textAlign: 'center', opacity: mod.enabled ? 1 : 0.4 }}
          />
        </div>
        {onRemoveMod && mod.id.startsWith('custom') && (
          <button
            onClick={() => onRemoveMod(index)}
            className="poe-button-danger"
            style={{ padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="刪除此自訂詞綴"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
