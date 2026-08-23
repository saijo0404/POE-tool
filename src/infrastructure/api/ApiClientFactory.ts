import type { IPoeApiClient } from '../../application/ports/IPoeApiClient';
import { TauriBridgeClient } from './TauriBridgeClient';
import { HttpFallbackClient } from './HttpFallbackClient';

export class ApiClientFactory {
  private static instance: IPoeApiClient | null = null;

  public static isTauri(): boolean {
    if (typeof window === 'undefined') return false;
    const win = window as unknown as { __TAURI_INTERNALS__?: unknown; __TAURI__?: unknown };
    return Boolean(win.__TAURI_INTERNALS__ || win.__TAURI__);
  }

  public static getClient(): IPoeApiClient {
    if (!ApiClientFactory.instance) {
      ApiClientFactory.instance = ApiClientFactory.isTauri()
        ? new TauriBridgeClient()
        : new HttpFallbackClient();
    }
    return ApiClientFactory.instance;
  }

  public static setClient(client: IPoeApiClient): void {
    ApiClientFactory.instance = client;
  }

  public static resetClient(): void {
    ApiClientFactory.instance = null;
  }
}
