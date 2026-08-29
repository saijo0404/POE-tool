import React, { useRef, useMemo, useEffect } from 'react';
import type { AtlasNode } from '../../../domain/atlas/types';
import { ATLAS_TREE_NODES_DATA, ATLAS_NODES_MAP } from '../../../domain/atlas/atlasTreeDataset';
import { AtlasCanvasDefs } from './AtlasCanvasDefs';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface AtlasCanvasProps {
  nodes?: AtlasNode[];
  allocatedNodeIds: Set<string>;
  previewNodeIds?: Set<string>;
  hoveredNode: AtlasNode | null;
  searchQuery: string;
  selectedCategory: string;
  zoom: number;
  pan: { x: number; y: number };
  isDragging: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onWheel: (e: React.WheelEvent) => void;
  onNodeClick: (node: AtlasNode, e: React.MouseEvent) => void;
  onNodeDoubleClick?: (node: AtlasNode, e: React.MouseEvent) => void;
  onNodeHover: (node: AtlasNode | null) => void;
  onZoomChange: (newZoom: number) => void;
  onResetView?: () => void;
  onViewInit?: (view: { zoom: number; pan: { x: number; y: number } }) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  essence: '#38bdf8',
  ambush: '#f59e0b',
  harvest: '#22c55e',
  expedition: '#ef4444',
  legion: '#a855f7',
  delirium: '#94a3b8',
  ritual: '#dc2626',
  breach: '#8b5cf6',
  beyond: '#e11d48',
  blight: '#ea580c',
  scarab: '#ec4899',
  boss: '#eab308',
  map: '#67e8f9',
  bestiary: '#14b8a6',
  torment: '#2dd4bf',
  general: '#f3d179',
  custom: '#a78bfa'
};

