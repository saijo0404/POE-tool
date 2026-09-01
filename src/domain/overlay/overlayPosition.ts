import type { OverlayPositionOptions, Point } from './types';

/**
 * Calculates smart overlay window coordinates relative to mouse cursor
 * preventing overflow beyond screen boundaries.
 */
export function calculateOverlayPosition({
  cursor,
  windowSize,
  screenSize,
  offset = { x: 15, y: 15 }
}: OverlayPositionOptions): Point {
  const maxAllowedX = Math.max(0, screenSize.width - windowSize.width);
  const maxAllowedY = Math.max(0, screenSize.height - windowSize.height);

  let targetX = cursor.x + offset.x;
  if (targetX + windowSize.width > screenSize.width) {
    targetX = cursor.x - offset.x - windowSize.width;
  }

  let targetY = cursor.y + offset.y;
  if (targetY + windowSize.height > screenSize.height) {
    targetY = cursor.y - offset.y - windowSize.height;
  }

  return {
    x: Math.max(0, Math.min(targetX, maxAllowedX)),
    y: Math.max(0, Math.min(targetY, maxAllowedY))
  };
}
