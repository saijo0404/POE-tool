import React from 'react';
import { useBlightOil } from '../../hooks/useBlightOil';
import { BlightArbitrageSection } from './BlightArbitrageSection';
import { BlightAnointSection } from './BlightAnointSection';
import { BlightMapEvSection } from './BlightMapEvSection';
import { Card, Button } from '../ui';

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
    <Card
      variant="bordered"
      style={{
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
    </Card>
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
      <Button
        size="sm"
        variant={activeTab === 'arbitrage' ? 'primary' : 'secondary'}
        onClick={() => onTabChange('arbitrage')}
      >
        3:1 升級套利
      </Button>
      <Button
        size="sm"
        variant={activeTab === 'anointment' ? 'primary' : 'secondary'}
        onClick={() => onTabChange('anointment')}
      >
        天賦塗油反查
      </Button>
      <Button
        size="sm"
        variant={activeTab === 'map' ? 'primary' : 'secondary'}
        onClick={() => onTabChange('map')}
      >
        真菌地圖塗油 EV
      </Button>
    </div>
  </div>
);

export default BlightOilCard;
