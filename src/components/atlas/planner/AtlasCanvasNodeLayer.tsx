import React from 'react';
import type { AtlasNode } from '../../../domain/atlas/types';
import { isNodeMatching, getNodeFill } from './atlasCanvasHelpers';

interface AtlasCanvasNodeLayerProps {
  nodes: AtlasNode[];
  allocatedNodeIds: Set<string>;
  previewNodeIds: Set<string>;
  hoveredNode: AtlasNode | null;
  searchQuery: string;
  selectedCategory: string;
  zoom: number;
  onNodeClick: (node: AtlasNode, e: React.MouseEvent) => void;
  onNodeDoubleClick?: (node: AtlasNode, e: React.MouseEvent) => void;
  onNodeHover: (node: AtlasNode | null) => void;
}

export const AtlasCanvasNodeLayer: React.FC<AtlasCanvasNodeLayerProps> = ({
  nodes,
  allocatedNodeIds,
  previewNodeIds,
  hoveredNode,
  searchQuery,
  selectedCategory,
  zoom,
  onNodeClick,
  onNodeDoubleClick,
  onNodeHover
}) => {
  return (
    <g>
      {nodes.map(node => {
        const isAlloc = allocatedNodeIds.has(node.id);
        const isPreview = previewNodeIds.has(node.id);
        const isMatch = isNodeMatching(node, selectedCategory, searchQuery);
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
  );
};
