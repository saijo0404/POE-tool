import { describe, it, expect, vi } from 'vitest';
import { playPriceAlertSound } from '../priceAlertSound';

describe('Price Alert Sound Synthesizer', () => {
  it('should run playPriceAlertSound without throwing in mock environment', () => {
    expect(() => playPriceAlertSound()).not.toThrow();
  });

  it('should call AudioContext oscillator start and stop when AudioContext is present', () => {
    const mockStart = vi.fn();
    const mockStop = vi.fn();
    const mockConnect = vi.fn();
    const mockSetValueAtTime = vi.fn();
    const mockExponentialRampToValueAtTime = vi.fn();

    const mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: mockSetValueAtTime,
        exponentialRampToValueAtTime: mockExponentialRampToValueAtTime
      },
      connect: mockConnect,
      start: mockStart,
      stop: mockStop
    };

    const mockGain = {
      gain: {
        setValueAtTime: mockSetValueAtTime,
        exponentialRampToValueAtTime: mockExponentialRampToValueAtTime
      },
      connect: mockConnect
    };

    const mockContext = {
      state: 'running',
      currentTime: 10,
      destination: {},
      createGain: vi.fn(() => mockGain),
      createOscillator: vi.fn(() => mockOscillator),
      resume: vi.fn().mockResolvedValue(undefined)
    };

    const originalAudioContext = window.AudioContext;
    (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn(() => mockContext);

    try {
      playPriceAlertSound();
      expect(mockStart).toHaveBeenCalled();
      expect(mockStop).toHaveBeenCalled();
    } finally {
      (window as unknown as { AudioContext: unknown }).AudioContext = originalAudioContext;
    }
  });
});
