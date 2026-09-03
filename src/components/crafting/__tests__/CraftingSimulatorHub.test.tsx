import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CraftingSimulatorHub } from '../../CraftingSimulatorHub';

vi.mock('../../../hooks/atlas/useAtlasNinjaRates', () => ({
  useAtlasNinjaRates: () => ({
    ninjaRates: {
      'Deafening Essence of Greed': 4,
      'Pristine Fossil': 3,
    },
    isRatesLoading: false,
  }),
}));

describe('CraftingSimulatorHub Component Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render the full crafting simulator hub with all 4 cards', () => {
    render(<CraftingSimulatorHub league="Settlers" divineRate={150} />);

    expect(screen.getByText(/裝備工藝模擬與成本期望精算器/i)).toBeInTheDocument();
    expect(screen.getByText('1. 裝備部位與基底設定')).toBeInTheDocument();
    expect(screen.getByText('2. 勾選目標前綴與後綴')).toBeInTheDocument();
    expect(screen.getByText('3. 工藝成本期望精算 (Actuary Report)')).toBeInTheDocument();
    expect(screen.getByText('4. 實機模擬試骰沙盒 (Live Craft Sandbox)')).toBeInTheDocument();
  });

  it('should allow clicking roll once button to simulate a roll', () => {
    render(<CraftingSimulatorHub league="Settlers" divineRate={150} />);

    const rollBtn = screen.getByRole('button', { name: /試骰 1 次/i });
    expect(rollBtn).toBeInTheDocument();

    fireEvent.click(rollBtn);

    expect(screen.getByText('1 次')).toBeInTheDocument();
    expect(screen.getByText(/精製之/i)).toBeInTheDocument();
  });

  it('should allow switching item classes via buttons', () => {
    render(<CraftingSimulatorHub league="Settlers" divineRate={150} />);

    const bootsBtn = screen.getByRole('button', { name: '靴子' });
    fireEvent.click(bootsBtn);

    expect(screen.getAllByText(/雙色鞋/i).length).toBeGreaterThanOrEqual(1);
  });
});
