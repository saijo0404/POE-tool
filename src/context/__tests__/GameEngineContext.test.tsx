import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { GameEngineProvider } from '../GameEngineContext';
import { useGameEngine } from '../../hooks/useGameEngine';

describe('GameEngineContext', () => {
  it('provides default game engine context values', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GameEngineProvider>{children}</GameEngineProvider>
    );

    const { result } = renderHook(() => useGameEngine(), { wrapper });

    expect(result.current.currentEngine).toBe('poe1');
    expect(result.current.mode).toBe('auto');
    expect(result.current.metadata.shortName).toBe('PoE 1');
    expect(result.current.features.spirit).toBe(false);
  });

  it('allows switching game engine and updates features accordingly', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GameEngineProvider>{children}</GameEngineProvider>
    );

    const { result } = renderHook(() => useGameEngine(), { wrapper });

    act(() => {
      result.current.setEngine('poe2');
    });

    expect(result.current.currentEngine).toBe('poe2');
    expect(result.current.metadata.shortName).toBe('PoE 2');
    expect(result.current.features.spirit).toBe(true);
    expect(result.current.features.goldEconomy).toBe(true);
  });

  it('allows switching mode between auto and manual', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <GameEngineProvider>{children}</GameEngineProvider>
    );

    const { result } = renderHook(() => useGameEngine(), { wrapper });

    act(() => {
      result.current.setMode('manual');
    });

    expect(result.current.mode).toBe('manual');
  });
});
