import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadMappingSessions,
  saveMappingSessions,
  loadActiveSessionId,
  saveActiveSessionId,
  createDefaultMappingSession,
  MAPPING_SESSIONS_STORAGE_KEY,
  ACTIVE_MAPPING_SESSION_ID_KEY
} from '../mappingStorage';

describe('mappingStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('should initialize and return default session when storage is empty', () => {
    const sessions = loadMappingSessions('Standard');
    expect(sessions).toHaveLength(1);
    expect(sessions[0].league).toBe('Standard');
    expect(sessions[0].runs).toEqual([]);
  });

  it('should save and reload valid sessions correctly', () => {
    const defaultSess = createDefaultMappingSession('Settlers');
    defaultSess.name = 'Test Session';
    saveMappingSessions([defaultSess]);

    const loaded = loadMappingSessions('Settlers');
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe('Test Session');
  });

  it('should sanitize malformed objects in storage', () => {
    window.localStorage.setItem(
      MAPPING_SESSIONS_STORAGE_KEY,
      JSON.stringify([{ corrupt: true }])
    );

    const loaded = loadMappingSessions('Settlers');
    expect(loaded).toHaveLength(1);
    expect(loaded[0].name).toBe('未命名 Session');
    expect(loaded[0].runs).toEqual([]);
  });

  it('should track and persist active session id', () => {
    const s1 = createDefaultMappingSession('Settlers');
    const s2 = createDefaultMappingSession('Settlers');
    saveMappingSessions([s1, s2]);

    saveActiveSessionId(s2.id);
    const activeId = loadActiveSessionId([s1, s2]);
    expect(activeId).toBe(s2.id);
  });

  it('should fallback to first session if saved active session id not found', () => {
    const s1 = createDefaultMappingSession('Settlers');
    window.localStorage.setItem(ACTIVE_MAPPING_SESSION_ID_KEY, JSON.stringify('non_existent_id'));

    const activeId = loadActiveSessionId([s1]);
    expect(activeId).toBe(s1.id);
  });
});
