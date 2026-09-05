import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { EngineSwitcher } from '../EngineSwitcher';
import { GameEngineContext, type GameEngineContextType } from '../../../context/GameEngineContextDef';
import { ENGINE_METADATA } from '../../../domain/engine/types';

function renderWithEngineContext(
  ui: React.ReactElement,
  contextOverrides?: Partial<GameEngineContextType>
) {
  const defaultContext: GameEngineContextType = {
    currentEngine: 'poe1',
    mode: 'auto',
    metadata: ENGINE_METADATA.poe1,
    features: ENGINE_METADATA.poe1.features,
    detectedEngine: null,
    detectedProcess: null,
    detectedTitle: null,
    isAutoDetecting: true,
    setEngine: vi.fn(),
    setMode: vi.fn(),
    namespacedStorage: {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn()
    },
    ...contextOverrides
  };

  return {
    ...render(
      <GameEngineContext.Provider value={defaultContext}>
        {ui}
      </GameEngineContext.Provider>
    ),
    context: defaultContext
  };
}

describe('EngineSwitcher', () => {
  it('renders current engine and mode correctly', () => {
    renderWithEngineContext(<EngineSwitcher />);
    expect(screen.getByText('PoE 1')).toBeInTheDocument();
    expect(screen.getByText('自動')).toBeInTheDocument();
  });

  it('calls setEngine when switching between PoE 1 and PoE 2', () => {
    const setEngine = vi.fn();
    const setMode = vi.fn();
    renderWithEngineContext(<EngineSwitcher />, {
      currentEngine: 'poe1',
      setEngine,
      setMode
    });

    const toggleBtn = screen.getByRole('button', { name: /切換至 poe 2/i });
    fireEvent.click(toggleBtn);

    expect(setEngine).toHaveBeenCalledWith('poe2');
    expect(setMode).toHaveBeenCalledWith('manual');
  });

  it('toggles mode when clicking mode badge', () => {
    const setMode = vi.fn();
    renderWithEngineContext(<EngineSwitcher />, {
      mode: 'auto',
      setMode
    });

    const modeBtn = screen.getByRole('button', { name: /切換偵測模式/i });
    fireEvent.click(modeBtn);

    expect(setMode).toHaveBeenCalledWith('manual');
  });

  it('displays detected process indicator in auto mode', () => {
    renderWithEngineContext(<EngineSwitcher />, {
      currentEngine: 'poe2',
      detectedEngine: 'poe2',
      detectedProcess: 'PathOfExile2.exe',
      mode: 'auto'
    });

    expect(screen.getByText('PoE 2')).toBeInTheDocument();
    expect(screen.getByTitle(/偵測到進程: PathOfExile2.exe/i)).toBeInTheDocument();
  });
});
