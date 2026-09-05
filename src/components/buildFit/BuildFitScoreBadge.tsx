import React, { useState } from 'react';
import type { BuildFitEvaluation, BuildPreset, BuildFitRank } from '../../domain/buildFit/types';

interface BuildFitScoreBadgeProps {
  evaluation: BuildFitEvaluation | null;
  presets: BuildPreset[];
  selectedPresetId: string;
  onSelectPreset: (id: string) => void;
}

function getRankBadgeStyle(rank: BuildFitRank): { bg: string; text: string; border: string } {
  switch (rank) {
    case 'S':
      return { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' };
    case 'A':
      return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/50' };
    case 'B':
      return { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/50' };
    case 'C':
      return { bg: 'bg-zinc-600/20', text: 'text-zinc-400', border: 'border-zinc-500/50' };
    default:
      return { bg: 'bg-red-500/10', text: 'text-red-400/70', border: 'border-red-500/30' };
  }
}

export const BuildFitScoreBadge: React.FC<BuildFitScoreBadgeProps> = ({
  evaluation,
  presets,
  selectedPresetId,
  onSelectPreset
}) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!evaluation) return null;

  const style = getRankBadgeStyle(evaluation.rank);

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-lg p-3 text-xs shadow-md mt-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 font-bold rounded border text-sm ${style.bg} ${style.text} ${style.border}`}>
            {evaluation.rank} 級
          </span>
          <div>
            <span className="text-zinc-400">流派契合度：</span>
            <span className="font-semibold text-zinc-100">{evaluation.totalScore} 分</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <select
            value={selectedPresetId}
            onChange={e => onSelectPreset(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-zinc-300 rounded px-2 py-1 text-xs focus:outline-none focus:border-amber-500"
            aria-label="選擇流派預設"
          >
            {presets.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowDetails(prev => !prev)}
            className="text-zinc-400 hover:text-zinc-200 px-1.5 py-0.5 rounded bg-zinc-800/80 border border-zinc-700"
            title="查看屬性詳情"
          >
            {showDetails ? '收起' : '明細'}
          </button>
        </div>
      </div>

      <div className="mt-1.5 text-zinc-300 text-[11px] leading-relaxed">
        {evaluation.advice}
      </div>

      {evaluation.primaryHighlights.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {evaluation.primaryHighlights.map((hl, idx) => (
            <span
              key={idx}
              className="bg-zinc-800 text-zinc-300 border border-zinc-700/60 px-1.5 py-0.5 rounded text-[10px]"
            >
              {hl}
            </span>
          ))}
        </div>
      )}

      {showDetails && evaluation.matches.length > 0 && (
        <div className="mt-2 pt-2 border-t border-zinc-800 space-y-1">
          <div className="text-[10px] text-zinc-400 font-medium">契合詞綴得分列表：</div>
          {evaluation.matches.map((m, i) => (
            <div key={i} className="flex items-center justify-between text-[11px] text-zinc-300">
              <span className="truncate max-w-[220px]" title={m.modText}>
                {m.modText}
              </span>
              <span className="text-amber-400/90 font-mono ml-2">+{m.score} 分</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
