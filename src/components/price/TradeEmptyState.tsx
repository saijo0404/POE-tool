import React from 'react';

export const TradeEmptyState: React.FC = () => {
  return (
    <div
      className="poe-card"
      style={{
        padding: '30px 20px',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px dashed rgba(200, 170, 110, 0.3)',
        borderRadius: '8px',
        marginBottom: '20px'
      }}
    >
      <div style={{ fontSize: '1.2rem', color: 'var(--text-gold)', marginBottom: '8px', fontWeight: 600 }}>
        🔍 未找到符合條件的市集刊登物件 (0 筆)
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '580px', margin: '0 auto 16px', lineHeight: 1.6 }}>
        可能原因：
        <br />• 勾選的詞綴數量過多或數值過於嚴苛，導致市場上無完全一致的裝備。
        <br />• 交易方式設為「<strong>Instant Buyout (僅即時直購)</strong>」，該類別在當前聯盟可能尚無玩家以直購方式刊登，建議將上方「交易方式」切換為「<strong>In Person (Online)</strong>」或「<strong>Instant Buyout and In Person</strong>」。
        <br />• 建議取消勾選次要詞綴（如防禦回復、自訂工藝等），保留 2~3 項核心數值後點擊「重新查詢」。
      </p>
    </div>
  );
};
