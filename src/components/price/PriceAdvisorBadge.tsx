import React, { useMemo } from 'react';
import type { TradeListing } from '../../types/poe';
import { analyzeMarketPrices, type PriceAnalysisResult } from '../../domain/price/priceFilterEngine';

interface PriceAdvisorBadgeProps {
  listings: TradeListing[];
  divineChaosRate?: number;
}

function getConfidenceBadge(confidence: PriceAnalysisResult['confidenceLevel']): { text: string; color: string } {
  if (confidence === 'high') return { text: '高信賴度', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
  if (confidence === 'medium') return { text: '中信賴度', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
  return { text: '樣本偏少', color: 'bg-zinc-700/40 text-zinc-400 border-zinc-600/40' };
}

export const PriceAdvisorBadge: React.FC<PriceAdvisorBadgeProps> = ({
  listings,
  divineChaosRate = 150
}) => {
  const analysis = useMemo(
    () => analyzeMarketPrices(listings, { divineChaosRate }),
    [listings, divineChaosRate]
  );

  if (analysis.sampleCount === 0) return null;

  const confBadge = getConfidenceBadge(analysis.confidenceLevel);
  const isHighValue = analysis.suggestedFairPriceChaos >= divineChaosRate;

  return (
    <div className="bg-zinc-900/95 border border-zinc-800 rounded-lg p-3 text-xs shadow-md mb-2">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-amber-300 flex items-center gap-1">
            📊 市集抗壓價估值
          </span>
          <span className={`px-1.5 py-0.5 rounded border text-[10px] ${confBadge.color}`}>
            {confBadge.text}
          </span>
        </div>
        <span className="text-zinc-500 text-[11px]">
          有效樣本 {analysis.validCount}/{analysis.sampleCount} 筆
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-zinc-800/40 p-2 rounded border border-zinc-800/60">
        <div>
          <div className="text-[11px] text-zinc-400">建議合理市價 (中位數)</div>
          <div className="text-sm font-bold text-amber-400 font-mono">
            {analysis.suggestedFairPriceChaos}c
            {isHighValue && (
              <span className="text-xs text-zinc-300 font-normal ml-1">
                (~{analysis.suggestedFairPriceDivine} Div)
              </span>
            )}
          </div>
        </div>

        <div>
          <div className="text-[11px] text-zinc-400">建議快速脫手價 (15%)</div>
          <div className="text-sm font-bold text-emerald-400 font-mono">
            {analysis.suggestedQuickSellChaos}c
            {isHighValue && (
              <span className="text-xs text-zinc-300 font-normal ml-1">
                (~{analysis.suggestedQuickSellDivine} Div)
              </span>
            )}
          </div>
        </div>
      </div>

      {analysis.hasPriceFixing && (
        <div className="mt-2 text-[11px] text-red-400 bg-red-950/30 border border-red-900/50 rounded px-2 py-1 flex items-center gap-1">
          <span>{analysis.warningMessage}</span>
        </div>
      )}

      {analysis.highOutlierCount > 0 && !analysis.hasPriceFixing && (
        <div className="mt-1.5 text-[10px] text-zinc-400">
          ℹ️ 已剔除 {analysis.highOutlierCount} 筆高於 {analysis.upperFenceChaos}c 的極端高價掛牌。
        </div>
      )}
    </div>
  );
};
