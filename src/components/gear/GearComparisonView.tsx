import React, { useState } from 'react';
import type { ParsedItem } from '../../types/poe';
import { useGearComparison } from '../../hooks/useGearComparison';

interface GearComparisonViewProps {
  item: ParsedItem;
}

export const GearComparisonView: React.FC<GearComparisonViewProps> = ({ item }) => {
  const {
    slot,
    equippedItem,
    deltaReport,
    handleSetCurrentAsEquipped,
    handleClearEquipped
  } = useGearComparison(item);

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 text-xs shadow-md mt-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-300">
            ⚖️ 裝備差額對比
          </span>
          <span className="bg-zinc-800 text-zinc-400 border border-zinc-700 px-1.5 py-0.5 rounded text-[10px]">
            {slot}
          </span>
          {deltaReport && (
            <span
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                deltaReport.recommendation === 'upgrade'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : deltaReport.recommendation === 'downgrade'
                  ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
              }`}
            >
              {deltaReport.recommendation === 'upgrade'
                ? '提升'
                : deltaReport.recommendation === 'downgrade'
                ? '退步'
                : '持平'}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleSetCurrentAsEquipped}
            className="bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-600/50 px-2 py-0.5 rounded text-[11px]"
            title="將此裝備設為此槽位的當前穿戴基準"
          >
            設為穿戴基準
          </button>
          {equippedItem && (
            <button
              type="button"
              onClick={handleClearEquipped}
              className="text-zinc-400 hover:text-zinc-200 bg-zinc-800 px-1.5 py-0.5 rounded text-[11px] border border-zinc-700"
              title="清除當前槽位的基準記錄"
            >
              清除
            </button>
          )}
        </div>
      </div>

      {!equippedItem ? (
        <div className="mt-2 text-zinc-400 text-[11px]">
          尚未記錄【{slot}】槽位的穿戴裝備。點擊右上角「設為穿戴基準」即可記錄，後續查價時將自動對比屬性差額。
        </div>
      ) : deltaReport ? (
        <div className="mt-2 space-y-1.5">
          <div className="text-zinc-300 text-[11px] leading-relaxed">
            {deltaReport.summaryNote}
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {deltaReport.gains.map(g => (
              <span
                key={g.statKey}
                className="bg-emerald-950/40 border border-emerald-800/60 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
              >
                +{g.delta}{g.unit} {g.label}
              </span>
            ))}
            {deltaReport.losses.map(l => (
              <span
                key={l.statKey}
                className="bg-red-950/40 border border-red-800/60 text-red-400 px-1.5 py-0.5 rounded text-[10px] font-mono font-medium"
              >
                {l.delta}{l.unit} {l.label}
              </span>
            ))}
          </div>

          <div className="pt-1">
            <button
              type="button"
              onClick={() => setExpanded(prev => !prev)}
              className="text-zinc-400 hover:text-zinc-200 text-[10px] underline"
            >
              {expanded ? '收起完整對比表' : '展開完整屬性對照表'}
            </button>
          </div>

          {expanded && (
            <div className="mt-2 border-t border-zinc-800 pt-2 grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <div className="text-zinc-500 font-medium mb-1">現有裝備 ({deltaReport.currentName})</div>
                {deltaReport.deltas.map(d => (
                  <div key={d.statKey} className="flex justify-between py-0.5 border-b border-zinc-800/40 text-zinc-300">
                    <span>{d.label}</span>
                    <span className="font-mono">{d.currentValue}{d.unit}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-amber-400/90 font-medium mb-1">對比新裝 ({deltaReport.newName})</div>
                {deltaReport.deltas.map(d => (
                  <div key={d.statKey} className="flex justify-between py-0.5 border-b border-zinc-800/40 text-zinc-300">
                    <span>{d.label}</span>
                    <span className={`font-mono ${d.isPositive ? 'text-emerald-400' : d.isNegative ? 'text-red-400' : 'text-zinc-400'}`}>
                      {d.newValue}{d.unit} ({d.delta >= 0 ? '+' : ''}{d.delta}{d.unit})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
