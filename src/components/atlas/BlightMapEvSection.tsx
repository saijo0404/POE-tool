import React from 'react';
import type { BlightedMapType, BlightMapCalculation } from '../../domain/blight/types';
import { BLIGHT_OILS } from '../../domain/blight/blightData';

interface BlightMapEvSectionProps {
  mapType: BlightedMapType;
  onSwitchMapType: (t: BlightedMapType) => void;
  baseMapCost: number;
  onBaseMapCostChange: (v: number) => void;
  selectedOils: string[];
  onToggleOil: (id: string) => void;
  onClearOils: () => void;
  mapEv: BlightMapCalculation;
}

export const BlightMapEvSection: React.FC<BlightMapEvSectionProps> = (props) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    <MapTypeControls
      mapType={props.mapType}
      onSwitch={props.onSwitchMapType}
      cost={props.baseMapCost}
      onCostChange={props.onBaseMapCostChange}
    />
    <SelectedOilsBar
      selected={props.selectedOils}
      max={props.mapType === 'blighted' ? 3 : 9}
      onClear={props.onClearOils}
    />
    <AvailableOilChips onAddOil={props.onToggleOil} />
    <MapEvSummaryBanner ev={props.mapEv} />
  </div>
);

const MapTypeControls: React.FC<{
  mapType: BlightedMapType;
  onSwitch: (t: BlightedMapType) => void;
  cost: number;
  onCostChange: (v: number) => void;
}> = ({ mapType, onSwitch, cost, onCostChange }) => (
  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
    <button
      onClick={() => onSwitch('blighted')}
      style={{
        padding: '3px 10px',
        borderRadius: '4px',
        border: 'none',
        background: mapType === 'blighted' ? '#1f6feb' : '#21262d',
        color: '#fff',
        cursor: 'pointer',
      }}
    >
      凋落圖 (3聖油)
    </button>
    <button
      onClick={() => onSwitch('blight_ravaged')}
      style={{
        padding: '3px 10px',
        borderRadius: '4px',
        border: 'none',
        background: mapType === 'blight_ravaged' ? '#1f6feb' : '#21262d',
        color: '#fff',
        cursor: 'pointer',
      }}
    >
      凋落蔓延圖 (9聖油)
    </button>
    <span style={{ marginLeft: 'auto', fontSize: '11px', color: '#8b949e' }}>地圖成本 (C):</span>
    <input
      type="number"
      value={cost}
      onChange={(e) => onCostChange(Number(e.target.value) || 0)}
      style={{ width: '55px', padding: '3px', background: '#0d1117', border: '1px solid #30363d', color: '#fff', borderRadius: '4px' }}
    />
  </div>
);

const SelectedOilsBar: React.FC<{
  selected: string[];
  max: number;
  onClear: () => void;
}> = ({ selected, max, onClear }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#0d1117', padding: '6px 8px', borderRadius: '4px' }}>
    <span style={{ fontSize: '11px', color: '#8b949e' }}>已選 ({selected.length}/{max}):</span>
    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', flex: 1 }}>
      {selected.map((id, idx) => {
        const oil = BLIGHT_OILS.find((o) => o.id === id);
        return (
          <span key={`${id}_${idx}`} style={{ padding: '2px 6px', background: '#21262d', borderRadius: '3px', fontSize: '11px' }}>
            {oil?.nameZh ?? id}
          </span>
        );
      })}
    </div>
    {selected.length > 0 && (
      <button onClick={onClear} style={{ padding: '2px 6px', background: '#21262d', border: 'none', color: '#8b949e', borderRadius: '3px', cursor: 'pointer', fontSize: '10px' }}>
        清空
      </button>
    )}
  </div>
);

const AvailableOilChips: React.FC<{ onAddOil: (id: string) => void }> = ({ onAddOil }) => (
  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
    {BLIGHT_OILS.slice(2).map((oil) => (
      <button
        key={oil.id}
        onClick={() => onAddOil(oil.id)}
        style={{
          padding: '2px 6px',
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '3px',
          color: '#c9d1d9',
          cursor: 'pointer',
          fontSize: '11px',
        }}
      >
        +{oil.nameZh}
      </button>
    ))}
  </div>
);

const MapEvSummaryBanner: React.FC<{ ev: BlightMapCalculation }> = ({ ev }) => (
  <div style={{ padding: '8px 10px', background: '#0d1117', borderRadius: '6px', border: '1px solid #30363d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div>
      <div style={{ fontSize: '11px', color: '#8b949e' }}>
        油料成本: {ev.totalOilCostChaos}C | 數量 +{ev.quantityBonusPercent}% | 幸運寶箱 +{ev.luckyChestChancePercent}%
      </div>
      <div>
        期望淨利: <span style={{ color: ev.estimatedNetProfitChaos >= 0 ? '#3fb950' : '#f85149', fontWeight: 'bold' }}>
          {ev.estimatedNetProfitChaos > 0 ? `+${ev.estimatedNetProfitChaos}` : ev.estimatedNetProfitChaos} C
        </span>
        <span style={{ color: '#8b949e', marginLeft: '6px', fontSize: '11px' }}>(總產出: {ev.estimatedGrossChaos}C)</span>
      </div>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ color: '#8b949e', fontSize: '10px' }}>預期回報率 (ROI)</div>
      <div style={{ color: ev.roiPercent >= 0 ? '#3fb950' : '#f85149', fontWeight: 'bold' }}>{ev.roiPercent}%</div>
    </div>
  </div>
);
