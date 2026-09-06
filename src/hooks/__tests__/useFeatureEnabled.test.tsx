import type React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFeatureEnabled } from '../useFeatureEnabled';
import { GameEngineContext, type GameEngineContextType } from '../../context/GameEngineContextDef';
import { ENGINE_METADATA } from '../../domain/engine/types';

function createWrapper(engine: 'poe1' | 'poe2') {
  const contextValue: GameEngineContextType = {
    currentEngine: engine,
    mode: 'auto',
    metadata: ENGINE_METADATA[engine],
    features: ENGINE_METADATA[engine].features,
    detectedEngine: null,
    detectedProcess: null,
    detectedTitle: null,
    isAutoDetecting: false,
    setEngine: () => {},
    setMode: () => {},
    namespacedStorage: {
      getItem: <T,>(_key: string, defaultVal: T): T => defaultVal,
      setItem: () => {},
      removeItem: () => {}
    }
  };

  return ({ children }: { children: React.ReactNode }) => (
    <GameEngineContext.Provider value={contextValue}>
      {children}
    </GameEngineContext.Provider>
  );
}

describe('useFeatureEnabled hook', () => {
  it('identifies feature availability in poe1 context', () => {
    const { result } = renderHook(() => ({
      price: useFeatureEnabled('price'),
      atlas: useFeatureEnabled('atlas'),
      dualSpec: useFeatureEnabled('dualSpec')
    }), { wrapper: createWrapper('poe1') });

    expect(result.current.price).toBe(true);
    expect(result.current.atlas).toBe(true);
    expect(result.current.dualSpec).toBe(false);
  });

  it('identifies feature availability in poe2 context', () => {
    const { result } = renderHook(() => ({
      price: useFeatureEnabled('price'),
      atlas: useFeatureEnabled('atlas'),
      dualSpec: useFeatureEnabled('dualSpec')
    }), { wrapper: createWrapper('poe2') });

    expect(result.current.price).toBe(true);
    expect(result.current.atlas).toBe(false);
    expect(result.current.dualSpec).toBe(true);
  });
});
