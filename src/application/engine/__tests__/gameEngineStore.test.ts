import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GameEngineStore } from '../gameEngineStore';

describe('GameEngineStore', () => {
  let store: GameEngineStore;

  beforeEach(() => {
    store = new GameEngineStore();
  });

  it('initializes with default poe1 and auto mode', () => {
    const state = store.getState();
    expect(state.currentEngine).toBe('poe1');
    expect(state.mode).toBe('auto');
    expect(state.detectedEngine).toBeNull();
    expect(state.detectedProcess).toBeNull();
    expect(state.detectedTitle).toBeNull();
  });

  it('allows manually switching the current engine', () => {
    store.setEngine('poe2');
    expect(store.getState().currentEngine).toBe('poe2');

    store.setEngine('poe1');
    expect(store.getState().currentEngine).toBe('poe1');
  });

  it('allows switching modes between auto and manual', () => {
    store.setMode('manual');
    expect(store.getState().mode).toBe('manual');

    store.setMode('auto');
    expect(store.getState().mode).toBe('auto');
  });

  describe('syncDetectedEngine', () => {
    it('automatically switches currentEngine in auto mode when new engine is detected', () => {
      store.syncDetectedEngine({
        engine: 'poe2',
        processName: 'PathOfExile2.exe',
        title: 'Path of Exile 2'
      });

      const state = store.getState();
      expect(state.currentEngine).toBe('poe2');
      expect(state.detectedEngine).toBe('poe2');
      expect(state.detectedProcess).toBe('PathOfExile2.exe');
      expect(state.detectedTitle).toBe('Path of Exile 2');
    });

    it('does NOT override currentEngine in manual mode, but updates detection info', () => {
      store.setMode('manual');
      store.setEngine('poe1');

      store.syncDetectedEngine({
        engine: 'poe2',
        processName: 'PathOfExile2.exe',
        title: 'Path of Exile 2'
      });

      const state = store.getState();
      expect(state.currentEngine).toBe('poe1'); // Unchanged because of manual lock
      expect(state.detectedEngine).toBe('poe2');
      expect(state.detectedProcess).toBe('PathOfExile2.exe');
    });

    it('clears detection info when no engine is currently detected', () => {
      store.syncDetectedEngine({ engine: 'poe2', processName: 'PathOfExile2.exe' });
      expect(store.getState().detectedEngine).toBe('poe2');

      store.syncDetectedEngine({ engine: null });
      expect(store.getState().detectedEngine).toBeNull();
      expect(store.getState().detectedProcess).toBeNull();
      // currentEngine remains at last valid state
      expect(store.getState().currentEngine).toBe('poe2');
    });
  });

  describe('subscription', () => {
    it('notifies subscribers on state change', () => {
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);

      store.setEngine('poe2');
      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(expect.objectContaining({ currentEngine: 'poe2' }));

      unsubscribe();
      store.setEngine('poe1');
      expect(listener).toHaveBeenCalledTimes(1); // No additional call after unsubscribe
    });
  });

  it('resets to initial state properly', () => {
    store.setEngine('poe2');
    store.setMode('manual');
    store.reset();

    const state = store.getState();
    expect(state.currentEngine).toBe('poe1');
    expect(state.mode).toBe('auto');
  });
});
