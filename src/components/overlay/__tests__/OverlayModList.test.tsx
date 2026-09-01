import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OverlayModList } from '../OverlayModList';
import type { ParsedItemMod } from '../../../types/poe';

describe('OverlayModList Component', () => {
  const mockMods: ParsedItemMod[] = [
    {
      id: 'explicit.stat_1',
      text: '+54(50-54) 最大魔力',
      englishText: '+54(50-54) to Maximum Mana',
      type: 'explicit',
      tier: 1,
      value: 54,
      minValue: 50,
      maxValue: 54,
      enabled: true
    },
    {
      id: 'explicit.stat_2',
      text: '+30(30-35)% 閃電抗性',
      englishText: '+30(30-35)% to Lightning Resistance',
      type: 'explicit',
      tier: 4,
      value: 30,
      minValue: 30,
      maxValue: 35,
      enabled: false
    }
  ];

  it('renders affixes with tier and rating badge', () => {
    render(
      <OverlayModList
        mods={mockMods}
        onToggleMod={vi.fn()}
      />
    );

    expect(screen.getByText(/最大魔力/)).toBeInTheDocument();
    expect(screen.getByText('T1')).toBeInTheDocument();
    expect(screen.getByText('Max')).toBeInTheDocument();
    expect(screen.getByText('T4')).toBeInTheDocument();
  });

  it('toggles mod when checkbox is clicked', () => {
    const onToggle = vi.fn();
    render(
      <OverlayModList
        mods={mockMods}
        onToggleMod={onToggle}
      />
    );

    const checkboxes = screen.getAllByRole('checkbox');
    fireEvent.click(checkboxes[0]);
    expect(onToggle).toHaveBeenCalledWith(0);
  });
});
