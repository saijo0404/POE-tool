import React from 'react';
import { useBlightOil } from '../../hooks/useBlightOil';
import { BlightArbitrageSection } from './BlightArbitrageSection';
import { BlightAnointSection } from './BlightAnointSection';
import { BlightMapEvSection } from './BlightMapEvSection';

interface BlightOilCardProps {
  divineRate?: number;
}

export const BlightOilCard: React.FC<BlightOilCardProps> = () => {
  const {
    activeTab,
    setActiveTab,
    arbitrageList,
    onUpdatePrice,
    anointKeyword,
    onAnointKeywordChange,
    filteredAnoints,
    mapType,
    onSwitchMapType,
    baseMapCost,
    onBaseMapCostChange,
    selectedOils,
    onToggleOil,
    onClearOils,
    mapEv,
  } = useBlightOil();

  return (
    <div
      style={{
        background: '#161b22',
        border: '1px solid #30363d',
        borderRadius: '8px',
        padding: '16px',
        color: '#c9d1d9',
        fontSize: '13px',
      }}
    >
      <BlightHeader activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'arbitrage' && (
        <BlightArbitrageSection
          arbitrageList={arbitrageList}
          onUpdatePrice={onUpdatePrice}
        />
      )}
      {activeTab === 'anointment' && (
        <BlightAnointSection
          keyword={anointKeyword}
          onKeywordChange={onAnointKeywordChange}
          anointments={filteredAnoints}
        />
      )}
      {activeTab === 'map' && (
        <BlightMapEvSection
          mapType={mapType}
          onSwitchMapType={onSwitchMapType}
          baseMapCost={baseMapCost}
          onBaseMapCostChange={onBaseMapCostChange}
          selectedOils={selectedOils}
          onToggleOil={onToggleOil}
          onClearOils={onClearOils}
          mapEv={mapEv}
        />
      )}
    </div>
  );
};

interface BlightHeaderProps {
  activeTab: 'arbitrage' | 'anointment' | 'map';
  onTabChange: (t: 'arbitrage' | 'anointment' | 'map') => void;
}

const BlightHeader: React.FC<BlightHeaderProps> = ({ activeTab, onTabChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
    <h3 style={{ margin: 0, color: '#e3b341', fontSize: '15px' }}>💧 凋落聖油提煉配比與真菌地圖收益精算器</h3>
    <div style={{ display: 'flex', gap: '6px' }}>
      <button
        onClick={() => onTabChange('arbitrage')}
        style={{
          padding: '4px 10px',
          borderRadius: '4px',
          border: 'none',
          background: activeTab === 'arbitrage' ? '#1f6feb' : '#21262d',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        3:1 升級套利
      </button>
      <button
        onClick={() => onTabChange('anointment')}
        style={{
          padding: '4px 10px',
          borderRadius: '4px',
          border: 'none',
          background: activeTab === 'anointment' ? '#1f6feb' : '#21262d',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        天賦塗油反查
      </button>
      <button
        onClick={() => onTabChange('map')}
        style={{
          padding: '4px 10px',
          borderRadius: '4px',
          border: 'none',
          background: activeTab === 'map' ? '#1f6feb' : '#21262d',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        真菌地圖塗油 EV
      </button>
    </div>
  </div>
);

export default BlightOilCard;
