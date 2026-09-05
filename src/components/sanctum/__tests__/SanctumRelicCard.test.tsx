import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SanctumRelicCard } from '../SanctumRelicCard';

describe('SanctumRelicCard', () => {
  it('renders title, survival badge, and initial forecast metrics', () => {
    render(<SanctumRelicCard />);
    expect(screen.getByText(/禁忌聖所聖物詞綴與 4 層收益預估/)).toBeInTheDocument();
    expect(screen.getByText(/預期通關率/)).toBeInTheDocument();
    expect(screen.getByText(/預估淨利 \(Chaos\)/)).toBeInTheDocument();
    expect(screen.getByText(/預估淨利 \(Divine\)/)).toBeInTheDocument();
  });

  it('switches playstyle to safe_clear and adjusts recommendations', () => {
    render(<SanctumRelicCard />);
    const safeButton = screen.getByRole('button', { name: /穩健通關/ });
    fireEvent.click(safeButton);

    expect(screen.getByText(/優先路徑推薦:/)).toBeInTheDocument();
    expect(screen.getByText(/神龕泉水/)).toBeInTheDocument();
  });

  it('toggles an affix on and off', () => {
    render(<SanctumRelicCard />);
    expect(screen.getByText(/已啟用 3 個詞綴/)).toBeInTheDocument();

    const affixBtn = screen.getByRole('button', { name: /最大決心上限/ });
    fireEvent.click(affixBtn);
    expect(screen.getByText(/已啟用 4 個詞綴/)).toBeInTheDocument();

    fireEvent.click(affixBtn);
    expect(screen.getByText(/已啟用 3 個詞綴/)).toBeInTheDocument();
  });
});
