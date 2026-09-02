import React, { useState, useEffect, useCallback, Suspense, lazy, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { PriceChecker } from './components/PriceChecker';
import { ErrorBoundary } from './components/ErrorBoundary';
import { poeApi } from './services/api';
import { useClipboardSync } from './hooks/useClipboardSync';
import { useSettings } from './hooks/useSettings';
import { AppStateProvider } from './context/AppStateProvider';

import { evaluateMapDanger } from './domain/mapMod/dangerEvaluator';
import { DEFAULT_MAP_DANGER_CONFIG } from './domain/mapMod/dangerPresets';
import { playDangerAlertSound } from './application/audio/alertSound';

// Dynamic Lazy-Loaded Modules for Chunk Optimization
const WealthTracker = lazy(() => import('./components/WealthTracker'));
const MappingTracker = lazy(() => import('./components/mapping/MappingTracker'));
const BuildCalculator = lazy(() => import('./components/BuildCalculator'));
const ActLevelingGuide = lazy(() => import('./components/ActLevelingGuide'));
const AtlasStrategyHub = lazy(() => import('./components/AtlasStrategyHub'));
const MapModHub = lazy(() => import('./components/MapModHub'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));

const LoadingFallback: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-gold)', gap: '10px' }}>
    <div className="spin" style={{ width: '20px', height: '20px', border: '2px solid rgba(200,170,110,0.3)', borderTopColor: 'var(--text-gold)', borderRadius: '50%' }} />
    <span style={{ fontSize: '0.9rem' }}>正在載入模組...</span>
  </div>
);

export const App: React.FC = () => {
  const { settings, activeLeague, divineRate, refreshSettings, refreshDivineRate } = useSettings();
  const [activeTab, setActiveTab] = useState<'price' | 'wealth' | 'mapping' | 'build' | 'acts' | 'atlas' | 'mapmod'>('price');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [pastedText, setPastedText] = useState<string>('');

  const hotkey = settings.hotkey || 'ctrl+c+d';

  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    const timer = setTimeout(() => {
      setToastMsg(null);
    }, 3500);
    const timerNode = timer as unknown as { unref?: () => void };
    timerNode.unref?.();
    toastTimerRef.current = timer;
  }, []);

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

  // Hook for in-game Ctrl+C clipboard polling without browser focus
  useClipboardSync({
    enabled: true,
    intervalMs: 600,
    onItemDetected: handleItemDetected
  });

  // Global Hotkey Listener (when browser has focus)
  useEffect(() => {
    const handleKeyDown = async (e: KeyboardEvent) => {
      const norm = hotkey.toLowerCase();
      const hasCtrl = norm.includes('ctrl') || norm.includes('cmd');
      const hasAlt = norm.includes('alt');
      const hasShift = norm.includes('shift');

      const ctrlActive = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      let isTriggered = false;

      // Handle default "ctrl+c+d" or custom shortcuts (Only trigger when 'd' key is pressed)
      if (hasCtrl && ctrlActive) {
        if (norm.includes('c') && norm.includes('d')) {
          if (key === 'd') isTriggered = true;
        } else if (norm.includes(key) && key !== 'c') {
          isTriggered = true;
        }
      } else if (hasAlt && e.altKey && norm.includes(key)) {
        isTriggered = true;
      } else if (hasShift && e.shiftKey && norm.includes(key)) {
        isTriggered = true;
      }

      if (isTriggered) {
        e.preventDefault();
        setActiveTab('price');
        try {
          // Attempt reading via server backend OS clipboard first, fallback to browser clipboard API
          const serverRes = await poeApi.readClipboard();
          if (serverRes?.text) {
            setPastedText(serverRes.text);
            showToast(`快捷鍵觸發 (${hotkey.toUpperCase()})：已自動讀取裝備並完成查價！`);
            return;
          }

          const text = await navigator.clipboard.readText();
          if (text) {
            setPastedText(text);
            showToast(`快捷鍵觸發 (${hotkey.toUpperCase()})：已自動讀取裝備並完成查價！`);
          } else {
            showToast(`快捷鍵觸發 (${hotkey.toUpperCase()})：剪貼簿中無文字內容`);
          }
        } catch {
          showToast('快捷鍵觸發：已為您開啟裝備查價工具！');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hotkey, showToast]);

  const handleSettingsUpdated = async () => {
    await refreshSettings();
    await refreshDivineRate();
  };

  return (
    <ErrorBoundary>
      <AppStateProvider>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />

          <main style={{ flex: 1 }}>
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                {activeTab === 'price' ? (
                  <PriceChecker league={activeLeague} onShowToast={showToast} externalText={pastedText} />
                ) : activeTab === 'build' ? (
                  <BuildCalculator league={activeLeague} onShowToast={showToast} />
                ) : activeTab === 'acts' ? (
                  <ActLevelingGuide onShowToast={showToast} />
                ) : activeTab === 'atlas' ? (
                  <AtlasStrategyHub league={activeLeague} divineRate={divineRate} onShowToast={showToast} />
                ) : activeTab === 'mapping' ? (
                  <MappingTracker league={activeLeague} divineRate={divineRate} onShowToast={showToast} />
                ) : activeTab === 'mapmod' ? (
                  <MapModHub onShowToast={showToast} />
                ) : (
                  <WealthTracker league={activeLeague} onShowToast={showToast} />
                )}
              </Suspense>
            </ErrorBoundary>
          </main>

          <Suspense fallback={null}>
            {isSettingsOpen && (
              <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                onShowToast={showToast}
                onSettingsUpdated={handleSettingsUpdated}
              />
            )}
          </Suspense>

          {/* Global Toast Notification */}
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
