import React, { useState, useMemo } from 'react';
import type { AtlasStrategyTier } from '../../domain/atlas/types';
import {
  calculateBulkShoppingPlan,
  formatBulkShoppingClipboardText,
  type BulkShoppingPlan
} from '../../domain/atlas/atlasBulkShoppingEngine';
import { ShoppingCart, Copy, Coins, Edit2, Check } from 'lucide-react';
import { Card, Button } from '../ui';

interface AtlasBulkShoppingCardProps {
  tier: AtlasStrategyTier;
  strategyName?: string;
  divineRate?: number;
  ninjaRates?: Record<string, number>;
  onShowToast?: (msg: string) => void;
}

const RUN_PRESETS = [10, 25, 50, 100];

export const AtlasBulkShoppingCard: React.FC<AtlasBulkShoppingCardProps> = ({
  tier,
  strategyName,
  divineRate = 150,
  ninjaRates = {},
  onShowToast
}) => {
  const [runs, setRuns] = useState<number>(50);
  const [customPriceOverrides, setCustomPriceOverrides] = useState<Record<string, number>>({});
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [overrideInput, setOverrideInput] = useState<string>('');

  const planResult = useMemo(() => {
    return calculateBulkShoppingPlan({
      tier,
      runs,
      strategyName,
      divineRate,
      ninjaRates,
      customPriceOverrides
    });
  }, [tier, runs, strategyName, divineRate, ninjaRates, customPriceOverrides]);

  const plan: BulkShoppingPlan | null = planResult.isOk() ? planResult.value : null;

  const handleCopyClipboard = async () => {
    if (!plan) return;
    const text = formatBulkShoppingClipboardText(plan);
    try {
      await navigator.clipboard.writeText(text);
      onShowToast?.(`已複製 ${plan.runs} 場大宗採購清單至剪貼簿！`);
    } catch {
      onShowToast?.('複製失敗，請手動選取複製');
    }
  };

  const handleSaveOverride = (itemName: string) => {
    const val = parseFloat(overrideInput);
    if (!isNaN(val) && val >= 0) {
      setCustomPriceOverrides(prev => ({ ...prev, [itemName]: val }));
    }
    setEditingItem(null);
    setOverrideInput('');
  };

  if (!plan) return null;

  return (
    <Card
      variant="default"
      padding="none"
      style={{
        background: 'linear-gradient(145deg, #141b27 0%, #0d121c 100%)',
        border: '1px solid rgba(200, 170, 110, 0.25)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      {/* Header & Runs Selector */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShoppingCart size={18} color="var(--text-gold, #f3d179)" />
          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#f3d179' }}>
            大宗備料清單與成本精算
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>場次：</span>
          {RUN_PRESETS.map(preset => (
            <button
              key={preset}
              type="button"
              onClick={() => setRuns(preset)}
              style={{
                background: runs === preset ? 'var(--text-gold, #f3d179)' : 'rgba(255, 255, 255, 0.05)',
                color: runs === preset ? '#0d121c' : '#cbd5e1',
                border: '1px solid rgba(200, 170, 110, 0.2)',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '0.75rem',
                fontWeight: runs === preset ? 600 : 400,
                cursor: 'pointer'
              }}
            >
              {preset} 場
            </button>
          ))}
          <input
            type="number"
            min="1"
            max="1000"
            value={runs}
            onChange={e => setRuns(Math.max(1, parseInt(e.target.value) || 1))}
            style={{
              width: '54px',
              padding: '2px 4px',
              fontSize: '0.75rem',
              textAlign: 'center',
              borderRadius: '4px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              background: '#090d14',
              color: '#fff'
            }}
          />
        </div>
      </div>

      {/* Items Table */}
      {plan.items.length === 0 ? (
        <div style={{ fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center', padding: '12px 0' }}>
          ✨ 此分級配置未設定聖甲蟲或工藝消耗，單場 0 成本！
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {plan.items.map(item => {
            const isEditing = editingItem === item.name;
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '6px 10px',
                  background: 'rgba(255, 255, 255, 0.025)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '5px',
                  fontSize: '0.82rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1 }}>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '1px 5px',
                    borderRadius: '3px',
                    background: item.isCraftCost ? 'rgba(59, 130, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: item.isCraftCost ? '#93c5fd' : '#fcd34d'
                  }}>
                    {item.isCraftCost ? '工藝' : '聖甲蟲'}
                  </span>
                  <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{item.name}</span>
                  <span style={{ color: '#94a3b8', fontSize: '0.76rem' }}>
                    (每場 {item.perMapCount})
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#f3d179', fontWeight: 600 }}>
                    x {item.totalCount}
                  </span>

                  {isEditing ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input
                        type="number"
                        step="0.5"
                        value={overrideInput}
                        onChange={e => setOverrideInput(e.target.value)}
                        placeholder={String(item.unitPriceChaos)}
                        style={{ width: '50px', fontSize: '0.75rem', padding: '1px 3px', background: '#090d14', color: '#fff', border: '1px solid #c8aa6e' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveOverride(item.name)}
                        style={{ background: '#22c55e', border: 'none', color: '#fff', borderRadius: '3px', padding: '2px 4px', cursor: 'pointer' }}
                      >
                        <Check size={12} />
                      </button>
                    </div>
                  ) : (
                    <span
                      onClick={() => {
                        setEditingItem(item.name);
                        setOverrideInput(String(item.unitPriceChaos));
                      }}
                      title="點擊自訂單價"
                      style={{ color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                    >
                      @{item.unitPriceChaos}c <Edit2 size={10} />
                    </span>
                  )}

                  <span style={{ width: '70px', textAlign: 'right', color: '#e2e8f0', fontWeight: 600 }}>
                    {item.totalCostChaos}c
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      <div style={{
        marginTop: '4px',
        padding: '10px 12px',
        background: 'rgba(0, 0, 0, 0.3)',
        borderRadius: '6px',
        border: '1px dashed rgba(200, 170, 110, 0.2)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.78rem' }}>
          <div>
            <span style={{ color: '#94a3b8' }}>單場成本：</span>
            <span style={{ color: '#f3d179', fontWeight: 600 }}>{plan.singleMapCostChaos} c</span>
            <span style={{ color: '#94a3b8', marginLeft: '4px' }}>({plan.singleMapCostDivine} div)</span>
          </div>
          <div>
            <span style={{ color: '#94a3b8' }}>總採購花費：</span>
            <span style={{ color: '#f87171', fontWeight: 700, fontSize: '0.85rem' }}>{plan.totalCostChaos} c</span>
            <span style={{ color: '#fca5a5', marginLeft: '4px' }}>({plan.totalCostDivine} div)</span>
          </div>
          {plan.totalEstimatedGoldFee > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#eab308' }}>
              <Coins size={12} />
              <span>Faustus 預估金幣：約 {plan.totalEstimatedGoldFee.toLocaleString()} (約需 {plan.mapsNeededToFarmGold} 場 T16)</span>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopyClipboard}
            icon={<Copy size={13} />}
          >
            複製採購清單
          </Button>
        </div>
      </div>
    </Card>
  );
};
