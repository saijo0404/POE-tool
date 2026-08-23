import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ApiClientFactory } from './ApiClientFactory';
import { TauriBridgeClient } from './TauriBridgeClient';
import { HttpFallbackClient } from './HttpFallbackClient';

describe('ApiClientFactory', () => {
  beforeEach(() => {
    delete (window as unknown as Record<string, unknown>).__TAURI__;
    delete (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__;
    ApiClientFactory.resetClient();
  });

  afterEach(() => {
    delete (window as unknown as Record<string, unknown>).__TAURI__;
    delete (window as unknown as Record<string, unknown>).__TAURI_INTERNALS__;
    ApiClientFactory.resetClient();
  });

  it('returns HttpFallbackClient in web mode', () => {
    expect(ApiClientFactory.isTauri()).toBe(false);
    const client = ApiClientFactory.getClient();
    expect(client).toBeInstanceOf(HttpFallbackClient);
  });

  it('returns TauriBridgeClient when in Tauri environment', () => {
    (window as unknown as Record<string, unknown>).__TAURI__ = {};
    expect(ApiClientFactory.isTauri()).toBe(true);
    const client = ApiClientFactory.getClient();
    expect(client).toBeInstanceOf(TauriBridgeClient);
  });

  it('allows overriding client for dependency injection', () => {
    const mockClient = new HttpFallbackClient();
    ApiClientFactory.setClient(mockClient);
    expect(ApiClientFactory.getClient()).toBe(mockClient);
  });
});
