let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) return null;

  if (!audioCtx || audioCtx.state === 'closed') {
    try {
      audioCtx = new AudioContextClass();
    } catch {
      return null;
    }
  }

  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }

  return audioCtx;
}

/**
 * Plays an ascending three-tone chime for high-value asset price alerts.
 * Self-contained without external audio files.
 */
export function playPriceAlertSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, now);
    masterGain.connect(ctx.destination);

    // Three rising tones: 523.25Hz (C5), 659.25Hz (E5), 783.99Hz (G5)
    const tones = [
      { freq: 523.25, time: now, dur: 0.12 },
      { freq: 659.25, time: now + 0.10, dur: 0.12 },
      { freq: 783.99, time: now + 0.20, dur: 0.22 }
    ];

    tones.forEach(t => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(t.freq, t.time);

      gain.gain.setValueAtTime(0.3, t.time);
      gain.gain.exponentialRampToValueAtTime(0.001, t.time + t.dur);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(t.time);
      osc.stop(t.time + t.dur);
    });
  } catch (err) {
    console.warn('[PriceAlertAudio] Failed to play price alert sound:', err);
  }
}
