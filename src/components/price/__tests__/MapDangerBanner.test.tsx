import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MapDangerBanner } from '../MapDangerBanner';
import type { MapDangerEvaluation } from '../../../domain/mapMod/types';

describe('MapDangerBanner', () => {
  it('renders nothing when evaluation has no danger', () => {
    const evaluation: MapDangerEvaluation = {
      isMap: true,
      hasDanger: false,
      dangerScore: 0,
      totalModsCount: 0,
      matchedDangerMods: [],
      matchedCustomKeywords: []
    };
    const { container } = render(<MapDangerBanner evaluation={evaluation} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders danger warning when evaluation has danger mods', () => {
    const evaluation: MapDangerEvaluation = {
      isMap: true,
      hasDanger: true,
      dangerScore: 10,
      totalModsCount: 4,
      matchedDangerMods: [
        {
          def: {
            id: 'no_regen',
            nameZh: '無法回復生命',
            nameEn: 'Cannot Regenerate Life',
            category: 'recovery',
            severity: 'deadly',
            descriptionZh: '無法回復生命',
            descriptionEn: 'Cannot Regenerate Life',
            matchPatternsZh: ['無法回復生命'],
            matchPatternsEn: ['cannot regenerate life'],
            regexTokenZh: '!regen',
            regexTokenEn: '!regen'
          },
          matchedLine: '玩家無法回復生命、魔力或能量護盾',
          modType: 'explicit'
        }
      ],
      matchedCustomKeywords: []
    };
    render(<MapDangerBanner evaluation={evaluation} />);
    expect(screen.getByText(/致命地圖警報/)).toBeInTheDocument();
    expect(screen.getAllByText(/無法回復生命/).length).toBeGreaterThan(0);
  });
});
