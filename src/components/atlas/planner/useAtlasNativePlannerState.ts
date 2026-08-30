import { useState, useMemo } from 'react';
import type { AtlasNode } from '../../../domain/atlas/types';
import { MAX_ATLAS_POINTS, ATLAS_ORIGIN_ALIASES } from '../../../domain/atlas/constants';
import { reloadAtlasTreeDataset } from '../../../domain/atlas/atlasTreeDataset';
import { calculatePathToTarget, pruneDisconnectedNodes } from '../../../domain/atlas/atlasPathfinding';
import { calculateAtlasTreeStats } from '../../../domain/atlas/atlasTreeStats';
import {
  syncOfficialAtlasTree,
  getAtlasTreeLastSyncTime,
  loadCachedAtlasTreeData
} from '../../../domain/atlas/atlasOfficialSyncService';
import { useAtlasPlannerHistory } from './useAtlasPlannerHistory';
import { useAtlasPlannerShortcuts } from './useAtlasPlannerShortcuts';
import { useAtlasCanvasPanZoom } from './useAtlasCanvasPanZoom';

interface UseAtlasNativePlannerStateProps {
  strategyId: string;
  tierId: string;
  strategyName: string;
  tierName: string;
  initialAllocatedNodes?: string[];
  onSaveAllocatedNodes?: (nodes: string[]) => void;
  onShowToast: (msg: string) => void;
}

export function useAtlasNativePlannerState(props: UseAtlasNativePlannerStateProps) {
  const {
    strategyId,
    tierId,
    strategyName,
    tierName,
    initialAllocatedNodes,
    onSaveAllocatedNodes,
    onShowToast
  } = props;

  const [treeNodes, setTreeNodes] = useState<AtlasNode[]>(() => loadCachedAtlasTreeData());
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(() => getAtlasTreeLastSyncTime());
  const [hoveredNode, setHoveredNode] = useState<AtlasNode | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [autoPathMode, setAutoPathMode] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);

  const {
    allocatedNodeIds,
    historyIndex,
    historyLength,
    commitAllocatedChange,
    handleUndo,
    handleRedo
  } = useAtlasPlannerHistory({ strategyId, tierId, initialAllocatedNodes, onShowToast });

  const panZoom = useAtlasCanvasPanZoom({ isFullscreen });

  const hoveredPreviewPath = useMemo(() => {
    if (!hoveredNode || allocatedNodeIds.has(hoveredNode.id) || !autoPathMode) return [];
    return calculatePathToTarget(allocatedNodeIds, hoveredNode.id, treeNodes);
  }, [hoveredNode, allocatedNodeIds, autoPathMode, treeNodes]);

  const previewNodeIds = useMemo(() => new Set(hoveredPreviewPath), [hoveredPreviewPath]);
  const summaryData = useMemo(() => calculateAtlasTreeStats(allocatedNodeIds, treeNodes), [allocatedNodeIds, treeNodes]);

  const handleNodeClick = (node: AtlasNode, e: React.MouseEvent) => {
    e.stopPropagation();
    if (panZoom.dragDistance > 5) return;
    const next = new Set(allocatedNodeIds);
    if (next.has(node.id)) {
      if (!ATLAS_ORIGIN_ALIASES.includes(node.id)) {
        next.delete(node.id);
        const resolved = autoPathMode ? pruneDisconnectedNodes(next, treeNodes, '29045') : next;
        commitAllocatedChange(resolved);
      }
    } else {
      let neededPoints = 0;
      const nodesToAdd: string[] = [];
      const path = autoPathMode ? calculatePathToTarget(next, node.id, treeNodes) : [node.id];
      path.forEach(id => {
        if (!next.has(id)) {
          nodesToAdd.push(id);
          if (!ATLAS_ORIGIN_ALIASES.includes(id)) neededPoints += 1;
        }
      });
      if (summaryData.pointsSpent + neededPoints > MAX_ATLAS_POINTS) {
        const remaining = Math.max(0, MAX_ATLAS_POINTS - summaryData.pointsSpent);
        onShowToast(`⚠️ 點數不足！配置此路徑需 ${neededPoints} 點，目前僅剩餘 ${remaining} 點 (上限 ${MAX_ATLAS_POINTS} 點)`);
        return;
      }
      nodesToAdd.forEach(id => next.add(id));
      commitAllocatedChange(next);
    }
  };

  const handleNodeDoubleClick = (node: AtlasNode, e: React.MouseEvent) => {
    e.stopPropagation();
    const targetZoom = Math.max(panZoom.zoom, 0.45);
    const canvasWidth = isFullscreen ? window.innerWidth : 780;
    const canvasHeight = isFullscreen ? window.innerHeight - 200 : 580;
    panZoom.setZoom(targetZoom);
    panZoom.setPan({ x: canvasWidth / 2 - node.x * targetZoom, y: canvasHeight / 2 - node.y * targetZoom });
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
      }
      onShowToast(res.message);
    } catch {
      onShowToast('同步失敗，已切換至離線打包資料。');
    } finally {
      setIsSyncing(false);
    }
  };

  useAtlasPlannerShortcuts({
    handleUndo,
    handleRedo,
    handleResetView: panZoom.handleResetView,
    setZoom: panZoom.setZoom,
    isFullscreen,
    setIsFullscreen
  });

  return {
    treeNodes,
    isSyncing,
    lastSyncTime,
    allocatedNodeIds,
    historyIndex,
    historyLength,
    hoveredNode,
    setHoveredNode,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    autoPathMode,
    setAutoPathMode,
    isFullscreen,
    setIsFullscreen,
    isImportExportOpen,
    setIsImportExportOpen,
    hoveredPreviewPath,
    previewNodeIds,
    summaryData,
    commitAllocatedChange,
    handleUndo,
    handleRedo,
    handleNodeClick,
    handleNodeDoubleClick,
    handleResetToPreset: () => {
      const list = initialAllocatedNodes && initialAllocatedNodes.length > 0 ? initialAllocatedNodes : ['29045'];
      commitAllocatedChange(new Set(list));
      onShowToast(`已還原為【${strategyName} - ${tierName}】已儲存的天賦配置！`);
    },
    handleSaveTree: () => {
      if (onSaveAllocatedNodes) onSaveAllocatedNodes(Array.from(allocatedNodeIds));
      onShowToast(`💾 已成功將天賦配置儲存至【${tierName}】！`);
    },
    handleSyncLeagueTree,
    ...panZoom
  };
}
