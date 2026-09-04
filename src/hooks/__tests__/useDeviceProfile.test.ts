import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useDeviceProfile } from '../useDeviceProfile';
import type { IStoragePort } from '../../application/ports/IStoragePort';

class MockStorage implements IStoragePort {
  private store = new Map<string, unknown>();

  getItem<T>(key: string, defaultValue: T): T {
    const val = this.store.get(key);
    return val !== undefined ? (val as T) : defaultValue;
  }

  setItem<T>(key: string, value: T): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

describe('useDeviceProfile hook', () => {
  let storage: MockStorage;

  beforeEach(() => {
    storage = new MockStorage();
    document.documentElement.removeAttribute('data-high-contrast');
    document.documentElement.removeAttribute('data-compact-hud');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-high-contrast');
    document.documentElement.removeAttribute('data-compact-hud');
  });

  it('initializes with default desktop mode and reflects in DOM styles', () => {
    const { result } = renderHook(() => useDeviceProfile(storage));
    expect(result.current.mode).toBe('desktop');
    expect(result.current.isCustomized).toBe(false);
    expect(document.documentElement.style.getPropertyValue('--touch-target-min-size')).toBe('32px');
  });

  it('switches to steam-deck mode and updates DOM properties', () => {
    const { result } = renderHook(() => useDeviceProfile(storage));

    act(() => {
      result.current.setMode('steam-deck');
    });

    expect(result.current.mode).toBe('steam-deck');
    expect(result.current.isCustomized).toBe(true);
    expect(document.documentElement.style.getPropertyValue('--touch-target-min-size')).toBe('48px');
    expect(document.documentElement.getAttribute('data-high-contrast')).toBe('true');
  });

  it('switches to compact-hud mode and updates compact attribute', () => {
    const { result } = renderHook(() => useDeviceProfile(storage));

    act(() => {
      result.current.setMode('compact-hud');
    });

    expect(result.current.mode).toBe('compact-hud');
    expect(document.documentElement.getAttribute('data-compact-hud')).toBe('true');
  });
});
