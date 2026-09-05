import React from 'react';
import { useBestiaryCraft } from '../../hooks/useBestiaryCraft';
import { BestiaryMissionSection } from './BestiaryMissionSection';
import { BestiaryRecipeSection } from './BestiaryRecipeSection';

interface BestiaryCraftCardProps {
  league?: string;
  onCopyWhisper?: (text: string) => void;
}

export const BestiaryCraftCard: React.FC<BestiaryCraftCardProps> = ({
  league = 'Settlers',
  onCopyWhisper,
}) => {
  const { activeTab, setActiveTab, recipeProps, missionProps } = useBestiaryCraft({
    league,
    onCopyWhisper,
  });

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
      <BestiaryHeader activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === 'craft' ? (
        <BestiaryRecipeSection {...recipeProps} />
      ) : (
        <BestiaryMissionSection {...missionProps} />
      )}
    </div>
  );
};

interface BestiaryHeaderProps {
  activeTab: 'craft' | 'mission';
  onTabChange: (tab: 'craft' | 'mission') => void;
}

const BestiaryHeader: React.FC<BestiaryHeaderProps> = ({ activeTab, onTabChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
    <h3 style={{ margin: 0, color: '#f0883e', fontSize: '15px' }}>🦁 魔物園獵捕效益與野獸工藝精算器</h3>
    <div style={{ display: 'flex', gap: '6px' }}>
      <button
        onClick={() => onTabChange('craft')}
        style={{
          padding: '4px 10px',
          borderRadius: '4px',
          border: 'none',
          background: activeTab === 'craft' ? '#238636' : '#21262d',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        野獸工藝配方
      </button>
      <button
        onClick={() => onTabChange('mission')}
        style={{
          padding: '4px 10px',
          borderRadius: '4px',
          border: 'none',
          background: activeTab === 'mission' ? '#238636' : '#21262d',
          color: '#fff',
          cursor: 'pointer',
        }}
      >
        魔物園獵捕 EV
      </button>
    </div>
  </div>
);

export default BestiaryCraftCard;
