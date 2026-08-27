import React, { useRef } from 'react';
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

  const getNodeFill = (node: AtlasNode, isAllocated: boolean, isMatched: boolean) => {
    if (node.type === 'keystone') return isAllocated ? 'url(#keystoneAllocGrad)' : 'url(#keystoneUnallocGrad)';
    if (node.type === 'start') return '#38bdf8';
    if (isAllocated) {
      if (node.category === 'essence') return '#38bdf8';
      if (node.category === 'ambush') return '#f59e0b';
      if (node.category === 'harvest') return '#22c55e';
      if (node.category === 'expedition') return '#ef4444';
      if (node.category === 'legion') return '#a855f7';
      if (node.category === 'delirium') return '#94a3b8';
      if (node.category === 'scarab') return '#ec4899';
      if (node.category === 'boss') return '#eab308';
      return '#f3d179';
    }
    return isMatched ? '#334155' : '#1e293b';
  };

  return (
    <div style={{ flex: 1, position: 'relative', background: '#07090e', overflow: 'hidden' }}>
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
          {/* Concentric Guide Circles */}
          <circle cx="0" cy="0" r="160" fill="none" stroke="rgba(200, 170, 110, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="0" cy="0" r="300" fill="none" stroke="rgba(200, 170, 110, 0.08)" strokeWidth="1" />
          <circle cx="0" cy="0" r="460" fill="none" stroke="rgba(200, 170, 110, 0.05)" strokeWidth="1" strokeDasharray="6 6" />

          {/* Connections */}
          {ATLAS_TREE_NODES_DATA.map(node =>
            node.connections.map(targetId => {
              const targetNode = ATLAS_NODES_MAP[targetId];
              if (!targetNode || node.numId > targetNode.numId) return null;
              const isLineAlloc = allocatedNodeIds.has(node.id) && allocatedNodeIds.has(targetNode.id);

              return (
                <line
                  key={`${node.id}-${targetNode.id}`}
                  x1={node.x}
                  y1={node.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke={isLineAlloc ? '#f3d179' : 'rgba(255, 255, 255, 0.12)'}
                  strokeWidth={isLineAlloc ? 3.5 : 1.5}
                  strokeLinecap="round"
                  filter={isLineAlloc ? 'url(#glowGoldEffect)' : undefined}
                  opacity={isLineAlloc ? 0.95 : 0.35}
                />
              );
            })
          )}

          {/* Nodes */}
          {ATLAS_TREE_NODES_DATA.map(node => {
            const isAlloc = allocatedNodeIds.has(node.id);
            const isMatch = isMatching(node);
            const isHov = hoveredNode?.id === node.id;
            const isKs = node.type === 'keystone';
            const radius = isKs ? 24 : node.type === 'notable' ? 18 : 12;

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                onClick={e => onNodeClick(node, e)}
                onMouseEnter={() => onNodeHover(node)}
                onMouseLeave={() => onNodeHover(null)}
                style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
              >
                {(isAlloc || isHov) && (
                  <circle
                    cx="0"
                    cy="0"
                    r={radius + 6}
                    fill="none"
                    stroke={isKs ? '#f59e0b' : '#38bdf8'}
                    strokeWidth="2"
                    opacity={isHov ? 0.9 : 0.6}
                    filter="url(#glowGoldEffect)"
                  />
                )}

                {isKs ? (
                  <polygon
                    points={`0,-${radius} ${radius},0 0,${radius} -${radius},0`}
                    fill={getNodeFill(node, isAlloc, isMatch)}
                    stroke={isAlloc ? '#fef08a' : '#64748b'}
                    strokeWidth={isAlloc ? 2.5 : 1.5}
                    opacity={isMatch ? 1 : 0.25}
                  />
                ) : (
                  <circle
                    cx="0"
                    cy="0"
                    r={radius}
                    fill={getNodeFill(node, isAlloc, isMatch)}
                    stroke={isAlloc ? '#fef08a' : '#475569'}
                    strokeWidth={isAlloc ? 2 : 1}
                    opacity={isMatch ? 1 : 0.25}
                  />
                )}

                <text x="0" y={isKs ? 6 : 5} textAnchor="middle" fontSize={isKs ? '14px' : '11px'} style={{ pointerEvents: 'none', userSelect: 'none' }}>
                  {node.icon || '•'}
                </text>

                <text
                  x="0"
                  y={radius + 14}
                  textAnchor="middle"
                  fill={isAlloc ? 'var(--text-gold)' : isMatch ? '#cbd5e1' : '#475569'}
                  fontSize="10px"
                  fontWeight={isAlloc ? 'bold' : 'normal'}
                  style={{ pointerEvents: 'none', userSelect: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                >
                  {node.name.split(' (')[0]}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Floating Zoom Controls */}
      <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(0, 0, 0, 0.6)', padding: '4px', borderRadius: '6px' }}>
        <button type="button" className="poe-button-secondary" onClick={() => onZoomChange(Math.min(zoom + 0.2, 2.6))} style={{ padding: '4px', height: '26px', width: '26px' }} title="放大">
          <ZoomIn size={13} />
        </button>
        <button type="button" className="poe-button-secondary" onClick={() => onZoomChange(Math.max(zoom - 0.2, 0.4))} style={{ padding: '4px', height: '26px', width: '26px' }} title="縮小">
          <ZoomOut size={13} />
        </button>
      </div>
    </div>
  );
};
