import { describe, it, expect, beforeEach } from 'vitest';
import { StorageNamespaceAdapter } from '../StorageNamespaceAdapter';
import type { IStoragePort } from '../../../application/ports/IStoragePort';
import type { GameEngine } from '../../../domain/engine/types';

class MemoryStorage implements IStoragePort {
  private store = new Map<string, string>();

  getItem<T>(key: string, defaultVal: T): T {
    const raw = this.store.get(key);
    if (raw === undefined) return defaultVal;
    return JSON.parse(raw) as T;
  }

  setItem<T>(key: string, value: T): void {
    this.store.set(key, JSON.stringify(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  getRaw(key: string): string | undefined {
    return this.store.get(key);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }
}

describe('StorageNamespaceAdapter', () => {
  let memory: MemoryStorage;
  let currentEngine: GameEngine;
  let adapter: StorageNamespaceAdapter;

  beforeEach(() => {
    memory = new MemoryStorage();
    currentEngine = 'poe1';
    adapter = new StorageNamespaceAdapter(memory, () => currentEngine, {
      sharedKeys: ['active_theme', 'client_log_path'],
      enableLegacyFallback: true
    });
  });

  it('prefixes keys with current engine namespace', () => {
    currentEngine = 'poe1';
    adapter.setItem('price_cache', { divine: 150 });
    expect(memory.has('poe_tool:poe1:price_cache')).toBe(true);
    expect(adapter.getItem('price_cache', null)).toEqual({ divine: 150 });

    currentEngine = 'poe2';
    expect(adapter.getItem('price_cache', null)).toBeNull();

    adapter.setItem('price_cache', { exalted: 20 });
    expect(memory.has('poe_tool:poe2:price_cache')).toBe(true);
    expect(adapter.getItem('price_cache', null)).toEqual({ exalted: 20 });
  });

  it('falls back to legacy un-namespaced key in poe1 when namespaced key is absent', () => {
    // Legacy data exists in base storage without namespace
    memory.setItem('legacy_settings', { league: 'Settlers' });

    currentEngine = 'poe1';
    const loaded = adapter.getItem('legacy_settings', null);
    expect(loaded).toEqual({ league: 'Settlers' });
  });

  it('does NOT fallback to legacy data when in poe2', () => {
    memory.setItem('legacy_settings', { league: 'Settlers' });

    currentEngine = 'poe2';
    const loaded = adapter.getItem('legacy_settings', null);
    expect(loaded).toBeNull();
  });

  it('routes configured shared keys to poe_tool:shared namespace', () => {
    currentEngine = 'poe1';
    adapter.setItem('active_theme', 'dark');
    expect(memory.has('poe_tool:shared:active_theme')).toBe(true);

    currentEngine = 'poe2';
    expect(adapter.getItem('active_theme', 'light')).toBe('dark');
  });

  it('removes namespaced key on removeItem', () => {
    currentEngine = 'poe1';
    adapter.setItem('temp_data', 123);
    expect(memory.has('poe_tool:poe1:temp_data')).toBe(true);

    adapter.removeItem('temp_data');
    expect(memory.has('poe_tool:poe1:temp_data')).toBe(false);
  });
});
