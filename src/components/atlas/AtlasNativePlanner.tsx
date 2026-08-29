import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import type { AtlasNode } from '../../domain/atlas/types';
import {
  reloadAtlasTreeDataset
} from '../../domain/atlas/atlasTreeDataset';
import { calculatePathToTarget, pruneDisconnectedNodes } from '../../domain/atlas/atlasPathfinding';
import { calculateAtlasTreeStats } from '../../domain/atlas/atlasTreeStats';
import {
  syncOfficialAtlasTree,
  getAtlasTreeLastSyncTime,
  loadCachedAtlasTreeData
} from '../../domain/atlas/atlasOfficialSyncService';
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
  const [treeNodes, setTreeNodes] = useState<AtlasNode[]>(() => loadCachedAtlasTreeData());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => getAtlasTreeLastSyncTime());

  const [allocatedNodeIds, setAllocatedNodeIds] = useState<Set<string>>(() => {
    if (initialAllocatedNodes && initialAllocatedNodes.length > 0) {
      return new Set(initialAllocatedNodes);
    }
    return new Set(['29045']);
  });

  const [history, setHistory] = useState<string[][]>(() => [
    initialAllocatedNodes && initialAllocatedNodes.length > 0 ? initialAllocatedNodes : ['29045']
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  useEffect(() => {
    const list = initialAllocatedNodes && initialAllocatedNodes.length > 0 ? initialAllocatedNodes : ['29045'];
    setAllocatedNodeIds(new Set(list));
    setHistory([list]);
    setHistoryIndex(0);
  }, [strategyId, tierId, initialAllocatedNodes]);

  const commitAllocatedChange = useCallback((nextSet: Set<string>) => {
    const arr = Array.from(nextSet);
    setHistory(prev => [...prev.slice(0, historyIndex + 1), arr]);
    setHistoryIndex(prev => prev + 1);
    setAllocatedNodeIds(nextSet);
  }, [historyIndex]);

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      setHistoryIndex(prevIndex);
      setAllocatedNodeIds(new Set(history[prevIndex]));
      onShowToast('↩️ 已復原上一步配置');
    }
  }, [history, historyIndex, onShowToast]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      setHistoryIndex(nextIndex);
      setAllocatedNodeIds(new Set(history[nextIndex]));
      onShowToast('↪️ 已重做下一步配置');
    }
  }, [history, historyIndex, onShowToast]);

  const [zoom, setZoom] = useState<number>(0.21);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 425, y: 532 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [dragDistance, setDragDistance] = useState<number>(0);
  const dragOriginRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [hoveredNode, setHoveredNode] = useState<AtlasNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoPathMode, setAutoPathMode] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);

  // Real-time hover path preview calculation
  const hoveredPreviewPath = useMemo(() => {
    if (!hoveredNode || allocatedNodeIds.has(hoveredNode.id) || !autoPathMode) {
      return [];
    }
    return calculatePathToTarget(allocatedNodeIds, hoveredNode.id, treeNodes);
  }, [hoveredNode, allocatedNodeIds, autoPathMode, treeNodes]);

  const previewNodeIds = useMemo(() => new Set(hoveredPreviewPath), [hoveredPreviewPath]);

  const summaryData = useMemo(
    () => calculateAtlasTreeStats(allocatedNodeIds, treeNodes),
    [allocatedNodeIds, treeNodes]
  );

  const handleNodeClick = (node: AtlasNode, e: React.MouseEvent) => {
    e.stopPropagation();
    // If the user moved more than 5px during mouse down, treat as canvas drag/pan rather than click
    if (dragDistance > 5) return;

    const next = new Set(allocatedNodeIds);
    if (next.has(node.id)) {
      if (node.id !== 'start_origin' && node.id !== '29045') {
        next.delete(node.id);
        const resolved = autoPathMode ? pruneDisconnectedNodes(next, treeNodes, '29045') : next;
        commitAllocatedChange(resolved);
      }
    } else {
      if (autoPathMode) {
        const path = calculatePathToTarget(next, node.id, treeNodes);
        path.forEach(id => next.add(id));
      } else {
        next.add(node.id);
      }
      commitAllocatedChange(next);
    }
  };

  const handleNodeDoubleClick = (node: AtlasNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetZoom = Math.max(zoom, 0.45);
    const canvasWidth = isFullscreen ? window.innerWidth : 780;
    const canvasHeight = isFullscreen ? window.innerHeight - 200 : 580;
    setZoom(targetZoom);
    setPan({
      x: canvasWidth / 2 - node.x * targetZoom,
      y: canvasHeight / 2 - node.y * targetZoom
    });
  };

  const handleResetToPreset = () => {
    const list = initialAllocatedNodes && initialAllocatedNodes.length > 0 ? initialAllocatedNodes : ['29045'];
    commitAllocatedChange(new Set(list));
    onShowToast(`已還原為【${strategyName} - ${tierName}】已儲存的天賦配置！`);
  };

  const handleSaveTree = () => {
    if (onSaveAllocatedNodes) onSaveAllocatedNodes(Array.from(allocatedNodeIds));
    onShowToast(`💾 已成功將天賦配置儲存至【${tierName}】！`);
  };

  const handleSyncLeagueTree = async () => {
    setIsSyncing(true);
    onShowToast('🔄 正在連線 GGG 官方伺服器同步最新聯盟輿圖天賦...');
    try {
      const res = await syncOfficialAtlasTree();
      if (res.success) {
        const updated = loadCachedAtlasTreeData();
        setTreeNodes(updated);
        reloadAtlasTreeDataset(updated);
        setLastSyncTime(getAtlasTreeLastSyncTime());
        onShowToast(res.message);
      } else {
        onShowToast(res.message);
      }
    } catch {
      onShowToast('同步失敗，已切換至離線打包資料。');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOriginRef.current = { x: e.clientX, y: e.clientY };
    setDragDistance(0);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dist = Math.hypot(e.clientX - dragOriginRef.current.x, e.clientY - dragOriginRef.current.y);
    setDragDistance(dist);
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.88;
    setZoom(prev => Math.min(Math.max(prev * factor, 0.15), 2.5));
  };

  const canvasContainerRef = useRef<HTMLDivElement>(null);

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
    const fitZoomX = (w * 0.92) / 2900;
    const fitZoomY = (h * 0.92) / 2500;
    const fitZoom = Math.min(fitZoomX, fitZoomY);
    const targetZoom = Number(Math.min(Math.max(fitZoom, 0.12), 0.45).toFixed(2));
    setZoom(targetZoom);
    setPan({
      x: Math.round(w / 2),
      y: Math.round(h / 2 + 1150 * targetZoom)
    });
  }, [isFullscreen]);

  const handleViewInit = useCallback((view: { zoom: number; pan: { x: number; y: number } }) => {
    setZoom(view.zoom);
    setPan(view.pan);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (isInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
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
  }, [handleUndo, handleRedo, handleResetView, isFullscreen]);

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
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onToggleAutoPath={() => setAutoPathMode(!autoPathMode)}
        onResetToPreset={handleResetToPreset}
        onClearAll={() => {
          commitAllocatedChange(new Set(['29045', 'start_origin']));
          onShowToast('已清空已配置天賦');
        }}
        onSaveTree={handleSaveTree}
        onResetView={handleResetView}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onSyncTree={handleSyncLeagueTree}
      />

      <AtlasCategoryFilter
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        onSearchChange={setSearchQuery}
        onSelectCategory={setSelectedCategory}
      />

      <div
        ref={canvasContainerRef}
        style={{ display: 'flex', height: isFullscreen ? 'calc(100vh - 190px)' : '580px', position: 'relative' }}
      >
        <AtlasCanvas
          nodes={treeNodes}
          allocatedNodeIds={allocatedNodeIds}
          previewNodeIds={previewNodeIds}
          hoveredNode={hoveredNode}
          searchQuery={searchQuery}
          selectedCategory={selectedCategory}
          zoom={zoom}
          pan={pan}
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          onNodeHover={setHoveredNode}
          onZoomChange={setZoom}
          onResetView={handleResetView}
          onViewInit={handleViewInit}
        />

        <AtlasNodeTooltip
          node={hoveredNode}
          autoPathMode={autoPathMode}
          isAllocated={allocatedNodeIds.has(hoveredNode?.id || '')}
          previewCount={hoveredPreviewPath.length}
        />

        <AtlasStatsSidebar summaryData={summaryData} onShowToast={onShowToast} />
      </div>

      <AtlasImportExportModal
        allocatedNodeIds={allocatedNodeIds}
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onImportSuccess={imported => commitAllocatedChange(new Set(imported))}
        onShowToast={onShowToast}
      />
    </div>
  );

  if (isFullscreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px'
      }}>
        {renderContent()}
      </div>
    );
  }

  return renderContent();
};
