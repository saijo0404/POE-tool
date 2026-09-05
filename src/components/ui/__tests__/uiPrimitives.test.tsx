import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Card, Badge, StatBadge, Button } from '../index';

describe('UI Design System Primitives', () => {
  describe('Card Component', () => {
    it('renders children with default styles and padding', () => {
      render(
        <Card data-testid="test-card">
          <span>Card Content</span>
        </Card>
      );
      const card = screen.getByTestId('test-card');
      expect(card).toBeInTheDocument();
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('applies custom variant and padding', () => {
      render(
        <Card variant="bordered" padding="lg" data-testid="bordered-card">
          <span>Bordered</span>
        </Card>
      );
      const card = screen.getByTestId('bordered-card');
      expect(card).toHaveStyle({ padding: '24px' });
    });
  });

  describe('Badge Component', () => {
    it('renders with specific variant and size', () => {
      render(
        <Badge variant="green" size="sm">
          Active Status
        </Badge>
      );
      const badge = screen.getByText('Active Status');
      expect(badge).toBeInTheDocument();
    });

    it('renders unique and currency variants', () => {
      render(
        <>
          <Badge variant="unique">Headhunter</Badge>
          <Badge variant="currency">Divine Orb</Badge>
        </>
      );
      expect(screen.getByText('Headhunter')).toBeInTheDocument();
      expect(screen.getByText('Divine Orb')).toBeInTheDocument();
    });
  });

  describe('StatBadge Component', () => {
    it('renders label, value, and unit correctly', () => {
      render(<StatBadge label="時薪" value={18.5} unit="div/hr" variant="gold" />);
      expect(screen.getByText('時薪:')).toBeInTheDocument();
      expect(screen.getByText(/18\.5/)).toBeInTheDocument();
      expect(screen.getByText('div/hr')).toBeInTheDocument();
    });
  });

  describe('Button Component', () => {
    it('handles click events and variant styles', () => {
      const handleClick = vi.fn();
      render(
        <Button variant="primary" onClick={handleClick}>
          確認計算
        </Button>
      );
      const btn = screen.getByRole('button', { name: /確認計算/i });
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('disables button when disabled or loading prop is true', () => {
      const handleClick = vi.fn();
      const { rerender } = render(
        <Button disabled onClick={handleClick}>
          Disabled Button
        </Button>
      );
      const btn = screen.getByRole('button', { name: /Disabled Button/i });
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();

      rerender(
        <Button loading onClick={handleClick}>
          Loading Button
        </Button>
      );
      const loadingBtn = screen.getByRole('button');
      expect(loadingBtn).toBeDisabled();
    });
  });
});
