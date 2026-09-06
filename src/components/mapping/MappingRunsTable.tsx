import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Trash2, Package } from 'lucide-react';
import type { MapRun } from '../../domain/mapping/types';
import { formatDuration } from '../../domain/mapping/mappingExport';
import { formatGold } from '../../domain/mapping/poe2MappingCalculator';

interface MappingRunsTableProps {
  runs: MapRun[];
  onDeleteRun: (runId: string) => void;
}

export const MappingRunsTable: React.FC<MappingRunsTableProps> = ({ runs, onDeleteRun }) => {
  const [expandedRunIds, setExpandedRunIds] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedRunIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  if (runs.length === 0) {
    return (
      <div
        className="poe-card"
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }}
      >
        <Package size={36} color="rgba(200, 170, 110, 0.3)" />
        <div>目前尚無刷圖結算紀錄。點擊上方「開始進圖」展開您的第一場刷圖收益追蹤！</div>
      </div>
    );
  }

  return (
    <div className="poe-card" style={{ padding: '0', overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 className="poe-font" style={{ fontSize: '1.05rem', color: 'var(--text-gold)', margin: 0 }}>
          場次歷程與掉落明細 (Mapping History · 共 {runs.length} 場)
        </h3>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#0e121a', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left' }}>場次</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>耗時</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>門票成本</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>毛收入</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>淨利潤</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>掉落物數量</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>結算時間</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {runs.map(run => {
              const isExpanded = expandedRunIds.includes(run.id);
              const isProfitPositive = run.netProfitChaos >= 0;

              return (
                <React.Fragment key={run.id}>
                  <tr
                    onClick={() => toggleExpand(run.id)}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      cursor: 'pointer',
                      backgroundColor: isExpanded ? 'rgba(243, 209, 121, 0.05)' : 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px 14px', fontWeight: 'bold', color: 'var(--text-gold)' }}>
                      <div>#{run.runNumber} {run.mapName ? `${run.mapName}` : ''}</div>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '2px', flexWrap: 'wrap' }}>
                        {run.mapTier && (
                          <span style={{ fontSize: '0.72rem', color: '#c678dd', backgroundColor: 'rgba(198,120,221,0.15)', padding: '1px 4px', borderRadius: '3px' }}>
                            T{run.mapTier}
                          </span>
                        )}
                        {run.goldEarned !== undefined && run.goldEarned > 0 && (
                          <span style={{ fontSize: '0.72rem', color: '#f3d179', backgroundColor: 'rgba(243,209,121,0.15)', padding: '1px 4px', borderRadius: '3px' }}>
                            💰 {formatGold(run.goldEarned)}
                          </span>
                        )}
                        {run.bossSlain && (
                          <span style={{ fontSize: '0.72rem', color: '#98c379', backgroundColor: 'rgba(152,195,121,0.15)', padding: '1px 4px', borderRadius: '3px' }}>
                            👑 討伐
                          </span>
                        )}
                        {run.deathCount !== undefined && run.deathCount > 0 && (
                          <span style={{ fontSize: '0.72rem', color: '#e06c75', backgroundColor: 'rgba(224,108,117,0.15)', padding: '1px 4px', borderRadius: '3px' }}>
                            💀 x{run.deathCount}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: '#61afef' }}>
                      {formatDuration(run.durationSeconds)}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)' }}>
                      {run.investment.totalCostChaos}c ({run.investment.totalCostDivine} Div)
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right', color: '#fff' }}>
                      {run.grossRevenueChaos}c ({run.grossRevenueDivine} Div)
                    </td>
                    <td
                      style={{
                        padding: '12px 14px',
                        textAlign: 'right',
                        fontWeight: 'bold',
                        color: isProfitPositive ? '#98c379' : '#e06c75'
                      }}
                    >
                      {isProfitPositive ? '+' : ''}
                      {run.netProfitDivine} Div ({run.netProfitChaos}c)
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff', padding: '2px 8px', borderRadius: '10px' }}>
                        {run.drops.length} 種
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                      {new Date(run.endTime).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            toggleExpand(run.id);
                          }}
                          className="poe-button-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        >
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            onDeleteRun(run.id);
                          }}
                          className="poe-button-secondary"
                          style={{ padding: '4px 8px', fontSize: '0.75rem', color: '#e06c75' }}
                          title="刪除此場紀錄"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}>
                      <td colSpan={8} style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-gold)' }}>
                            📦 第 #{run.runNumber} 場掉落物差量明細 ({run.drops.length} 項)：
                          </span>
                          {(run.goldEarned !== undefined || run.waystonesFound || run.runesFound) && (
                            <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', flexWrap: 'wrap', padding: '6px 10px', backgroundColor: '#11151f', borderRadius: '4px' }}>
                              {run.goldEarned !== undefined && (
                                <span style={{ color: '#f3d179' }}>💰 金幣收益：{run.goldEarned.toLocaleString()} ({run.goldPerHour ? `${formatGold(run.goldPerHour)}/hr` : ''})</span>
                              )}
                              {run.waystonesFound !== undefined && run.waystonesFound > 0 && (
                                <span style={{ color: '#c678dd' }}>🗺️ 銘刻掉落：{run.waystonesFound} 張</span>
                              )}
                              {run.runesFound !== undefined && run.runesFound > 0 && (
                                <span style={{ color: '#56b6c2' }}>🪨 符文掉落：{run.runesFound} 顆</span>
                              )}
                            </div>
                          )}
                          {run.drops.length === 0 ? (
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                              本次結算未偵測到指定的 Dump Tab 物品數量增長（或為純門票消耗）。
                            </div>
                          ) : (
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                                gap: '8px'
                              }}
                            >
                              {run.drops.map(drop => (
                                <div
                                  key={drop.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '6px 10px',
                                    backgroundColor: '#161b26',
                                    borderRadius: '4px',
                                    border: '1px solid rgba(255,255,255,0.06)'
                                  }}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                    {drop.icon && (
                                      <img src={drop.icon} alt={drop.name} style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                                    )}
                                    <span style={{ fontSize: '0.8rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {drop.name} <strong style={{ color: 'var(--text-gold)' }}>x{drop.deltaCount}</strong>
                                    </span>
                                  </div>
                                  <div style={{ textAlign: 'right', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#98c379', fontWeight: 'bold' }}>
                                      +{drop.totalPriceChaos}c
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
