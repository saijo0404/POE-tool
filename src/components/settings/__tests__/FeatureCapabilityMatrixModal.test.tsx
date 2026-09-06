import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FeatureCapabilityMatrixModal } from '../FeatureCapabilityMatrixModal';

describe('FeatureCapabilityMatrixModal Component', () => {
  it('does not render when isOpen is false', () => {
    const { container } = render(
      <FeatureCapabilityMatrixModal isOpen={false} onClose={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders title and capability rows when isOpen is true', () => {
    render(<FeatureCapabilityMatrixModal isOpen onClose={vi.fn()} />);

    expect(
      screen.getByText(/PoE 1 vs PoE 2 功能支援與世代能力對照表/i)
    ).toBeInTheDocument();
    expect(screen.getByText('裝備即時查價')).toBeInTheDocument();
    expect(screen.getByText('輿圖天賦策略')).toBeInTheDocument();
    expect(screen.getByText('雙天賦與武器切換')).toBeInTheDocument();
  });

  it('filters table by category and engine type', () => {
    render(<FeatureCapabilityMatrixModal isOpen onClose={vi.fn()} />);

    // Filter by crafting
    fireEvent.click(screen.getByRole('button', { name: '裝備工藝' }));
    expect(screen.getByText('工藝期望精算')).toBeInTheDocument();
    expect(screen.queryByText('雙天賦與武器切換')).not.toBeInTheDocument();

    // Filter by PoE 2 exclusive
    fireEvent.click(screen.getByRole('button', { name: '全部機制' }));
    fireEvent.click(screen.getByRole('button', { name: 'PoE 2 專屬' }));
    expect(screen.getByText('雙天賦與武器切換')).toBeInTheDocument();
    expect(screen.queryByText('輿圖天賦策略')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<FeatureCapabilityMatrixModal isOpen onClose={onClose} />);

    fireEvent.click(screen.getByRole('button', { name: '' })); // Close X button
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
