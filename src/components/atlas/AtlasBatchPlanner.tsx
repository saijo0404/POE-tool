import React from 'react';
import type { AtlasCalculationSummary } from '../../domain/atlas/types';
import { ShoppingCart, Copy } from 'lucide-react';

interface AtlasBatchPlannerProps {
  summary: AtlasCalculationSummary;
  batchSize: number;
  onSelectBatchSize: (size: number) => void;
  onCopyShoppingList: () => void;
  divineRate?: number;
}

const PRESET_BATCH_SIZES = [10, 20, 50, 100];

export const AtlasBatchPlanner: React.FC<AtlasBatchPlannerProps> = ({
  summary,
  batchSize,
  onSelectBatchSize,
  onCopyShoppingList
}) => {
  return (
    <div className="poe-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* Header & Quick Batch Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={18} color="var(--text-gold)" />
          <h3 className="poe-font" style={{ fontSize: '1.05rem', color: 'var(--text-gold)', margin: 0 }}>
            批次備料與採購清單 (Batch Prep & Shopping List)
          </h3>
        </div>

        {/* Batch Size Selector Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>目標批次：</span>
          {PRESET_BATCH_SIZES.map(size => {
            const isActive = batchSize === size;
            return (
              <button
                key={size}
                type="button"
                onClick={() => onSelectBatchSize(size)}
                className={isActive ? 'poe-button' : 'poe-button-secondary'}
                style={{ fontSize: '0.78rem', padding: '4px 10px', height: '28px', minWidth: '45px' }}
              >
                {size} 張
              </button>
            );
          })}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
            <input
              type="number"
              min="1"
              max="500"
              className="poe-input"
              value={batchSize}
              onChange={e => onSelectBatchSize(Math.max(parseInt(e.target.value) || 1, 1))}
              style={{ width: '55px', height: '28px', padding: '0 4px', fontSize: '0.8rem', textAlign: 'center' }}
            />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>張</span>
          </div>
        </div>
      </div>

      {/* Batch Overview Banner */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(200, 170, 110, 0.12) 0%, rgba(14, 143, 127, 0.12) 100%)',
        border: '1px solid var(--border-gold-dark)',
        borderRadius: '6px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>批次總備料預算</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-gold)' }}>
              {summary.batchTotalCostChaos} <span style={{ fontSize: '0.85rem' }}>Chaos</span>
              <span style={{ fontSize: '0.85rem', color: '#e2e8f0', marginLeft: '6px' }}>
                (~{summary.batchTotalCostDivine} Div)
              </span>
            </div>
          </div>

          <div style={{ width: '1px', height: '30px', background: 'rgba(255, 255, 255, 0.1)' }} />

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>批次預期淨利潤</div>
            <div style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: summary.batchTotalProfitChaos >= 0 ? '#22c55e' : '#ef4444'
            }}>
              {summary.batchTotalProfitChaos >= 0 ? `+${summary.batchTotalProfitChaos}` : summary.batchTotalProfitChaos}{' '}
              <span style={{ fontSize: '0.85rem' }}>Chaos</span>
              <span style={{ fontSize: '0.85rem', color: '#e2e8f0', marginLeft: '6px' }}>
                (~{summary.batchTotalProfitDivine >= 0 ? `+${summary.batchTotalProfitDivine}` : summary.batchTotalProfitDivine} Div)
              </span>
            </div>
          </div>
        </div>

        {/* Copy Shopping List Button */}
        <button
          type="button"
          className="poe-button"
          onClick={onCopyShoppingList}
          style={{ fontSize: '0.85rem', padding: '7px 16px', display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <Copy size={15} /> 一鍵複製採購清單
        </button>
      </div>

      {/* Materials Requirements Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
          <thead>
            <tr style={{ background: 'rgba(0, 0, 0, 0.4)', borderBottom: '1px solid rgba(200, 170, 110, 0.2)' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', color: 'var(--text-gold)', fontWeight: 600 }}>物料名稱 (Item)</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-gold)', fontWeight: 600 }}>單場用量</th>
              <th style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-gold)', fontWeight: 600 }}>
                {batchSize} 場總需數量
              </th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-gold)', fontWeight: 600 }}>參考單價</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-gold)', fontWeight: 600 }}>總費用 (Chaos)</th>
              <th style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-gold)', fontWeight: 600 }}>總費用 (Divine)</th>
            </tr>
          </thead>
          <tbody>
            {summary.batchItems.length > 0 ? (
              summary.batchItems.map((item, idx) => (
                <tr
                  key={idx}
                  className="poe-table-row"
                  style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}
                >
                  <td style={{ padding: '8px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.9rem' }}>
                        {item.category === 'scarab' ? '🪲' : '📦'}
                      </span>
                      <div>
                        <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{item.name}</div>
                        {item.nameEn && !item.name.includes(item.nameEn) && (
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{item.nameEn}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    x {item.unitCount}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'center', color: 'var(--text-gold)', fontWeight: 700 }}>
                    x {item.totalCount}
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>
                    {item.unitPriceChaos} C
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: 'var(--text-gold)' }}>
                    {item.totalCostChaos} C
                  </td>
                  <td style={{ padding: '8px 12px', textAlign: 'right', color: 'var(--text-dim)' }}>
                    ~{item.totalCostDivine} Div
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-dim)' }}>
                  當前分級尚未設定聖甲蟲或額外物品
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
