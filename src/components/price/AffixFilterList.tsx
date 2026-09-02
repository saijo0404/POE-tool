import React, { useState } from 'react';
import { Filter, Link2, Skull, ShieldCheck, Plus, Search, RefreshCw, Sliders } from 'lucide-react';
import type { ParsedItemMod, TradeStatusOption } from '../../types/poe';
import { ModCategoryGroup } from './ModCategoryGroup';
import { CustomModModal } from './CustomModModal';

interface AffixFilterListProps {
  mods: ParsedItemMod[];
  tradeStatus?: TradeStatusOption;
  setTradeStatus?: (val: TradeStatusOption) => void;
  linksMin?: number;
  setLinksMin?: (val: number | undefined) => void;
  corruptedFilter?: boolean;
  setCorruptedFilter?: (val: boolean | undefined) => void;
  itemLevelMin?: number;
  setItemLevelMin?: (val: number | undefined) => void;
  rollPercentage?: number;
  setRollPercentage?: (val: number) => void;
  onToggleMod: (index: number) => void;
  onChangeMinValue: (index: number, val: number | undefined) => void;
  onChangeMaxValue: (index: number, val: number | undefined) => void;
  formatModText: (mod: ParsedItemMod) => string;
  onAddCustomMod?: (mod: { text: string; englishText?: string; value?: number; minValue?: number; maxValue?: number }) => void;
  onRemoveMod?: (index: number) => void;
  onSearchTrade?: () => void;
  searching?: boolean;
}

