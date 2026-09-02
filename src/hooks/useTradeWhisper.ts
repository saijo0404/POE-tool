import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  TradeWhisper,
  TradeWhisperAction,
  TradeQuickResponseConfig
} from '../domain/tradeWhisper/types';
import { parseTradeWhisper } from '../domain/tradeWhisper/whisperParser';
import {
  buildInviteCommand,
  buildWaitCommand,
  buildTradeCommand,
  buildThanksAndKickCommands,
  buildHideoutCommand
} from '../domain/tradeWhisper/commandBuilder';
import { playTradeWhisperSound } from '../application/audio/whisperSound';
import {
  loadTradeWhisperConfig,
  saveTradeWhisperConfig,
  loadTradeWhisperHistory,
  saveTradeWhisperHistory
} from '../infrastructure/storage/tradeWhisperStorage';
import { poeApi } from '../services/api';
import { isTauri } from '../utils/tauri';

export function useTradeWhisper() {
  const [config, setConfig] = useState<TradeQuickResponseConfig>(loadTradeWhisperConfig);
  const [whispers, setWhispers] = useState<TradeWhisper[]>([]);
  const [history, setHistory] = useState<TradeWhisper[]>(loadTradeWhisperHistory);
  const [activeWhisperId, setActiveWhisperId] = useState<string | null>(null);

  const configRef = useRef(config);
  configRef.current = config;

  const handleNewWhisper = useCallback((raw: string) => {
    const parsed = parseTradeWhisper(raw);
    if (!parsed) return;

    setWhispers(prev => {
      if (prev.some(w => w.sender === parsed.sender && w.itemName === parsed.itemName && Date.now() - w.timestamp < 15000)) {
        return prev;
      }
      return [parsed, ...prev];
    });

    setActiveWhisperId(parsed.id);
    setHistory(prev => {
      const next = [parsed, ...prev.filter(h => h.id !== parsed.id)];
      saveTradeWhisperHistory(next);
      return next;
    });

    if (configRef.current.soundAlertEnabled) {
      playTradeWhisperSound();
    }
  }, []);

  const handleAction = useCallback(async (whisper: TradeWhisper, action: TradeWhisperAction): Promise<boolean> => {
    let success = false;
    if (action === 'invite') {
      const cmd = buildInviteCommand(whisper.sender);
      success = await poeApi.triggerInGameCommand(cmd);
      setWhispers(prev => prev.map(w => w.id === whisper.id ? { ...w, status: 'invited' } : w));
    } else if (action === 'wait') {
      const cmd = buildWaitCommand(whisper.sender, configRef.current.waitMessageTemplate);
      success = await poeApi.triggerInGameCommand(cmd);
      setWhispers(prev => prev.map(w => w.id === whisper.id ? { ...w, status: 'waited' } : w));
    } else if (action === 'trade') {
      const cmd = buildTradeCommand(whisper.sender);
      success = await poeApi.triggerInGameCommand(cmd);
      setWhispers(prev => prev.map(w => w.id === whisper.id ? { ...w, status: 'traded' } : w));
    } else if (action === 'thanksAndKick') {
      const cmds = buildThanksAndKickCommands(whisper.sender, configRef.current.thanksMessageTemplate);
      success = await poeApi.triggerInGameCommand(cmds.join('\n'));
      setWhispers(prev => prev.map(w => w.id === whisper.id ? { ...w, status: 'completed' } : w));
    } else if (action === 'hideout') {
      const cmd = buildHideoutCommand();
      success = await poeApi.triggerInGameCommand(cmd);
    } else if (action === 'dismiss') {
      setWhispers(prev => prev.filter(w => w.id !== whisper.id));
      success = true;
    }
    return success;
  }, []);

  const updateConfig = useCallback((partial: Partial<TradeQuickResponseConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...partial };
      saveTradeWhisperConfig(next);
      return next;
    });
  }, []);

  const dismissWhisper = useCallback((id: string) => {
    setWhispers(prev => prev.filter(w => w.id !== id));
  }, []);

  // Listen to Tauri poe-trade-whisper event
  useEffect(() => {
    if (!isTauri()) return;
    let unmounted = false;
    let unlisten: (() => void) | undefined;

    import('@tauri-apps/api/event').then(({ listen }) => {
      if (unmounted) return;
      listen<{ text?: string } | string>('poe-trade-whisper', (ev) => {
        const text = typeof ev.payload === 'string' ? ev.payload : ev.payload?.text;
        if (text) handleNewWhisper(text);
      }).then(u => { unlisten = u; });
    }).catch(() => {});

    return () => {
      unmounted = true;
      if (unlisten) unlisten();
    };
  }, [handleNewWhisper]);

  const activeWhisper = whispers.find(w => w.id === activeWhisperId) || whispers[0] || null;

  return {
    whispers,
    activeWhisper,
    activeWhisperId,
    history,
    config,
    setActiveWhisperId,
    handleNewWhisper,
    handleAction,
    dismissWhisper,
    updateConfig
  };
}
