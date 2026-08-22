import React, { useState, useEffect } from 'react';
import type { AppSettings, StashTabMeta } from '../types/poe';
import { Settings as SettingsIcon, X, Check, ShieldCheck, User, Sparkles, LogOut, Keyboard, Activity, AlertCircle, Globe, HelpCircle } from 'lucide-react';
import { poeApi } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onSettingsUpdated: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onSettingsUpdated
}) => {
  const [settings, setSettings] = useState<AppSettings>({
    league: 'Auto',
    poesessid: '',
    accountName: '',
    autoSnapshotEnabled: true,
    autoSnapshotIntervalMinutes: 60,
    useDemoData: false,
    poetoken: '',
    cf_clearance: '',
    hotkey: 'ctrl+c+d',
    selectedStashTabs: undefined,
    maxStashTabs: 60
  });
  const [availableTabs, setAvailableTabs] = useState<StashTabMeta[]>([]);
  const [characters, setCharacters] = useState<any[]>([]);
  const [saving, setSaving] = useState<boolean>(false);
  const [loggingIn, setLoggingIn] = useState<boolean>(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [testingConn, setTestingConn] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleLogin = async () => {
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
      } else {
        onShowToast(res.message || '已在預設瀏覽器中開啟官方登入網址！');
      }
    } catch (err: any) {
      setLoginError(err.message || '無法開啟瀏覽器');
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await poeApi.logoutAuth();
      onShowToast('已成功登出！');
      const currentSettings = await poeApi.getSettings();
      setSettings({ ...currentSettings, useDemoData: false });
      setCharacters([]);
      setTestResult(null);
      onSettingsUpdated();
    } catch {
      onShowToast('登出失敗');
    }
  };

  const handleTestConnection = async () => {
    if (!settings.poesessid) {
      setTestResult({ success: false, message: '請先填入 POESESSID' });
      return;
    }
    setTestingConn(true);
    setTestResult(null);
    try {
      const res = await poeApi.testConnection({
        poesessid: settings.poesessid,
        accountName: settings.accountName
      });
      setTestResult({ success: res.success, message: res.message });
      if (res.success) {
        if (res.characters && res.characters.length > 0) {
          setCharacters(res.characters);
          const autoAcc = res.characters[0].accountName;
          if (autoAcc) {
            setSettings(prev => ({ ...prev, accountName: autoAcc }));
          }
        }
        const updated = await poeApi.getSettings();
        if (updated.accountName) {
          setSettings(prev => ({ ...prev, accountName: updated.accountName }));
        }
        onShowToast(res.message);
        onSettingsUpdated();
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.message || '連線測試失敗' });
    } finally {
      setTestingConn(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      poeApi.getSettings().then(data => {
        setSettings({ ...data, useDemoData: false });
        if (data.poesessid && data.accountName) {
          poeApi.getStashTabs(data.league).then(tabs => {
            if (tabs && tabs.length > 0) setAvailableTabs(tabs);
          }).catch(() => {});
        }
      }).catch(err => console.error('Failed to load settings:', err));

      poeApi.getCharacters().then(chars => {
        setCharacters(chars || []);
      }).catch(err => console.error('Failed to load characters:', err));
    }
  }, [isOpen]);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    if (typeof window !== 'undefined' && Boolean((window as any).__TAURI_INTERNALS__ || (window as any).__TAURI__)) {
      import('@tauri-apps/api/event').then(({ listen }) => {
        listen<any>('auto-login-completed', async (event) => {
          const payload = event.payload;
          onShowToast(`🎉 登入成功！已自動綁定帳號 ${payload.accountName}`);
          const current = await poeApi.getSettings();
          setSettings({ ...current, useDemoData: false });
          const chars = await poeApi.getCharacters();
          setCharacters(chars || []);
          onSettingsUpdated();
        }).then(fn => { unlisten = fn; });
      }).catch(() => {});
    }
    return () => {
      if (unlisten) unlisten();
    };
  }, [onShowToast, onSettingsUpdated]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...settings, useDemoData: false };
      await poeApi.updateSettings(payload);
      onShowToast('設定已儲存！');
      onSettingsUpdated();
      onClose();
    } catch {
      onShowToast('儲存失敗');
    } finally {
      setSaving(false);
    }
  };

  const latestChar = characters.length > 0 ? characters[0] : null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="poe-card" style={{ width: '580px', padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(200,170,110,0.2)', paddingBottom: '12px', marginBottom: '16px' }}>
          <h3 className="poe-font" style={{ color: 'var(--text-gold)', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <SettingsIcon size={18} />
            系統設定 (POE Tool Settings)
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Account Authentication Card */}
          {settings.poesessid ? (
            <div style={{
              background: 'rgba(56, 189, 248, 0.05)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              borderRadius: '4px',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ color: 'var(--text-gold)', fontWeight: 'bold', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ShieldCheck size={16} color="var(--accent-green)" />
                  已登入 PoE 官方帳號
                </div>
                <div style={{ color: '#fff', fontSize: '0.8rem', marginTop: '4px' }}>
                  帳號名稱: <span style={{ color: 'var(--text-gold)', fontWeight: 600 }}>{settings.accountName || '未指定'}</span>
                </div>
              </div>
              <button
                className="poe-btn"
                onClick={handleLogout}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  borderColor: 'rgba(239, 68, 68, 0.3)',
                  color: '#ef4444'
                }}
              >
                <LogOut size={14} />
                登出帳號
              </button>
            </div>
          ) : (
            <div style={{
              background: 'rgba(200, 170, 110, 0.03)',
              border: '1px solid rgba(200, 170, 110, 0.15)',
              borderRadius: '4px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ color: 'var(--text-gold)', fontWeight: 'bold', fontSize: '0.95rem' }}>PoE 官方帳號綁定</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '2px' }}>
                    點擊開啟官方登入視窗，登入後系統將<b>全自動獲取憑證並同步帳號與所有角色</b>，完成後自動關閉！
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="poe-btn poe-btn-primary"
                    onClick={handleLogin}
                    disabled={loggingIn}
                    style={{
                      padding: '7px 16px',
                      fontSize: '0.85rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 0 10px rgba(200, 170, 110, 0.2)'
                    }}
                  >
                    <Globe size={15} />
                    {loggingIn ? '正在開啟登入視窗...' : '🌐 官方快速登入 (全自動綁定)'}
                  </button>
                  <button
                    type="button"
                    className="poe-btn"
                    onClick={async () => {
                      try {
                        let text = '';
                        if (navigator.clipboard && navigator.clipboard.readText) {
                          text = await navigator.clipboard.readText();
                        }
                        if (text && text.trim()) {
                          let clean = text.trim();
                          if (clean.includes('POESESSID=')) {
                            const idx = clean.indexOf('POESESSID=');
                            clean = clean.substring(idx + 10).split(';')[0].trim();
                          }
                          clean = clean.replace(/['"]/g, '').trim();
                          if (clean) {
                            setSettings(prev => ({ ...prev, poesessid: clean }));
                            onShowToast('📋 已從剪貼簿貼入 POESESSID，正在驗證連線...');
                            setTimeout(() => {
                              handleTestConnection();
                            }, 100);
                            return;
                          }
                        }
                        onShowToast('⚠️ 剪貼簿中未偵測到有效文字，請先複製 POESESSID！');
                      } catch {
                        onShowToast('⚠️ 無法自動讀取剪貼簿，請手動在下方貼入！');
                      }
                    }}
                    style={{
                      padding: '7px 14px',
                      fontSize: '0.82rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: 'rgba(34, 197, 94, 0.12)',
                      borderColor: 'rgba(34, 197, 94, 0.35)',
                      color: '#4ade80'
                    }}
                  >
                    <Check size={14} />
                    📋 剪貼簿貼上
                  </button>
                </div>
              </div>

              {loginError && (
                <div style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '2px' }}>
                  錯誤: {loginError}
                </div>
              )}

              {/* Step-by-Step Friendly Instructions */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '6px',
                padding: '12px 14px',
                fontSize: '0.8rem',
                lineHeight: 1.6,
                color: 'var(--text-main)'
              }}>
                <div style={{ color: '#fbbf24', fontWeight: 600, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <HelpCircle size={14} />
                  <span>💡 為什麼需要登入？如何快速取得 POESESSID？</span>
                </div>

                <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', marginBottom: '10px', padding: '6px 10px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '4px', borderLeft: '3px solid #3b82f6' }}>
                  ✨ <b>免登入直接用</b>：遊戲內 <kbd style={{ background: '#1e293b', padding: '1px 5px', borderRadius: '3px' }}>Ctrl+D</kbd> 即時查價、聯盟物價、POB 模擬器<b>不需要登入即可直接使用</b>！<br/>
                  🔒 僅有<b>「資產管理 (Wealth Tracker 讀取私人倉庫)」</b>需要綁定官方 POESESSID 權限。
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Option A: Console 1-liner */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 'bold', color: '#60a5fa', marginBottom: '3px' }}>
                      方法一（推薦・F12 主控台 1 秒複製）：
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                      在 PoE 官網登入後，按 <kbd style={{ background: '#1e293b', padding: '1px 4px', borderRadius: '2px', border: '1px solid #334155' }}>F12</kbd> ➔ 切換至頂部 <code style={{ color: '#38bdf8' }}>Console</code> (主控台) ➔ 貼上下方指令並按 <kbd style={{ background: '#1e293b', padding: '1px 4px', borderRadius: '2px' }}>Enter</kbd>：
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px' }}>
                      <code style={{ background: '#0f172a', color: '#34d399', padding: '3px 8px', borderRadius: '3px', fontSize: '0.75rem', flex: 1, border: '1px solid #334155' }}>
                        copy(document.cookie)
                      </code>
                      <button
                        type="button"
                        className="poe-btn"
                        style={{ padding: '3px 10px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                        onClick={() => {
                          navigator.clipboard.writeText("copy(document.cookie)");
                          onShowToast('📋 已複製指令 `copy(document.cookie)`！請貼至 F12 主控台按 Enter');
                        }}
                      >
                        複製代碼
                      </button>
                    </div>
                    <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      按 Enter 後 Session 已自動複製至剪貼簿，回到此處點擊上方<b>「📋 2. 一鍵貼上並綁定」</b>即可！
                    </div>
                  </div>

                  {/* Option B: Standard Cookie Table */}
                  <div style={{ background: 'rgba(255,255,255,0.03)', padding: '8px 10px', borderRadius: '4px' }}>
                    <div style={{ fontWeight: 'bold', color: '#94a3b8', marginBottom: '3px' }}>
                      方法二（標準手動尋找 Cookie）：
                    </div>
                    <div style={{ fontSize: '0.76rem', color: '#cbd5e1' }}>
                      在官網按 <kbd style={{ background: '#1e293b', padding: '1px 4px', borderRadius: '2px', border: '1px solid #334155' }}>F12</kbd> ➔ 切換至 <code style={{ color: '#38bdf8' }}>Application</code> (應用程式) ➔ 左側 <code style={{ color: '#38bdf8' }}>Cookies</code> ➔ 點擊 <code style={{ color: '#38bdf8' }}>pathofexile.com</code> ➔ 雙擊複製 <code style={{ color: '#fbbf24' }}>POESESSID</code> 數值，貼回上方欄位。
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* League Selection */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              PoE 聯盟 (League)
            </label>
            <select
              className="poe-input"
              value={settings.league}
              onChange={(e) => setSettings({ ...settings, league: e.target.value })}
              style={{ width: '100%' }}
            >
              <option value="Standard">Standard (標準模式 - 預設)</option>
              <option value="Hardcore">Hardcore (標準專家)</option>
              <option value="Allflame">Allflame (當前季賽聯盟)</option>
              <option value="Hardcore Allflame">Hardcore Allflame (當前專家季賽)</option>
              <option value="Settlers">Settlers (3.25 賽季)</option>
              <option value="Hardcore Settlers">Hardcore Settlers (3.25 專家)</option>
              <option value="Auto">✨ Auto (自動偵測: {latestChar ? `${latestChar.name} @ ${latestChar.league}` : '依活躍角色'})</option>
            </select>
          </div>

          {/* Account Name */}
          <div>
            <label style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              PoE 帳號名稱 (Account Name)
            </label>
            <input
              type="text"
              className="poe-input"
              value={settings.accountName}
              onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
              placeholder="例如: YourAccount#1234"
              style={{ width: '100%' }}
            />
          </div>

          {/* POESESSID */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-gold)', fontWeight: 600 }}>
                官方 POESESSID (登入 Session Key)
              </label>
              <button
                type="button"
                className="poe-btn"
                onClick={handleTestConnection}
                disabled={testingConn || !settings.poesessid}
                style={{ padding: '3px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                title="即時測試此 POESESSID 與帳號能否順利連線官方伺服器"
              >
                <Activity size={12} className={testingConn ? 'spin' : ''} />
                {testingConn ? '連線測試中...' : '🔍 測試官方連線'}
              </button>
            </div>
            <input
              type="password"
              className="poe-input"
              value={settings.poesessid}
              onChange={(e) => setSettings({ ...settings, poesessid: e.target.value })}
              placeholder="貼上瀏覽器中的 POESESSID Cookie..."
              style={{ width: '100%' }}
            />
            
            {/* Connection Test Result Banner */}
            {testResult && (
              <div style={{
                marginTop: '6px',
                padding: '6px 10px',
                borderRadius: '4px',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: testResult.success ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: testResult.success ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
                color: testResult.success ? '#4ade80' : '#f87171'
              }}>
                {testResult.success ? <Check size={14} /> : <AlertCircle size={14} />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="var(--accent-green)" />
              SESSID 僅保存在本機端，用於向 PoE 官方 Stash API 取回倉庫物品頁
            </div>
          </div>

          {/* Characters Preview List */}
          {characters.length > 0 && (
            <div style={{ background: '#090c10', padding: '12px', borderRadius: '4px', border: '1px solid rgba(200, 170, 110, 0.2)' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-gold)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={14} />
                偵測到的帳號角色名單 ({characters.length} 個角色)
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '140px', overflowY: 'auto' }}>
                {characters.map((char, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '4px 8px', background: i === 0 ? 'rgba(200, 170, 110, 0.12)' : 'transparent', borderRadius: '3px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {i === 0 && <Sparkles size={12} color="var(--text-gold)" />}
                      <span style={{ color: i === 0 ? 'var(--text-gold)' : '#fff', fontWeight: i === 0 ? 700 : 400 }}>
                        {char.name} (Lv {char.level} {char.class})
                      </span>
                    </div>
                    <span style={{ color: 'var(--accent-blue)', background: 'rgba(56, 189, 248, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
                      {char.league}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hotkey Settings */}
          <div style={{ background: '#090c10', padding: '12px', borderRadius: '4px', border: '1px solid rgba(200, 170, 110, 0.2)' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-gold)', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Keyboard size={16} />
              遊戲內自動查價快捷鍵 (In-Game Auto Price Check)
            </div>
            <div style={{ color: 'var(--text-bright)', fontSize: '0.8rem', lineHeight: '1.4' }}>
              ✨ <strong style={{ color: '#4ade80' }}>免設定！在遊戲中只需按下 Ctrl+C</strong>
              <br />
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                當《流亡黯道 Path of Exile》遊戲執行時，只要在遊戲內對著任何裝備按下 <code style={{ color: 'var(--text-gold)', background: 'rgba(255,255,255,0.08)', padding: '2px 6px', borderRadius: '3px' }}>Ctrl+C</code>，工具即會自動帶入裝備並完成拍賣場估價！
              </span>
            </div>
          </div>

          {/* Stash Tabs Selection Section */}
          <div style={{ background: '#090c10', padding: '12px', borderRadius: '4px', border: '1px solid rgba(200, 170, 110, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={15} />
                倉庫頁資產追蹤自選 (Stash Tab Selector)
              </div>
              <button
                type="button"
                className="poe-btn"
                onClick={async () => {
                  if (!settings.poesessid || !settings.accountName) {
                    onShowToast('請先填入 POESESSID 與帳號名稱');
                    return;
                  }
                  try {
                    onShowToast('正在向 PoE 官方獲取倉庫頁清單...');
                    const tabs = await poeApi.getStashTabs(settings.league);
                    setAvailableTabs(tabs);
                    if (tabs.length > 0) {
                      onShowToast(`成功載入 ${tabs.length} 個倉庫頁！`);
                    } else {
                      onShowToast('未能獲取倉庫頁，請確認登入狀態');
                    }
                  } catch (e: any) {
                    onShowToast('載入倉庫頁失敗: ' + (e.message || ''));
                  }
                }}
                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
              >
                載入/更新倉庫清單
              </button>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              自訂要納入財富計算的倉庫分頁。未勾選任何項目時將預設抓取所有分頁（已解除 10 頁上限）。
            </div>

            {availableTabs.length > 0 ? (
              <div>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button
                    type="button"
                    className="poe-btn"
                    onClick={() => setSettings({ ...settings, selectedStashTabs: availableTabs.map(t => t.i) })}
                    style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                  >
                    全選 ({availableTabs.length} 頁)
                  </button>
                  <button
                    type="button"
                    className="poe-btn"
                    onClick={() => {
                      const priorityTabs = availableTabs
                        .filter(t => /Currency|Fragment|Divination|Quad|Map|Essence/i.test(t.type || '') || /通貨|碎片|卡片|精髓/i.test(t.n))
                        .map(t => t.i);
                      setSettings({ ...settings, selectedStashTabs: priorityTabs });
                    }}
                    style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                  >
                    僅主要通貨/碎片頁
                  </button>
                  <button
                    type="button"
                    className="poe-btn"
                    onClick={() => setSettings({ ...settings, selectedStashTabs: [] })}
                    style={{ padding: '2px 8px', fontSize: '0.7rem' }}
                  >
                    重設 (全自動)
                  </button>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '6px',
                  maxHeight: '160px',
                  overflowY: 'auto',
                  background: 'rgba(0,0,0,0.3)',
                  padding: '8px',
                  borderRadius: '4px'
                }}>
                  {availableTabs.map((tab) => {
                    const isSelected = Array.isArray(settings.selectedStashTabs) && settings.selectedStashTabs.length > 0
                      ? settings.selectedStashTabs.includes(tab.i)
                      : true;

                    const toggleTab = () => {
                      const currentSelected = settings.selectedStashTabs && settings.selectedStashTabs.length > 0
                        ? [...settings.selectedStashTabs]
                        : availableTabs.map(t => t.i);

                      let next: number[];
                      if (currentSelected.includes(tab.i)) {
                        next = currentSelected.filter(idx => idx !== tab.i);
                      } else {
                        next = [...currentSelected, tab.i];
                      }
                      setSettings({ ...settings, selectedStashTabs: next });
                    };

                    return (
                      <label
                        key={tab.id || tab.i}
                        onClick={(e) => { e.preventDefault(); toggleTab(); }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 8px',
                          background: isSelected ? 'rgba(200, 170, 110, 0.15)' : 'rgba(255,255,255,0.02)',
                          border: isSelected ? '1px solid rgba(200, 170, 110, 0.4)' : '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          color: isSelected ? 'var(--text-gold)' : 'var(--text-muted)'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          style={{ cursor: 'pointer' }}
                        />
                        <span style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          flex: 1
                        }}>
                          {tab.n}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontStyle: 'italic' }}>
                尚未載入分頁清單，點擊右上角「載入/更新倉庫清單」可即時抓取遊戲分頁名稱進行挑選。
              </div>
            )}
          </div>

          {/* Auto Snapshot Settings */}
          <div style={{ background: '#090c10', padding: '12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                啟用每小時自動快照估算
              </span>
              <input
                type="checkbox"
                checked={settings.autoSnapshotEnabled}
                onChange={(e) => setSettings({ ...settings, autoSnapshotEnabled: e.target.checked })}
                style={{ cursor: 'pointer' }}
              />
            </div>

            {settings.autoSnapshotEnabled && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>紀錄頻率 (分鐘):</span>
                <input
                  type="number"
                  className="poe-input"
                  value={settings.autoSnapshotIntervalMinutes}
                  onChange={(e) => setSettings({ ...settings, autoSnapshotIntervalMinutes: parseInt(e.target.value, 10) || 60 })}
                  style={{ width: '80px', padding: '4px 8px' }}
                />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>分鐘/次</span>
              </div>
            )}
          </div>

          {/* System Log File Section */}
          <div style={{ background: '#090c10', padding: '12px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>
                📄 系統日誌檔案 (poe-tool.log)
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  type="button"
                  className="poe-btn"
                  style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                  onClick={async () => {
                    const path = await poeApi.getLogFilePath();
                    if (path) {
                      await navigator.clipboard.writeText(path);
                      onShowToast?.(`📋 已複製日誌檔案路徑：${path}`);
                    } else {
                      onShowToast?.('無法取得日誌路徑');
                    }
                  }}
                >
                  複製路徑
                </button>
                <button
                  type="button"
                  className="poe-btn"
                  style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                  onClick={async () => {
                    const logs = await poeApi.getLogContents(200);
                    if (logs) {
                      await navigator.clipboard.writeText(logs);
                      onShowToast?.('📋 已複製最近 200 行日誌內容至剪貼簿！');
                    } else {
                      onShowToast?.('尚無日誌記錄');
                    }
                  }}
                >
                  複製日誌
                </button>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              所有查價請求、剪貼簿監聽與官方市集回傳資訊皆已同步寫入日誌檔案中。
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
          <button className="poe-btn" onClick={onClose}>
            取消
          </button>
          <button className="poe-btn poe-btn-primary" onClick={handleSave} disabled={saving}>
            <Check size={16} />
            儲存變更
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
