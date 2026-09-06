import React, { useState, useCallback, Suspense, lazy, useRef } from 'react';
import { Navbar, type AppTabType } from './components/Navbar';
import { Sidebar } from './components/navigation/Sidebar';
import { AppRouter } from './components/AppRouter';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useClipboardSync } from './hooks/useClipboardSync';
import { useSettings } from './hooks/useSettings';
import { useToastNotification } from './hooks/useToastNotification';
import { useGlobalHotkeys } from './hooks/useGlobalHotkeys';
import { AppStateProvider } from './context/AppStateProvider';
import { evaluateMapDanger } from './domain/mapMod/dangerEvaluator';
import { DEFAULT_MAP_DANGER_CONFIG } from './domain/mapMod/dangerPresets';
import { playDangerAlertSound } from './application/audio/alertSound';

const SettingsModal = lazy(() => import('./components/SettingsModal'));
const TradeWhisperModal = lazy(() => import('./components/whisper/TradeWhisperModal').then(m => ({ default: m.TradeWhisperModal })));

export const App: React.FC = () => {
  const { settings, activeLeague, divineRate, refreshSettings, refreshDivineRate } = useSettings();
  const [activeTab, setActiveTab] = useState<AppTabType>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isWhisperOpen, setIsWhisperOpen] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');

  const { toastMsg, showToast } = useToastNotification();
  const lastPastedTextRef = useRef<string>('');

  const handleItemDetected = useCallback((text: string) => {
    if (text.trim() === lastPastedTextRef.current.trim()) {
      return;
    }
    lastPastedTextRef.current = text.trim();
    setActiveTab('price');
    setPastedText(text);

    const cfg = settings.mapDangerConfig || DEFAULT_MAP_DANGER_CONFIG;
    const dangerRes = evaluateMapDanger(text, cfg);
    if (dangerRes.isMap && dangerRes.hasDanger) {
      if (cfg.soundAlertEnabled) {
        playDangerAlertSound();
      }
      showToast(`⚠️ 致命地圖警報：此地圖包含 ${dangerRes.matchedDangerMods.length + dangerRes.matchedCustomKeywords.length} 個流派危險詞綴！`);
    } else {
      showToast('🎮 遊戲中按 Ctrl+C：已自動帶入裝備並完成即時查價！');
    }
  }, [showToast, settings.mapDangerConfig]);

  useClipboardSync({
    enabled: true,
    intervalMs: 600,
    onItemDetected: handleItemDetected
  });

  useGlobalHotkeys({
    hotkey: settings.hotkey || 'ctrl+c+d',
    onTrigger: () => setActiveTab('price'),
    setPastedText,
    showToast
  });

  const handleSettingsUpdated = async () => {
    await refreshSettings();
    await refreshDivineRate();
  };

  return (
    <ErrorBoundary>
      <AppStateProvider>
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenSettings={() => setIsSettingsOpen(true)}
            onOpenTradeWhisper={() => setIsWhisperOpen(true)}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={() => setIsSidebarCollapsed(prev => !prev)}
          />

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
              onOpenTradeWhisper={() => setIsWhisperOpen(true)}
              onShowToast={showToast}
            />

            <main style={{ flex: 1, overflowY: 'auto', background: '#0f1219' }}>
              <AppRouter
                activeTab={activeTab}
                activeLeague={activeLeague}
                divineRate={divineRate}
                pastedText={pastedText}
                showToast={showToast}
                onNavigate={setActiveTab}
                onOpenTradeWhisper={() => setIsWhisperOpen(true)}
              />
            </main>
          </div>

          <Suspense fallback={null}>
            {isSettingsOpen && (
              <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onShowToast={showToast}
                onSettingsUpdated={handleSettingsUpdated}
              />
            )}
            {isWhisperOpen && (
              <TradeWhisperModal
                isOpen={isWhisperOpen}
                onClose={() => setIsWhisperOpen(false)}
                onShowToast={showToast}
              />
            )}
          </Suspense>

          {toastMsg && (
            <div className="toast-notice">
              <span>{toastMsg}</span>
            </div>
          )}
        </div>
      </AppStateProvider>
    </ErrorBoundary>
  );
};

export default App;
