import type { GameEngine } from '../../domain/engine/types';

export interface SystemWindowInfo {
  readonly title?: string | null;
  readonly processName?: string | null;
}

export interface EngineDetectionEvent {
  readonly engine: GameEngine | null;
  readonly processName?: string | null;
  readonly title?: string | null;
}

export interface IWindowProcessDetector {
  getForegroundWindow(): Promise<SystemWindowInfo | null>;
  detectRunningEngine(): Promise<GameEngine | null>;
  startAutoDetection(
    intervalMs: number,
    onDetected: (event: EngineDetectionEvent) => void
  ): () => void;
}