export const AffixFilterList: React.FC<AffixFilterListProps> = ({
  mods, tradeStatus, setTradeStatus, linksMin, setLinksMin, corruptedFilter, setCorruptedFilter,
  itemLevelMin, setItemLevelMin, rollPercentage, setRollPercentage, onToggleMod, onChangeMinValue, onChangeMaxValue,
  formatModText, onAddCustomMod, onRemoveMod, onSearchTrade, searching = false
}) => {
  const [showAddCustom, setShowAddCustom] = useState<boolean>(false);

  const pseudos = mods.map((mod, idx) => ({ mod, originalIndex: idx })).filter(x => x.mod.type === 'pseudo' && !x.mod.id.startsWith('custom'));
  const implicits = mods.map((mod, idx) => ({ mod, originalIndex: idx })).filter(x => x.mod.type === 'implicit' && !x.mod.id.startsWith('custom'));
  const fractured = mods.map((mod, idx) => ({ mod, originalIndex: idx })).filter(x => x.mod.type === 'fractured' && !x.mod.id.startsWith('custom'));
  const crafted = mods.map((mod, idx) => ({ mod, originalIndex: idx })).filter(x => x.mod.type === 'crafted' && !x.mod.id.startsWith('custom'));
  const explicits = mods.map((mod, idx) => ({ mod, originalIndex: idx })).filter(x => !['implicit', 'fractured', 'crafted', 'pseudo'].includes(x.mod.type) && !x.mod.id.startsWith('custom'));
  const customList = mods.map((mod, idx) => ({ mod, originalIndex: idx })).filter(x => x.mod.id.startsWith('custom'));

  return (
    <div className="poe-card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="var(--text-gold)" />
          <h3 className="poe-font" style={{ fontSize: '1rem', color: 'var(--text-gold)', margin: 0 }}>市集進階篩選與詞綴過濾</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {onAddCustomMod && (
            <button type="button" onClick={() => setShowAddCustom(!showAddCustom)} className="poe-button-secondary" style={{ padding: '4px 10px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Plus size={13} /> {showAddCustom ? '關閉新增' : '➕ 新增額外篩選詞綴'}
            </button>
          )}
          {onSearchTrade && (
            <button type="button" onClick={onSearchTrade} disabled={searching} className="poe-button" style={{ padding: '6px 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {searching ? <RefreshCw size={14} className="spin" /> : <Search size={14} />} {searching ? '查詢中...' : '依選定詞綴查詢市集'}
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', padding: '10px 14px', background: 'rgba(0, 0, 0, 0.25)', borderRadius: '6px', alignItems: 'center' }}>
          {setTradeStatus && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="var(--text-gold)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>交易方式:</span>
              <select className="poe-input" value={tradeStatus} onChange={e => setTradeStatus(e.target.value as TradeStatusOption)} style={{ padding: '3px 8px', fontSize: '0.8rem', background: '#121214', color: 'var(--text-bright)' }}>
                <option value="instant">Instant Buyout (僅即時直購 - 預設)</option>
                <option value="securable">Securable (可擔保交易)</option>
                <option value="any_buyout">Instant Buyout and In Person (任何直購)</option>
                <option value="onlineleague">In Person (Online League 聯盟在線)</option>
                <option value="online">In Person (Online 任意在線)</option>
                <option value="any">Any (全部狀態)</option>
              </select>
            </div>
          )}
          {setLinksMin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Link2 size={14} color="var(--text-gold)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>最少連線:</span>
              <select className="poe-input" value={linksMin ?? ''} onChange={e => setLinksMin(e.target.value === '' ? undefined : Number(e.target.value))} style={{ padding: '3px 8px', fontSize: '0.8rem', background: '#121214', color: 'var(--text-bright)' }}>
                <option value="">不限</option><option value="6">6 連 (6L)</option><option value="5">5 連 (5L)</option><option value="4">4 連 (4L)</option>
              </select>
            </div>
          )}
          {setCorruptedFilter && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Skull size={14} color="#ef4444" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>已汙染:</span>
              <select className="poe-input" value={corruptedFilter === undefined ? '' : corruptedFilter ? 'yes' : 'no'} onChange={e => setCorruptedFilter(e.target.value === '' ? undefined : e.target.value === 'yes')} style={{ padding: '3px 8px', fontSize: '0.8rem', background: '#121214', color: 'var(--text-bright)' }}>
                <option value="">不限</option><option value="yes">僅已汙染</option><option value="no">未汙染</option>
              </select>
            </div>
          )}
          {setItemLevelMin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>最低物等:</span>
              <input type="number" className="poe-input" value={itemLevelMin ?? ''} placeholder="無" onChange={e => setItemLevelMin(e.target.value === '' ? undefined : Number(e.target.value))} style={{ width: '55px', padding: '3px 6px', fontSize: '0.8rem', textAlign: 'center' }} />
            </div>
          )}
        </div>

        {setRollPercentage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 14px', background: 'rgba(200, 170, 110, 0.07)', borderRadius: '6px', border: '1px solid rgba(200, 170, 110, 0.18)', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders size={14} color="var(--text-gold)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gold)', fontWeight: 600 }}>數值門檻 (Roll %):</span>
              <span style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 700, minWidth: '38px' }}>{rollPercentage ?? 80}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={100}
              step={5}
              value={rollPercentage ?? 80}
              onChange={e => setRollPercentage(Number(e.target.value))}
              style={{ accentColor: 'var(--text-gold)', cursor: 'pointer', flex: '1 1 120px', maxWidth: '180px' }}
            />
            <div style={{ display: 'flex', gap: '4px' }}>
              {[70, 80, 90, 100].map(pct => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setRollPercentage(pct)}
                  className="poe-button-secondary"
                  style={{
                    padding: '2px 8px',
                    fontSize: '0.74rem',
                    background: (rollPercentage ?? 80) === pct ? 'rgba(200, 170, 110, 0.3)' : undefined,
                    borderColor: (rollPercentage ?? 80) === pct ? 'var(--text-gold)' : undefined,
                    color: (rollPercentage ?? 80) === pct ? '#fff' : undefined,
                  }}
                >
                  {pct === 100 ? '100% (嚴格)' : `${pct}%`}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAddCustom && onAddCustomMod && (
        <CustomModModal onAddCustomMod={onAddCustomMod} onClose={() => setShowAddCustom(false)} />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <ModCategoryGroup title="偽屬性 (Pseudo Stats - 總抗/總生命)" badgeBg="rgba(192, 132, 252, 0.2)" badgeColor="#c084fc" items={pseudos} onToggleMod={onToggleMod} onChangeMinValue={onChangeMinValue} onChangeMaxValue={onChangeMaxValue} formatModText={formatModText} onRemoveMod={onRemoveMod} />
        <ModCategoryGroup title="固定詞綴 (Implicit)" badgeBg="rgba(56, 189, 248, 0.15)" badgeColor="#38bdf8" items={implicits} onToggleMod={onToggleMod} onChangeMinValue={onChangeMinValue} onChangeMaxValue={onChangeMaxValue} formatModText={formatModText} onRemoveMod={onRemoveMod} />
        <ModCategoryGroup title="分裂詞綴 (Fractured)" badgeBg="rgba(234, 179, 8, 0.15)" badgeColor="#eab308" items={fractured} onToggleMod={onToggleMod} onChangeMinValue={onChangeMinValue} onChangeMaxValue={onChangeMaxValue} formatModText={formatModText} onRemoveMod={onRemoveMod} />
        <ModCategoryGroup title="工藝詞綴 (Crafted)" badgeBg="rgba(168, 85, 247, 0.15)" badgeColor="#a855f7" items={crafted} onToggleMod={onToggleMod} onChangeMinValue={onChangeMinValue} onChangeMaxValue={onChangeMaxValue} formatModText={formatModText} onRemoveMod={onRemoveMod} />
        <ModCategoryGroup title="主要詞綴 (Explicit)" badgeBg="rgba(200, 170, 110, 0.15)" badgeColor="var(--text-gold)" items={explicits} onToggleMod={onToggleMod} onChangeMinValue={onChangeMinValue} onChangeMaxValue={onChangeMaxValue} formatModText={formatModText} onRemoveMod={onRemoveMod} />
        <ModCategoryGroup title="自訂詞綴" badgeBg="rgba(34, 197, 94, 0.15)" badgeColor="#22c55e" items={customList} onToggleMod={onToggleMod} onChangeMinValue={onChangeMinValue} onChangeMaxValue={onChangeMaxValue} formatModText={formatModText} onRemoveMod={onRemoveMod} />
      </div>
    </div>
  );
};
