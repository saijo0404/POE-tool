import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WaystoneRiskCard } from '../WaystoneRiskCard';
import { evaluateWaystone } from '../../../domain/waystone/waystoneRiskEvaluator';

describe('WaystoneRiskCard', () => {
  const sampleWaystone = `
Item Class: Waystones
Rarity: Rare
Bramble Waystone (Tier 15)
--------
Waystone Tier: 15
Item Quantity: +70%
--------
Monsters penetrate 14% Elemental Resistances
Patches of Chilled Ground
`;

  it('renders evaluation details with safety score and matched mods', () => {
    const evaluation = evaluateWaystone(sampleWaystone);
    const onRawTextChange = vi.fn();
    const onLoadSample = vi.fn();

    render(
      <WaystoneRiskCard
        evaluation={evaluation}
        rawText={sampleWaystone}
        onRawTextChange={onRawTextChange}
        onLoadSample={onLoadSample}
      />
    );

    expect(screen.getByText(/銘刻地圖即時詞綴評鑑/i)).toBeInTheDocument();
    expect(screen.getByText(/安全評分：/i)).toBeInTheDocument();
    expect(screen.getAllByText(/致命致死 \(Fatal\)/i).length).toBeGreaterThan(0);
    expect(screen.getByText('怪物穿透元素抗性')).toBeInTheDocument();
  });

  it('triggers onLoadSample when clicking sample button', () => {
    const evaluation = evaluateWaystone('');
    const onRawTextChange = vi.fn();
    const onLoadSample = vi.fn();

    render(
      <WaystoneRiskCard
        evaluation={evaluation}
        rawText=""
        onRawTextChange={onRawTextChange}
        onLoadSample={onLoadSample}
      />
    );

    fireEvent.click(screen.getByText('帶入範例銘刻地圖'));
    expect(onLoadSample).toHaveBeenCalledTimes(1);
  });

  it('shows empty state message when input is not a waystone', () => {
    const evaluation = evaluateWaystone('Random text');
    render(
      <WaystoneRiskCard
        evaluation={evaluation}
        rawText="Random text"
        onRawTextChange={vi.fn()}
        onLoadSample={vi.fn()}
      />
    );

    expect(screen.getByText(/貼上銘刻地圖 \(Waystone\) 裝備資料以開始評估/i)).toBeInTheDocument();
  });
});
