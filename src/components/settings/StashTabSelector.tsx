import React from 'react';
import { Layers, RefreshCw } from 'lucide-react';
import type { AppSettings } from '../../domain/settings/types';
import type { StashTabMeta } from '../../domain/wealth/types';

interface StashTabSelectorProps {
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  availableTabs: StashTabMeta[];
  onFetchStashTabs: () => void;
  onSelectAllTabs: () => void;
  onClearAllTabs: () => void;
  onSelectCurrencyTabs: () => void;
}

export const StashTabSelector: React.FC<StashTabSelectorProps> = ({
  settings,
  setSettings,
  availableTabs,
  onFetchStashTabs,
  onSelectAllTabs,
  onClearAllTabs,
  onSelectCurrencyTabs
}) => {
  const selectedTabs = settings.selectedStashTabs || [];

  const handleToggleTab = (tabIndex: number) => {
    const isSelected = selectedTabs.includes(tabIndex);
    const updated = isSelected ? selectedTabs.filter(i => i !== tabIndex) : [...selectedTabs, tabIndex];
    setSettings(prev => ({ ...prev, selectedStashTabs: updated }));
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={16} /> 倉庫頁資產追蹤自選 (Stash Tab Selector)
        </h3>
        <button
          type="button"
          className="poe-button-secondary"
          onClick={onFetchStashTabs}
          style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RefreshCw size={12} /> 載入/更新倉庫清單
        </button>
      </div>

      {availableTabs.length > 0 && (
        <>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="poe-button-secondary"
              onClick={onSelectAllTabs}
              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
            >
              全選 ({availableTabs.length} 頁)
            </button>
            <button
              type="button"
              className="poe-button-secondary"
              onClick={onSelectCurrencyTabs}
              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
            >
              僅主要通貨/碎片頁
            </button>
            <button
              type="button"
              className="poe-button-secondary"
              onClick={onClearAllTabs}
              style={{ padding: '3px 8px', fontSize: '0.75rem', color: '#ef4444' }}
            >
              清除全部選取
            </button>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '160px', overflowY: 'auto', padding: '6px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {availableTabs.map(tab => {
              const isChecked = selectedTabs.length === 0 || selectedTabs.includes(tab.i);
              return (
                <div
                  key={tab.id || tab.i}
                  onClick={() => handleToggleTab(tab.i)}
                  style={{
                    padding: '3px 8px', borderRadius: '4px', fontSize: '0.78rem', cursor: 'pointer',
                    background: isChecked ? 'rgba(200, 170, 110, 0.2)' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isChecked ? 'var(--text-gold)' : 'rgba(255,255,255,0.1)'}`,
                    color: isChecked ? 'var(--text-bright)' : 'var(--text-dim)',
                  }}
                >
                  {tab.n}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
