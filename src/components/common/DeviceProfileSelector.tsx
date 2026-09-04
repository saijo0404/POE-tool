import React from 'react';
import type { DeviceProfileMode } from '../../domain/platform/deviceProfile';
import { Monitor, Gamepad2, Smartphone, Sparkles, Check } from 'lucide-react';

interface DeviceProfileSelectorProps {
  mode: DeviceProfileMode;
  onModeChange: (mode: DeviceProfileMode) => void;
  suggestedMode?: DeviceProfileMode;
  compact?: boolean;
}

interface ProfileOption {
  id: DeviceProfileMode;
  label: string;
  subLabel: string;
  icon: React.ReactNode;
  badge: string;
}

const PROFILE_OPTIONS: ProfileOption[] = [
  {
    id: 'desktop',
    label: '標準桌面',
    subLabel: '滑鼠精準操作 (100% 比例)',
    icon: <Monitor size={16} />,
    badge: '32px 點擊區域'
  },
  {
    id: 'steam-deck',
    label: 'Steam Deck / 掌機',
    subLabel: '大按鈕高對比 (125% 縮放)',
    icon: <Gamepad2 size={16} />,
    badge: '48px 觸控友善'
  },
  {
    id: 'compact-hud',
    label: '精簡 HUD',
    subLabel: '最小化懸浮窗佔用 (90%)',
    icon: <Smartphone size={16} />,
    badge: '極簡視窗'
  }
];

export const DeviceProfileSelector: React.FC<DeviceProfileSelectorProps> = ({
  mode,
  onModeChange,
  suggestedMode,
  compact = false
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: compact ? '6px' : '10px',
      background: 'rgba(0, 0, 0, 0.25)',
      padding: compact ? '8px 10px' : '12px 14px',
      borderRadius: '6px',
      border: '1px solid rgba(255, 255, 255, 0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-gold, #f3d179)' }}>
          <Gamepad2 size={16} />
          <span>裝置顯示與觸控 HUD 模式</span>
        </div>

        {suggestedMode && suggestedMode !== mode && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.72rem',
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.12)',
            padding: '2px 6px',
            borderRadius: '10px',
            border: '1px solid rgba(56, 189, 248, 0.3)'
          }}>
            <Sparkles size={11} />
            <span>偵測建議：{suggestedMode === 'steam-deck' ? 'Steam Deck' : '精簡 HUD'}</span>
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: compact ? 'repeat(3, 1fr)' : 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '8px'
      }}>
        {PROFILE_OPTIONS.map(opt => {
          const isSelected = mode === opt.id;
          const isSuggested = suggestedMode === opt.id;

          return (
            <div
              key={opt.id}
              onClick={() => onModeChange(opt.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: compact ? '6px 8px' : '10px 12px',
                borderRadius: '5px',
                cursor: 'pointer',
                background: isSelected
                  ? 'linear-gradient(135deg, rgba(200, 170, 110, 0.18) 0%, rgba(14, 143, 127, 0.15) 100%)'
                  : 'rgba(255, 255, 255, 0.02)',
                border: isSelected
                  ? '1.5px solid var(--border-gold-bright, #f3d179)'
                  : '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isSelected ? 'var(--text-gold, #f3d179)' : '#cbd5e1', fontWeight: 600, fontSize: '0.82rem' }}>
                  {opt.icon}
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check size={14} color="#f3d179" />}
              </div>

              {!compact && (
                <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                  {opt.subLabel}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span style={{
                  fontSize: '0.68rem',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: isSelected ? 'rgba(243, 209, 121, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  color: isSelected ? '#fef08a' : '#94a3b8'
                }}>
                  {opt.badge}
                </span>

                {isSuggested && !isSelected && (
                  <span style={{ fontSize: '0.68rem', color: '#38bdf8' }}>★ 推薦</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
