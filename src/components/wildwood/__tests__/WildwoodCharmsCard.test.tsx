import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { WildwoodCharmsCard } from '../WildwoodCharmsCard';

describe('WildwoodCharmsCard', () => {
  it('renders title and initial primalist charms', () => {
    render(<WildwoodCharmsCard />);
    expect(screen.getByText(/荒野野靈昇華與符咒精算/)).toBeInTheDocument();
    expect(screen.getByText(/符咒插槽配置/)).toBeInTheDocument();
    expect(screen.getByText('插槽 1')).toBeInTheDocument();
  });

  it('switches ascendancy to Warden and displays Warden major nodes', () => {
    render(<WildwoodCharmsCard />);
    const wardenTab = screen.getByRole('button', { name: /典獄長/ });
    fireEvent.click(wardenTab);

    expect(screen.getByText(/樹皮防護 \(Barkskin\)/)).toBeInTheDocument();
    expect(screen.getByText(/瑪濟誓約 \(Oath of the Maji\)/)).toBeInTheDocument();
    expect(screen.queryByText(/符咒插槽配置/)).not.toBeInTheDocument();
  });

  it('toggles major node and updates special flags', () => {
    render(<WildwoodCharmsCard />);
    const wardenTab = screen.getByRole('button', { name: /典獄長/ });
    fireEvent.click(wardenTab);

    const barkskinNode = screen.getByText(/樹皮防護 \(Barkskin\)/);
    fireEvent.click(barkskinNode);

    expect(screen.getByText(/樹皮防護生效 \(Barkskin Active\)/)).toBeInTheDocument();
  });

  it('updates charm roll in Primalist mode', () => {
    render(<WildwoodCharmsCard />);
    const rollInput = screen.getByLabelText('插槽 1 詞綴數值');
    fireEvent.change(rollInput, { target: { value: '14' } });

    expect(screen.getByText(/allResist: \+14/)).toBeInTheDocument();
  });
});
