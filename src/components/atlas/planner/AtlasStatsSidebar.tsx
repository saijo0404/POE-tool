import React from 'react';
import type { AtlasTreeStatsSummary } from '../../../domain/atlas/types';
import { Shield, CheckCircle2, Copy } from 'lucide-react';

interface AtlasStatsSidebarProps {
  summaryData: AtlasTreeStatsSummary;
  onShowToast: (msg: string) => void;
}

export const AtlasStatsSidebar: React.FC<AtlasStatsSidebarProps> = ({
  summaryData,
  onShowToast
}) => {
  const handleCopyStats = async () => {
    const lines: string[] = ['📋 【PoE 1 輿圖天賦配置摘要】'];
    lines.push(`已配置點數：${summaryData.pointsSpent} / 132 點`);
    if (summaryData.activeKeystones.length > 0) {
      lines.push(`核心基石天賦：${summaryData.activeKeystones.map(k => k.name).join(', ')}`);
    }
    lines.push('--- 詞綴加成總覽 ---');
    summaryData.statsList.forEach(st => lines.push(`- ${st}`));

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      onShowToast('📋 已複製天賦屬性總結至剪貼簿！');
    } catch {
      onShowToast('複製失敗');
    }
  };

  return (
    <div style={{
      width: '320px',
      background: '#0a0e16',
      borderLeft: '1px solid rgba(200, 170, 110, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      overflowY: 'auto',
      padding: '12px 14px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gold)', fontWeight: 600, fontSize: '0.86rem' }}>
          <Shield size={16} />
          <span>天賦屬性總結</span>
        </div>
        <button
          type="button"
          className="poe-button-secondary"
          onClick={handleCopyStats}
          style={{ fontSize: '0.72rem', padding: '2px 6px', height: '22px', display: 'flex', alignItems: 'center', gap: '3px' }}
          title="複製全部屬性總結"
        >
          <Copy size={11} /> 複製
        </button>
      </div>

      {/* Active Keystones */}
      {summaryData.activeKeystones.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
            生效基石天賦 ({summaryData.activeKeystones.length})：
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {summaryData.activeKeystones.map(ks => (
              <div
                key={ks.id}
                style={{
                  fontSize: '0.76rem',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fde047',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>⭐</span>
                <strong>{ks.name}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aggregated Stats List */}
      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
        累計詞綴加成 ({summaryData.statsList.length} 條)：
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        {summaryData.statsList.map((st, idx) => (
          <div
            key={idx}
            style={{
              fontSize: '0.76rem',
              padding: '5px 8px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
              color: '#e2e8f0',
              lineHeight: 1.35,
              display: 'flex',
              alignItems: 'flex-start',
              gap: '5px'
            }}
          >
            <CheckCircle2 size={13} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
            <span>{st}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
