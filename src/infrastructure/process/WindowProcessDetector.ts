import type {
  IWindowProcessDetector,
  SystemWindowInfo,
  EngineDetectionEvent
} from '../../application/ports/IWindowProcessDetector';
import type { GameEngine } from '../../domain/engine/types';
import { detectEngineFromSystem } from '../../domain/engine/engineDetector';

type WindowInfoProvider = () => Promise<SystemWindowInfo | null>;

interface TauriWindowInfoResponse {
  readonly title?: string | null;
  readonly process_name?: string | null;
}

async function defaultTauriWindowProvider(): Promise<SystemWindowInfo | null> {
  try {
    if (typeof window === 'undefined') return null;
    const tauri = (window as unknown as { __TAURI_INTERNALS__?: unknown });
    if (!tauri.__TAURI_INTERNALS__) return null;

    const { invoke } = await import('@tauri-apps/api/core');
    const resp = await invoke<TauriWindowInfoResponse>('get_foreground_window_info');
    return {
      title: resp.title ?? null,
      processName: resp.process_name ?? null
    };
  } catch {
    return null;
  }
}

export class WindowProcessDetector implements IWindowProcessDetector {
  private readonly provider: WindowInfoProvider;

  constructor(provider?: WindowInfoProvider) {
    this.provider = provider ?? defaultTauriWindowProvider;
  }

  async getForegroundWindow(): Promise<SystemWindowInfo | null> {
    try {
      return await this.provider();
    } catch {
      return null;
    }
  }

  async detectRunningEngine(): Promise<GameEngine | null> {
    const info = await this.getForegroundWindow();
    if (!info) return null;
    return detectEngineFromSystem(info);
  }

  startAutoDetection(
    intervalMs: number,
    onDetected: (event: EngineDetectionEvent) => void
  ): () => void {
    let isCancelled = false;

    const tick = async () => {
      if (isCancelled) return;
      const info = await this.getForegroundWindow();
      if (isCancelled) return;

      const engine = info ? detectEngineFromSystem(info) : null;
      onDetected({
        engine,
        processName: info?.processName,
        title: info?.title
      });
    };

    const timerId = setInterval(tick, Math.max(intervalMs, 200));

    return () => {
      isCancelled = true;
      clearInterval(timerId);
    };
  }
}

export const defaultWindowProcessDetector = new WindowProcessDetector();
