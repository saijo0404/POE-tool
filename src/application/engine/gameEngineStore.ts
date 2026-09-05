import type { GameEngine, EngineMode } from '../../domain/engine/types';
import type { EngineDetectionEvent } from '../ports/IWindowProcessDetector';

export interface GameEngineState {
  readonly currentEngine: GameEngine;
  readonly mode: EngineMode;
  readonly detectedEngine: GameEngine | null;
  readonly detectedProcess: string | null;
  readonly detectedTitle: string | null;
  readonly isAutoDetecting: boolean;
}

const DEFAULT_STATE: GameEngineState = {
  currentEngine: 'poe1',
  mode: 'auto',
  detectedEngine: null,
  detectedProcess: null,
  detectedTitle: null,
  isAutoDetecting: false
};

export class GameEngineStore {
  private state: GameEngineState;
  private readonly listeners = new Set<(state: GameEngineState) => void>();

  constructor(initialState?: Partial<GameEngineState>) {
    this.state = { ...DEFAULT_STATE, ...initialState };
  }

  getState(): GameEngineState {
    return this.state;
  }

  setEngine(engine: GameEngine): void {
    if (this.state.currentEngine === engine) return;
    this.updateState({ currentEngine: engine });
  }

  setMode(mode: EngineMode): void {
    if (this.state.mode === mode) return;
    this.updateState({ mode });
  }

  setAutoDetecting(isAutoDetecting: boolean): void {
    if (this.state.isAutoDetecting === isAutoDetecting) return;
    this.updateState({ isAutoDetecting });
  }

  syncDetectedEngine(event: EngineDetectionEvent): void {
    const { engine, processName = null, title = null } = event;
    const shouldSwitchEngine = this.state.mode === 'auto' && engine !== null;

    const nextEngine = shouldSwitchEngine ? engine : this.state.currentEngine;
    const nextDetectedEngine = engine ?? null;
    const nextProcess = engine ? (processName ?? null) : null;
    const nextTitle = engine ? (title ?? null) : null;

    if (
      this.state.currentEngine === nextEngine &&
      this.state.detectedEngine === nextDetectedEngine &&
      this.state.detectedProcess === nextProcess &&
      this.state.detectedTitle === nextTitle
    ) {
      return;
    }

    this.updateState({
      currentEngine: nextEngine,
      detectedEngine: nextDetectedEngine,
      detectedProcess: nextProcess,
      detectedTitle: nextTitle
    });
  }

  subscribe(listener: (state: GameEngineState) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  reset(): void {
    this.updateState(DEFAULT_STATE);
  }

  private updateState(partial: Partial<GameEngineState>): void {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }
}

export const defaultGameEngineStore = new GameEngineStore();
