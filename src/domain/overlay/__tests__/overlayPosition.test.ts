import { describe, it, expect } from 'vitest';
import { calculateOverlayPosition } from '../overlayPosition';

describe('calculateOverlayPosition', () => {
  const screenSize = { width: 1920, height: 1080 };
  const windowSize = { width: 480, height: 600 };

  it('positions overlay to the bottom-right of cursor when there is ample screen space', () => {
    const cursor = { x: 500, y: 300 };
    const pos = calculateOverlayPosition({
      cursor,
      windowSize,
      screenSize,
      offset: { x: 15, y: 15 }
    });

    expect(pos.x).toBe(515);
    expect(pos.y).toBe(315);
  });

  it('flips overlay to the left when cursor is near the right edge of screen', () => {
    const cursor = { x: 1800, y: 300 };
    const pos = calculateOverlayPosition({
      cursor,
      windowSize,
      screenSize,
      offset: { x: 15, y: 15 }
    });

    // 1800 + 15 + 480 = 2295 > 1920 -> flips to 1800 - 15 - 480 = 1305
    expect(pos.x).toBe(1305);
    expect(pos.y).toBe(315);
  });

  it('flips overlay upwards when cursor is near the bottom edge of screen', () => {
    const cursor = { x: 500, y: 900 };
    const pos = calculateOverlayPosition({
      cursor,
      windowSize,
      screenSize,
      offset: { x: 15, y: 15 }
    });

    // 900 + 15 + 600 = 1515 > 1080 -> flips to 900 - 15 - 600 = 285
    expect(pos.x).toBe(515);
    expect(pos.y).toBe(285);
  });

  it('clamps coordinates strictly within screen bounds even on extreme corners', () => {
    const cursor = { x: 1919, y: 1079 };
    const pos = calculateOverlayPosition({
      cursor,
      windowSize,
      screenSize,
      offset: { x: 15, y: 15 }
    });

    expect(pos.x).toBeLessThanOrEqual(screenSize.width - windowSize.width);
    expect(pos.y).toBeLessThanOrEqual(screenSize.height - windowSize.height);
    expect(pos.x).toBeGreaterThanOrEqual(0);
    expect(pos.y).toBeGreaterThanOrEqual(0);
  });

  it('handles small screen or window size larger than screen gracefully', () => {
    const smallScreen = { width: 400, height: 500 };
    const pos = calculateOverlayPosition({
      cursor: { x: 100, y: 100 },
      windowSize: { width: 500, height: 700 },
      screenSize: smallScreen
    });

    expect(pos.x).toBe(0);
    expect(pos.y).toBe(0);
  });
});
