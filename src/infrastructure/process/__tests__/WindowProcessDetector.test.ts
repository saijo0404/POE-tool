import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { WindowProcessDetector } from '../WindowProcessDetector';

describe('WindowProcessDetector', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('detects running engine from window info provider', async () => {
    const provider = vi.fn().mockResolvedValue({
      title: 'Path of Exile 2',
      processName: 'PathOfExile2.exe'
    });

    const detector = new WindowProcessDetector(provider);
    const engine = await detector.detectRunningEngine();
    expect(engine).toBe('poe2');
  });

  it('returns null when window is not a PoE game', async () => {
    const provider = vi.fn().mockResolvedValue({
      title: 'Notepad',
      processName: 'notepad.exe'
    });

    const detector = new WindowProcessDetector(provider);
    const engine = await detector.detectRunningEngine();
    expect(engine).toBeNull();
  });

  it('polls periodically and fires onDetected callback', async () => {
    let mockTitle = 'Path of Exile';
    let mockProcess = 'PathOfExile.exe';
    const provider = vi.fn().mockImplementation(async () => ({
      title: mockTitle,
      processName: mockProcess
    }));

    const detector = new WindowProcessDetector(provider);
    const callback = vi.fn();

    const stop = detector.startAutoDetection(1000, callback);

    // First poll immediate or after tick
    await vi.advanceTimersByTimeAsync(1000);
    expect(callback).toHaveBeenCalledWith({
      engine: 'poe1',
      processName: 'PathOfExile.exe',
      title: 'Path of Exile'
    });

    // Switch game
    mockTitle = 'Path of Exile 2';
    mockProcess = 'PathOfExile2.exe';

    await vi.advanceTimersByTimeAsync(1000);
    expect(callback).toHaveBeenCalledWith({
      engine: 'poe2',
      processName: 'PathOfExile2.exe',
      title: 'Path of Exile 2'
    });

    // Cleanup stops polling
    stop();
    mockTitle = 'Path of Exile';
    mockProcess = 'PathOfExile.exe';
    await vi.advanceTimersByTimeAsync(2000);
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
