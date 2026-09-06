import React, { useState, useEffect, useCallback } from 'react';
import { FileText, FolderOpen, Trash2, Copy, Check, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import poeApi from '../../services/api';
import type { DiagnosticBundle } from '../../domain/logger/types';

interface LogDiagnosticsSectionProps {
  onShowToast: (msg: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i] ?? 'B'}`;
}

function buildMarkdownBundle(bundle: DiagnosticBundle): string {
  return [
    '### 系統診斷報告 (Diagnostic Bundle)',
    `- **App Version**: ${bundle.app_version}`,
    `- **OS**: ${bundle.os}`,
    `- **Timestamp**: ${bundle.timestamp}`,
    `- **Log Path**: \`${bundle.log_file_path}\``,
    `- **Log File Size**: ${formatBytes(bundle.log_file_size_bytes)}`,
    `- **Total Lines**: ${bundle.total_lines}`,
    '',
    '<details>',
    '<summary>最近脫敏日誌 (Recent Logs)</summary>',
    '',
    '```log',
    bundle.recent_logs,
    '```',
    '</details>'
  ].join('\n');
}

export const LogDiagnosticsSection: React.FC<LogDiagnosticsSectionProps> = ({ onShowToast }) => {
  const [bundle, setBundle] = useState<DiagnosticBundle | null>(null);
  const [loading, setLoading] = useState(false);
  const [isViewerExpanded, setIsViewerExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadDiagnosticInfo = useCallback(async () => {
    setLoading(true);
    try {
      const data = await poeApi.getDiagnosticBundle();
      setBundle(data);
    } catch {
      onShowToast('無法取得日誌診斷資訊');
    } finally {
      setLoading(false);
    }
  }, [onShowToast]);

  useEffect(() => {
    void loadDiagnosticInfo();
  }, [loadDiagnosticInfo]);

  const handleCopy = async () => {
    if (!bundle) return;
    try {
      const markdown = buildMarkdownBundle(bundle);
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      onShowToast('診斷報告已複製至剪貼簿');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast('複製失敗，請手動複製');
    }
  };

  const handleClear = async () => {
    try {
      await poeApi.clearLogs();
      onShowToast('日誌已清空');
      await loadDiagnosticInfo();
    } catch {
      onShowToast('清空日誌失敗');
    }
  };

  const handleOpenDir = async () => {
    try {
      await poeApi.openLogDirectory();
      onShowToast('已請求開啟日誌目錄');
    } catch {
      onShowToast('無法開啟日誌目錄');
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FileText size={16} /> 診斷與系統日誌 (Diagnostics & Logs)
        </h3>
        <button
          type="button"
          onClick={loadDiagnosticInfo}
          disabled={loading}
          className="poe-button-secondary"
          style={{ padding: '3px 8px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <RefreshCw size={12} className={loading ? 'spin' : ''} /> 重新整理
        </button>
      </div>

      <div style={{ padding: '12px 14px', background: 'rgba(0,0,0,0.3)', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div>路徑：<code style={{ color: 'var(--text-bright)', wordBreak: 'break-all' }}>{bundle?.log_file_path || '載入中...'}</code></div>
            <div style={{ marginTop: '4px' }}>
              大小：<span style={{ color: 'var(--text-bright)' }}>{bundle ? formatBytes(bundle.log_file_size_bytes) : '-'}</span>
              <span style={{ margin: '0 8px' }}>|</span>
              行數：<span style={{ color: 'var(--text-bright)' }}>{bundle?.total_lines ?? '-'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              onClick={handleOpenDir}
              className="poe-button-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <FolderOpen size={13} /> 開啟目錄
            </button>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!bundle}
              className="poe-button-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {copied ? <Check size={13} style={{ color: '#4caf50' }} /> : <Copy size={13} />}
              {copied ? '已複製' : '複製診斷'}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="poe-button-secondary"
              style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: '#ff6b6b' }}
            >
              <Trash2 size={13} /> 清空日誌
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsViewerExpanded(prev => !prev)}
          style={{
            width: '100%', padding: '6px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '4px', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}
        >
          <span>檢視最近脫敏日誌內容 ({bundle?.total_lines ?? 0} 行)</span>
          {isViewerExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {isViewerExpanded && (
          <div style={{ marginTop: '8px' }}>
            <textarea
              readOnly
              value={bundle?.recent_logs || '(尚無日誌記錄)'}
              style={{
                width: '100%', height: '180px', background: '#0d0e12', color: '#88c0d0',
                border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px',
                fontFamily: 'monospace', fontSize: '0.75rem', padding: '8px',
                resize: 'vertical', boxSizing: 'border-box'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
