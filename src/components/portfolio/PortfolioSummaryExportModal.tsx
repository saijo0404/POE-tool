import React, { useState } from 'react';
import type { PortfolioAnalysisResult } from '../../domain/portfolio/types';
import {
  exportPortfolioToMarkdown,
  exportPortfolioToCSV,
  exportPortfolioToDiscord
} from '../../domain/portfolio/portfolioCalculator';
import { Copy, Share2, X } from 'lucide-react';

interface PortfolioSummaryExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: PortfolioAnalysisResult;
  league: string;
  onCopyMarkdown: () => void;
  onCopyCSV: () => void;
  onCopyDiscord: () => void;
}

export const PortfolioSummaryExportModal: React.FC<PortfolioSummaryExportModalProps> = ({
  isOpen,
  onClose,
  analysis,
  league,
  onCopyMarkdown,
  onCopyCSV,
  onCopyDiscord
}) => {
  const [activeTab, setActiveTab] = useState<'markdown' | 'csv' | 'discord'>('markdown');

  if (!isOpen) return null;

  const content = activeTab === 'markdown'
    ? exportPortfolioToMarkdown(analysis, league)
    : activeTab === 'csv'
    ? exportPortfolioToCSV(analysis.categories)
    : exportPortfolioToDiscord(analysis, league);

  const handleCopy = () => {
    if (activeTab === 'markdown') onCopyMarkdown();
    else if (activeTab === 'csv') onCopyCSV();
    else onCopyDiscord();
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-gold)', borderRadius: '10px', width: '100%', maxWidth: '600px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', boxShadow: '0 8px 32px rgba(0,0,0,0.8)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 className="poe-font" style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Share2 size={18} /> 匯出資產分析報表與社群分享
          </h3>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {/* Format Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
          <button type="button" onClick={() => setActiveTab('markdown')} className={activeTab === 'markdown' ? 'poe-button' : 'poe-button-secondary'} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Markdown 報表</button>
          <button type="button" onClick={() => setActiveTab('csv')} className={activeTab === 'csv' ? 'poe-button' : 'poe-button-secondary'} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>CSV 格式</button>
          <button type="button" onClick={() => setActiveTab('discord')} className={activeTab === 'discord' ? 'poe-button' : 'poe-button-secondary'} style={{ padding: '4px 12px', fontSize: '0.8rem' }}>Discord 分享</button>
        </div>

        {/* Content Box */}
        <pre style={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: '6px', padding: '12px', fontSize: '0.76rem', color: 'var(--text-bright)', maxHeight: '250px', overflowY: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
          {content}
        </pre>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
          <button type="button" onClick={handleCopy} className="poe-button" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '6px 16px' }}>
            <Copy size={14} /> 一鍵複製至剪貼簿
          </button>
          <button type="button" onClick={onClose} className="poe-button-secondary" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>關閉</button>
        </div>
      </div>
    </div>
  );
};
