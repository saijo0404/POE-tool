import React, { useState, useEffect } from 'react';
import { Keyboard, AlertTriangle, Pin } from 'lucide-react';
import {
  HOTKEY_ACTIONS,
  HOTKEY_PRESETS,
  getDefaultBindings
} from '../../domain/hotkey/hotkeyPresets';
import {
  detectHotkeyConflicts,
  validateHotkey,
  applyPreset
} from '../../domain/hotkey/hotkeyManager';
import type { HotkeyActionId, HotkeyBindingMap } from '../../domain/hotkey/types';
import type { AppSettings } from '../../domain/settings/types';

interface HotkeySettingsCardProps {
  settings: Partial<AppSettings>;
  onChange: (key: keyof AppSettings, value: unknown) => void;
  onShowToast?: (msg: string) => void;
}

function PresetSelector({ currentPreset, onSelectPreset }: { currentPreset: string; onSelectPreset: (id: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>快速預設方案:</span>
      <select
        value={currentPreset}
        onChange={e => onSelectPreset(e.target.value)}
        style={{ padding: '4px 8px', background: '#111', border: '1px solid #444', color: '#fff', borderRadius: '4px', fontSize: '0.78rem' }}
      >
        <option value="custom">自訂方案 (Custom)</option>
        {HOTKEY_PRESETS.map(p => (
          <option key={p.id} value={p.id}>{p.nameZh}</option>
        ))}
      </select>
    </div>
  );
}

function ConflictAlert({ conflicts }: { conflicts: ReturnType<typeof detectHotkeyConflicts> }) {
  if (conflicts.length === 0) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: '6px', padding: '10px' }}>
      {conflicts.map((c, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: '#fca5a5' }}>
          <AlertTriangle size={14} color="#ef4444" />
          <span>快捷鍵衝突！【{c.actionA}】與【{c.actionB}】同時綁定了「{c.key.toUpperCase()}」</span>
        </div>
      ))}
    </div>
  );
}

function ActionBadge({ isRecording, currentKey }: { isRecording: boolean; currentKey: string }) {
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '4px',
      fontSize: '0.78rem',
      fontWeight: 700,
      background: isRecording ? '#ef4444' : 'rgba(0,0,0,0.4)',
      border: `1px solid ${isRecording ? '#f87171' : 'var(--border-gold)'}`,
      color: isRecording ? '#fff' : 'var(--text-gold)',
      minWidth: '80px',
      textAlign: 'center'
    }}>
      {isRecording ? '請按下按鍵...' : currentKey.toUpperCase()}
    </span>
  );
}

