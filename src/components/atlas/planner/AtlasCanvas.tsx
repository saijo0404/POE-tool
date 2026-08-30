import React, { useRef, useMemo } from 'react';
import type { AtlasNode } from '../../../domain/atlas/types';
import { ATLAS_TREE_NODES_DATA, ATLAS_NODES_MAP } from '../../../domain/atlas/atlasTreeDataset';
import { AtlasCanvasDefs } from './AtlasCanvasDefs';
import { AtlasCanvasEdgeLayer, type CanvasEdge } from './AtlasCanvasEdgeLayer';
import { AtlasCanvasNodeLayer } from './AtlasCanvasNodeLayer';
import { AtlasCanvasControls } from './AtlasCanvasControls';
import { useAtlasCanvasCentering } from './useAtlasCanvasCentering';

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

  const { handleManualReset } = useAtlasCanvasCentering(containerRef, onViewInit, onResetView);

  const currentNodes = useMemo(() => nodes || ATLAS_TREE_NODES_DATA, [nodes]);
  const currentNodesMap = useMemo(() => {
    const map = new Map<string, AtlasNode>();
    currentNodes.forEach(n => map.set(n.id, n));
    return map;
  }, [currentNodes]);

  // Pre-calculate unique deduplicated undirected edges
  const uniqueEdges = useMemo<CanvasEdge[]>(() => {
    const edgeMap = new Map<string, CanvasEdge>();
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

          {/* SVG Layers */}
          <AtlasCanvasEdgeLayer
            uniqueEdges={uniqueEdges}
            allocatedNodeIds={allocatedNodeIds}
            previewNodeIds={previewNodeIds}
          />

          <AtlasCanvasNodeLayer
            nodes={currentNodes}
            allocatedNodeIds={allocatedNodeIds}
            previewNodeIds={previewNodeIds}
            hoveredNode={hoveredNode}
            searchQuery={searchQuery}
            selectedCategory={selectedCategory}
            zoom={zoom}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodeHover={onNodeHover}
          />
        </g>
      </svg>

      <AtlasCanvasControls
        zoom={zoom}
        onZoomChange={onZoomChange}
        onManualReset={handleManualReset}
      />
    </div>
  );
};
