import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { GameEngine, EngineMode } from '../domain/engine/types';
import { ENGINE_METADATA } from '../domain/engine/types';
import { GameEngineStore, defaultGameEngineStore } from '../application/engine/gameEngineStore';
import type { IStoragePort } from '../application/ports/IStoragePort';
import { defaultStorage } from '../infrastructure/storage/LocalStorageAdapter';
import { StorageNamespaceAdapter } from '../infrastructure/storage/StorageNamespaceAdapter';
import { defaultWindowProcessDetector } from '../infrastructure/process/WindowProcessDetector';
import type { IWindowProcessDetector } from '../application/ports/IWindowProcessDetector';
import { GameEngineContext, type GameEngineContextType } from './GameEngineContextDef';

export interface GameEngineProviderProps {
  readonly children: React.ReactNode;
  readonly store?: GameEngineStore;
  readonly detector?: IWindowProcessDetector;
  readonly baseStorage?: IStoragePort;
  readonly autoDetectionIntervalMs?: number;
}

export const GameEngineProvider: React.FC<GameEngineProviderProps> = ({
  children,
  store = defaultGameEngineStore,
  detector = defaultWindowProcessDetector,
  baseStorage = defaultStorage,
  autoDetectionIntervalMs = 2000
}) => {
  const [state, setState] = useState(() => store.getState());

  useEffect(() => {
    return store.subscribe(newState => {
      setState(newState);
    });
  }, [store]);

  useEffect(() => {
    store.setAutoDetecting(true);
    const stop = detector.startAutoDetection(autoDetectionIntervalMs, event => {
      store.syncDetectedEngine(event);
    });

    return () => {
      stop();
      store.setAutoDetecting(false);
    };
  }, [detector, store, autoDetectionIntervalMs]);

  const setEngine = useCallback(
    (engine: GameEngine) => {
      store.setEngine(engine);
    },
    [store]
  );

  const setMode = useCallback(
    (mode: EngineMode) => {
      store.setMode(mode);
    },
    [store]
  );

  const namespacedStorage = useMemo<IStoragePort>(() => {
    return new StorageNamespaceAdapter(baseStorage, () => state.currentEngine, {
      sharedKeys: ['active_theme', 'client_log_path', 'app_hotkeys', 'window_pinned'],
      enableLegacyFallback: true
    });
  }, [baseStorage, state.currentEngine]);

  const metadata = useMemo(() => ENGINE_METADATA[state.currentEngine], [state.currentEngine]);
  const features = metadata.features;

  const value = useMemo<GameEngineContextType>(
    () => ({
      currentEngine: state.currentEngine,
      mode: state.mode,
      metadata,
      features,
      detectedEngine: state.detectedEngine,
      detectedProcess: state.detectedProcess,
      detectedTitle: state.detectedTitle,
      isAutoDetecting: state.isAutoDetecting,
      setEngine,
      setMode,
      namespacedStorage
    }),
    [state, metadata, features, setEngine, setMode, namespacedStorage]
  );

  return <GameEngineContext.Provider value={value}>{children}</GameEngineContext.Provider>;
};
