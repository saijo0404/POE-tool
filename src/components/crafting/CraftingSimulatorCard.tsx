import React from 'react';
import { Play, RotateCcw, Sparkles, Dices } from 'lucide-react';
import { CraftingItemPreview } from './CraftingItemPreview';
import type { CraftingMethodType, SimulatedItem } from '../../domain/crafting/types';
import { Card, Button } from '../ui';

interface CraftingSimulatorCardProps {
  selectedMethod: CraftingMethodType;
  onMethodChange: (m: CraftingMethodType) => void;
  simulatedItem: SimulatedItem | null;
  onRollOnce: () => void;
  onRollUntilHit: () => void;
  onReset: () => void;
  divineRate: number;
}

export const CraftingSimulatorCard: React.FC<CraftingSimulatorCardProps> = ({
  selectedMethod,
  onMethodChange,
  simulatedItem,
  onRollOnce,
  onRollUntilHit,
  onReset,
  divineRate,
}) => {
  const attempts = simulatedItem?.attemptCount ?? 0;
  const spentChaos = simulatedItem?.totalSpentChaos ?? 0;
  const spentDivine = Number((spentChaos / divineRate).toFixed(2));

  return (
    <Card variant="default" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', paddingBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Dices size={18} color="var(--text-gold)" />
          <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-gold)' }}>4. 實機模擬試骰沙盒 (Live Craft Sandbox)</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
          <span style={{ color: 'var(--text-muted)' }}>累計嘗試：</span>
          <span style={{ color: '#fff', fontWeight: 600 }}>{attempts} 次</span>
          <span style={{ color: 'var(--text-muted)' }}>| 花費：</span>
          <span style={{ color: '#f3d179', fontWeight: 700 }}>{spentChaos} c ({spentDivine} Div)</span>
        </div>
      </div>

      {/* Method Buttons & Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['essence', 'fossil', 'harvest', 'chaos'] as const).map(method => (
            <Button
              key={method}
              size="sm"
              variant={selectedMethod === method ? 'primary' : 'secondary'}
              onClick={() => onMethodChange(method)}
            >
              {method === 'essence' ? '精髓' : method === 'fossil' ? '化石' : method === 'harvest' ? '收割' : '混沌石'}
            </Button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="primary"
            size="sm"
            onClick={onRollOnce}
            icon={<Play size={14} />}
          >
            試骰 1 次
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onRollUntilHit}
            icon={<Sparkles size={14} />}
            style={{ borderColor: '#2ecc71', color: '#2ecc71' }}
          >
            點到命中 (上限100)
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onReset}
            icon={<RotateCcw size={14} />}
            title="重置模擬器"
          />
        </div>
      </div>

      {/* Item Tooltip Preview */}
      <CraftingItemPreview item={simulatedItem} />
    </Card>
  );
};
