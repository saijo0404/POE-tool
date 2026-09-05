import type { IStoragePort } from '../../application/ports/IStoragePort';
import type { GameEngine } from '../../domain/engine/types';
import { defaultStorage } from './LocalStorageAdapter';
import { defaultGameEngineStore } from '../../application/engine/gameEngineStore';

export interface StorageNamespaceOptions {
  readonly sharedKeys?: readonly string[];
  readonly enableLegacyFallback?: boolean;
}

export class StorageNamespaceAdapter implements IStoragePort {
  private readonly baseStorage: IStoragePort;
  private readonly getNamespace: () => GameEngine | string;
  private readonly sharedKeySet: Set<string>;
  private readonly enableLegacyFallback: boolean;

  constructor(
    baseStorage: IStoragePort,
    getNamespace: () => GameEngine | string,
    options?: StorageNamespaceOptions
  ) {
    this.baseStorage = baseStorage;
    this.getNamespace = getNamespace;
    this.sharedKeySet = new Set(options?.sharedKeys ?? []);
    this.enableLegacyFallback = options?.enableLegacyFallback ?? true;
  }

  getNamespacedKey(key: string): string {
    if (this.sharedKeySet.has(key)) {
      return `poe_tool:shared:${key}`;
    }
    const ns = this.getNamespace();
    return `poe_tool:${ns}:${key}`;
  }

  getItem<T>(key: string, defaultVal: T): T {
    const namespacedKey = this.getNamespacedKey(key);
    const namespacedVal = this.baseStorage.getItem<T | null>(namespacedKey, null);

    if (namespacedVal !== null) {
      return namespacedVal;
    }

    if (this.isLegacyFallbackEligible(key)) {
      const legacyVal = this.baseStorage.getItem<T | null>(key, null);
      if (legacyVal !== null) {
        return legacyVal;
      }
    }

    return defaultVal;
  }

  setItem<T>(key: string, value: T): void {
    const namespacedKey = this.getNamespacedKey(key);
    this.baseStorage.setItem(namespacedKey, value);
  }

  removeItem(key: string): void {
    const namespacedKey = this.getNamespacedKey(key);
    this.baseStorage.removeItem(namespacedKey);

    if (this.isLegacyFallbackEligible(key)) {
      this.baseStorage.removeItem(key);
    }
  }

  private isLegacyFallbackEligible(key: string): boolean {
    if (!this.enableLegacyFallback) return false;
    if (this.sharedKeySet.has(key)) return true;
    return this.getNamespace() === 'poe1';
  }
}


export const DEFAULT_SHARED_STORAGE_KEYS: readonly string[] = [
  'poe_settings_cache',
  'poe_overlay_pin_state',
  'poe_device_profile_mode',
  'poe_hotkey_bindings',
  'poe_tool_trade_whisper_config',
  'poe_game_engine_store',
  'poe_tool:settings',
  'poe_tool:hotkeys'
];

export const namespacedStorage: IStoragePort = new StorageNamespaceAdapter(
  defaultStorage,
  () => defaultGameEngineStore.getState().currentEngine,
  {
    sharedKeys: DEFAULT_SHARED_STORAGE_KEYS,
    enableLegacyFallback: true
  }
);
