export interface IStoragePort {
  getItem<T>(key: string, defaultVal: T): T;
  setItem<T>(key: string, value: T): void;
  removeItem(key: string): void;
}
