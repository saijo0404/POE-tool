import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpeditionOptimizerCard } from '../ExpeditionOptimizerCard';

describe('ExpeditionOptimizerCard', () => {
  it('should render header and default Tujen haggle tab', () => {
    render(<ExpeditionOptimizerCard />);
    expect(screen.getByText(/探險先祖出價最佳化與日誌收益精算器/i)).toBeInTheDocument();
    expect(screen.getByText(/首出安全出價/i)).toBeInTheDocument();
    expect(screen.getByText(/首出進取出價/i)).toBeInTheDocument();
    expect(screen.getAllByText(/二出回價/i).length).toBeGreaterThan(0);
  });

  it('should update Tujen offer when asking price changes', () => {
    render(<ExpeditionOptimizerCard />);
    const input = screen.getByDisplayValue('350');
    fireEvent.change(input, { target: { value: '1000' } });

    expect(screen.getByText('520')).toBeInTheDocument();
    expect(screen.getByText('680')).toBeInTheDocument();
  });

  it('should switch to Dannig exchange tab and show arbitrage', () => {
    render(<ExpeditionOptimizerCard />);
    const dannigBtn = screen.getByText('丹尼格文物換算');
    fireEvent.click(dannigBtn);

    expect(screen.getByText(/丹尼格太陽文物數量/i)).toBeInTheDocument();
    expect(screen.getByText(/套利價差盈虧:/i)).toBeInTheDocument();
  });

  it('should switch to Logbook EV tab, toggle deadly affixes, and warn player', () => {
    render(<ExpeditionOptimizerCard />);
    const logbookBtn = screen.getByText('探險日誌收益 EV');
    fireEvent.click(logbookBtn);

    expect(screen.getByText(/黑鐮傭兵/i)).toBeInTheDocument();
    expect(screen.getByText(/符文怪加成:/i)).toBeInTheDocument();

    const deadlyButton = screen.getByText(/怪物免疫所有元素傷害/i);
    fireEvent.click(deadlyButton);

    expect(screen.getByText(/偵測到致命詞綴：/i)).toBeInTheDocument();
    expect(screen.getByText('致命風險')).toBeInTheDocument();
  });
});
