import type { MappingSession } from '../../domain/mapping/types';
import { DEFAULT_MAP_INVESTMENT } from '../../domain/mapping/constants';
import { defaultStorage } from './LocalStorageAdapter';

export const MAPPING_SESSIONS_STORAGE_KEY = 'poe_mapping_sessions_v1';
export const ACTIVE_MAPPING_SESSION_ID_KEY = 'poe_active_mapping_session_id';

export function createDefaultMappingSession(league: string = 'Settlers'): MappingSession {
  const now = Date.now();
  return {
    id: `session_${now}_${Math.random().toString(36).substring(2, 7)}`,
    name: '一般速刷地圖 (Standard Session)',
    league,
    strategyName: '點金速刷 (Alch & Go)',
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
    strategyName: s.strategyName,
    defaultInvestment: s.defaultInvestment || { ...DEFAULT_MAP_INVESTMENT },
    selectedTabNames: Array.isArray(s.selectedTabNames) ? s.selectedTabNames : [],
    runs: Array.isArray(s.runs) ? s.runs : [],
    createdAt: typeof s.createdAt === 'number' ? s.createdAt : now,
    updatedAt: typeof s.updatedAt === 'number' ? s.updatedAt : now
  };
}

export function loadMappingSessions(defaultLeague: string = 'Settlers'): MappingSession[] {
  const list = defaultStorage.getItem<unknown[]>(MAPPING_SESSIONS_STORAGE_KEY, []);
  if (!Array.isArray(list) || list.length === 0) {
    const initial = [createDefaultMappingSession(defaultLeague)];
    saveMappingSessions(initial);
    return initial;
  }
  return list.map(item => sanitizeSession(item, defaultLeague));
}

export function saveMappingSessions(sessions: MappingSession[]): void {
  defaultStorage.setItem(MAPPING_SESSIONS_STORAGE_KEY, sessions);
}

export function loadActiveSessionId(sessions: MappingSession[]): string {
  const savedId = defaultStorage.getItem<string | null>(ACTIVE_MAPPING_SESSION_ID_KEY, null);
  if (savedId && sessions.some(s => s.id === savedId)) {
    return savedId;
  }
  return sessions[0]?.id || '';
}

export function saveActiveSessionId(id: string): void {
  defaultStorage.setItem(ACTIVE_MAPPING_SESSION_ID_KEY, id);
}
