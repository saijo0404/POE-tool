import { useContext } from 'react';
import { GameEngineContext, type GameEngineContextType } from '../context/GameEngineContextDef';
import { ENGINE_METADATA } from '../domain/engine/types';
import { defaultStorage } from '../infrastructure/storage/LocalStorageAdapter';

const fallbackEngineContext: GameEngineContextType = {
  currentEngine: 'poe1',
  mode: 'auto',
  metadata: ENGINE_METADATA.poe1,
  features: ENGINE_METADATA.poe1.features,
  detectedEngine: null,
  detectedProcess: null,
  detectedTitle: null,
  isAutoDetecting: false,
  setEngine: () => {},
  setMode: () => {},
  namespacedStorage: defaultStorage
};

export function useGameEngine(): GameEngineContextType {
  const ctx = useContext(GameEngineContext);
  return ctx ?? fallbackEngineContext;
}
