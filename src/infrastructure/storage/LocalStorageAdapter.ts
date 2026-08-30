import type { IStoragePort } from '../../application/ports/IStoragePort';

export class LocalStorageAdapter implements IStoragePort {
  getItem<T>(key: string, defaultVal: T): T {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return defaultVal;
      }
      const raw = window.localStorage.getItem(key);
      if (!raw) return defaultVal;
      return JSON.parse(raw) as T;
    } catch {
      return defaultVal;
    }
  }

  setItem<T>(key: string, value: T): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {}
  }

  removeItem(key: string): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      window.localStorage.removeItem(key);
    } catch {}
  }
}

export const defaultStorage: IStoragePort = new LocalStorageAdapter();
