import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MapRollingSimulatorCard } from '../MapRollingSimulatorCard';

describe('MapRollingSimulatorCard', () => {
  it('renders title, inputs, and three rolling strategies', () => {
    render(<MapRollingSimulatorCard initialForbiddenCount={3} />);

    expect(screen.getByText('地圖洗詞期望成本精算 (Map Rolling Simulator)')).toBeInTheDocument();
    expect(screen.getByText('重鑄 + 點金')).toBeInTheDocument();
    expect(screen.getByText('混沌直骰')).toBeInTheDocument();
    expect(screen.getByText('點金 + 瓦爾寶珠')).toBeInTheDocument();
    expect(screen.getByText('最佳推薦')).toBeInTheDocument();
  });

  it('updates batch size and recalulates total cost', () => {
    render(<MapRollingSimulatorCard initialForbiddenCount={2} />);

    const btn50 = screen.getByText('50');
    fireEvent.click(btn50);

    expect(screen.getAllByText(/50 張總期望:/).length).toBeGreaterThan(0);
  });

  it('allows changing forbidden count and minimum quantity', () => {
    const { container } = render(<MapRollingSimulatorCard initialForbiddenCount={2} />);

    const forbiddenInput = container.querySelector('#sim-forbidden-count') as HTMLInputElement;
    expect(forbiddenInput).toBeInTheDocument();
    fireEvent.change(forbiddenInput, { target: { value: '5' } });
    expect(forbiddenInput.value).toBe('5');

    const quantInput = container.querySelector('#sim-min-quant') as HTMLInputElement;
    expect(quantInput).toBeInTheDocument();
    fireEvent.change(quantInput, { target: { value: '85' } });
    expect(quantInput.value).toBe('85');
  });

  it('switches active strategy on card click', () => {
    render(<MapRollingSimulatorCard />);

    const chaosCard = screen.getByText('混沌直骰');
    fireEvent.click(chaosCard);

    expect(screen.getByText(/選中方案【混沌直骰】/)).toBeInTheDocument();
  });
});
