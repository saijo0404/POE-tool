import { describe, it, expect } from 'vitest';
import {
  calculateStashCellPercentage,
  isQuadTabByCoordinates,
  clampStashCoordinate
} from '../stashGrid';

describe('stashGrid (TDD)', () => {
  it('clamps coordinates within boundaries', () => {
    expect(clampStashCoordinate(0, 12)).toBe(1);
    expect(clampStashCoordinate(5, 12)).toBe(5);
    expect(clampStashCoordinate(15, 12)).toBe(12);
  });

  it('determines quad tab based on coordinate range (> 12)', () => {
    expect(isQuadTabByCoordinates({ left: 4, top: 8 })).toBe(false);
    expect(isQuadTabByCoordinates({ left: 14, top: 8 })).toBe(true);
    expect(isQuadTabByCoordinates({ left: 2, top: 16 })).toBe(true);
  });

  it('calculates grid percentage positions for 12x12 regular stash tab', () => {
    const pos = calculateStashCellPercentage({ left: 1, top: 1 }, 12);
    expect(pos.leftPercent).toBeCloseTo(0, 1);
    expect(pos.topPercent).toBeCloseTo(0, 1);
    expect(pos.widthPercent).toBeCloseTo(100 / 12, 1);
    expect(pos.heightPercent).toBeCloseTo(100 / 12, 1);

    const posMid = calculateStashCellPercentage({ left: 4, top: 8 }, 12);
    expect(posMid.leftPercent).toBeCloseTo((3 / 12) * 100, 1);
    expect(posMid.topPercent).toBeCloseTo((7 / 12) * 100, 1);
  });

  it('calculates grid percentage positions for 24x24 quad stash tab', () => {
    const posQuad = calculateStashCellPercentage({ left: 13, top: 13 }, 24);
    expect(posQuad.leftPercent).toBeCloseTo((12 / 24) * 100, 1);
    expect(posQuad.topPercent).toBeCloseTo((12 / 24) * 100, 1);
    expect(posQuad.widthPercent).toBeCloseTo(100 / 24, 1);
  });
});
