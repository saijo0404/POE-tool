// Helper utilities for interacting with native Tauri desktop runtime

export function isTauri(): boolean {
  return typeof window !== 'undefined' && ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);
}

export async function toggleAlwaysOnTop(enable: boolean): Promise<boolean> {
  if (!isTauri()) return false;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('toggle_always_on_top', { enable });
    return enable;
  } catch (err) {
    console.warn('[Tauri] toggle_always_on_top failed:', err);
    return false;
  }
}

export async function showMainWindow(): Promise<void> {
  if (!isTauri()) return;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('show_main_window');
  } catch (err) {
    console.warn('[Tauri] show_main_window failed:', err);
  }
}

export async function hideMainWindow(): Promise<void> {
  if (!isTauri()) return;
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    await invoke('hide_main_window');
  } catch (err) {
    console.warn('[Tauri] hide_main_window failed:', err);
  }
}

export async function getTauriAppVersion(): Promise<string> {
  if (!isTauri()) return '1.0.0 (Web)';
  try {
    const { invoke } = await import('@tauri-apps/api/core');
    return await invoke<string>('get_app_version');
  } catch {
    return '1.0.0 (Desktop)';
  }
}
