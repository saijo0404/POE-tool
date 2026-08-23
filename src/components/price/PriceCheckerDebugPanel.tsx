import React, { useState } from 'react';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import type { ParsedItem, ParsedItemMod, TradeSearchResult } from '../../types/poe';

interface PriceCheckerDebugPanelProps {
  parsedItem: ParsedItem;
  mods: ParsedItemMod[];
  linksMin?: number;
  corruptedFilter?: boolean;
  tradeResults: TradeSearchResult | null;
}

export const PriceCheckerDebugPanel: React.FC<PriceCheckerDebugPanelProps> = ({
  parsedItem,
  mods,
  linksMin,
  corruptedFilter,
  tradeResults
}) => {
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const activeModsCount = mods.filter(m => m.enabled).length;

  return (
    <div className="poe-card" style={{ background: 'rgba(0, 0, 0, 0.4)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
      <button
        type="button"
        onClick={() => setShowDebug(prev => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          padding: '6px 0',
          fontSize: '0.85rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={16} color="var(--accent-blue)" />
          <span style={{ color: 'var(--text-gold)', fontWeight: 600 }}>
            🛠️ 查價詞綴與 GGG 搜尋 Payload 除錯資訊 (Debug Logs)
          </span>
          <span style={{ fontSize: '0.78rem', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', padding: '1px 6px', borderRadius: '3px' }}>
            已選詞綴: {activeModsCount} / {mods.length}
          </span>
        </div>
        {showDebug ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {showDebug && (
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: '#cbd5e1' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '12px' }}>
            <div style={{ background: '#090d14', padding: '10px', borderRadius: '4px' }}>
              <strong style={{ color: 'var(--text-gold)' }}>📦 裝備解析屬性:</strong>
              <div>名稱 (Name): {parsedItem.name || '(無)'}</div>
              <div>底材 (BaseType): {parsedItem.baseType}</div>
              <div>稀有度 (Rarity): {parsedItem.rarity}</div>
              <div>物品等級 (iLvl): {parsedItem.itemLevel ?? '無'}</div>
              <div>連線 (Links): {linksMin ?? '無'}</div>
              <div>已汙染 (Corrupted): {corruptedFilter === undefined ? '不限' : corruptedFilter ? '是' : '否'}</div>
            </div>

            <div style={{ background: '#090d14', padding: '10px', borderRadius: '4px' }}>
              <strong style={{ color: 'var(--text-gold)' }}>🎯 詞綴清單與 GGG Stat ID:</strong>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {mods.map((m, i) => (
                  <li key={i} style={{ color: m.enabled ? '#4ade80' : 'var(--text-muted)' }}>
                    [{m.enabled ? '✓ 已勾選' : '✗ 未選'}] {m.text} ➔ <code>{m.id}</code> (Min: {m.minValue ?? '無'}, Max: {m.maxValue ?? '無'})
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {tradeResults && (
            <div style={{ background: '#090d14', padding: '10px', borderRadius: '4px' }}>
              <strong style={{ color: 'var(--text-gold)' }}>🌐 GGG 市集查詢結果:</strong>
              <div>Search ID: <code>{tradeResults.searchId || tradeResults.id || 'N/A'}</code></div>
              <div>Total Results: <strong>{tradeResults.total}</strong> 筆</div>
              {tradeResults.tradeUrl && (
                <div>
                  Official URL: <a href={tradeResults.tradeUrl} target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>{tradeResults.tradeUrl}</a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