function ActionRow({
  action,
  currentKey,
  isRecording,
  onStartRecord,
  onCancelRecord
}: {
  action: typeof HOTKEY_ACTIONS[number];
  currentKey: string;
  isRecording: boolean;
  onStartRecord: () => void;
  onCancelRecord: () => void;
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-light)' }}>{action.nameZh}</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{action.description}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ActionBadge isRecording={isRecording} currentKey={currentKey} />
        <button
          type="button"
          onClick={isRecording ? onCancelRecord : onStartRecord}
          style={{
            padding: '3px 8px',
            borderRadius: '4px',
            fontSize: '0.75rem',
            background: isRecording ? '#444' : 'var(--gold-gradient)',
            color: isRecording ? '#fff' : '#000',
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {isRecording ? '取消' : '錄製'}
        </button>
      </div>
    </div>
  );
}

function ActionRowsList({
  actions,
  bindings,
  recordingAction,
  onStartRecord,
  onCancelRecord
}: {
  actions: typeof HOTKEY_ACTIONS;
  bindings: HotkeyBindingMap;
  recordingAction: HotkeyActionId | null;
  onStartRecord: (id: HotkeyActionId) => void;
  onCancelRecord: () => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {actions.map(action => (
        <ActionRow
          key={action.id}
          action={action}
          currentKey={bindings[action.id] || action.defaultKey}
          isRecording={recordingAction === action.id}
          onStartRecord={() => onStartRecord(action.id)}
          onCancelRecord={onCancelRecord}
        />
      ))}
    </div>
  );
}

function PinningOptions({
  isPinned,
  onTogglePin,
  opacity,
  onChangeOpacity
}: {
  isPinned: boolean;
  onTogglePin: (val: boolean) => void;
  opacity: number;
  onChangeOpacity: (val: number) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
        <input
          type="checkbox"
          checked={isPinned}
          onChange={e => onTogglePin(e.target.checked)}
          style={{ accentColor: 'var(--text-gold)' }}
        />
        <Pin size={14} color="var(--text-gold)" />
        <span>懸浮視窗自適應釘選 (Pin Always-on-Top，防止失焦關閉)</span>
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>懸浮卡片透光度</span>
          <span style={{ color: 'var(--text-gold)' }}>{Math.round(opacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.3"
          max="1.0"
          step="0.05"
          value={opacity}
          onChange={e => onChangeOpacity(parseFloat(e.target.value))}
          style={{ accentColor: 'var(--text-gold)' }}
        />
      </div>
    </div>
  );
}

function useHotkeyRecorder(
  bindings: HotkeyBindingMap,
  setBindings: React.Dispatch<React.SetStateAction<HotkeyBindingMap>>,
  setActivePreset: React.Dispatch<React.SetStateAction<string>>,
  onChange: (key: keyof AppSettings, value: unknown) => void,
  onShowToast?: (msg: string) => void
) {
  const [recordingAction, setRecordingAction] = useState<HotkeyActionId | null>(null);

  useEffect(() => {
    if (!recordingAction) return;
    const handleKey = (e: KeyboardEvent) => {
      e.preventDefault();
      const mods: string[] = [];
      if (e.ctrlKey || e.metaKey) mods.push('ctrl');
      if (e.altKey) mods.push('alt');
      if (e.shiftKey) mods.push('shift');
      const key = e.key.toLowerCase();
      if (key === 'control' || key === 'alt' || key === 'shift' || key === 'meta') return;

      const fullKey = [...mods, key].join('+');
      const valRes = validateHotkey(fullKey);
      if (valRes.isValid && valRes.normalizedKey) {
        const next = { ...bindings, [recordingAction]: valRes.normalizedKey };
        setBindings(next);
        setActivePreset('custom');
        onChange('hotkeyBindings', next);
        if (recordingAction === 'priceCheck') onChange('hotkey', valRes.normalizedKey);
        onShowToast?.(`已更新【${recordingAction}】快捷鍵為 ${valRes.normalizedKey.toUpperCase()}`);
      }
      setRecordingAction(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [recordingAction, bindings, onChange, onShowToast, setActivePreset, setBindings]);

  return { recordingAction, setRecordingAction };
}

export const HotkeySettingsCard: React.FC<HotkeySettingsCardProps> = ({
  settings,
  onChange,
  onShowToast
}) => {
  const [bindings, setBindings] = useState<HotkeyBindingMap>(settings.hotkeyBindings || getDefaultBindings());
  const [activePreset, setActivePreset] = useState<string>('standard');
  const { recordingAction, setRecordingAction } = useHotkeyRecorder(bindings, setBindings, setActivePreset, onChange, onShowToast);

  const conflicts = detectHotkeyConflicts(bindings);

  const handleSelectPreset = (presetId: string) => {
    setActivePreset(presetId);
    if (presetId !== 'custom') {
      const next = applyPreset(presetId);
      setBindings(next);
      onChange('hotkeyBindings', next);
      onChange('hotkey', next.priceCheck);
      onShowToast?.(`已套用快捷鍵方案：${HOTKEY_PRESETS.find(p => p.id === presetId)?.nameZh}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Keyboard size={16} /> 自訂全域快捷鍵與視窗釘選 (Hotkeys & Pinning)
        </h3>
        <PresetSelector currentPreset={activePreset} onSelectPreset={handleSelectPreset} />
      </div>

      <ConflictAlert conflicts={conflicts} />

      <ActionRowsList
        actions={HOTKEY_ACTIONS}
        bindings={bindings}
        recordingAction={recordingAction}
        onStartRecord={id => setRecordingAction(id)}
        onCancelRecord={() => setRecordingAction(null)}
      />

      <PinningOptions
        isPinned={settings.overlayPinned ?? false}
        onTogglePin={val => onChange('overlayPinned', val)}
        opacity={settings.overlayOpacity ?? 0.92}
        onChangeOpacity={val => onChange('overlayOpacity', val)}
      />
    </div>
  );
};

export default HotkeySettingsCard;
