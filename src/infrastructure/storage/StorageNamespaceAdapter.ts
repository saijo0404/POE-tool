import type { IStoragePort } from '../../application/ports/IStoragePort';
import type { GameEngine } from '../../domain/engine/types';

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
    return (
      this.enableLegacyFallback &&
      !this.sharedKeySet.has(key) &&
      this.getNamespace() === 'poe1'
    );
  }
}
