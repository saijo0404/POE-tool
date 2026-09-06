import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WaystoneRollingCard } from '../WaystoneRollingCard';
import { forecastWaystoneRolling } from '../../../domain/waystone/waystoneRollingForecaster';

describe('WaystoneRollingCard', () => {
  const criteria = {
    maxAcceptableRisk: 'caution' as const,
    minItemQuantity: 65,
    forbiddenModIds: []
  };

  it('renders strategies, criteria controls, and currency cost estimates', () => {
    const forecast = forecastWaystoneRolling('alch_scour', criteria);
    const onCriteriaChange = vi.fn();
    const onStrategyChange = vi.fn();

    render(
      <WaystoneRollingCard
        criteria={criteria}
        forecast={forecast}
        onCriteriaChange={onCriteriaChange}
        onStrategyChange={onStrategyChange}
      />
    );

    expect(screen.getByText(/洗圖通貨成本期望精算/i)).toBeInTheDocument();
    expect(screen.getByText(/點金 \+ 重鑄/i)).toBeInTheDocument();
    expect(screen.getByText(/單次命中率/i)).toBeInTheDocument();
    expect(screen.getByText(/期望嘗試次數/i)).toBeInTheDocument();
    expect(screen.getByText(/預估通貨花費明細/i)).toBeInTheDocument();
  });

  it('triggers onStrategyChange when clicking another strategy', () => {
    const forecast = forecastWaystoneRolling('alch_scour', criteria);
    const onStrategyChange = vi.fn();

    render(
      <WaystoneRollingCard
        criteria={criteria}
        forecast={forecast}
        onCriteriaChange={vi.fn()}
        onStrategyChange={onStrategyChange}
      />
    );

    fireEvent.click(screen.getByText(/混沌直骰/i));
    expect(onStrategyChange).toHaveBeenCalledWith('chaos_spam');
  });

  it('triggers onCriteriaChange when modifying maxAcceptableRisk', () => {
    const forecast = forecastWaystoneRolling('alch_scour', criteria);
    const onCriteriaChange = vi.fn();

    render(
      <WaystoneRollingCard
        criteria={criteria}
        forecast={forecast}
        onCriteriaChange={onCriteriaChange}
        onStrategyChange={vi.fn()}
      />
    );

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'warning' } });
    expect(onCriteriaChange).toHaveBeenCalledWith({ maxAcceptableRisk: 'warning' });
  });
});
