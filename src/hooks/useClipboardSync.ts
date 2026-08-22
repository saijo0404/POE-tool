import { useEffect, useRef } from 'react';
import { poeApi } from '../services/api';

interface UseClipboardSyncOptions {
  enabled?: boolean;
  intervalMs?: number;
  onItemDetected: (itemText: string) => void;
}

export function useClipboardSync({
  enabled = true,
  intervalMs = 800,
  onItemDetected
}: UseClipboardSyncOptions) {
  const lastTimestampRef = useRef<number>(0);
  const lastTextRef = useRef<string>('');
  const onItemDetectedRef = useRef(onItemDetected);
  onItemDetectedRef.current = onItemDetected;

  useEffect(() => {
    if (!enabled) return;

    const timer = setInterval(async () => {
      try {
        const latest = await poeApi.getLatestClipboard();
        if (
          latest?.text &&
          latest.timestamp &&
          latest.timestamp > lastTimestampRef.current &&
          latest.text.trim() !== lastTextRef.current
        ) {
          lastTimestampRef.current = latest.timestamp;
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
