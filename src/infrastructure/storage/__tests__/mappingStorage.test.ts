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
import { StorageNamespaceAdapter } from '../StorageNamespaceAdapter';
import { LocalStorageAdapter } from '../LocalStorageAdapter';

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

  it('should create default session for poe2 with appropriate metadata', () => {
    const session = createDefaultMappingSession('Standard', 'poe2');
    expect(session.engine).toBe('poe2');
    expect(session.name).toContain('PoE 2');
    expect(session.strategyName).toContain('Waystone');
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

  it('should isolate poe1 and poe2 sessions in namespaced storage', () => {
    const rawStorage = new LocalStorageAdapter();
    const poe1Storage = new StorageNamespaceAdapter(rawStorage, () => 'poe1');
    const poe2Storage = new StorageNamespaceAdapter(rawStorage, () => 'poe2');

    const poe1Session = createDefaultMappingSession('Settlers', 'poe1');
    poe1Session.name = 'PoE 1 Mapping Session';
    saveMappingSessions([poe1Session], poe1Storage);

    const poe2Session = createDefaultMappingSession('Standard', 'poe2');
    poe2Session.name = 'PoE 2 Waystone Session';
    saveMappingSessions([poe2Session], poe2Storage);

    const loadedPoe1 = loadMappingSessions('Settlers', poe1Storage);
    const loadedPoe2 = loadMappingSessions('Standard', poe2Storage);

    expect(loadedPoe1).toHaveLength(1);
    expect(loadedPoe1[0].name).toBe('PoE 1 Mapping Session');

    expect(loadedPoe2).toHaveLength(1);
    expect(loadedPoe2[0].name).toBe('PoE 2 Waystone Session');
  });
});
