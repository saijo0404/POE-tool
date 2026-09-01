import React from 'react';
import type { AppSettings } from '../../domain/settings/types';

interface OverlaySettingsSectionProps {
  settings: Partial<AppSettings>;
  onChange: (key: keyof AppSettings, value: unknown) => void;
}

export const OverlaySettingsSection: React.FC<OverlaySettingsSectionProps> = ({
  settings,
  onChange
}) => {
  const overlayEnabled = settings.overlayEnabled ?? true;
  const overlayOpacity = settings.overlayOpacity ?? 0.92;
  const autoClose = settings.overlayAutoCloseOnBlur ?? true;
  const overlayScale = settings.overlayScale ?? 1.0;
  const clickThrough = settings.overlayClickThrough ?? false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--text-gold)', margin: 0 }}>
        🎮 遊戲內懸浮查價卡片 (Awakened-Style Overlay)
      </h3>

      {/* Enable Overlay */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
        <input
          type="checkbox"
          checked={overlayEnabled}
          onChange={(e) => onChange('overlayEnabled', e.target.checked)}
          style={{ accentColor: 'var(--text-gold)' }}
        />
        <span>啟用遊戲內極簡懸浮小卡（於游標旁彈出查價）</span>
      </label>

      {/* Auto close on blur */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
        <input
          type="checkbox"
          checked={autoClose}
          onChange={(e) => onChange('overlayAutoCloseOnBlur', e.target.checked)}
          style={{ accentColor: 'var(--text-gold)' }}
        />
        <span>隨點即消模式（點擊遊戲畫面或失焦時自動隱藏懸浮卡片）</span>
      </label>

      {/* Default Click-through */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem' }}>
        <input
          type="checkbox"
          checked={clickThrough}
          onChange={(e) => onChange('overlayClickThrough', e.target.checked)}
          style={{ accentColor: 'var(--text-gold)' }}
        />
        <span>滑鼠穿透模式 (Click-Through)</span>
      </label>

      {/* Opacity Slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1' }}>
          <span>卡片預設不透明度</span>
          <span style={{ color: 'var(--text-gold)' }}>{Math.round(overlayOpacity * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.3"
          max="1.0"
          step="0.05"
          value={overlayOpacity}
          onChange={(e) => onChange('overlayOpacity', parseFloat(e.target.value))}
          style={{ accentColor: 'var(--text-gold)' }}
        />
      </div>

      {/* Scale Slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#cbd5e1' }}>
          <span>懸浮卡片介面縮放 (Scale)</span>
          <span style={{ color: 'var(--text-gold)' }}>{Math.round(overlayScale * 100)}%</span>
        </div>
        <input
          type="range"
          min="0.8"
          max="1.3"
          step="0.05"
          value={overlayScale}
          onChange={(e) => onChange('overlayScale', parseFloat(e.target.value))}
          style={{ accentColor: 'var(--text-gold)' }}
        />
      </div>
    </div>
  );
};
