import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActGemSwapCheckpoints } from '../ActGemSwapCheckpoints';

describe('ActGemSwapCheckpoints Component (Issue #94)', () => {
  it('renders milestones for witch class with gems, warnings and filters', () => {
    const handleToggle = vi.fn();
    const completedGems = new Set<string>(['witch-12-0']);

    render(
      <ActGemSwapCheckpoints
        selectedClass="witch"
        completedGemIds={completedGems}
        onToggleGem={handleToggle}
      />
    );

    expect(screen.getByText(/技能與裝備轉換里程碑檢查點/)).toBeInTheDocument();
    expect(screen.getByText(/女巫 Lv 12: 元素\/召喚一階爆發/)).toBeInTheDocument();
    expect(screen.getByText(/女巫 Lv 28: 核心烙印與褻瀆爆破/)).toBeInTheDocument();
    expect(screen.getByText(/女巫 Lv 38: 高階施法輔助串聯/)).toBeInTheDocument();

    // Filter by Lv 12
    const lv12Btn = screen.getByRole('button', { name: 'Lv 12' });
    fireEvent.click(lv12Btn);

    expect(screen.getByText(/女巫 Lv 12: 元素\/召喚一階爆發/)).toBeInTheDocument();
    expect(screen.queryByText(/女巫 Lv 28: 核心烙印與褻瀆爆破/)).not.toBeInTheDocument();

    // Filter back to all
    const allBtn = screen.getByRole('button', { name: '全部等級' });
    fireEvent.click(allBtn);
    expect(screen.getByText(/女巫 Lv 28: 核心烙印與褻瀆爆破/)).toBeInTheDocument();
  });

  it('renders attribute warnings for off-stat gems', () => {
    render(
      <ActGemSwapCheckpoints
        selectedClass="ranger"
      />
    );

    expect(screen.getByText(/遊俠 Lv 12: 毒雨\/閃電箭矢啟航/)).toBeInTheDocument();
    expect(screen.getByText(/門檻目標：火抗\/冰抗 ≥ 40%/)).toBeInTheDocument();
  });
});
