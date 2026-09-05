import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BestiaryCraftCard } from '../BestiaryCraftCard';

describe('BestiaryCraftCard', () => {
  it('should render header, categories, and initial recipe', () => {
    render(<BestiaryCraftCard />);
    expect(screen.getByText(/魔物園獵捕效益與野獸工藝精算器/i)).toBeInTheDocument();
    expect(screen.getByText('全部配方')).toBeInTheDocument();
    expect(screen.getByText('拓印魔法物品')).toBeInTheDocument();
  });

  it('should switch tabs between Crafting and Mission EV', () => {
    render(<BestiaryCraftCard />);
    const missionTabBtn = screen.getByText('魔物園獵捕 EV');
    fireEvent.click(missionTabBtn);

    expect(screen.getByText(/地圖階級:/i)).toBeInTheDocument();
    expect(screen.getByText(/預估紅野獸:/i)).toBeInTheDocument();

    const craftTabBtn = screen.getByText('野獸工藝配方');
    fireEvent.click(craftTabBtn);
    expect(screen.getByText('全部配方')).toBeInTheDocument();
  });

  it('should trigger onCopyWhisper when click bulk buy button', () => {
    const handleCopy = vi.fn();
    render(<BestiaryCraftCard onCopyWhisper={handleCopy} />);

    const copyBtn = screen.getByRole('button', { name: /大宗收/i });
    fireEvent.click(copyBtn);

    expect(handleCopy).toHaveBeenCalledTimes(1);
    expect(handleCopy.mock.calls[0][0]).toContain('@seller Hi, I\'d like to buy your 5');
  });

  it('should switch mission tiers and update values in mission tab', () => {
    render(<BestiaryCraftCard />);
    fireEvent.click(screen.getByText('魔物園獵捕 EV'));

    const whiteTierBtn = screen.getByText('WHITE');
    fireEvent.click(whiteTierBtn);
    expect(screen.getByText(/1 隻/i)).toBeInTheDocument();
  });

  it('should filter recipes by category', () => {
    render(<BestiaryCraftCard />);
    const categoryBtn = screen.getByText('30%品質瓦爾');
    fireEvent.click(categoryBtn);

    expect(screen.getByText('腐化物品至 30% 品質')).toBeInTheDocument();
  });
});
