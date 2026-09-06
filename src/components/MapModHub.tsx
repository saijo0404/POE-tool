import React, { useState } from 'react';
import { ShieldAlert, Compass } from 'lucide-react';
import { useMapDanger } from '../hooks/useMapDanger';
import { useGameEngine } from '../hooks/useGameEngine';
import { MapDangerSettingsCard } from './mapMod/MapDangerSettingsCard';
import { MapRegexGeneratorCard } from './mapMod/MapRegexGeneratorCard';
import { MapLiveTesterCard } from './mapMod/MapLiveTesterCard';
import { MapRollingSimulatorCard } from './mapMod/MapRollingSimulatorCard';
import { WaystoneHub } from './waystone/WaystoneHub';

interface MapModHubProps {
  onShowToast?: (msg: string) => void;
}

export const MapModHub: React.FC<MapModHubProps> = ({ onShowToast }) => {
  const { currentEngine } = useGameEngine();
  const [activeTab, setActiveTab] = useState<'poe1' | 'poe2'>(currentEngine);

  const {
    config,
    updateConfig,
    applyPreset,
    toggleModBlacklist,
    addCustomKeyword,
    removeCustomKeyword,
    testSound,
    evaluateItem,
    regexOptions,
    setRegexOptions,
    regexResult,
    copiedRegex,
    copyGeneratedRegex
  } = useMapDanger();

  const handleCopyRegex = () => {
    copyGeneratedRegex();
    onShowToast?.('📋 已複製超短 Regex 到剪貼簿！可在遊戲內搜尋列直接貼上');
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Top Engine View Toggle */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
        <button
          type="button"
          className={activeTab === 'poe1' ? 'poe-button' : 'poe-button-secondary'}
          onClick={() => setActiveTab('poe1')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', fontSize: '0.86rem' }}
        >
          <ShieldAlert size={16} /> PoE 1 輿圖詞綴 & 倉庫 Regex
        </button>
        <button
          type="button"
          className={activeTab === 'poe2' ? 'poe-button' : 'poe-button-secondary'}
          onClick={() => setActiveTab('poe2')}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '6px', fontSize: '0.86rem' }}
        >
          <Compass size={16} /> PoE 2 銘刻地圖 (Waystone) 評鑑與洗圖
        </button>
      </div>

      {activeTab === 'poe2' ? (
        <WaystoneHub onShowToast={onShowToast} />
      ) : (
        <>
          {/* Header Banner */}
          <div style={{
            background: 'radial-gradient(ellipse at top left, rgba(200, 170, 110, 0.15) 0%, rgba(10, 13, 20, 0.8) 70%)',
            border: '1px solid rgba(200, 170, 110, 0.3)',
            borderRadius: '8px',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e55039 0%, #b71540 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 14px rgba(229, 80, 57, 0.4)'
          }}>
            <ShieldAlert size={24} color="#fff" />
          </div>
          <div>
            <h2 className="poe-font" style={{ margin: 0, fontSize: '1.35rem', color: 'var(--text-gold)', letterSpacing: '0.5px' }}>
              地圖危險詞綴警示 & 倉庫 Regex 產生器
            </h2>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              流派致命詞綴自動紅字音效警報 & 遊戲內 50 字元超短正規表達式一鍵生成
            </span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Danger Settings & Live Tester */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <MapDangerSettingsCard
            config={config}
            onApplyPreset={applyPreset}
            onToggleMod={toggleModBlacklist}
            onAddCustomKeyword={addCustomKeyword}
            onRemoveCustomKeyword={removeCustomKeyword}
            onToggleSound={enabled => updateConfig({ soundAlertEnabled: enabled })}
            onTestSound={testSound}
          />
          <MapLiveTesterCard onEvaluate={evaluateItem} />
        </div>

        {/* Right Column: Regex Generator & Map Rolling Simulator */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <MapRegexGeneratorCard
            options={regexOptions}
            result={regexResult}
            copied={copiedRegex}
            onUpdateOptions={patch => setRegexOptions(prev => ({ ...prev, ...patch }))}
            onCopy={handleCopyRegex}
          />
          <MapRollingSimulatorCard
            initialForbiddenCount={config.blacklistedModIds?.length || 3}
          />
        </div>
      </div>
    </>
  )}
</div>
  );
};

export default MapModHub;
