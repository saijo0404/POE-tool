let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
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
 * Plays a pleasant, two-tone crystal chime when an incoming trade whisper is received.
 * Completely self-contained without external assets.
 */
export function playTradeWhisperSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.18, now);
    masterGain.connect(ctx.destination);

    // Chime Note 1: E5 (659.25 Hz)
    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);

    const gain1 = ctx.createGain();
    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain1);
    gain1.connect(masterGain);
    osc1.start(now);
    osc1.stop(now + 0.22);

    // Chime Note 2: B5 (987.77 Hz)
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.1);

    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0.3, now + 0.1);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    osc2.connect(gain2);
    gain2.connect(masterGain);
    osc2.start(now + 0.1);
    osc2.stop(now + 0.38);
  } catch (err) {
    console.warn('[WhisperSound] Failed to play whisper sound:', err);
  }
}
