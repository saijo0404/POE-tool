import React, { useState, useMemo } from 'react';
import { History, Scale, Trash2, X, PlusCircle, ArrowUpRight } from 'lucide-react';
import type { ClipboardHistoryItem, ComparisonItem } from '../../domain/history/types';
import { compareItems } from '../../domain/history/clipboardHistoryManager';

interface ClipboardHistoryTrayProps {
  history: ClipboardHistoryItem[];
  tray: ComparisonItem[];
  onSelectHistoryItem: (item: ClipboardHistoryItem) => void;
  onAddToComparison: (item: ClipboardHistoryItem) => void;
  onRemoveFromComparison: (id: string) => void;
  onClearComparison: () => void;
  onClearHistory?: () => void;
}

export const ClipboardHistoryTray: React.FC<ClipboardHistoryTrayProps> = ({
  history,
  tray,
  onSelectHistoryItem,
  onAddToComparison,
  onRemoveFromComparison,
  onClearComparison,
  onClearHistory
}) => {
  const [activeTab, setActiveTab] = useState<'history' | 'comparison'>('history');
  const comparisonResult = useMemo(() => compareItems(tray), [tray]);

  return (
    <div className="poe-card" style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <TrayHeader
        activeTab={activeTab}
        historyCount={history.length}
        trayCount={tray.length}
        onTabChange={setActiveTab}
        onClearHistory={onClearHistory}
        onClearComparison={onClearComparison}
      />
      {activeTab === 'history' ? (
        <HistoryList history={history} tray={tray} onSelect={onSelectHistoryItem} onAdd={onAddToComparison} />
      ) : (
        <ComparisonView result={comparisonResult} onRemove={onRemoveFromComparison} />
      )}
    </div>
  );
};

interface TrayHeaderProps {
  activeTab: 'history' | 'comparison';
  historyCount: number;
  trayCount: number;
  onTabChange: (tab: 'history' | 'comparison') => void;
  onClearHistory?: () => void;
  onClearComparison?: () => void;
}

const TrayHeader: React.FC<TrayHeaderProps> = (props) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
    <TrayHeaderTabs activeTab={props.activeTab} historyCount={props.historyCount} trayCount={props.trayCount} onTabChange={props.onTabChange} />
    <TrayHeaderActions activeTab={props.activeTab} historyCount={props.historyCount} trayCount={props.trayCount} onClearHistory={props.onClearHistory} onClearComparison={props.onClearComparison} />
  </div>
);

const TrayHeaderTabs: React.FC<{
  activeTab: 'history' | 'comparison';
  historyCount: number;
  trayCount: number;
  onTabChange: (tab: 'history' | 'comparison') => void;
}> = ({ activeTab, historyCount, trayCount, onTabChange }) => (
  <div style={{ display: 'flex', gap: '8px' }}>
    <button type="button" className={`btn-filter ${activeTab === 'history' ? 'active' : ''}`} onClick={() => onTabChange('history')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <History size={14} /><span>查價歷史 ({historyCount})</span>
    </button>
    <button type="button" className={`btn-filter ${activeTab === 'comparison' ? 'active' : ''}`} onClick={() => onTabChange('comparison')} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <Scale size={14} /><span>比價暫存列 ({trayCount}/4)</span>
    </button>
  </div>
);

const TrayHeaderActions: React.FC<{
  activeTab: 'history' | 'comparison';
  historyCount: number;
  trayCount: number;
  onClearHistory?: () => void;
  onClearComparison?: () => void;
}> = ({ activeTab, historyCount, trayCount, onClearHistory, onClearComparison }) => (
  <>
    {activeTab === 'history' && onClearHistory && historyCount > 0 && (
      <button type="button" onClick={onClearHistory} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem' }}>
        <Trash2 size={12} /> 清空歷史
      </button>
    )}
    {activeTab === 'comparison' && onClearComparison && trayCount > 0 && (
      <button type="button" onClick={onClearComparison} style={{ background: 'none', border: 'none', color: '#ff7675', cursor: 'pointer', fontSize: '0.8rem' }}>
        <Trash2 size={12} /> 清空暫存
      </button>
    )}
  </>
);

interface HistoryListProps {
  history: ClipboardHistoryItem[];
  tray: ComparisonItem[];
  onSelect: (item: ClipboardHistoryItem) => void;
  onAdd: (item: ClipboardHistoryItem) => void;
}

const HistoryList: React.FC<HistoryListProps> = ({ history, tray, onSelect, onAdd }) => {
  if (history.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#777', fontSize: '0.88rem' }}>
        尚無剪貼簿查價紀錄。在遊戲內複製物品並查價後，將自動記錄於此。
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
      {history.map((hist) => (
        <HistoryItemRow
          key={hist.id}
          item={hist}
          inTray={tray.some(t => t.item.rawText === hist.item.rawText)}
          onSelect={() => onSelect(hist)}
          onAdd={() => onAdd(hist)}
        />
      ))}
    </div>
  );
};

const HistoryItemRow: React.FC<{
  item: ClipboardHistoryItem;
  inTray: boolean;
  onSelect: () => void;
  onAdd: () => void;
}> = ({ item, inTray, onSelect, onAdd }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px' }}>
    <HistoryRowDetails item={item} onSelect={onSelect} />
    <HistoryRowButtons inTray={inTray} onSelect={onSelect} onAdd={onAdd} />
  </div>
);

const HistoryRowDetails: React.FC<{ item: ClipboardHistoryItem; onSelect: () => void }> = ({ item, onSelect }) => {
  const nameColor = item.item.rarity === 'Rare' ? '#ffd700' : '#af6025';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', cursor: 'pointer', flex: 1 }} onClick={onSelect}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: nameColor, fontWeight: 600, fontSize: '0.88rem' }}>{item.item.name || item.item.baseType}</span>
        {item.item.itemLevel && <span style={{ fontSize: '0.72rem', color: '#888', background: 'rgba(255,255,255,0.08)', padding: '1px 4px', borderRadius: '3px' }}>iLvl {item.item.itemLevel}</span>}
        {item.priceChaos != null && <span style={{ fontSize: '0.78rem', color: '#e67e22', fontWeight: 'bold' }}>~{item.priceChaos}c</span>}
      </div>
      <span style={{ fontSize: '0.72rem', color: '#666' }}>{item.item.baseType}</span>
    </div>
  );
};

