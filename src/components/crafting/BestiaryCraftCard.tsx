import React from 'react';
import { useBestiaryCraft } from '../../hooks/useBestiaryCraft';
import { BestiaryMissionSection } from './BestiaryMissionSection';
import { BestiaryRecipeSection } from './BestiaryRecipeSection';
import { Card, Button } from '../ui';

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
    <Card
      variant="bordered"
      style={{
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
    </Card>
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
      <Button
        size="sm"
        variant={activeTab === 'craft' ? 'primary' : 'secondary'}
        onClick={() => onTabChange('craft')}
      >
        野獸工藝配方
      </Button>
      <Button
        size="sm"
        variant={activeTab === 'mission' ? 'primary' : 'secondary'}
        onClick={() => onTabChange('mission')}
      >
        魔物園獵捕 EV
      </Button>
    </div>
  </div>
);

export default BestiaryCraftCard;
