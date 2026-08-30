import { useEffect, useRef, useCallback } from 'react';

export function calculateCenter(width: number, height: number) {
  const fitZoomX = (width * 0.92) / 2900;
  const fitZoomY = (height * 0.92) / 2500;
  const fitZoom = Math.min(fitZoomX, fitZoomY);
  const targetZoom = Number(Math.min(Math.max(fitZoom, 0.12), 0.45).toFixed(2));
  return {
    zoom: targetZoom,
    pan: {
      x: Math.round(width / 2),
      y: Math.round(height / 2 + 1150 * targetZoom)
    }
  };
}

export function useAtlasCanvasCentering(
  containerRef: React.RefObject<HTMLDivElement | null>,
  onViewInit?: (view: { zoom: number; pan: { x: number; y: number } }) => void,
  onResetView?: () => void
) {
  const prevSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  useEffect(() => {
    if (!containerRef.current || !onViewInit) return;

    const handleResize = (width: number, height: number) => {
      if (width <= 50 || height <= 50) return;
      const dw = Math.abs(width - prevSizeRef.current.w);
      const dh = Math.abs(height - prevSizeRef.current.h);
      if (prevSizeRef.current.w === 0 || dw > 30 || dh > 30) {
        prevSizeRef.current = { w: width, h: height };
        const center = calculateCenter(width, height);
        onViewInit(center);
      }
    };

    const { clientWidth, clientHeight } = containerRef.current;
    if (clientWidth > 50 && clientHeight > 50) {
      handleResize(clientWidth, clientHeight);
    }

    const obs = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        handleResize(width, height);
      }
    });

    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [containerRef, onViewInit]);

  const handleManualReset = useCallback(() => {
    if (containerRef.current && onViewInit) {
      const { clientWidth, clientHeight } = containerRef.current;
      if (clientWidth > 50 && clientHeight > 50) {
        const center = calculateCenter(clientWidth, clientHeight);
        onViewInit(center);
        return;
      }
    }
    if (onResetView) {
      onResetView();
    }
  }, [containerRef, onViewInit, onResetView]);

  return { handleManualReset };
}
