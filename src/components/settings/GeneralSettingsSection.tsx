import React from 'react';
import { Globe, Keyboard } from 'lucide-react';
import type { AppSettings } from '../../domain/settings/types';

interface GeneralSettingsSectionProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const GeneralSettingsSection: React.FC<GeneralSettingsSectionProps> = ({
  settings,
  setSettings,
}) => {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ fontSize: '1rem', color: 'var(--text-gold)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Globe size={16} /> 基礎與聯盟設定 (General & League)
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            目標聯盟 (League)
          </label>
          <input
            type="text"
            className="poe-input"
            value={settings.league}
            onChange={e => setSettings(prev => ({ ...prev, league: e.target.value }))}
            placeholder="例如: Settlers 或 Auto"
            style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
            自動快照週期 (分鐘)
          </label>
          <input
            type="number"
            className="poe-input"
            value={settings.autoSnapshotIntervalMinutes}
            onChange={e => setSettings(prev => ({ ...prev, autoSnapshotIntervalMinutes: Number(e.target.value) || 60 }))}
            style={{ width: '100%', padding: '6px 10px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-bright)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.autoSnapshotEnabled}
            onChange={e => setSettings(prev => ({ ...prev, autoSnapshotEnabled: e.target.checked }))}
          />
          啟用定時自動資產快照
        </label>
      </div>

      <div style={{ padding: '10px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Keyboard size={15} /> 遊戲內自動查價快捷鍵
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          免設定！在遊戲中只需按下 Ctrl+C 複製物品資訊，POE Tool 將自動在後台進行智慧解析與精準查價。
        </div>
      </div>
    </div>
  );
};
