import React, { useState, useMemo } from 'react';
import { Package, Copy, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import type { ScarabStockStrategy, ScarabShortage } from '../../domain/scarab/scarabTypes';
import { DEFAULT_SCARABS, PRESET_SCARAB_STRATEGIES } from '../../domain/scarab/scarabData';
import { auditScarabStock, getScarabById } from '../../domain/scarab/scarabStockEngine';
import { Card, Button } from '../ui';

interface ScarabStockAuditCardProps {
  divineRate?: number;
  onShowToast: (msg: string) => void;
}

export const ScarabStockAuditCard: React.FC<ScarabStockAuditCardProps> = ({ divineRate = 150, onShowToast }) => {
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>(PRESET_SCARAB_STRATEGIES[0].id);
  const [targetRuns, setTargetRuns] = useState<number>(PRESET_SCARAB_STRATEGIES[0].targetMapRuns);
  const [inventory, setInventory] = useState<Record<string, number>>({
    scarab_ambush_normal: 40, scarab_ambush_hidden: 15, scarab_divination_plenty: 20
  });

  const currentStrategy = useMemo(() => {
    const s = PRESET_SCARAB_STRATEGIES.find(st => st.id === selectedStrategyId) || PRESET_SCARAB_STRATEGIES[0];
    return { ...s, targetMapRuns: targetRuns };
  }, [selectedStrategyId, targetRuns]);

  const audit = useMemo(() => auditScarabStock(inventory, currentStrategy, DEFAULT_SCARABS, divineRate), [inventory, currentStrategy, divineRate]);
  const handleUpdateStock = (id: string, count: number) => setInventory(p => ({ ...p, [id]: Math.max(0, count) }));
  const handleCopyWhisper = () => { navigator.clipboard?.writeText(audit.bulkWhisperCommand); onShowToast('已複製大宗採購密語指令！'); };
  const handleSelectStrat = (id: string) => { setSelectedStrategyId(id); const s = PRESET_SCARAB_STRATEGIES.find(x => x.id === id); if (s) setTargetRuns(s.targetMapRuns); };

  return (
    <Card variant="default" padding="md" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <CardHeader completionPct={audit.completionPct} maxRuns={audit.maxPlayableRuns} />
      <StrategySelectorBar strategies={PRESET_SCARAB_STRATEGIES} selectedId={selectedStrategyId} targetRuns={targetRuns} onSelectStrategy={handleSelectStrat} onChangeTargetRuns={setTargetRuns} />
      <AuditMetricsMeter audit={audit} />
      <InventoryInputsGrid requirements={currentStrategy.requirements} inventory={inventory} onChangeStock={handleUpdateStock} />
      {audit.shortages.length > 0 && <ShortagesTable shortages={audit.shortages} onCopyWhisper={handleCopyWhisper} />}
    </Card>
  );
};

const CardHeader: React.FC<{ completionPct: number; maxRuns: number }> = ({ completionPct, maxRuns }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ffd700', fontWeight: 'bold' }}>
      <Package size={18} /><span>聖甲蟲庫存自動盤點與成套率精算 (Scarab Stock Audit)</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 215, 0, 0.15)', padding: '3px 10px', borderRadius: '4px', border: '1px solid rgba(255, 215, 0, 0.4)' }}>
      {completionPct === 100 ? <CheckCircle size={14} color="#2ecc71" /> : <RefreshCw size={14} color="#ffd700" />}
      <span style={{ color: '#ffd700', fontWeight: 'bold', fontSize: '0.85rem' }}>成套進度 {completionPct}% (可跑 {maxRuns} 場)</span>
    </div>
  </div>
);

const StrategySelectorBar: React.FC<{
  strategies: ScarabStockStrategy[];
  selectedId: string;
  targetRuns: number;
  onSelectStrategy: (id: string) => void;
  onChangeTargetRuns: (runs: number) => void;
}> = ({ strategies, selectedId, targetRuns, onSelectStrategy, onChangeTargetRuns }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
    <div style={{ display: 'flex', gap: '8px' }}>
      {strategies.map(s => (
        <Button
          key={s.id}
          size="sm"
          variant={s.id === selectedId ? 'primary' : 'secondary'}
          onClick={() => onSelectStrategy(s.id)}
        >
          {s.name}
        </Button>
      ))}
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#aaa' }}>
      <span>目標場次:</span>
      <input aria-label="目標刷圖場次" type="number" value={targetRuns} onChange={e => onChangeTargetRuns(Math.max(1, Number(e.target.value)))} style={{ width: '60px', padding: '3px 6px', background: '#1e1e1e', color: '#fff', border: '1px solid #444', borderRadius: '3px', fontSize: '0.8rem' }} />
      <span>場</span>
    </div>
  </div>
);

