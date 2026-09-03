import React from 'react';
import { useCraftingSimulator } from '../hooks/useCraftingSimulator';
import { CraftingHeader } from './crafting/CraftingHeader';
import { CraftingItemConfigCard } from './crafting/CraftingItemConfigCard';
import { CraftingModSelectorCard } from './crafting/CraftingModSelectorCard';
import { CraftingActuaryCard } from './crafting/CraftingActuaryCard';
import { CraftingSimulatorCard } from './crafting/CraftingSimulatorCard';

interface CraftingSimulatorHubProps {
  league?: string;
  divineRate?: number;
  onShowToast?: (msg: string) => void;
}

export const CraftingSimulatorHub: React.FC<CraftingSimulatorHubProps> = ({
  league = 'Settlers',
  divineRate = 150,
  onShowToast,
}) => {
  const {
    selectedClass,
    selectedBase,
    availableBases,
    ilvl,
    setIlvl,
    targetMods,
    activePresetId,
    customPresets,
    actuaryResult,
    selectedSimMethod,
    setSelectedSimMethod,
    simulatedItem,
    handleClassChange,
    handleBaseChange,
    handleToggleTargetMod,
    handleApplyPreset,
    handleRollOnce,
    handleRollUntilHit,
    handleResetSimulation,
  } = useCraftingSimulator({ league, divineRate, onShowToast });

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <CraftingHeader
        activePresetId={activePresetId}
        customPresets={customPresets}
        onApplyPreset={handleApplyPreset}
        league={league}
        divineRate={divineRate}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '20px', alignItems: 'start' }}>
        {/* Left Column: Item Config & Mod Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <CraftingItemConfigCard
            selectedClass={selectedClass}
            selectedBase={selectedBase}
            availableBases={availableBases}
            ilvl={ilvl}
            onClassChange={handleClassChange}
            onBaseChange={handleBaseChange}
            onIlvlChange={setIlvl}
          />

          <CraftingModSelectorCard
            baseItem={selectedBase}
            ilvl={ilvl}
            targetMods={targetMods}
            onToggleTargetMod={handleToggleTargetMod}
          />
        </div>

        {/* Right Column: Actuary Calculations & Simulator Sandbox */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <CraftingActuaryCard actuaryResult={actuaryResult} />

          <CraftingSimulatorCard
            selectedMethod={selectedSimMethod}
            onMethodChange={setSelectedSimMethod}
            simulatedItem={simulatedItem}
            onRollOnce={handleRollOnce}
            onRollUntilHit={handleRollUntilHit}
            onReset={handleResetSimulation}
            divineRate={divineRate}
          />
        </div>
      </div>
    </div>
  );
};

export default CraftingSimulatorHub;
