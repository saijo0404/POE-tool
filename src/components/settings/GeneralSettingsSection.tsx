import React, { useState } from 'react';
import { Globe, Keyboard, Layers } from 'lucide-react';
import type { AppSettings } from '../../domain/settings/types';
import { FeatureCapabilityMatrixModal } from './FeatureCapabilityMatrixModal';

interface GeneralSettingsSectionProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
}

export const GeneralSettingsSection: React.FC<GeneralSettingsSectionProps> = ({
  settings,
  setSettings,
}) => {
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);
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

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-bright)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.autoSnapshotEnabled}
            onChange={e => setSettings(prev => ({ ...prev, autoSnapshotEnabled: e.target.checked }))}
          />
          啟用定時自動資產快照
        </label>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-bright)', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={settings.focusModeEnabled ?? false}
            onChange={e => setSettings(prev => ({ ...prev, focusModeEnabled: e.target.checked }))}
          />
          啟用雙版本專注模式（依據當前 PoE 1 / PoE 2 自動過濾或折疊專屬分頁）
        </label>
        <div style={{ marginLeft: '24px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          開啟後將在 PoE 2 自動折疊舊輿圖與工藝台等 PoE 1 專屬分頁，提供最乾淨的介面體驗。
        </div>
      </div>

      <div style={{ marginBottom: '14px' }}>
        <button
          type="button"
          onClick={() => setIsMatrixOpen(true)}
          className="poe-button-secondary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', fontSize: '0.8rem', borderRadius: '5px' }}
        >
          <Layers size={14} /> 查看 PoE 1 vs PoE 2 世代能力與功能支援對照表
        </button>
      </div>

      <FeatureCapabilityMatrixModal
        isOpen={isMatrixOpen}
        onClose={() => setIsMatrixOpen(false)}
      />

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