export const AtlasCanvas: React.FC<AtlasCanvasProps> = ({
  nodes,
  allocatedNodeIds,
  previewNodeIds = new Set(),
  hoveredNode,
  searchQuery,
  selectedCategory,
  zoom,
  pan,
  isDragging,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onWheel,
  onNodeClick,
  onNodeDoubleClick,
  onNodeHover,
  onZoomChange,
  onResetView,
  onViewInit
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const prevSizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });

  // Calculate centered zoom and pan based on actual container width & height
  const calculateCenter = (width: number, height: number) => {
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
  };

  // Auto-center whenever container size changes (initial load, fullscreen toggle, window resize)
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
  }, [onViewInit]);

  const handleManualReset = () => {
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
  };

  const currentNodes = useMemo(() => nodes || ATLAS_TREE_NODES_DATA, [nodes]);
  const currentNodesMap = useMemo(() => {
    const map = new Map<string, AtlasNode>();
    currentNodes.forEach(n => map.set(n.id, n));
    return map;
  }, [currentNodes]);

  // Pre-calculate unique deduplicated undirected edges
  const uniqueEdges = useMemo(() => {
    const edgeMap = new Map<string, { id: string; source: AtlasNode; target: AtlasNode }>();
    currentNodes.forEach(node => {
      node.connections.forEach(tId => {
        const targetNode = currentNodesMap.get(tId) || ATLAS_NODES_MAP[tId];
        if (!targetNode) return;
        const edgeKey = node.id < tId ? `${node.id}-${tId}` : `${tId}-${node.id}`;
        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, { id: edgeKey, source: node, target: targetNode });
        }
      });
    });
    return Array.from(edgeMap.values());
  }, [currentNodes, currentNodesMap]);

  const isMatching = (node: AtlasNode): boolean => {
    if (selectedCategory !== 'all' && node.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      node.name.toLowerCase().includes(q) ||
      node.nameEn.toLowerCase().includes(q) ||
      node.description.toLowerCase().includes(q) ||
      node.stats.some(s => s.toLowerCase().includes(q))
    );
  };

  const getNodeFill = (node: AtlasNode, isAlloc: boolean, isPreview: boolean, isMatch: boolean) => {
    if (node.type === 'start') return 'url(#originGrad)';
    if (node.type === 'keystone') return isAlloc ? 'url(#keystoneAllocGrad)' : isPreview ? '#0284c7' : 'url(#keystoneUnallocGrad)';
    if (isAlloc) return CATEGORY_COLORS[node.category] || '#f3d179';
    if (isPreview) return '#0284c7';
    return isMatch ? '#334155' : '#1e293b';
  };

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        position: 'relative',
        background: 'radial-gradient(ellipse at 50% 40%, #0d1424 0%, #060910 60%, #020306 100%)',
        overflow: 'hidden'
      }}
    >
      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
        onDoubleClick={e => {
          if (e.target === svgRef.current) {
            handleManualReset();
          }
        }}
      >
        <AtlasCanvasDefs />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Background Celestial Concentric Guides & Constellation Axes */}
          <circle cx="0" cy="-1100" r="1400" fill="none" stroke="rgba(200, 170, 110, 0.03)" strokeWidth="1" strokeDasharray="8 8" />
          <circle cx="0" cy="-1100" r="1050" fill="none" stroke="rgba(200, 170, 110, 0.05)" strokeWidth="1.2" strokeDasharray="6 6" />
          <circle cx="0" cy="-1100" r="700" fill="none" stroke="rgba(200, 170, 110, 0.07)" strokeWidth="1.2" />
          <circle cx="0" cy="-1100" r="350" fill="none" stroke="rgba(200, 170, 110, 0.09)" strokeWidth="1" strokeDasharray="4 4" />
          <line x1="-1500" y1="-1100" x2="1500" y2="-1100" stroke="rgba(200, 170, 110, 0.04)" strokeWidth="1" strokeDasharray="4 8" />
          <line x1="0" y1="-2600" x2="0" y2="400" stroke="rgba(200, 170, 110, 0.04)" strokeWidth="1" strokeDasharray="4 8" />

          {/* ================= 1. Base Layer: Unallocated Constellation Lines ================= */}
          <g opacity={0.35}>
            {uniqueEdges.map(edge => {
              const isAlloc = allocatedNodeIds.has(edge.source.id) && allocatedNodeIds.has(edge.target.id);
              if (isAlloc) return null; // Rendered in highlighted golden layer
              return (
                <line
                  key={`unalloc-${edge.id}`}
                  x1={edge.source.x}
                  y1={edge.source.y}
                  x2={edge.target.x}
                  y2={edge.target.y}
                  stroke="rgba(148, 163, 184, 0.25)"
                  strokeWidth={1.3}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* ================= 2. Middle Layer: Hover Preview Pulsing Paths ================= */}
          {previewNodeIds.size > 0 && (
            <g>
              {uniqueEdges.map(edge => {
                const sAlloc = allocatedNodeIds.has(edge.source.id);
                const tAlloc = allocatedNodeIds.has(edge.target.id);
                const sPrev = previewNodeIds.has(edge.source.id);
                const tPrev = previewNodeIds.has(edge.target.id);

                // Preview edge connects preview nodes or connects preview node to an allocated node
                const isPreviewEdge = (sPrev && tPrev) || (sAlloc && tPrev) || (tAlloc && sPrev);
                if (!isPreviewEdge) return null;

                return (
                  <line
                    key={`prev-${edge.id}`}
                    x1={edge.source.x}
                    y1={edge.source.y}
                    x2={edge.target.x}
                    y2={edge.target.y}
                    stroke="#38bdf8"
                    strokeWidth={3}
                    strokeDasharray="5 3"
                    strokeLinecap="round"
                    filter="url(#glowCyanPreview)"
                    opacity={0.9}
                  />
                );
              })}
            </g>
          )}

          {/* ================= 3. Top Layer: Allocated Dual-Layer Golden Energy Beams ================= */}
          <g>
            {uniqueEdges.map(edge => {
              const isAlloc = allocatedNodeIds.has(edge.source.id) && allocatedNodeIds.has(edge.target.id);
              if (!isAlloc) return null;

              return (
                <React.Fragment key={`alloc-beam-${edge.id}`}>
                  {/* Outer Glowing Energy Beam */}
                  <line
                    x1={edge.source.x}
                    y1={edge.source.y}
                    x2={edge.target.x}
                    y2={edge.target.y}
                    stroke="#eab308"
                    strokeWidth={4.2}
                    strokeLinecap="round"
                    filter="url(#glowGoldBeam)"
                    opacity={0.88}
                  />
                  {/* Inner Intense Golden Core */}
                  <line
                    x1={edge.source.x}
                    y1={edge.source.y}
                    x2={edge.target.x}
                    y2={edge.target.y}
                    stroke="#fffbeb"
                    strokeWidth={1.8}
                    strokeLinecap="round"
                    opacity={0.98}
                  />
                </React.Fragment>
              );
            })}
          </g>

          {/* ================= 4. Nodes ================= */}
          {currentNodes.map(node => {
            const isAlloc = allocatedNodeIds.has(node.id);
            const isPreview = previewNodeIds.has(node.id);
            const isMatch = isMatching(node);
            const isHov = hoveredNode?.id === node.id;
            const isKs = node.type === 'keystone';
            const isNot = node.type === 'notable';
            const isStart = node.type === 'start';
            const radius = isStart ? 17 : isKs ? 14 : isNot ? 9 : 4.8;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={e => onNodeClick(node, e)}
                onDoubleClick={e => onNodeDoubleClick?.(node, e)}
                onMouseEnter={() => onNodeHover(node)}
                onMouseLeave={() => onNodeHover(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Search Match Halo Pulse */}
                {searchQuery.trim() && isMatch && (
                  <circle
                    cx="0"
                    cy="0"
                    r={radius + 6}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    filter="url(#glowSearchMatch)"
                    opacity={0.9}
                  />
                )}

                {/* Node Outer Halo (Allocated / Hovered / Preview) */}
                {(isAlloc || isHov || isPreview) && (
                  <circle
                    cx="0"
                    cy="0"
                    r={radius + (isStart ? 5 : isKs ? 4.5 : isNot ? 3.5 : 2.5)}
                    fill="none"
                    stroke={isStart ? '#38bdf8' : isPreview ? '#38bdf8' : isKs ? '#f59e0b' : '#fde047'}
                    strokeWidth={isHov ? 2.4 : 1.8}
                    opacity={isHov ? 0.98 : isPreview ? 0.85 : 0.7}
                    filter={isStart || isPreview ? 'url(#glowCyanPreview)' : 'url(#glowGoldEffect)'}
                  />
                )}

                {/* Keystone Diamond / Octagon Frame vs Standard Disc */}
                {isKs ? (
                  <polygon
                    points={`0,-${radius * 1.15} ${radius * 1.15},0 0,${radius * 1.15} -${radius * 1.15},0`}
                    fill={getNodeFill(node, isAlloc, isPreview, isMatch)}
                    stroke={isAlloc ? '#fef08a' : isPreview ? '#7dd3fc' : '#94a3b8'}
                    strokeWidth={isAlloc ? 2.4 : 1.4}
                    opacity={isMatch ? 1 : 0.22}
                  />
                ) : (
                  <circle
                    cx="0"
                    cy="0"
                    r={radius}
                    fill={getNodeFill(node, isAlloc, isPreview, isMatch)}
                    stroke={isAlloc ? '#fef08a' : isPreview ? '#7dd3fc' : isNot ? '#cbd5e1' : '#475569'}
                    strokeWidth={isAlloc ? 2 : isNot ? 1.4 : 0.9}
                    opacity={isMatch ? 1 : 0.22}
                  />
                )}

                {/* Inner Icon / Symbol */}
                {(isKs || isNot || isStart) && (
                  <text
                    x="0"
                    y={isKs ? 4.5 : isStart ? 5.5 : 3.5}
                    textAnchor="middle"
                    fontSize={isKs ? '11px' : isStart ? '13px' : '7.5px'}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {isStart ? '🏛️' : isKs ? '⭐' : '•'}
                  </text>
                )}

                {/* Node Label Text on Canvas */}
                {(isKs || (isNot && zoom > 0.5) || isStart || isHov) && (
                  <text
                    x="0"
                    y={radius + (isStart ? 14 : 11)}
                    textAnchor="middle"
                    fill={isAlloc ? '#fde047' : isPreview ? '#38bdf8' : isMatch ? '#e2e8f0' : '#64748b'}
                    fontSize={isStart ? '10px' : isKs ? '9px' : '7.5px'}
                    fontWeight={isAlloc || isStart || isKs ? 'bold' : 'normal'}
                    style={{
                      pointerEvents: 'none',
                      userSelect: 'none',
                      textShadow: '0 1px 4px rgba(0,0,0,0.95), 0 0 2px #000'
                    }}
                  >
                    {isStart ? '輿圖起點 (Atlas Origin)' : node.name.split(' (')[0]}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Shortcut Hint Bar */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        right: '12px',
        background: 'rgba(10, 15, 26, 0.75)',
        border: '1px solid rgba(200, 170, 110, 0.2)',
        borderRadius: '6px',
        padding: '3px 8px',
        fontSize: '0.68rem',
        color: 'var(--text-dim)',
        backdropFilter: 'blur(4px)',
        pointerEvents: 'none'
      }}>
        💡 空白鍵：重設視角 | Ctrl+Z：復原 | 雙擊節點：聚焦 | 滾輪：縮放
      </div>

      {/* Floating Canvas Controls Overlay */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        background: 'rgba(10, 15, 26, 0.75)',
        border: '1px solid rgba(200, 170, 110, 0.3)',
        padding: '6px',
        borderRadius: '6px',
        backdropFilter: 'blur(6px)',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.6)'
      }}>
        <button
          type="button"
          className="poe-button-secondary"
          onClick={() => onZoomChange(Math.min(zoom + 0.08, 2.5))}
          style={{ padding: '4px', height: '26px', width: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="放大 (+)"
        >
          <ZoomIn size={14} />
        </button>
        <button
          type="button"
          className="poe-button-secondary"
          onClick={() => onZoomChange(Math.max(zoom - 0.08, 0.15))}
          style={{ padding: '4px', height: '26px', width: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="縮小 (-)"
        >
          <ZoomOut size={14} />
        </button>
        <button
          type="button"
          className="poe-button-secondary"
          onClick={handleManualReset}
          style={{ padding: '4px', height: '26px', width: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          title="視角重設至置中 (空白鍵 / R)"
        >
          <RotateCcw size={13} />
        </button>
        <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', textAlign: 'center', marginTop: '2px', fontWeight: 'bold' }}>
          {Math.round(zoom * 100)}%
        </div>
      </div>
    </div>
  );
};
