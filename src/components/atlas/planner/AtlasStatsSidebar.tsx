import React, { useState } from 'react';
import type { AtlasTreeStatsSummary } from '../../../domain/atlas/types';
import { MAX_ATLAS_POINTS } from '../../../domain/atlas/constants';
import { Shield, CheckCircle2, Copy, Languages } from 'lucide-react';

interface AtlasStatsSidebarProps {
  summaryData: AtlasTreeStatsSummary;
  onShowToast: (msg: string) => void;
}

export const AtlasStatsSidebar: React.FC<AtlasStatsSidebarProps> = ({
  summaryData,
  onShowToast
}) => {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');

  const statsToDisplay = summaryData.aggregatedStats && summaryData.aggregatedStats.length > 0
    ? summaryData.aggregatedStats
    : summaryData.statsList.map(s => ({ text: s, textEn: s, count: 1 }));

  const handleCopyStats = async () => {
    const isZh = lang === 'zh';
    const lines: string[] = [isZh ? '📋 【PoE 1 輿圖天賦配置摘要】' : '📋 【PoE 1 Atlas Passive Tree Summary】'];
    lines.push(
      isZh
        ? `已配置點數：${summaryData.pointsSpent} / ${MAX_ATLAS_POINTS} 點`
        : `Allocated Points: ${summaryData.pointsSpent} / ${MAX_ATLAS_POINTS}`
    );

    if (summaryData.activeKeystones.length > 0) {
      const ksNames = summaryData.activeKeystones
        .map(k => (isZh ? k.name : k.nameEn || k.name))
        .join(', ');
      lines.push(isZh ? `核心基石天賦：${ksNames}` : `Active Keystones: ${ksNames}`);
    }

    lines.push(isZh ? '--- 詞綴加成總覽 ---' : '--- Aggregated Modifiers ---');
    statsToDisplay.forEach(item => {
      lines.push(`- ${isZh ? item.text : item.textEn}`);
    });

    try {
      await navigator.clipboard.writeText(lines.join('\n'));
      onShowToast(isZh ? '📋 已複製天賦屬性總結至剪貼簿！' : '📋 Copied Atlas Stats Summary to clipboard!');
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
      {/* Header with Title, Language Toggle and Copy */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gold)', fontWeight: 600, fontSize: '0.86rem' }}>
          <Shield size={16} />
          <span>{lang === 'zh' ? '天賦屬性總結' : 'Stats Summary'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          {/* Language Toggle Button */}
          <button
            type="button"
            className="poe-button-secondary"
            onClick={() => setLang(prev => (prev === 'zh' ? 'en' : 'zh'))}
            style={{
              fontSize: '0.72rem',
              padding: '2px 6px',
              height: '22px',
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
              color: 'var(--accent-blue)',
              borderColor: 'rgba(56, 189, 248, 0.3)'
            }}
            title={lang === 'zh' ? '切換為英文顯示' : 'Switch to Traditional Chinese'}
          >
            <Languages size={11} />
            <span>{lang === 'zh' ? '繁中' : 'EN'}</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            className="poe-button-secondary"
            onClick={handleCopyStats}
            style={{ fontSize: '0.72rem', padding: '2px 6px', height: '22px', display: 'flex', alignItems: 'center', gap: '3px' }}
            title={lang === 'zh' ? '複製全部屬性總結' : 'Copy all stats summary'}
          >
            <Copy size={11} />
            <span>{lang === 'zh' ? '複製' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Active Keystones */}
      {summaryData.activeKeystones.length > 0 && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
            {lang === 'zh'
              ? `生效基石天賦 (${summaryData.activeKeystones.length})：`
              : `Active Keystones (${summaryData.activeKeystones.length}):`}
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
                <strong>{lang === 'zh' ? ks.name : ks.nameEn || ks.name}</strong>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Aggregated Stats List */}
      <div style={{ fontSize: '0.74rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
        {lang === 'zh'
          ? `累計加總詞綴 (${statsToDisplay.length} 條)：`
          : `Aggregated Modifiers (${statsToDisplay.length} lines):`}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
        {statsToDisplay.length === 0 ? (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontStyle: 'italic', padding: '8px 0' }}>
            {lang === 'zh' ? '尚未配置任何具有屬性之天賦節點' : 'No stats allocated yet'}
          </div>
        ) : (
          statsToDisplay.map((item, idx) => (
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
              <span>{lang === 'zh' ? item.text : item.textEn}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

