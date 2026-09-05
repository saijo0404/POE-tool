import { useState, useCallback, useRef } from 'react';

export interface UseToastNotificationReturn {
  toastMsg: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
}

export function useToastNotification(durationMs: number = 3500): UseToastNotificationReturn {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastMsg(null);
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    const timer = setTimeout(() => {
      setToastMsg(null);
    }, durationMs);
    const timerNode = timer as unknown as { unref?: () => void };
    timerNode.unref?.();
    toastTimerRef.current = timer;
  }, [durationMs]);

  return { toastMsg, showToast, clearToast };
}