const HistoryRowButtons: React.FC<{ inTray: boolean; onSelect: () => void; onAdd: () => void }> = ({ inTray, onSelect, onAdd }) => (
  <div style={{ display: 'flex', gap: '6px' }}>
    <button type="button" className="btn-filter" style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px' }} onClick={onSelect} title="回溯重查">
      <ArrowUpRight size={12} /> 載入
    </button>
    <button type="button" className="btn-filter" disabled={inTray} style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '2px', opacity: inTray ? 0.4 : 1 }} onClick={onAdd} title={inTray ? '已在比價暫存中' : '加入比價暫存列'}>
      <PlusCircle size={12} /> {inTray ? '已加入' : '比價'}
    </button>
  </div>
);

const ComparisonView: React.FC<{
  result: ReturnType<typeof compareItems>;
  onRemove: (id: string) => void;
}> = ({ result, onRemove }) => {
  if (result.items.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#777', fontSize: '0.88rem' }}>
        暫存列為空。請從歷史紀錄點擊「比價」將裝備加入暫存列（最多 4 件）。
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <MetricsSummary metrics={result.metrics} />
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${result.items.length}, minmax(130px, 1fr))`, gap: '8px' }}>
        {result.items.map((comp) => (
          <TrayItemCard key={comp.id} item={comp} onRemove={() => onRemove(comp.id)} />
        ))}
      </div>
      {result.affixes.length > 0 && <AffixDiffTable affixes={result.affixes} items={result.items} />}
    </div>
  );
};

const MetricsSummary: React.FC<{ metrics: ReturnType<typeof compareItems>['metrics'] }> = ({ metrics }) => (
  <div style={{ display: 'flex', gap: '14px', background: 'rgba(255,255,255,0.02)', padding: '6px 10px', borderRadius: '4px', fontSize: '0.78rem', color: '#aaa', flexWrap: 'wrap' }}>
    {metrics.priceCount > 0 && (
      <span>價格中位數: <strong style={{ color: '#e67e22' }}>{metrics.priceMedian ?? '-'}c</strong> (最低: {metrics.priceMin}c / 最高: {metrics.priceMax}c)</span>
    )}
    {metrics.itemLevelAvg != null && (
      <span>平均物等: <strong style={{ color: '#3498db' }}>{metrics.itemLevelAvg.toFixed(1)}</strong> (範圍: {metrics.itemLevelMin} - {metrics.itemLevelMax})</span>
    )}
  </div>
);

const TrayItemCard: React.FC<{ item: ComparisonItem; onRemove: () => void }> = ({ item, onRemove }) => (
  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '4px', padding: '8px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative' }}>
    <button type="button" onClick={onRemove} aria-label="移除此項" style={{ position: 'absolute', top: '4px', right: '4px', background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
      <X size={14} />
    </button>
    <div style={{ color: '#ffd700', fontWeight: 600, fontSize: '0.82rem', paddingRight: '16px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
      {item.item.name || item.item.baseType}
    </div>
    <div style={{ color: '#888', fontSize: '0.72rem' }}>{item.item.baseType}</div>
    <div style={{ marginTop: '4px', display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
      <span style={{ color: '#aaa' }}>iLvl {item.item.itemLevel ?? '-'}</span>
      <span style={{ color: '#e67e22', fontWeight: 'bold' }}>{item.priceChaos != null ? `${item.priceChaos}c` : '-'}</span>
    </div>
  </div>
);

const AffixDiffTable: React.FC<{ affixes: ReturnType<typeof compareItems>['affixes']; items: ComparisonItem[] }> = ({ affixes, items }) => (
  <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
    <table style={{ width: '100%', fontSize: '0.73rem', borderCollapse: 'collapse', textAlign: 'left' }}>
      <thead>
        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#888' }}>
          <th style={{ padding: '3px' }}>詞綴對比</th>
          {items.map((it) => (
            <th key={it.id} style={{ padding: '3px', color: '#ffd700', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {it.item.name || it.item.baseType}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {affixes.map((aff, i) => (
          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
            <td style={{ padding: '3px', color: '#aaa' }}>{aff.name}</td>
            {items.map((it) => (
              <td key={it.id} style={{ padding: '3px', color: aff.values[it.id] !== undefined ? '#2ecc71' : '#555' }}>
                {aff.values[it.id] !== undefined ? String(aff.values[it.id]) : '-'}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
