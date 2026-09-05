import React, { useState } from 'react';
import { ShieldAlert, Volume2, Plus, X, Sparkles, Check } from 'lucide-react';
import type { MapDangerConfig } from '../../domain/mapMod/types';
import { MAP_DANGER_MODS, BUILD_ARCHETYPE_PRESETS } from '../../domain/mapMod/dangerPresets';
import { Card, Button } from '../ui';

interface MapDangerSettingsCardProps {
  config: MapDangerConfig;
  onApplyPreset: (id: string) => void;
  onToggleMod: (id: string) => void;
  onAddCustomKeyword: (kw: string) => void;
  onRemoveCustomKeyword: (kw: string) => void;
  onToggleSound: (enabled: boolean) => void;
  onTestSound: () => void;
}

export const MapDangerSettingsCard: React.FC<MapDangerSettingsCardProps> = ({
  config,
  onApplyPreset,
  onToggleMod,
  onAddCustomKeyword,
  onRemoveCustomKeyword,
  onToggleSound,
  onTestSound
}) => {
  const [newKeyword, setNewKeyword] = useState('');

  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newKeyword.trim()) {
      onAddCustomKeyword(newKeyword.trim());
      setNewKeyword('');
    }
  };

  return (
    <Card variant="default" padding="md" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', paddingBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} color="#e55039" /> 流派致命詞綴黑名單配置
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={onTestSound}
            icon={<Volume2 size={13} />}
            title="測試警示音效"
          >
            測試音效
          </Button>
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '0.82rem', color: 'var(--text-main)' }}>
            <input
              type="checkbox"
              checked={config.soundAlertEnabled}
              onChange={e => onToggleSound(e.target.checked)}
            />
            音效警示
          </label>
        </div>
      </div>

      {/* Preset Archetypes */}
      <div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={13} color="var(--text-gold)" /> 一鍵套用熱門流派黑名單模板：
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {BUILD_ARCHETYPE_PRESETS.map(preset => {
            const isActive = config.activePresetId === preset.id;
            return (
              <Button
                key={preset.id}
                size="sm"
                variant={isActive ? 'primary' : 'secondary'}
                onClick={() => onApplyPreset(preset.id)}
                icon={<span>{preset.icon}</span>}
                style={{
                  borderColor: isActive ? '#f3d179' : undefined
                }}
                title={preset.descriptionZh}
              >
                <span>{preset.nameZh}</span>
                {isActive && <Check size={12} color="#f3d179" />}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Dangerous Mod Checkbox Grid */}
      <div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
          勾選地圖黑名單詞綴（偵測到時將醒目紅字與音效警報）：
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '8px' }}>
          {MAP_DANGER_MODS.map(def => {
            const isChecked = config.blacklistedModIds.includes(def.id);
            const severityColor = def.severity === 'deadly' ? '#e55039' : def.severity === 'dangerous' ? '#f39c12' : '#f1c40f';
            return (
              <div
                key={def.id}
                onClick={() => onToggleMod(def.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  padding: '8px 10px',
                  background: isChecked ? 'rgba(229, 80, 57, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isChecked ? 'rgba(229, 80, 57, 0.45)' : 'rgba(255, 255, 255, 0.08)'}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {}}
                  style={{ marginTop: '2px', cursor: 'pointer' }}
                />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: isChecked ? 'bold' : 'normal', color: isChecked ? '#ff7675' : 'var(--text-main)' }}>
                      {def.nameZh}
                    </span>
                    <span style={{ fontSize: '0.68rem', padding: '1px 5px', borderRadius: '3px', background: `${severityColor}22`, color: severityColor, border: `1px solid ${severityColor}44` }}>
                      {def.severity === 'deadly' ? '致命' : def.severity === 'dangerous' ? '高危' : '警告'}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {def.descriptionZh}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Custom Keywords Input */}
      <div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
          自訂額外關鍵字過濾（地圖詞綴包含此字串即觸發警告）：
        </div>
        <form onSubmit={handleAddKeyword} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            className="poe-input"
            value={newKeyword}
            onChange={e => setNewKeyword(e.target.value)}
            placeholder="輸入關鍵字，如：燃燒地面、偷取充能..."
            style={{ flex: 1, fontSize: '0.82rem', padding: '6px 10px' }}
          />
          <button type="submit" className="poe-button" style={{ padding: '6px 12px', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus size={14} /> 新增
          </button>
        </form>
        {config.customKeywords.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {config.customKeywords.map(kw => (
              <span
                key={kw}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: 'rgba(200, 170, 110, 0.15)',
                  border: '1px solid rgba(200, 170, 110, 0.4)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.75rem',
                  color: 'var(--text-gold)'
                }}
              >
                {kw}
                <X size={12} style={{ cursor: 'pointer' }} onClick={() => onRemoveCustomKeyword(kw)} />
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
