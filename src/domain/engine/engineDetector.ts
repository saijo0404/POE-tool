import type { GameEngine } from './types';
import { ENGINE_METADATA } from './types';

function extractBaseExecutableName(pathOrName: string): string {
  const normalized = pathOrName.replace(/\\/g, '/');
  const filename = normalized.split('/').pop() ?? normalized;
  return filename.trim().toLowerCase();
}

export function identifyEngineFromProcess(processName?: string | null): GameEngine | null {
  if (!processName || !processName.trim()) return null;

  const cleanName = extractBaseExecutableName(processName);

  // Check PoE 2 first to avoid 'pathofexile' partial match
  const isPoe2 = ENGINE_METADATA.poe2.executablePatterns.some(
    pattern => cleanName === pattern || cleanName.includes('pathofexile2')
  );
  if (isPoe2) return 'poe2';

  const isPoe1 = ENGINE_METADATA.poe1.executablePatterns.some(
    pattern => cleanName === pattern || cleanName.includes('pathofexile')
  );
  if (isPoe1) return 'poe1';

  return null;
}

export function identifyEngineFromWindowTitle(windowTitle?: string | null): GameEngine | null {
  if (!windowTitle || !windowTitle.trim()) return null;

  const titleLower = windowTitle.trim().toLowerCase();

  // Check PoE 2 first
  if (titleLower.includes('path of exile 2') || titleLower.includes('流亡黯道 2')) {
    return 'poe2';
  }

  if (titleLower.includes('path of exile') || titleLower.includes('流亡黯道')) {
    return 'poe1';
  }

  return null;
}

export function detectEngineFromSystem(info: {
  processName?: string | null;
  windowTitle?: string | null;
}): GameEngine | null {
  if (info.processName) {
    const fromProcess = identifyEngineFromProcess(info.processName);
    if (fromProcess) return fromProcess;
  }

  if (info.windowTitle) {
    const fromTitle = identifyEngineFromWindowTitle(info.windowTitle);
    if (fromTitle) return fromTitle;
  }

  return null;
}
