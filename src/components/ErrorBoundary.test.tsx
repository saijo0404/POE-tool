import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import { ErrorBoundary } from './ErrorBoundary';

const ThrowingComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test crash in component render');
  }
  return <div>Normal Content Displayed</div>;
};

const ControlledThrower = () => {
  const [shouldThrow, setShouldThrow] = useState(true);
  return (
    <div>
      <ThrowingComponent shouldThrow={shouldThrow} />
      <button onClick={() => setShouldThrow(false)}>Fix Error</button>
    </div>
  );
};

describe('ErrorBoundary Component', () => {
  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <div>Safe Child Content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Safe Child Content')).toBeInTheDocument();
  });

  it('catches render error and displays error UI with details', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ThrowingComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByText(/⚠️ 畫面發生錯誤/i)).toBeInTheDocument();
    expect(screen.getByText(/Test crash in component render/i)).toBeInTheDocument();
    expect(screen.getByText(/嘗試重新載入 \(Retry\)/i)).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });

  it('resets error state when Retry button is clicked', () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { rerender } = render(
      <ErrorBoundary>
        <ControlledThrower />
      </ErrorBoundary>
    );

    expect(screen.getByText(/⚠️ 畫面發生錯誤/i)).toBeInTheDocument();

    // Rerender with child that does not throw anymore
    rerender(
      <ErrorBoundary>
        <div>Recovered Safely</div>
      </ErrorBoundary>
    );

    const retryBtn = screen.getByText(/嘗試重新載入 \(Retry\)/i);
    fireEvent.click(retryBtn);

    expect(screen.getByText('Recovered Safely')).toBeInTheDocument();

    consoleErrorSpy.mockRestore();
  });
});
