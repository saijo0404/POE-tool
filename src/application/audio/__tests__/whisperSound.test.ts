import { describe, it, expect, vi } from 'vitest';
import { playTradeWhisperSound } from '../whisperSound';

describe('Whisper Sound Synthesizer', () => {
  it('should run playTradeWhisperSound without throwing in mock environment', () => {
    expect(() => playTradeWhisperSound()).not.toThrow();
  });

  it('should trigger AudioContext oscillator nodes when audio is available', () => {
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
      currentTime: 100,
      destination: {},
      createGain: vi.fn(() => mockGain),
      createOscillator: vi.fn(() => mockOscillator),
      resume: vi.fn().mockResolvedValue(undefined)
    };

    const originalAudioContext = window.AudioContext;
    (window as unknown as { AudioContext: unknown }).AudioContext = vi.fn(() => mockContext);

    try {
      playTradeWhisperSound();
      expect(mockStart).toHaveBeenCalled();
      expect(mockStop).toHaveBeenCalled();
    } finally {
      (window as unknown as { AudioContext: unknown }).AudioContext = originalAudioContext;
    }
  });
});
