import type { MappingSession } from '../../domain/mapping/types';
import type { GameEngine } from '../../domain/engine/types';
import type { IStoragePort } from '../../application/ports/IStoragePort';
import { DEFAULT_MAP_INVESTMENT } from '../../domain/mapping/constants';
import { namespacedStorage } from './StorageNamespaceAdapter';

export const MAPPING_SESSIONS_STORAGE_KEY = 'poe_mapping_sessions_v1';
export const ACTIVE_MAPPING_SESSION_ID_KEY = 'poe_active_mapping_session_id';

export function createDefaultMappingSession(
  league: string = 'Settlers',
  engine?: GameEngine
): MappingSession {
  const now = Date.now();
  const isPoe2 = engine === 'poe2';
  return {
    id: `session_${now}_${Math.random().toString(36).substring(2, 7)}`,
    name: isPoe2 ? 'PoE 2 銘刻地圖速刷 (Waystone Session)' : '一般速刷地圖 (Standard Session)',
    league,
    engine: engine || (isPoe2 ? 'poe2' : 'poe1'),
    strategyName: isPoe2 ? '銘刻昇階速刷 (Waystone Progression)' : '點金速刷 (Alch & Go)',
    defaultInvestment: { ...DEFAULT_MAP_INVESTMENT },
    selectedTabNames: [],
    runs: [],
    createdAt: now,
    updatedAt: now
  };
}

function sanitizeSession(raw: unknown, defaultLeague: string): MappingSession {
  if (!raw || typeof raw !== 'object') {
    return createDefaultMappingSession(defaultLeague);
  }
  const s = raw as Partial<MappingSession>;
  const now = Date.now();
  return {
    id: s.id && typeof s.id === 'string' ? s.id : `session_${now}`,
    name: s.name && typeof s.name === 'string' ? s.name : '未命名 Session',
    league: s.league && typeof s.league === 'string' ? s.league : defaultLeague,
    engine: s.engine === 'poe2' ? 'poe2' : 'poe1',
    strategyName: s.strategyName,
    defaultInvestment: s.defaultInvestment || { ...DEFAULT_MAP_INVESTMENT },
    selectedTabNames: Array.isArray(s.selectedTabNames) ? s.selectedTabNames : [],
    runs: Array.isArray(s.runs) ? s.runs : [],
    createdAt: typeof s.createdAt === 'number' ? s.createdAt : now,
    updatedAt: typeof s.updatedAt === 'number' ? s.updatedAt : now
  };
}

export function loadMappingSessions(
  defaultLeague: string = 'Settlers',
  storage: IStoragePort = namespacedStorage
): MappingSession[] {
  const list = storage.getItem<unknown[]>(MAPPING_SESSIONS_STORAGE_KEY, []);
  if (!Array.isArray(list) || list.length === 0) {
    const initial = [createDefaultMappingSession(defaultLeague)];
    saveMappingSessions(initial, storage);
    return initial;
  }
  return list.map(item => sanitizeSession(item, defaultLeague));
}

export function saveMappingSessions(
  sessions: MappingSession[],
  storage: IStoragePort = namespacedStorage
): void {
  storage.setItem(MAPPING_SESSIONS_STORAGE_KEY, sessions);
}

export function loadActiveSessionId(
  sessions: MappingSession[],
  storage: IStoragePort = namespacedStorage
): string {
  const savedId = storage.getItem<string | null>(ACTIVE_MAPPING_SESSION_ID_KEY, null);
  if (savedId && sessions.some(s => s.id === savedId)) {
    return savedId;
  }
  return sessions[0]?.id || '';
}

export function saveActiveSessionId(
  id: string,
  storage: IStoragePort = namespacedStorage
): void {
  storage.setItem(ACTIVE_MAPPING_SESSION_ID_KEY, id);
}
