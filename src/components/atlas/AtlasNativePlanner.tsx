import React from 'react';
import { MAX_ATLAS_POINTS, ATLAS_ORIGIN_ALIASES } from '../../domain/atlas/constants';
import { AtlasPlannerToolbar } from './planner/AtlasPlannerToolbar';
import { AtlasCategoryFilter } from './planner/AtlasCategoryFilter';
import { AtlasCanvas } from './planner/AtlasCanvas';
import { AtlasNodeTooltip } from './planner/AtlasNodeTooltip';
import { AtlasStatsSidebar } from './planner/AtlasStatsSidebar';
import { AtlasImportExportModal } from './planner/AtlasImportExportModal';
import { useAtlasNativePlannerState } from './planner/useAtlasNativePlannerState';

interface AtlasNativePlannerProps {
  strategyId: string;
  tierId: string;
  strategyName: string;
  tierName: string;
  initialAllocatedNodes?: string[];
  onSaveAllocatedNodes?: (nodes: string[]) => void;
  onShowToast: (msg: string) => void;
}

export const AtlasNativePlanner: React.FC<AtlasNativePlannerProps> = (props) => {
  const { onShowToast } = props;
  const state = useAtlasNativePlannerState(props);

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
        pointsSpent={state.summaryData.pointsSpent}
        autoPathMode={state.autoPathMode}
        isFullscreen={state.isFullscreen}
        isSyncing={state.isSyncing}
        lastSyncTime={state.lastSyncTime}
        canUndo={state.historyIndex > 0}
        canRedo={state.historyIndex < state.historyLength - 1}
        onUndo={state.handleUndo}
        onRedo={state.handleRedo}
        onToggleAutoPath={() => state.setAutoPathMode(!state.autoPathMode)}
        onResetToPreset={state.handleResetToPreset}
        onClearAll={() => {
          state.commitAllocatedChange(new Set(['29045', 'start_origin']));
          onShowToast('已清空已配置天賦');
        }}
        onSaveTree={state.handleSaveTree}
        onResetView={state.handleResetView}
        onToggleFullscreen={() => state.setIsFullscreen(!state.isFullscreen)}
        onOpenImportExport={() => state.setIsImportExportOpen(true)}
        onSyncTree={state.handleSyncLeagueTree}
      />

      <AtlasCategoryFilter
        searchQuery={state.searchQuery}
        selectedCategory={state.selectedCategory}
        onSearchChange={state.setSearchQuery}
        onSelectCategory={state.setSelectedCategory}
      />

      <div
        ref={state.canvasContainerRef}
        style={{ display: 'flex', height: state.isFullscreen ? 'calc(100vh - 190px)' : '580px', position: 'relative' }}
      >
        <AtlasCanvas
          nodes={state.treeNodes}
          allocatedNodeIds={state.allocatedNodeIds}
          previewNodeIds={state.previewNodeIds}
          hoveredNode={state.hoveredNode}
          searchQuery={state.searchQuery}
          selectedCategory={state.selectedCategory}
          zoom={state.zoom}
          pan={state.pan}
          isDragging={state.isDragging}
          onMouseDown={state.handleMouseDown}
          onMouseMove={state.handleMouseMove}
          onMouseUp={state.handleMouseUp}
          onWheel={state.handleWheel}
          onNodeClick={state.handleNodeClick}
          onNodeDoubleClick={state.handleNodeDoubleClick}
          onNodeHover={state.setHoveredNode}
          onZoomChange={state.setZoom}
          onResetView={state.handleResetView}
          onViewInit={state.handleViewInit}
        />

        <AtlasNodeTooltip
          node={state.hoveredNode}
          autoPathMode={state.autoPathMode}
          isAllocated={state.allocatedNodeIds.has(state.hoveredNode?.id || '')}
          previewCount={state.hoveredPreviewPath.filter(id => !state.allocatedNodeIds.has(id) && !ATLAS_ORIGIN_ALIASES.includes(id)).length || 1}
          remainingPoints={Math.max(0, MAX_ATLAS_POINTS - state.summaryData.pointsSpent)}
        />

        <AtlasStatsSidebar summaryData={state.summaryData} onShowToast={onShowToast} />
      </div>

      <AtlasImportExportModal
        allocatedNodeIds={state.allocatedNodeIds}
        isOpen={state.isImportExportOpen}
        onClose={() => state.setIsImportExportOpen(false)}
        onImportSuccess={imported => state.commitAllocatedChange(new Set(imported))}
        onShowToast={onShowToast}
      />
    </div>
  );

  if (state.isFullscreen) {
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

export default AtlasNativePlanner;
