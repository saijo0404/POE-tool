import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BuildCalculator } from '../BuildCalculator';
import { poeApi } from '../../services/api';
import { defaultProps, mockBuildResult, mockBuildWithMods } from './buildCalculatorMockData';

describe('BuildCalculator - Calculation & Navigation Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it('renders input box, quick buttons, and calculates build costs successfully', async () => {
    const onShowToast = vi.fn();
    vi.spyOn(poeApi, 'calculateBuild').mockResolvedValue(mockBuildResult);

    await act(async () => {
      render(<BuildCalculator {...defaultProps} onShowToast={onShowToast} />);
    });

    const input = screen.getByPlaceholderText(/poe\.ninja/i);
    fireEvent.change(input, { target: { value: 'https://poe.ninja/builds/char/TestAccount/SlayerGod1' } });

    const calcBtn = screen.getByRole('button', { name: /計算成本/i });
    await act(async () => {
      fireEvent.click(calcBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('SlayerGod')).toBeInTheDocument();
      expect(screen.getByText('Mageblood')).toBeInTheDocument();
      expect(screen.getByText('Starforge')).toBeInTheDocument();
    });

    expect(onShowToast).toHaveBeenCalledWith('Build 成本計算完成並已儲存快取！');
  });

  it('handles build calculation failure gracefully and displays error banner', async () => {
    const onShowToast = vi.fn();
    vi.spyOn(poeApi, 'calculateBuild').mockRejectedValue(new Error('PoB decode error'));

    await act(async () => {
      render(<BuildCalculator {...defaultProps} onShowToast={onShowToast} />);
    });

    const input = screen.getByPlaceholderText(/poe\.ninja/i);
    fireEvent.change(input, { target: { value: 'invalid-url' } });

    const calcBtn = screen.getByRole('button', { name: /計算成本/i });
    await act(async () => {
      fireEvent.click(calcBtn);
    });

    await waitFor(() => {
      expect(screen.getByText(/PoB decode error/i)).toBeInTheDocument();
    });
  });

  it('switches category tabs (equipment, gems, flasks, jewels) and filters items', async () => {
    vi.spyOn(poeApi, 'calculateBuild').mockResolvedValue(mockBuildResult);

    await act(async () => {
      render(<BuildCalculator {...defaultProps} />);
    });

    const input = screen.getByPlaceholderText(/poe\.ninja/i);
    fireEvent.change(input, { target: { value: 'https://pobb.in/test-tabs' } });

    const calcBtn = screen.getByRole('button', { name: /計算成本/i });
    await act(async () => {
      fireEvent.click(calcBtn);
    });

    await waitFor(() => {
      expect(screen.getByText('Mageblood')).toBeInTheDocument();
    });

    const gemsTab = screen.getByText(/💎 寶石/i);
    await act(async () => {
      fireEvent.click(gemsTab);
    });
    expect(screen.getByText('Awakened Multistrike Support')).toBeInTheDocument();

    const flasksTab = screen.getByText(/🧪 藥劑/i);
    await act(async () => {
      fireEvent.click(flasksTab);
    });
    expect(screen.getByText('Progenesis')).toBeInTheDocument();

    const jewelsTab = screen.getByText(/🔮 珠寶/i);
    await act(async () => {
      fireEvent.click(jewelsTab);
    });
    expect(screen.getByText('Watcher\'s Eye')).toBeInTheDocument();
  });

  it('displays detailed item affixes and stats when hovering over a build item', async () => {
    vi.spyOn(poeApi, 'calculateBuild').mockResolvedValue(mockBuildWithMods);

    await act(async () => {
      render(<BuildCalculator {...defaultProps} />);
    });

    const input = screen.getByPlaceholderText(/poe\.ninja/i);
    fireEvent.change(input, { target: { value: 'https://pobb.in/test-hover' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /計算成本/i }));
    });

    await waitFor(() => {
      expect(screen.getByText('Mageblood')).toBeInTheDocument();
    });

    const magebloodEl = screen.getByText('Mageblood');
    fireEvent.mouseEnter(magebloodEl);

    expect(screen.getByText('+30 to Strength')).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('Leftmost 4 Magic Utility Flasks'))).toBeInTheDocument();
    expect(screen.getByText((c) => c.includes('+15% to all Elemental Resistances'))).toBeInTheDocument();
  });
});
