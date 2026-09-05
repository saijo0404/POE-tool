import { createContext } from 'react';
import type { GameEngine, EngineMode, GameEngineInfo, GameEngineFeatures } from '../domain/engine/types';
import type { IStoragePort } from '../application/ports/IStoragePort';

export interface GameEngineContextType {
  readonly currentEngine: GameEngine;
  readonly mode: EngineMode;
  readonly metadata: GameEngineInfo;
  readonly features: GameEngineFeatures;
  readonly detectedEngine: GameEngine | null;
  readonly detectedProcess: string | null;
  readonly detectedTitle: string | null;
  readonly isAutoDetecting: boolean;
  readonly setEngine: (engine: GameEngine) => void;
  readonly setMode: (mode: EngineMode) => void;
  readonly namespacedStorage: IStoragePort;
}

export const GameEngineContext = createContext<GameEngineContextType | null>(null);
