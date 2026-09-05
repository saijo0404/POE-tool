import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BlightOilCard } from '../BlightOilCard';

describe('BlightOilCard', () => {
  it('should render header and default arbitrage tab with rows', () => {
    render(<BlightOilCard />);
    expect(screen.getByText(/凋落聖油提煉配比與真菌地圖收益精算器/i)).toBeInTheDocument();
    expect(screen.getByText(/3:1 升級路徑/i)).toBeInTheDocument();
    expect(screen.getByText('透明聖油')).toBeInTheDocument();
    expect(screen.getAllByText('棕黃聖油').length).toBeGreaterThan(0);
  });

  it('should switch to anointment tab and search notable', () => {
    render(<BlightOilCard />);
    const anointTabBtn = screen.getByText('天賦塗油反查');
    fireEvent.click(anointTabBtn);

    expect(screen.getByPlaceholderText(/輸入關鍵天賦名稱/i)).toBeInTheDocument();
    expect(screen.getByText(/滅亡低語/i)).toBeInTheDocument();

    const searchInput = screen.getByPlaceholderText(/輸入關鍵天賦名稱/i);
    fireEvent.change(searchInput, { target: { value: '主權' } });
    expect(screen.getByText(/主權/i)).toBeInTheDocument();
    expect(screen.queryByText(/滅亡低語/i)).not.toBeInTheDocument();
  });

  it('should switch to map EV tab, add oils, and update EV', () => {
    render(<BlightOilCard />);
    const mapTabBtn = screen.getByText('真菌地圖塗油 EV');
    fireEvent.click(mapTabBtn);

    expect(screen.getByText(/凋落圖 \(3聖油\)/i)).toBeInTheDocument();
    expect(screen.getByText(/油料成本:/i)).toBeInTheDocument();

    const switchBtn = screen.getByText(/凋落蔓延圖 \(9聖油\)/i);
    fireEvent.click(switchBtn);
    expect(screen.getByText(/已選 \(3\/9\):/i)).toBeInTheDocument();

    const addCrimsonBtn = screen.getByText('+緋紅聖油');
    fireEvent.click(addCrimsonBtn);
    expect(screen.getByText(/已選 \(4\/9\):/i)).toBeInTheDocument();
  });
});
