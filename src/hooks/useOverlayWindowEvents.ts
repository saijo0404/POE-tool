import { useEffect, useRef } from 'react';
import { poeApi } from '../services/api';
import { isTauri } from '../utils/tauri';

interface UseOverlayWindowEventsOptions {
  autoClose: boolean;
  pinned: boolean;
  handleCloseOverlay: () => Promise<void>;
  onLoadItem: (text: string) => void | Promise<void>;
}

export function useOverlayWindowEvents({
  autoClose,
  pinned,
  handleCloseOverlay,
  onLoadItem
}: UseOverlayWindowEventsOptions) {
  const onLoadItemRef = useRef(onLoadItem);
  onLoadItemRef.current = onLoadItem;

  // Register global JS hook for direct zero-latency invocation from Rust
  useEffect(() => {
    (window as unknown as { __POE_LOAD_ITEM?: (text: string) => void }).__POE_LOAD_ITEM = (text: string) => {
      onLoadItemRef.current(text);
    };
    return () => {
      delete (window as unknown as { __POE_LOAD_ITEM?: (text: string) => void }).__POE_LOAD_ITEM;
    };
  }, []);

  // Esc key and Window Blur listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleCloseOverlay();
      }
    };

    const handleBlur = () => {
      if (autoClose && !pinned) {
        handleCloseOverlay();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
    };
  }, [autoClose, pinned, handleCloseOverlay]);

  // Listen to Tauri events and focus checks for new item queries
  useEffect(() => {
    if (!isTauri()) return;
    let unmounted = false;
    const unlistens: Array<() => void> = [];

    const checkPendingOrClipboard = () => {
      poeApi.getPendingOverlayItem().then(item => {
        if (item && !unmounted) {
          onLoadItemRef.current(item);
        }
      }).catch(() => {});
    };

    checkPendingOrClipboard();
    const handleFocus = () => checkPendingOrClipboard();
    window.addEventListener('focus', handleFocus);

    import('@tauri-apps/api/event').then(({ listen }) => {
      if (unmounted) return;
      listen<string>('overlay-show-item', (ev) => {
        if (ev.payload) onLoadItemRef.current(ev.payload);
      }).then(u => unlistens.push(u));

      listen<{ text?: string }>('poe-item-copied', (ev) => {
        const t = typeof ev.payload === 'string' ? ev.payload : ev.payload?.text;
        if (t) onLoadItemRef.current(t);
      }).then(u => unlistens.push(u));
    });

    return () => {
      unmounted = true;
      window.removeEventListener('focus', handleFocus);
      unlistens.forEach(u => u());
    };
  }, []);
}
