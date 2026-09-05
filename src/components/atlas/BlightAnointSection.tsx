import React from 'react';
import type { NotableAnointment } from '../../domain/blight/types';
import { BLIGHT_OILS } from '../../domain/blight/blightData';

interface BlightAnointSectionProps {
  keyword: string;
  onKeywordChange: (v: string) => void;
  anointments: NotableAnointment[];
}

export const BlightAnointSection: React.FC<BlightAnointSectionProps> = ({
  keyword,
  onKeywordChange,
  anointments,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    <input
      type="text"
      placeholder="輸入關鍵天賦名稱 (如: 主權, 魅力, 詛咒)..."
      value={keyword}
      onChange={(e) => onKeywordChange(e.target.value)}
      style={{
        padding: '6px 10px',
        background: '#0d1117',
        border: '1px solid #30363d',
        borderRadius: '4px',
        color: '#c9d1d9',
        fontSize: '12px',
      }}
    />

    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '280px', overflowY: 'auto' }}>
      {anointments.map((item) => (
        <AnointCard key={item.id} item={item} />
      ))}
      {anointments.length === 0 && (
        <div style={{ color: '#8b949e', textAlign: 'center', padding: '16px' }}>未找到符合的天賦塗油</div>
      )}
    </div>
  </div>
);

const AnointCard: React.FC<{ item: NotableAnointment }> = ({ item }) => (
  <div
    style={{
      padding: '8px',
      background: '#0d1117',
      borderRadius: '4px',
      border: '1px solid #21262d',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      fontSize: '12px',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontWeight: 'bold', color: '#58a6ff' }}>
        {item.notableNameZh} <span style={{ color: '#8b949e', fontSize: '11px' }}>({item.notableNameEn})</span>
      </span>
      <OilsBadgeList oils={item.requiredOils} />
    </div>
    <div style={{ color: '#8b949e', fontSize: '11px' }}>{item.effectSummaryZh}</div>
  </div>
);

const OilsBadgeList: React.FC<{ oils: [string, string, string] }> = ({ oils }) => (
  <div style={{ display: 'flex', gap: '4px' }}>
    {oils.map((oilId, idx) => {
      const oil = BLIGHT_OILS.find((o) => o.id === oilId);
      return (
        <span
          key={`${oilId}_${idx}`}
          style={{
            padding: '1px 6px',
            borderRadius: '3px',
            background: '#21262d',
            border: '1px solid #30363d',
            color: '#e3b341',
            fontSize: '11px',
          }}
        >
          {oil?.nameZh ?? oilId}
        </span>
      );
    })}
  </div>
);
