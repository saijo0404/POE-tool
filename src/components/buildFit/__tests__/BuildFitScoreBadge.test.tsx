import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BuildFitScoreBadge } from '../BuildFitScoreBadge';
import { DEFAULT_BUILD_PRESETS } from '../../../domain/buildFit/buildPresets';
import type { BuildFitEvaluation } from '../../../domain/buildFit/types';

describe('BuildFitScoreBadge', () => {
  const mockEvaluation: BuildFitEvaluation = {
    presetId: 'life_fire_rf',
    presetName: '正火純火生命流',
    totalScore: 260,
    rank: 'S',
    matches: [
      { modText: '+95 to maximum Life', ruleId: 'rf_life', ruleName: '最大生命', extractedValue: 95, score: 95 },
      { modText: '+42% to Fire Resistance', ruleId: 'rf_fire_res', ruleName: '火焰抗性', extractedValue: 42, score: 34 }
    ],
    primaryHighlights: ['最大生命 (+95)', '火焰抗性 (+42)'],
    advice: '💎 極品契合！完美符合 正火純火生命流 核心需求。'
  };

  it('renders rank and total score correctly', () => {
    const onSelect = vi.fn();
    render(
      <BuildFitScoreBadge
        evaluation={mockEvaluation}
        presets={DEFAULT_BUILD_PRESETS}
        selectedPresetId="life_fire_rf"
        onSelectPreset={onSelect}
      />
    );

    expect(screen.getByText(/S 級/i)).toBeDefined();
    expect(screen.getByText(/260 分/i)).toBeDefined();
    expect(screen.getByText(/極品契合/i)).toBeDefined();
    expect(screen.getByText(/最大生命 \(\+95\)/i)).toBeDefined();
  });

  it('triggers onSelectPreset when selector changes', () => {
    const onSelect = vi.fn();
    render(
      <BuildFitScoreBadge
        evaluation={mockEvaluation}
        presets={DEFAULT_BUILD_PRESETS}
        selectedPresetId="life_fire_rf"
        onSelectPreset={onSelect}
      />
    );

    const select = screen.getByRole('combobox', { name: /選擇流派預設/i });
    fireEvent.change(select, { target: { value: 'ele_bow_crit' } });
    expect(onSelect).toHaveBeenCalledWith('ele_bow_crit');
  });

  it('toggles detail list on button click', () => {
    const onSelect = vi.fn();
    render(
      <BuildFitScoreBadge
        evaluation={mockEvaluation}
        presets={DEFAULT_BUILD_PRESETS}
        selectedPresetId="life_fire_rf"
        onSelectPreset={onSelect}
      />
    );

    const toggleBtn = screen.getByRole('button', { name: /明細/i });
    expect(screen.queryByText(/契合詞綴得分列表/i)).toBeNull();

    fireEvent.click(toggleBtn);
    expect(screen.getByText(/契合詞綴得分列表/i)).toBeDefined();
    expect(screen.getByText(/\+95 to maximum Life/i)).toBeDefined();
  });

  it('returns null when evaluation is null', () => {
    const { container } = render(
      <BuildFitScoreBadge
        evaluation={null}
        presets={DEFAULT_BUILD_PRESETS}
        selectedPresetId="life_fire_rf"
        onSelectPreset={vi.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });
});
