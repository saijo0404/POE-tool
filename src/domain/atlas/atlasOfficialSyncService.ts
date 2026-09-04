import type { AtlasNode } from './types';
import defaultOfficialNodes from './data/officialAtlasTree.json';
import type { IStoragePort } from '../../application/ports/IStoragePort';
import { defaultStorage } from '../../infrastructure/storage/LocalStorageAdapter';
import { parseOfficialGggData, type RawGggAtlasTreeData } from './atlasDataParser';

export const GGG_ATLASTREE_EXPORT_URL = 'https://raw.githubusercontent.com/grindinggear/atlastree-export/master/data.json';
export const ATLAS_CACHE_KEY = 'poe_official_atlas_tree_cache_v325';
export const ATLAS_SYNC_TIMESTAMP_KEY = 'poe_official_atlas_sync_time';

export * from './atlasOrbitGeometry';
export * from './atlasNodeTranslations';
export * from './atlasMechanicDetector';
export * from './atlasDataParser';

export interface SyncAtlasTreeResult {
  success: boolean;
  nodeCount: number;
  message: string;
}

async function fetchOfficialTreeJson(): Promise<RawGggAtlasTreeData> {
  const response = await fetch(GGG_ATLASTREE_EXPORT_URL, {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-cache'
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Fetch and auto-update latest Atlas Tree from GGG official GitHub repository
 */
export async function syncOfficialAtlasTree(
  storage: IStoragePort = defaultStorage
): Promise<SyncAtlasTreeResult> {
  try {
    const rawJson = await fetchOfficialTreeJson();
    const parsed = parseOfficialGggData(rawJson);
    if (parsed.length < 500) {
      throw new Error(`解析節點數異常 (${parsed.length} 個節點)`);
    }
    storage.setItem(ATLAS_CACHE_KEY, parsed);
    storage.setItem(ATLAS_SYNC_TIMESTAMP_KEY, new Date().toISOString());
    return {
      success: true,
      nodeCount: parsed.length,
      message: `✨ 已成功自 GGG 官方同步最新聯盟輿圖天賦樹 (${parsed.length} 個節點)！`
    };
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      nodeCount: defaultOfficialNodes.length,
      message: `同步失敗 (${errorMsg})，已自動切換為本地離線打包資料。`
    };
  }
}

/**
 * Load Atlas Tree nodes with cache-first strategy
 */
export function loadCachedAtlasTreeData(storage: IStoragePort = defaultStorage): AtlasNode[] {
  const cached = storage.getItem<AtlasNode[] | null>(ATLAS_CACHE_KEY, null);
  if (Array.isArray(cached) && cached.length > 500) {
    return cached;
  }
  return defaultOfficialNodes as AtlasNode[];
}

export function getAtlasTreeLastSyncTime(storage: IStoragePort = defaultStorage): string | null {
  return storage.getItem<string | null>(ATLAS_SYNC_TIMESTAMP_KEY, null);
}
