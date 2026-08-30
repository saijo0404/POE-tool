import { useState, useRef, useCallback } from 'react';

interface UseAtlasCanvasPanZoomProps {
  isFullscreen: boolean;
}

export function useAtlasCanvasPanZoom({ isFullscreen }: UseAtlasCanvasPanZoomProps) {
  const [zoom, setZoom] = useState<number>(0.21);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 425, y: 532 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState<number>(0);
  const dragOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOriginRef.current = { x: e.clientX, y: e.clientY };
    setDragDistance(0);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setDragDistance(Math.hypot(e.clientX - dragOriginRef.current.x, e.clientY - dragOriginRef.current.y));
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.88;
    setZoom(prev => Math.min(Math.max(prev * factor, 0.15), 2.5));
  };

  const handleResetView = useCallback(() => {
    let w = isFullscreen ? window.innerWidth - 320 : 780;
    let h = isFullscreen ? window.innerHeight - 190 : 580;
    if (canvasContainerRef.current) {
      const { clientWidth, clientHeight } = canvasContainerRef.current;
      if (clientWidth > 350 && clientHeight > 50) {
        w = clientWidth - 320;
        h = clientHeight;
      }
    }
    const fitZoom = Math.min((w * 0.92) / 2900, (h * 0.92) / 2500);
    const targetZoom = Number(Math.min(Math.max(fitZoom, 0.12), 0.45).toFixed(2));
    setZoom(targetZoom);
    setPan({ x: Math.round(w / 2), y: Math.round(h / 2 + 1150 * targetZoom) });
  }, [isFullscreen]);

  const handleViewInit = useCallback((view: { zoom: number; pan: { x: number; y: number } }) => {
    setZoom(view.zoom);
    setPan(view.pan);
  }, []);

  return {
    zoom,
    setZoom,
    pan,
    setPan,
    isDragging,
    dragDistance,
    canvasContainerRef,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp: () => setIsDragging(false),
    handleWheel,
    handleResetView,
    handleViewInit
  };
}
