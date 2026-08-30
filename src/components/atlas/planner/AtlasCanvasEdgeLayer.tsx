import React from 'react';
import type { AtlasNode } from '../../../domain/atlas/types';

export interface CanvasEdge {
  id: string;
  source: AtlasNode;
  target: AtlasNode;
}

interface AtlasCanvasEdgeLayerProps {
  uniqueEdges: CanvasEdge[];
  allocatedNodeIds: Set<string>;
  previewNodeIds: Set<string>;
}

export const AtlasCanvasEdgeLayer: React.FC<AtlasCanvasEdgeLayerProps> = ({
  uniqueEdges,
  allocatedNodeIds,
  previewNodeIds
}) => {
  return (
    <>
      {/* 1. Base Layer: Unallocated Constellation Lines */}
      <g opacity={0.35}>
        {uniqueEdges.map(edge => {
          const isAlloc = allocatedNodeIds.has(edge.source.id) && allocatedNodeIds.has(edge.target.id);
          if (isAlloc) return null;
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

      {/* 2. Middle Layer: Hover Preview Pulsing Paths */}
      {previewNodeIds.size > 0 && (
        <g>
          {uniqueEdges.map(edge => {
            const sAlloc = allocatedNodeIds.has(edge.source.id);
            const tAlloc = allocatedNodeIds.has(edge.target.id);
            const sPrev = previewNodeIds.has(edge.source.id);
            const tPrev = previewNodeIds.has(edge.target.id);

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

      {/* 3. Top Layer: Allocated Dual-Layer Golden Energy Beams */}
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
    </>
  );
};
