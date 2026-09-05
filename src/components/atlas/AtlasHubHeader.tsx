import React from 'react';
import { Compass, RefreshCw, Share2 } from 'lucide-react';

interface AtlasHubHeaderProps {
  league: string;
  divineRate: number;
  isRatesLoading: boolean;
  onOpenCommunity: () => void;
}

export const AtlasHubHeader: React.FC<AtlasHubHeaderProps> = ({
  league,
  divineRate,
  isRatesLoading,
  onOpenCommunity
}) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #f3d179 0%, #8c7849 70%, #2a2216 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 10px rgba(243, 209, 121, 0.35)'
        }}>
          <Compass size={22} color="#0d121c" />
        </div>
        <h1 className="poe-font" style={{ fontSize: '1.45rem', color: 'var(--text-gold)', margin: 0, letterSpacing: '0.5px' }}>
          POE 1 輿圖天賦策略與成本精算 (Atlas Strategy Hub)
        </h1>
      </div>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
        自訂輿圖天賦策略分級、聖甲蟲協同推薦、poe.ninja 即時物價連動、單場與批次利潤時薪精算
      </p>
    </div>

    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      <button
        type="button"
        className="poe-button-secondary"
        onClick={onOpenCommunity}
        style={{ height: '34px', padding: '0 14px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(243, 209, 121, 0.4)' }}
      >
        <Share2 size={15} color="var(--text-gold)" /> 社群策略中心
      </button>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(0, 0, 0, 0.35)',
        padding: '6px 14px',
        borderRadius: '20px',
        border: '1px solid rgba(200, 170, 110, 0.25)',
        fontSize: '0.82rem'
      }}>
        <span style={{ color: 'var(--text-dim)' }}>當前聯盟：</span>
        <span style={{ color: 'var(--text-gold)', fontWeight: 600 }}>{league || 'Settlers'}</span>
        <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
        <span style={{ color: 'var(--text-dim)' }}>神聖石匯率：</span>
        <span style={{ color: 'var(--text-gold)', fontWeight: 700 }}>1 Div = {divineRate} C</span>
        {isRatesLoading && <RefreshCw size={13} className="spin" color="var(--text-gold)" style={{ marginLeft: '4px' }} />}
      </div>
    </div>
  </div>
);
