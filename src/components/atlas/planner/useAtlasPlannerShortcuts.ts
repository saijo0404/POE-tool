import { useEffect } from 'react';

interface UseAtlasPlannerShortcutsProps {
  handleUndo: () => void;
  handleRedo: () => void;
  handleResetView: () => void;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function useAtlasPlannerShortcuts({
  handleUndo,
  handleRedo,
  handleResetView,
  setZoom,
  isFullscreen,
  setIsFullscreen
}: UseAtlasPlannerShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) handleRedo(); else handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if (e.code === 'Space' || e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleResetView();
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(prev => Math.min(prev * 1.12, 2.5));
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom(prev => Math.max(prev * 0.88, 0.15));
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsFullscreen(prev => !prev);
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, handleResetView, setZoom, isFullscreen, setIsFullscreen]);
}