const AuditMetricsMeter: React.FC<{ audit: ReturnType<typeof auditScarabStock> }> = ({ audit }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '4px' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '0.75rem', color: '#888' }}>當前庫存可跑場次</span>
      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: audit.maxPlayableRuns >= audit.targetMapRuns ? '#2ecc71' : '#e67e22' }}>
        {audit.maxPlayableRuns} / {audit.targetMapRuns} 場
      </span>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <span style={{ fontSize: '0.75rem', color: '#888' }}>補齊缺口預估花費</span>
      <span style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#e74c3c' }}>
        {audit.totalRestockCostChaos} c (~{audit.totalRestockCostDivine} Div)
      </span>
    </div>
    {audit.bottleneckScarabId && (
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#e67e22' }}>
        <AlertTriangle size={14} color="#e67e22" />
        <span>瓶頸短板: <strong>{getScarabById(audit.bottleneckScarabId, DEFAULT_SCARABS)?.nameZh || audit.bottleneckScarabId}</strong></span>
      </div>
    )}
  </div>
);

const InventoryInputsGrid: React.FC<{
  requirements: ScarabStockStrategy['requirements'];
  inventory: Record<string, number>;
  onChangeStock: (id: string, count: number) => void;
}> = ({ requirements, inventory, onChangeStock }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <span style={{ fontSize: '0.8rem', color: '#888' }}>當前倉庫甲蟲庫存 (可直接編輯進行盤點試算):</span>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
      {requirements.map(req => {
        const scarab = getScarabById(req.scarabId, DEFAULT_SCARABS);
        const current = inventory[req.scarabId] || 0;
        return (
          <div key={req.scarabId} style={{ padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '0.82rem', color: '#ffd700', fontWeight: 600 }}>{scarab?.nameZh || req.scarabId}</span>
              <span style={{ fontSize: '0.72rem', color: '#666' }}>每場需 {req.quantityPerMap} 個</span>
            </div>
            <input aria-label={`${scarab?.nameZh || req.scarabId} 庫存`} type="number" value={current} onChange={e => onChangeStock(req.scarabId, Number(e.target.value))} style={{ width: '55px', padding: '2px 4px', background: '#111', color: '#fff', border: '1px solid #444', borderRadius: '3px', fontSize: '0.78rem' }} />
          </div>
        );
      })}
    </div>
  </div>
);

const ShortagesTable: React.FC<{
  shortages: ReturnType<typeof auditScarabStock>['shortages'];
  onCopyWhisper: () => void;
}> = ({ shortages, onCopyWhisper }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.8rem', color: '#e74c3c' }}>待採購補貨清單:</span>
      <Button
        size="sm"
        variant="secondary"
        onClick={onCopyWhisper}
        icon={<Copy size={11} />}
      >
        複製大宗採購指令
      </Button>
    </div>
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', fontSize: '0.75rem', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#888' }}>
            <th style={{ padding: '4px' }}>甲蟲名稱</th><th style={{ padding: '4px' }}>現有 / 目標</th><th style={{ padding: '4px' }}>缺少數量</th><th style={{ padding: '4px' }}>預估花費</th>
          </tr>
        </thead>
        <tbody>
          {shortages.map(s => <ShortageRow key={s.scarabId} shortage={s} />)}
        </tbody>
      </table>
    </div>
  </div>
);

const ShortageRow: React.FC<{ shortage: ScarabShortage }> = ({ shortage }) => (
  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
    <td style={{ padding: '4px', color: '#ffd700' }}>{shortage.nameZh}</td>
    <td style={{ padding: '4px', color: '#aaa' }}>{shortage.currentStock} / {shortage.neededStock}</td>
    <td style={{ padding: '4px', color: '#e74c3c', fontWeight: 'bold' }}>+{shortage.missingQuantity}</td>
    <td style={{ padding: '4px', color: '#e67e22' }}>{shortage.estimatedCostChaos} c</td>
  </tr>
);
