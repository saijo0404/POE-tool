import type { StashPosition, StashCellPercentage } from './types';

export function clampStashCoordinate(val: number, max = 12): number {
  if (val < 1) return 1;
  if (val > max) return max;
  return val;
}

export function isQuadTabByCoordinates(pos?: StashPosition): boolean {
  if (!pos) return false;
  return pos.left > 12 || pos.top > 12;
}

export function calculateStashCellPercentage(
  pos: StashPosition,
  gridSize = 12
): StashCellPercentage {
  const size = gridSize === 24 ? 24 : 12;
  const leftClamped = clampStashCoordinate(pos.left, size);
  const topClamped = clampStashCoordinate(pos.top, size);

  const widthPercent = 100 / size;
  const heightPercent = 100 / size;
  const leftPercent = (leftClamped - 1) * widthPercent;
  const topPercent = (topClamped - 1) * heightPercent;

  return {
    leftPercent,
    topPercent,
    widthPercent,
    heightPercent
  };
}
