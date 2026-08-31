import { useState, useEffect, useCallback } from 'react';
import type { AppSettings, CharacterInfo, SessionHealthInfo } from '../domain/settings/types';
import type { StashTabMeta } from '../domain/wealth/types';
import { poeApi } from '../services/api';

export function useSettingsModal({
  isOpen,
  onClose,
  onShowToast,
  onSettingsUpdated
}: {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onSettingsUpdated: () => void;
}) {
  const [settings, setSettings] = useState<AppSettings>({
    league: 'Auto', poesessid: '', accountName: '', autoSnapshotEnabled: true,
    autoSnapshotIntervalMinutes: 60, useDemoData: false, poetoken: '', cf_clearance: '',
    hotkey: 'ctrl+c+d', selectedStashTabs: undefined, maxStashTabs: 60
  });
  const [availableTabs, setAvailableTabs] = useState<StashTabMeta[]>([]);
  const [characters, setCharacters] = useState<CharacterInfo[]>([]);
  const [sessionHealth, setSessionHealth] = useState<SessionHealthInfo | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [loggingIn, setLoggingIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [testingConn, setTestingConn] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      poeApi.getSettings().then(s => setSettings(s)).catch(() => {});
      poeApi.getCharacters().then(c => setCharacters(c || [])).catch(() => {});
      poeApi.getSessionHealth().then(h => setSessionHealth(h)).catch(() => {});
    }
  }, [isOpen]);

  const handleLogin = useCallback(async () => {
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await poeApi.loginAuth();
      if (res.success) {
        onShowToast(`連線成功！已連結帳號 ${res.accountName}`);
        const currentSettings = await poeApi.getSettings();
        setSettings({ ...currentSettings, useDemoData: false });
        const chars = await poeApi.getCharacters();
        setCharacters(chars || []);
        onSettingsUpdated();
        poeApi.getSessionHealth().then(h => setSessionHealth(h)).catch(() => {});
      } else {
        onShowToast(res.message || '已在預設瀏覽器中開啟官方登入網址！');
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : (typeof err === 'object' && err !== null && 'message' in err ? String((err as { message: unknown }).message) : '無法開啟瀏覽器');
      setLoginError(errorMsg);
    } finally {
      setLoggingIn(false);
    }
  }, [onShowToast, onSettingsUpdated]);

  const handleLogout = useCallback(async () => {
    try {
      await poeApi.logoutAuth();
      onShowToast('已成功登出！');
      const currentSettings = await poeApi.getSettings();
      setSettings({ ...currentSettings, useDemoData: false });
      setCharacters([]);
      setTestResult(null);
      onSettingsUpdated();
      poeApi.getSessionHealth().then(h => setSessionHealth(h)).catch(() => {});
    } catch {
      onShowToast('登出失敗');
    }
  }, [onShowToast, onSettingsUpdated]);

  const handleTestConnection = useCallback(async () => {
    if (!settings.poesessid) { setTestResult({ success: false, message: '請先填入 POESESSID' }); return; }
    setTestingConn(true);
    setTestResult(null);
    try {
      const res = await poeApi.testConnection({ poesessid: settings.poesessid, accountName: settings.accountName });
      setTestResult({ success: res.success, message: res.message });
      if (res.success) {
        if (res.characters && res.characters.length > 0) setCharacters(res.characters);
        const updated = await poeApi.getSettings();
        if (updated.accountName) setSettings(prev => ({ ...prev, accountName: updated.accountName }));
        onSettingsUpdated();
      }
      poeApi.getSessionHealth().then(h => setSessionHealth(h)).catch(() => {});
    } catch {
      setTestResult({ success: false, message: '連線請求失敗' });
    } finally {
      setTestingConn(false);
    }
  }, [settings.poesessid, settings.accountName, onSettingsUpdated]);

  const handleFetchStashTabs = useCallback(async () => {
    try {
      const tabs = await poeApi.getStashTabs(settings.league !== 'Auto' ? settings.league : undefined);
      setAvailableTabs(tabs || []);
      if (tabs && tabs.length > 0) onShowToast(`成功讀取 ${tabs.length} 個倉庫分頁！`);
      else onShowToast('未取得倉庫分頁，請檢查 POESESSID 與帳號');
    } catch {
      onShowToast('取得分頁失敗');
    }
  }, [settings.league, onShowToast]);

  const handleSaveSettings = useCallback(async () => {
    setSaving(true);
    try {
      await poeApi.updateSettings(settings);
      onShowToast('設定已成功儲存！');
      onSettingsUpdated();
      onClose();
    } catch {
      onShowToast('儲存設定失敗');
    } finally {
      setSaving(false);
    }
  }, [settings, onShowToast, onSettingsUpdated, onClose]);

  const handleSelectAllTabs = useCallback(() => {
    setSettings(prev => ({ ...prev, selectedStashTabs: availableTabs.map(t => t.i) }));
  }, [availableTabs]);

  const handleClearAllTabs = useCallback(() => {
    setSettings(prev => ({ ...prev, selectedStashTabs: [] }));
  }, []);

  const handleSelectCurrencyTabs = useCallback(() => {
    const currencyTabIdxs = availableTabs
      .filter(t => t.type.toLowerCase().includes('currency') || t.type.toLowerCase().includes('fragment') || t.n.includes('通貨') || t.n.includes('碎片'))
      .map(t => t.i);
    setSettings(prev => ({ ...prev, selectedStashTabs: currencyTabIdxs }));
  }, [availableTabs]);

  return {
    settings, setSettings,
    availableTabs, characters, sessionHealth,
    saving, loggingIn, loginError, testingConn, testResult,
    handleLogin, handleLogout, handleTestConnection, handleFetchStashTabs,
    handleSaveSettings, handleSelectAllTabs, handleClearAllTabs, handleSelectCurrencyTabs
  };
}
