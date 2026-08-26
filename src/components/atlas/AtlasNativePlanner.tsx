import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  ATLAS_TREE_NODES_DATA,
  PRESET_ALLOCATED_MAP,
  type AtlasNode
} from '../../domain/atlas/atlasTreeDataset';
import {
  Compass,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Shield,
  Search,
  CheckCircle2,
  Sparkles,
  Save,
  RotateCw
} from 'lucide-react';

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
  // Local state of allocated nodes
  const [allocatedNodeIds, setAllocatedNodeIds] = useState<Set<string>>(() => {
    if (initialAllocatedNodes && initialAllocatedNodes.length > 0) {
      return new Set(initialAllocatedNodes);
    }
    const defaultList =
      PRESET_ALLOCATED_MAP[tierId] ||
      PRESET_ALLOCATED_MAP[strategyId] ||
      PRESET_ALLOCATED_MAP.preset_essence;
    return new Set(defaultList);
  });

  // When strategy or tier changes, update allocation
  useEffect(() => {
    if (initialAllocatedNodes && initialAllocatedNodes.length > 0) {
      setAllocatedNodeIds(new Set(initialAllocatedNodes));
    } else {
      const defaultList =
        PRESET_ALLOCATED_MAP[tierId] ||
        PRESET_ALLOCATED_MAP[strategyId] ||
        PRESET_ALLOCATED_MAP.preset_essence;
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const svgRef = useRef<SVGSVGElement>(null);

  // Toggle allocation on click
  const handleNodeClick = (node: AtlasNode, e: React.MouseEvent) => {
    e.stopPropagation();
    setAllocatedNodeIds(prev => {
      const next = new Set(prev);
      if (next.has(node.id)) {
        if (node.id !== 'start_origin') {
          next.delete(node.id);
        }
      } else {
        next.add(node.id);
      }
      return next;
    });
  };

  // Reset to preset
  const handleResetToPreset = () => {
    const defaultList =
      PRESET_ALLOCATED_MAP[tierId] ||
      PRESET_ALLOCATED_MAP[strategyId] ||
      PRESET_ALLOCATED_MAP.preset_essence;
    setAllocatedNodeIds(new Set(defaultList));
    onShowToast(`已重設為【${strategyName} - ${tierName}】預設天賦！`);
  };

  // Clear all except start
  const handleClearAll = () => {
    setAllocatedNodeIds(new Set(['start_origin']));
    onShowToast('已清空已配置天賦');
  };

  // Save current tree
  const handleSaveTree = () => {
    if (onSaveAllocatedNodes) {
      onSaveAllocatedNodes(Array.from(allocatedNodeIds));
    }
    onShowToast(`💾 已成功將天賦配置儲存至【${tierName}】！`);
  };

  // Pan & Zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    setZoom(prev => Math.min(Math.max(prev * zoomFactor, 0.4), 2.6));
  };

  const handleResetView = () => {
    setZoom(0.9);
    setPan({ x: 420, y: 270 });
  };

  // Aggregate stats from currently allocated nodes
  const summaryData = useMemo(() => {
    const statsList: string[] = [];
    const activeKeystones: AtlasNode[] = [];
    let pointsSpent = 0;

    ATLAS_TREE_NODES_DATA.forEach(node => {
      if (allocatedNodeIds.has(node.id)) {
        if (node.id !== 'start_origin') {
          pointsSpent += 1;
        }
        if (node.type === 'keystone') {
          activeKeystones.push(node);
        }
        node.stats.forEach(st => {
          if (!statsList.includes(st) && st !== '輿圖探索起點，連接各大核心機制路徑') {
            statsList.push(st);
          }
        });
      }
    });

    return { statsList, activeKeystones, pointsSpent };
  }, [allocatedNodeIds]);

  // Search match helper
  const isNodeMatchingSearch = (node: AtlasNode): boolean => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      node.name.toLowerCase().includes(q) ||
      node.nameEn.toLowerCase().includes(q) ||
      node.description.toLowerCase().includes(q) ||
      node.stats.some(s => s.toLowerCase().includes(q))
    );
  };

  const isNodeMatchingCategory = (node: AtlasNode): boolean => {
    if (selectedCategory === 'all') return true;
    return node.category === selectedCategory;
  };

  const getNodeFill = (node: AtlasNode, isAllocated: boolean, isMatched: boolean) => {
    if (node.type === 'keystone') {
      return isAllocated ? 'url(#keystoneAllocGrad)' : 'url(#keystoneUnallocGrad)';
    }
    if (node.type === 'start') {
      return '#38bdf8';
    }
    if (isAllocated) {
      if (node.category === 'essence') return '#38bdf8';
      if (node.category === 'ambush') return '#f59e0b';
      if (node.category === 'harvest') return '#22c55e';
      if (node.category === 'expedition') return '#ef4444';
      if (node.category === 'legion') return '#a855f7';
      if (node.category === 'scarab') return '#ec4899';
      if (node.category === 'boss') return '#eab308';
      return '#f3d179';
    }
    return isMatched ? '#334155' : '#1e293b';
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
      {/* Top Header & Action Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '10px 14px',
        background: '#0d121c',
        borderBottom: '1px solid rgba(200, 170, 110, 0.3)'
      }}>
        {/* Title & Points Counter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gold)', fontWeight: 600, fontSize: '0.92rem' }}>
            <Compass size={18} />
            <span>應用內建 PoE 1 輿圖天賦規劃器 (Native Atlas Planner)</span>
          </div>

          <span style={{
            fontSize: '0.8rem',
            padding: '3px 10px',
            borderRadius: '12px',
            background: 'rgba(34, 197, 94, 0.15)',
            border: '1px solid rgba(34, 197, 94, 0.35)',
            color: '#86efac',
            fontWeight: 'bold'
          }}>
            🟢 已配置：{summaryData.pointsSpent} / 132 點 (剩餘 {Math.max(0, 132 - summaryData.pointsSpent)} 點)
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="poe-button-secondary"
            onClick={handleResetToPreset}
            style={{ fontSize: '0.78rem', padding: '4px 10px', height: '28px' }}
            title="重設為當前策略預設天賦"
          >
            <RotateCw size={13} /> 預設配置
          </button>
          <button
            type="button"
            className="poe-button-secondary"
            onClick={handleClearAll}
            style={{ fontSize: '0.78rem', padding: '4px 10px', height: '28px', color: '#fca5a5' }}
            title="全部清空"
          >
            全部清空
          </button>
          <button
            type="button"
            className="poe-button"
            onClick={handleSaveTree}
            style={{ fontSize: '0.78rem', padding: '4px 12px', height: '28px', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Save size={13} /> 儲存天賦
          </button>
          <button
            type="button"
            className="poe-button-secondary"
            onClick={handleResetView}
            style={{ fontSize: '0.78rem', padding: '4px 10px', height: '28px' }}
            title="重設視角"
          >
            <RotateCcw size={13} /> 重設視角
          </button>
          <button
            type="button"
            className="poe-button-secondary"
            onClick={() => setIsFullscreen(!isFullscreen)}
            style={{ fontSize: '0.78rem', padding: '4px 10px', height: '28px' }}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            <span>{isFullscreen ? '縮小' : '全螢幕'}</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '8px 14px',
        background: 'rgba(0, 0, 0, 0.4)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
      }}>
        {/* Search Input */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', minWidth: '220px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '8px' }} />
          <input
            type="text"
            className="poe-input"
            placeholder="搜尋天賦名稱或關鍵字 (如 精髓, 伏擊, 命能)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '28px', fontSize: '0.78rem', height: '28px', width: '100%' }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', overflowX: 'auto' }}>
          {[
            { id: 'all', label: '全部' },
            { id: 'essence', label: '💎 精髓' },
            { id: 'ambush', label: '📦 伏擊' },
            { id: 'harvest', label: '🌾 莊園' },
            { id: 'expedition', label: '💣 探險' },
            { id: 'legion', label: '⚔️ 戰亂' },
            { id: 'scarab', label: '🐞 聖甲蟲' },
            { id: 'boss', label: '👑 首領' },
            { id: 'map', label: '🗺️ 地圖' }
          ].map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                background: selectedCategory === cat.id ? 'rgba(200, 170, 110, 0.2)' : 'transparent',
                border: selectedCategory === cat.id ? '1px solid var(--border-gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                color: selectedCategory === cat.id ? 'var(--text-gold)' : 'var(--text-muted)',
                padding: '2px 8px',
                borderRadius: '10px',
                fontSize: '0.74rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Canvas & Inspector View */}
      <div style={{ display: 'flex', flexDirection: isFullscreen ? 'row' : 'row', height: isFullscreen ? 'calc(100vh - 190px)' : '540px', position: 'relative' }}>
        {/* Left/Center: Interactive SVG Canvas */}
        <div style={{ flex: 1, position: 'relative', background: '#07090e', overflow: 'hidden' }}>
          <svg
            ref={svgRef}
            style={{
              width: '100%',
              height: '100%',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <defs>
              <radialGradient id="keystoneAllocGrad">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="60%" stopColor="#eab308" />
                <stop offset="100%" stopColor="#854d0e" />
              </radialGradient>
              <radialGradient id="keystoneUnallocGrad">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="100%" stopColor="#1e293b" />
              </radialGradient>
              <filter id="glowGoldEffect" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Canvas Transformation Group */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Background Concentric Atlas Guides */}
              <circle cx="0" cy="0" r="160" fill="none" stroke="rgba(200, 170, 110, 0.06)" strokeWidth="1" strokeDasharray="4 4" />
              <circle cx="0" cy="0" r="300" fill="none" stroke="rgba(200, 170, 110, 0.08)" strokeWidth="1" />
              <circle cx="0" cy="0" r="460" fill="none" stroke="rgba(200, 170, 110, 0.05)" strokeWidth="1" strokeDasharray="6 6" />

              {/* 1. Draw Connections */}
              {ATLAS_TREE_NODES_DATA.map(node =>
                node.connections.map(targetId => {
                  const targetNode = ATLAS_TREE_NODES_DATA.find(n => n.id === targetId);
                  if (!targetNode) return null;
                  // Avoid drawing reverse lines twice
                  if (node.numId > targetNode.numId) return null;

                  const isLineAllocated = allocatedNodeIds.has(node.id) && allocatedNodeIds.has(targetNode.id);

                  return (
                    <line
                      key={`${node.id}-${targetNode.id}`}
                      x1={node.x}
                      y1={node.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isLineAllocated ? '#f3d179' : 'rgba(255, 255, 255, 0.12)'}
                      strokeWidth={isLineAllocated ? 3.5 : 1.5}
                      strokeLinecap="round"
                      filter={isLineAllocated ? 'url(#glowGoldEffect)' : undefined}
                      opacity={isLineAllocated ? 0.95 : 0.35}
                    />
                  );
                })
              )}

              {/* 2. Draw Nodes */}
              {ATLAS_TREE_NODES_DATA.map(node => {
                const isAllocated = allocatedNodeIds.has(node.id);
                const isMatched = isNodeMatchingSearch(node) && isNodeMatchingCategory(node);
                const isHovered = hoveredNode?.id === node.id;
                const isKeystone = node.type === 'keystone';
                const nodeRadius = isKeystone ? 24 : node.type === 'notable' ? 18 : 14;

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onClick={e => handleNodeClick(node, e)}
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{ cursor: 'pointer', transition: 'all 0.15s ease' }}
                  >
                    {/* Outer Glow Ring on Allocated or Hovered */}
                    {(isAllocated || isHovered) && (
                      <circle
                        cx="0"
                        cy="0"
                        r={nodeRadius + 6}
                        fill="none"
                        stroke={isKeystone ? '#f59e0b' : '#38bdf8'}
                        strokeWidth="2"
                        opacity={isHovered ? 0.9 : 0.6}
                        filter="url(#glowGoldEffect)"
                      />
                    )}

                    {/* Node Shape */}
                    {isKeystone ? (
                      <polygon
                        points={`0,-${nodeRadius} ${nodeRadius},0 0,${nodeRadius} -${nodeRadius},0`}
                        fill={getNodeFill(node, isAllocated, isMatched)}
                        stroke={isAllocated ? '#fef08a' : '#64748b'}
                        strokeWidth={isAllocated ? 2.5 : 1.5}
                        opacity={isMatched ? 1 : 0.25}
                      />
                    ) : (
                      <circle
                        cx="0"
                        cy="0"
                        r={nodeRadius}
                        fill={getNodeFill(node, isAllocated, isMatched)}
                        stroke={isAllocated ? '#fef08a' : '#475569'}
                        strokeWidth={isAllocated ? 2 : 1}
                        opacity={isMatched ? 1 : 0.25}
                      />
                    )}

                    {/* Node Icon */}
                    <text
                      x="0"
                      y={isKeystone ? 6 : 5}
                      textAnchor="middle"
                      fontSize={isKeystone ? '14px' : '11px'}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {node.icon || '•'}
                    </text>

                    {/* Node Name Label */}
                    <text
                      x="0"
                      y={nodeRadius + 14}
                      textAnchor="middle"
                      fill={isAllocated ? 'var(--text-gold)' : isMatched ? '#cbd5e1' : '#475569'}
                      fontSize="10px"
                      fontWeight={isAllocated ? 'bold' : 'normal'}
                      style={{ pointerEvents: 'none', userSelect: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                    >
                      {node.name.split(' (')[0]}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>

          {/* Floating Hover Tooltip */}
          {hoveredNode && (
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '16px',
              maxWidth: '350px',
              background: '#101522',
              border: '1.5px solid var(--border-gold)',
              borderRadius: '6px',
              padding: '12px 14px',
              boxShadow: '0 8px 28px rgba(0, 0, 0, 0.95)',
              pointerEvents: 'none',
              zIndex: 100
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-gold)' }}>
                  {hoveredNode.name}
                </span>
                <span style={{
                  fontSize: '0.72rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  background: hoveredNode.type === 'keystone' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(56, 189, 248, 0.2)',
                  color: hoveredNode.type === 'keystone' ? '#fde047' : '#38bdf8'
                }}>
                  {hoveredNode.type === 'keystone' ? '核心基石天賦' : hoveredNode.type === 'start' ? '起點' : '重要輿圖天賦'}
                </span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                {hoveredNode.nameEn}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.4, marginBottom: '8px' }}>
                {hoveredNode.description}
              </div>
              <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '6px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {hoveredNode.stats.map((st, idx) => (
                  <div key={idx} style={{ fontSize: '0.76rem', color: '#86efac', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={11} color="#f59e0b" />
                    <span>{st}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: '8px', fontSize: '0.72rem', color: 'var(--accent-blue)', fontStyle: 'italic' }}>
                💡 點擊節點即可配置或取消配置
              </div>
            </div>
          )}

          {/* Quick Zoom Buttons Overlay */}
          <div style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            background: 'rgba(0, 0, 0, 0.6)',
            padding: '4px',
            borderRadius: '6px'
          }}>
            <button
              type="button"
              className="poe-button-secondary"
              onClick={() => setZoom(prev => Math.min(prev + 0.2, 2.6))}
              style={{ padding: '4px', height: '26px', width: '26px' }}
              title="放大"
            >
              <ZoomIn size={13} />
            </button>
            <button
              type="button"
              className="poe-button-secondary"
              onClick={() => setZoom(prev => Math.max(prev - 0.2, 0.4))}
              style={{ padding: '4px', height: '26px', width: '26px' }}
              title="縮小"
            >
              <ZoomOut size={13} />
            </button>
          </div>
        </div>

        {/* Right: Cumulative Stats Inspector Panel */}
        <div style={{
          width: '320px',
          background: '#0a0e16',
          borderLeft: '1px solid rgba(200, 170, 110, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflowY: 'auto',
          padding: '12px 14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gold)', fontWeight: 600, fontSize: '0.86rem', marginBottom: '10px' }}>
            <Shield size={16} />
            <span>已配置天賦累積屬性總結：</span>
          </div>

          {/* Active Keystones */}
          {summaryData.activeKeystones.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                生效基石天賦 (Keystones)：
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {summaryData.activeKeystones.map(ks => (
                  <div
                    key={ks.id}
                    style={{
                      fontSize: '0.76rem',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      color: '#fde047',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>⭐</span>
                    <strong>{ks.name}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Aggregated Stats List */}
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
            累計詞綴加成 ({summaryData.statsList.length} 條)：
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
            {summaryData.statsList.map((st, idx) => (
              <div
                key={idx}
                style={{
                  fontSize: '0.76rem',
                  padding: '5px 8px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  color: '#e2e8f0',
                  lineHeight: 1.35,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '5px'
                }}
              >
                <CheckCircle2 size={13} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{st}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Fullscreen Modal
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
