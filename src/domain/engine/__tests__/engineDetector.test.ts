import { describe, it, expect } from 'vitest';
import {
  identifyEngineFromProcess,
  identifyEngineFromWindowTitle,
  detectEngineFromSystem,
  ENGINE_METADATA,
  isEngineFeatureSupported
} from '../index';

describe('engineDetector', () => {
  describe('identifyEngineFromProcess', () => {
    it('detects PoE 1 from standard executables', () => {
      expect(identifyEngineFromProcess('PathOfExile.exe')).toBe('poe1');
      expect(identifyEngineFromProcess('PathOfExile_x64.exe')).toBe('poe1');
      expect(identifyEngineFromProcess('PathOfExileSteam.exe')).toBe('poe1');
      expect(identifyEngineFromProcess('pathofexile.exe')).toBe('poe1');
      expect(identifyEngineFromProcess('C:\\Games\\Grinding Gear Games\\PathOfExile.exe')).toBe('poe1');
    });

    it('detects PoE 2 from standard executables', () => {
      expect(identifyEngineFromProcess('PathOfExile2.exe')).toBe('poe2');
      expect(identifyEngineFromProcess('PathOfExile2_x64.exe')).toBe('poe2');
      expect(identifyEngineFromProcess('PathOfExile2Steam.exe')).toBe('poe2');
      expect(identifyEngineFromProcess('pathofexile2.exe')).toBe('poe2');
      expect(identifyEngineFromProcess('D:\\SteamLibrary\\steamapps\\common\\Path of Exile 2\\PathOfExile2Steam.exe')).toBe('poe2');
    });

    it('returns null for unrelated executables or empty inputs', () => {
      expect(identifyEngineFromProcess('chrome.exe')).toBeNull();
      expect(identifyEngineFromProcess('notepad.exe')).toBeNull();
      expect(identifyEngineFromProcess('')).toBeNull();
      expect(identifyEngineFromProcess(null)).toBeNull();
      expect(identifyEngineFromProcess(undefined)).toBeNull();
    });
  });

  describe('identifyEngineFromWindowTitle', () => {
    it('detects PoE 1 from window titles', () => {
      expect(identifyEngineFromWindowTitle('Path of Exile')).toBe('poe1');
      expect(identifyEngineFromWindowTitle('Path of Exile (DirectX 12)')).toBe('poe1');
      expect(identifyEngineFromWindowTitle('Path of Exile (Vulkan)')).toBe('poe1');
    });

    it('detects PoE 2 from window titles with high precedence', () => {
      expect(identifyEngineFromWindowTitle('Path of Exile 2')).toBe('poe2');
      expect(identifyEngineFromWindowTitle('Path of Exile 2 - Vulkan')).toBe('poe2');
    });

    it('returns null for unrelated titles or empty inputs', () => {
      expect(identifyEngineFromWindowTitle('Google Chrome')).toBeNull();
      expect(identifyEngineFromWindowTitle('Visual Studio Code')).toBeNull();
      expect(identifyEngineFromWindowTitle('')).toBeNull();
      expect(identifyEngineFromWindowTitle(null)).toBeNull();
      expect(identifyEngineFromWindowTitle(undefined)).toBeNull();
    });
  });

  describe('detectEngineFromSystem', () => {
    it('prioritizes process name detection when available', () => {
      const result = detectEngineFromSystem({
        processName: 'PathOfExile2.exe',
        windowTitle: 'Path of Exile'
      });
      expect(result).toBe('poe2');
    });

    it('falls back to window title if process name is unknown', () => {
      const result = detectEngineFromSystem({
        processName: 'unknown.exe',
        windowTitle: 'Path of Exile 2'
      });
      expect(result).toBe('poe2');
    });

    it('returns null when neither matches', () => {
      const result = detectEngineFromSystem({
        processName: 'discord.exe',
        windowTitle: 'Discord'
      });
      expect(result).toBeNull();
    });
  });

  describe('ENGINE_METADATA and features', () => {
    it('defines distinct feature sets for poe1 and poe2', () => {
      expect(ENGINE_METADATA.poe1.features.spirit).toBe(false);
      expect(ENGINE_METADATA.poe2.features.spirit).toBe(true);

      expect(ENGINE_METADATA.poe1.features.goldEconomy).toBe(false);
      expect(ENGINE_METADATA.poe2.features.goldEconomy).toBe(true);

      expect(ENGINE_METADATA.poe1.features.weaponSets).toBe(false);
      expect(ENGINE_METADATA.poe2.features.weaponSets).toBe(true);

      expect(ENGINE_METADATA.poe1.features.waystones).toBe(false);
      expect(ENGINE_METADATA.poe2.features.waystones).toBe(true);
    });

    it('correctly queries features via helper', () => {
      expect(isEngineFeatureSupported('poe1', 'spirit')).toBe(false);
      expect(isEngineFeatureSupported('poe2', 'spirit')).toBe(true);
      expect(isEngineFeatureSupported('poe2', 'runes')).toBe(true);
    });
  });
});
