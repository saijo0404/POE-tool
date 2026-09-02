import { describe, it, expect, vi } from 'vitest';
import { playDangerAlertSound } from '../alertSound';

describe('Alert Sound Synthesizer', () => {
  it('should run playDangerAlertSound without throwing in mock environment', () => {
    expect(() => playDangerAlertSound()).not.toThrow();
  });

  it('should call AudioContext methods when available', () => {
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

    const mockFilter = {
      type: 'lowpass',
      frequency: {
        setValueAtTime: mockSetValueAtTime
      },
      connect: mockConnect
    };

    const mockContext = {
      state: 'running',
      currentTime: 100,
      destination: {},
      createGain: vi.fn(() => mockGain),
      createOscillator: vi.fn(() => mockOscillator),
      createBiquadFilter: vi.fn(() => mockFilter),
      resume: vi.fn().mockResolvedValue(undefined)
    };

    const originalAudioContext = window.AudioContext;
    (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn(() => mockContext);

    try {
      playDangerAlertSound();
      expect(mockStart).toHaveBeenCalled();
      expect(mockStop).toHaveBeenCalled();
    } finally {
      (window as unknown as { AudioContext: unknown }).AudioContext = originalAudioContext;
    }
  });
});
