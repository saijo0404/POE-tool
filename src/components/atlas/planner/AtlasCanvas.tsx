import React, { useRef, useMemo } from 'react';
import type { AtlasNode } from '../../../domain/atlas/types';
import { ATLAS_TREE_NODES_DATA, ATLAS_NODES_MAP } from '../../../domain/atlas/atlasTreeDataset';
import { AtlasCanvasDefs } from './AtlasCanvasDefs';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface AtlasCanvasProps {
  allocatedNodeIds: Set<string>;
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
  onNodeHover: (node: AtlasNode | null) => void;
  onZoomChange: (newZoom: number) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  essence: '#38bdf8', ambush: '#f59e0b', harvest: '#22c55e', expedition: '#ef4444',
  legion: '#a855f7', delirium: '#94a3b8', scarab: '#ec4899', boss: '#eab308'
};

export const AtlasCanvas: React.FC<AtlasCanvasProps> = ({
  allocatedNodeIds,
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
  onNodeHover,
  onZoomChange
}) => {
  const svgRef = useRef<SVGSVGElement>(null);

  // Pre-calculate unique deduplicated undirected edges
  const uniqueEdges = useMemo(() => {
    const edgeMap = new Map<string, { id: string; source: AtlasNode; target: AtlasNode }>();
    ATLAS_TREE_NODES_DATA.forEach(node => {
      node.connections.forEach(tId => {
        const targetNode = ATLAS_NODES_MAP[tId];
        if (!targetNode) return;
        const edgeKey = node.id < tId ? `${node.id}-${tId}` : `${tId}-${node.id}`;
        if (!edgeMap.has(edgeKey)) {
          edgeMap.set(edgeKey, { id: edgeKey, source: node, target: targetNode });
        }
      });
    });
    return Array.from(edgeMap.values());
  }, []);

  const isMatching = (node: AtlasNode): boolean => {
    if (selectedCategory !== 'all' && node.category !== selectedCategory) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return node.name.toLowerCase().includes(q) || node.nameEn.toLowerCase().includes(q) ||
      node.description.toLowerCase().includes(q) || node.stats.some(s => s.toLowerCase().includes(q));
  };

  const getNodeFill = (node: AtlasNode, isAlloc: boolean, isMatch: boolean) => {
    if (node.type === 'start') return '#38bdf8';
    if (node.type === 'keystone') return isAlloc ? 'url(#keystoneAllocGrad)' : 'url(#keystoneUnallocGrad)';
    if (isAlloc) return CATEGORY_COLORS[node.category] || '#f3d179';
    return isMatch ? '#334155' : '#1e293b';
  };

  return (
    <div style={{ flex: 1, position: 'relative', background: 'radial-gradient(ellipse at 50% 40%, #0d1424 0%, #05070b 100%)', overflow: 'hidden' }}>
      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%', cursor: isDragging ? 'grabbing' : 'grab', userSelect: 'none' }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <AtlasCanvasDefs />

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Background Concentric Guides */}
          <circle cx="0" cy="-1100" r="900" fill="none" stroke="rgba(200, 170, 110, 0.04)" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="0" cy="-1100" r="600" fill="none" stroke="rgba(200, 170, 110, 0.06)" strokeWidth="1" />
          <circle cx="0" cy="-1100" r="300" fill="none" stroke="rgba(200, 170, 110, 0.08)" strokeWidth="1" strokeDasharray="4 4" />

          {/* 1. Base Layer: Unallocated Lines */}
          <g opacity={0.35}>
            {uniqueEdges.map(edge => {
              const isAlloc = allocatedNodeIds.has(edge.source.id) && allocatedNodeIds.has(edge.target.id);
              if (isAlloc) return null; // Rendered in highlighted layer
              return (
                <line
                  key={edge.id}
                  x1={edge.source.x}
                  y1={edge.source.y}
                  x2={edge.target.x}
                  y2={edge.target.y}
                  stroke="rgba(255, 255, 255, 0.16)"
                  strokeWidth={1.2}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* 2. Top Layer: Allocated Glowing Highlighted Lines */}
          <g>
            {uniqueEdges.map(edge => {
              const isAlloc = allocatedNodeIds.has(edge.source.id) && allocatedNodeIds.has(edge.target.id);
              if (!isAlloc) return null;
              return (
                <line
                  key={`alloc-${edge.id}`}
                  x1={edge.source.x}
                  y1={edge.source.y}
                  x2={edge.target.x}
                  y2={edge.target.y}
                  stroke="#fde047"
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  filter="url(#glowGoldEffect)"
                  opacity={0.95}
                />
              );
            })}
          </g>

          {/* 3. Nodes */}
          {ATLAS_TREE_NODES_DATA.map(node => {
            const isAlloc = allocatedNodeIds.has(node.id);
            const isMatch = isMatching(node);
            const isHov = hoveredNode?.id === node.id;
            const isKs = node.type === 'keystone';
            const isNot = node.type === 'notable';
            const isStart = node.type === 'start';
            const radius = isStart ? 16 : isKs ? 13 : isNot ? 8.5 : 4.5;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={e => onNodeClick(node, e)}
                onMouseEnter={() => onNodeHover(node)}
                onMouseLeave={() => onNodeHover(null)}
                style={{ cursor: 'pointer' }}
              >
                {(isAlloc || isHov) && (
                  <circle cx="0" cy="0" r={radius + 4} fill="none" stroke={isKs ? '#f59e0b' : '#38bdf8'} strokeWidth={1.8} opacity={isHov ? 0.95 : 0.65} filter="url(#glowGoldEffect)" />
                )}

                {isKs ? (
                  <polygon points={`0,-${radius} ${radius},0 0,${radius} -${radius},0`} fill={getNodeFill(node, isAlloc, isMatch)} stroke={isAlloc ? '#fef08a' : '#94a3b8'} strokeWidth={isAlloc ? 2 : 1.2} opacity={isMatch ? 1 : 0.2} />
                ) : (
                  <circle cx="0" cy="0" r={radius} fill={getNodeFill(node, isAlloc, isMatch)} stroke={isAlloc ? '#fef08a' : isNot ? '#cbd5e1' : '#475569'} strokeWidth={isAlloc ? 1.8 : isNot ? 1.2 : 0.8} opacity={isMatch ? 1 : 0.2} />
                )}

                {(isKs || isNot || isStart) && (
                  <text x="0" y={isKs ? 4.5 : isStart ? 5 : 3.5} textAnchor="middle" fontSize={isKs ? '10px' : isStart ? '12px' : '7px'} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                    {isStart ? '🏛️' : isKs ? '⭐' : '•'}
                  </text>
                )}

                {(isKs || (isNot && zoom > 0.55) || isHov) && (
                  <text x="0" y={radius + 10} textAnchor="middle" fill={isAlloc ? 'var(--text-gold)' : isMatch ? '#e2e8f0' : '#64748b'} fontSize={isKs ? '9px' : '7.5px'} fontWeight={isAlloc ? 'bold' : 'normal'} style={{ pointerEvents: 'none', userSelect: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.95)' }}>
                    {node.name.split(' (')[0]}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0, 0, 0, 0.6)', padding: '4px', borderRadius: '6px' }}>
        <button type="button" className="poe-button-secondary" onClick={() => onZoomChange(Math.min(zoom + 0.1, 2.5))} style={{ padding: '4px', height: '26px', width: '26px' }} title="放大">
          <ZoomIn size={13} />
        </button>
        <button type="button" className="poe-button-secondary" onClick={() => onZoomChange(Math.max(zoom - 0.1, 0.15))} style={{ padding: '4px', height: '26px', width: '26px' }} title="縮小">
          <ZoomOut size={13} />
        </button>
      </div>
    </div>
  );
};
