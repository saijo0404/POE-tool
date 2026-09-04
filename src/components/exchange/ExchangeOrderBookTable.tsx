import React from 'react';
import { ExternalLink, Calculator } from 'lucide-react';
import { poeApi } from '../../services/api';
import type { ExchangeItem } from '../../domain/exchange/types';

interface ExchangeOrderBookTableProps {
  items: ExchangeItem[];
  league: string;
  selectedItemId?: string;
  onSelectItemForGold: (item: ExchangeItem) => void;
}

export const ExchangeOrderBookTable: React.FC<ExchangeOrderBookTableProps> = ({
  items,
  league,
  selectedItemId,
  onSelectItemForGold,
}) => {
  if (items.length === 0) {
    return (
      <div style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>
        查無符合條件之大宗通貨行情
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto', borderRadius: '6px', border: '1px solid rgba(200, 170, 110, 0.2)' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#0e121b', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', color: 'var(--text-gold)' }}>
            <th style={{ padding: '10px 14px' }}>物品名稱</th>
            <th style={{ padding: '10px 10px' }}>分類</th>
            <th style={{ padding: '10px 10px' }}>Faustus 交易所報價</th>
            <th style={{ padding: '10px 10px' }}>官方市集直購價</th>
            <th style={{ padding: '10px 10px' }}>24H 成交量</th>
            <th style={{ padding: '10px 10px' }}>金幣手續費</th>
            <th style={{ padding: '10px 14px', textAlign: 'right' }}>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <TableRow
              key={item.id}
              item={item}
              league={league}
              isSelected={selectedItemId === item.id}
              onSelect={() => onSelectItemForGold(item)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

interface TableRowProps {
  item: ExchangeItem;
  league: string;
  isSelected: boolean;
  onSelect: () => void;
}

const TableRow: React.FC<TableRowProps> = ({ item, league, isSelected, onSelect }) => {
  const diff = item.tradePriceChaos ? item.tradePriceChaos - item.primaryValue : 0;
  const hasDiff = Math.abs(diff) >= 0.5;

  const handleOpenTradeSearch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const queryJson = JSON.stringify({
        query: { status: { option: 'online' }, type: item.name },
      });
      await poeApi.createTradeSearchUrl(league, queryJson);
    } catch {
      // Ignore
    }
  };

  return (
    <tr
      onClick={onSelect}
      style={{
        backgroundColor: isSelected ? 'rgba(200, 170, 110, 0.12)' : 'rgba(10, 13, 20, 0.6)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        cursor: 'pointer',
        transition: 'background-color 0.15s',
      }}
    >
      <td style={{ padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        {item.icon && (
          <img src={item.icon} alt={item.name} style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
        )}
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-light)' }}>
            {item.nameZh || item.name}
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{item.name}</div>
        </div>
      </td>

      <td style={{ padding: '8px 10px' }}>
        <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', backgroundColor: 'rgba(255,255,255,0.08)', color: 'var(--text-muted)' }}>
          {item.category}
        </span>
      </td>

      <td style={{ padding: '8px 10px', color: '#fff', fontWeight: 600 }}>
        {item.primaryValue.toLocaleString()} c
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: '6px', fontWeight: 400 }}>
          ({item.secondaryValue.toFixed(2)} div)
        </span>
      </td>

      <td style={{ padding: '8px 10px' }}>
        {item.tradePriceChaos ? (
          <div>
            <span style={{ color: '#fff' }}>{item.tradePriceChaos.toLocaleString()} c</span>
            {hasDiff && (
              <span style={{ fontSize: '0.72rem', marginLeft: '6px', color: diff > 0 ? '#2ecc71' : '#e74c3c' }}>
                {diff > 0 ? `+${diff.toFixed(1)}c` : `${diff.toFixed(1)}c`}
              </span>
            )}
          </div>
        ) : (
          <span style={{ color: 'var(--text-muted)' }}>-</span>
        )}
      </td>

      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>
        {item.volume24h.toLocaleString()}
      </td>

      <td style={{ padding: '8px 10px', color: '#f1c40f' }}>
        {item.goldCostPerUnit.toLocaleString()} 金幣
      </td>

      <td style={{ padding: '8px 14px', textAlign: 'right' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className="poe-button-secondary"
            style={{ padding: '3px 8px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="選取並帶入金幣手續費計算機"
          >
            <Calculator size={12} /> 試算
          </button>
          <button
            type="button"
            onClick={handleOpenTradeSearch}
            className="poe-button-secondary"
            style={{ padding: '3px 8px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="開啟官方市集搜尋"
          >
            市集 <ExternalLink size={11} />
          </button>
        </div>
      </td>
    </tr>
  );
};
