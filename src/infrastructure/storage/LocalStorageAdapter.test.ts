import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageAdapter } from './LocalStorageAdapter';

describe('LocalStorageAdapter', () => {
  let adapter: LocalStorageAdapter;

  beforeEach(() => {
    localStorage.clear();
    adapter = new LocalStorageAdapter();
  });

  it('stores and retrieves JSON serialized data', () => {
    adapter.setItem('test_key', { count: 10, name: 'POE' });
    const val = adapter.getItem('test_key', { count: 0, name: '' });
    expect(val).toEqual({ count: 10, name: 'POE' });
  });

  it('returns default value when key does not exist or JSON is invalid', () => {
    const defaultVal = { count: 0 };
    expect(adapter.getItem('non_existent', defaultVal)).toBe(defaultVal);

    localStorage.setItem('corrupt_key', '{invalid json');
    expect(adapter.getItem('corrupt_key', defaultVal)).toBe(defaultVal);
  });

  it('removes item correctly', () => {
    adapter.setItem('removable', 'val');
    expect(adapter.getItem('removable', '')).toBe('val');

    adapter.removeItem('removable');
    expect(adapter.getItem('removable', 'none')).toBe('none');
  });
});
