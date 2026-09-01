import { useEffect, useRef } from 'react';
import { poeApi } from '../services/api';
import { isTauri } from '../utils/tauri';

export interface PoeItemCopiedPayload {
  text?: string;
  timestamp?: number;
}

export interface UseClipboardSyncOptions {
  enabled?: boolean;
  intervalMs?: number;
  onItemDetected: (itemText: string) => void;
}

export function useClipboardSync({
  enabled = true,
  intervalMs = 800,
  onItemDetected
}: UseClipboardSyncOptions) {
  const lastTextRef = useRef<string>('');
  const onItemDetectedRef = useRef(onItemDetected);
  onItemDetectedRef.current = onItemDetected;

  useEffect(() => {
    if (!enabled) return;

    // 1. Desktop Tauri Environment: Push-based event listener (0ms latency, ~0% idle CPU)
    if (isTauri()) {
      let unmounted = false;
      let unlistenFn: (() => void) | undefined;

      import('@tauri-apps/api/event')
        .then(({ listen }) => {
          if (unmounted) return;
          listen<PoeItemCopiedPayload | string>('poe-item-copied', (event) => {
            const raw = event.payload;
            const text = typeof raw === 'string' ? raw : raw?.text;
            if (text && text.trim().length > 0 && text.trim() !== lastTextRef.current) {
              lastTextRef.current = text.trim();
              onItemDetectedRef.current(text);
            }
          })
            .then((unlisten) => {
              if (unmounted) {
                unlisten();
              } else {
                unlistenFn = unlisten;
              }
            })
            .catch(() => {});
        })
        .catch(() => {});

      return () => {
        unmounted = true;
        if (unlistenFn) {
          unlistenFn();
        }
      };
    }

    // 2. Web Browser Fallback: Periodic polling
    const timer = setInterval(async () => {
      try {
        const latest = await poeApi.getLatestClipboard();
        if (
          latest?.text &&
          latest.text.trim().length > 0 &&
          latest.text.trim() !== lastTextRef.current
        ) {
          lastTextRef.current = latest.text.trim();
          onItemDetectedRef.current(latest.text);
        }
      } catch {
        // Ignore polling errors
      }
    }, intervalMs);

    return () => {
      clearInterval(timer);
    };
  }, [enabled, intervalMs]);
}

export default useClipboardSync;
