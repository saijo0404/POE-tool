import React, { useState, useMemo, useEffect } from 'react';
import type { AtlasNode } from '../../domain/atlas/types';
import { PRESET_ALLOCATED_MAP, ATLAS_TREE_NODES_DATA } from '../../domain/atlas/atlasTreeDataset';
import { calculatePathToTarget, pruneDisconnectedNodes } from '../../domain/atlas/atlasPathfinding';
import { calculateAtlasTreeStats } from '../../domain/atlas/atlasTreeStats';
import { AtlasPlannerToolbar } from './planner/AtlasPlannerToolbar';
import { AtlasCategoryFilter } from './planner/AtlasCategoryFilter';
import { AtlasCanvas } from './planner/AtlasCanvas';
import { AtlasNodeTooltip } from './planner/AtlasNodeTooltip';
import { AtlasStatsSidebar } from './planner/AtlasStatsSidebar';
import { AtlasImportExportModal } from './planner/AtlasImportExportModal';

interface AtlasNativePlannerProps {
  strategyId: string;
  tierId: string;
  strategyName: string;
  tierName: string;
  initialAllocatedNodes?: string[];
  onSaveAllocatedNodes?: (nodes: string[]) => void;
  onShowToast: (msg: string) => void;
}

export const AtlasNativePlanner: React.FC<AtlasNativePlannerProps> = ({
  strategyId,
  tierId,
  strategyName,
  tierName,
  initialAllocatedNodes,
  onSaveAllocatedNodes,
  onShowToast
}) => {
  const [allocatedNodeIds, setAllocatedNodeIds] = useState<Set<string>>(() => {
    if (initialAllocatedNodes && initialAllocatedNodes.length > 0) {
      return new Set(initialAllocatedNodes);
    }
    const defaultList = PRESET_ALLOCATED_MAP[tierId] || PRESET_ALLOCATED_MAP[strategyId] || PRESET_ALLOCATED_MAP.preset_essence;
    return new Set(defaultList);
  });

  useEffect(() => {
    if (initialAllocatedNodes && initialAllocatedNodes.length > 0) {
      setAllocatedNodeIds(new Set(initialAllocatedNodes));
    } else {
      const defaultList = PRESET_ALLOCATED_MAP[tierId] || PRESET_ALLOCATED_MAP[strategyId] || PRESET_ALLOCATED_MAP.preset_essence;
      setAllocatedNodeIds(new Set(defaultList));
    }
  }, [strategyId, tierId, initialAllocatedNodes]);

  const [zoom, setZoom] = useState<number>(0.9);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 420, y: 270 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<AtlasNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoPathMode, setAutoPathMode] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);

  const summaryData = useMemo(() => calculateAtlasTreeStats(allocatedNodeIds, ATLAS_TREE_NODES_DATA), [allocatedNodeIds]);

  const handleNodeClick = (node: AtlasNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setAllocatedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(node.id)) {
        if (node.id !== 'start_origin') {
          next.delete(node.id);
          return autoPathMode ? pruneDisconnectedNodes(next, ATLAS_TREE_NODES_DATA) : next;
        }
      } else {
        if (autoPathMode) {
          const path = calculatePathToTarget(next, node.id, ATLAS_TREE_NODES_DATA);
          path.forEach(id => next.add(id));
        } else {
          next.add(node.id);
        }
      }
      return next;
    });
  };

  const handleResetToPreset = () => {
    const defaultList = PRESET_ALLOCATED_MAP[tierId] || PRESET_ALLOCATED_MAP[strategyId] || PRESET_ALLOCATED_MAP.preset_essence;
    setAllocatedNodeIds(new Set(defaultList));
    onShowToast(`已重設為【${strategyName} - ${tierName}】預設天賦！`);
  };

  const handleSaveTree = () => {
    if (onSaveAllocatedNodes) onSaveAllocatedNodes(Array.from(allocatedNodeIds));
    onShowToast(`💾 已成功將天賦配置儲存至【${tierName}】！`);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.88;
    setZoom(prev => Math.min(Math.max(prev * factor, 0.4), 2.6));
  };

  const renderContent = () => (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      borderRadius: '8px',
      border: '1.5px solid var(--border-gold)',
      background: 'var(--bg-panel)',
      overflow: 'hidden',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.85)'
    }}>
      <AtlasPlannerToolbar
        pointsSpent={summaryData.pointsSpent}
        autoPathMode={autoPathMode}
        isFullscreen={isFullscreen}
        onToggleAutoPath={() => setAutoPathMode(!autoPathMode)}
        onResetToPreset={handleResetToPreset}
        onClearAll={() => {
          setAllocatedNodeIds(new Set(['start_origin']));
          onShowToast('已清空已配置天賦');
        }}
        onSaveTree={handleSaveTree}
        onResetView={() => {
          setZoom(0.9);
          setPan({ x: 420, y: 270 });
        }}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
      />

      <AtlasCategoryFilter
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onSearchChange={setSearchQuery}
        onSelectCategory={setSelectedCategory}
      />

      <div style={{ display: 'flex', height: isFullscreen ? 'calc(100vh - 190px)' : '540px', position: 'relative' }}>
        <AtlasCanvas
          allocatedNodeIds={allocatedNodeIds}
          hoveredNode={hoveredNode}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          zoom={zoom}
          pan={pan}
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={() => setIsDragging(false)}
          onWheel={handleWheel}
          onNodeClick={handleNodeClick}
          onNodeHover={setHoveredNode}
          onZoomChange={setZoom}
        />

        <AtlasNodeTooltip node={hoveredNode} autoPathMode={autoPathMode} />
        <AtlasStatsSidebar summaryData={summaryData} onShowToast={onShowToast} />
      </div>

      <AtlasImportExportModal
        allocatedNodeIds={allocatedNodeIds}
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onImportSuccess={imported => setAllocatedNodeIds(new Set(imported))}
        onShowToast={onShowToast}
      />
    </div>
  );

  if (isFullscreen) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0, 0, 0, 0.95)', zIndex: 2000, display: 'flex', flexDirection: 'column', padding: '16px' }}>
        {renderContent()}
      </div>
    );
  }

  return renderContent();
};
