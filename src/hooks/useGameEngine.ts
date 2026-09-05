import { useContext } from 'react';
import { GameEngineContext, type GameEngineContextType } from '../context/GameEngineContextDef';

export function useGameEngine(): GameEngineContextType {
  const ctx = useContext(GameEngineContext);
  if (!ctx) {
    throw new Error('useGameEngine must be used within a GameEngineProvider');
  }
  return ctx;
}
