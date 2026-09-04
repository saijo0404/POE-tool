import React, { useRef, useState } from 'react';
import type { PriceSnapshot } from '../../domain/price/priceSnapshotEngine';
import {
  evaluateSnapshotFreshness,
  serializePriceSnapshot,
  deserializePriceSnapshot
} from '../../domain/price/priceSnapshotEngine';
import { Database, Download, Upload, Check, AlertCircle } from 'lucide-react';

interface PriceSnapshotBadgeProps {
  snapshot: PriceSnapshot | null;
  onImportSnapshot?: (snap: PriceSnapshot) => void;
  onShowToast?: (msg: string) => void;
}

export const PriceSnapshotBadge: React.FC<PriceSnapshotBadgeProps> = ({
  snapshot,
  onImportSnapshot,
  onShowToast
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  const freshness = snapshot ? evaluateSnapshotFreshness(snapshot) : null;

  const handleExport = () => {
    if (!snapshot) return;
    const json = serializePriceSnapshot(snapshot);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `poe-price-snapshot-${snapshot.league}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onShowToast?.('📥 已成功匯出本地物價快照 JSON 檔案！');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      if (!text) return;
      const res = deserializePriceSnapshot(text);
      if (res.isOk()) {
        onImportSnapshot?.(res.value);
        onShowToast?.(`📦 成功載入物價快照：共 ${res.value.itemCount} 筆項目！`);
      } else {
        setImportError(res.error.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '8px',
        padding: '8px 12px',
        background: 'rgba(15, 20, 30, 0.65)',
        border: '1px solid rgba(200, 170, 110, 0.25)',
        borderRadius: '6px',
        fontSize: '0.8rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Database size={15} color="var(--text-gold)" />
        <span style={{ color: 'var(--text-dim)' }}>離線物價容災快照：</span>
        {snapshot && freshness ? (
          <span style={{ fontWeight: 600, color: freshness.isStale ? '#f87171' : '#fef08a' }}>
            {freshness.statusBadgeText} ({snapshot.itemCount} 筆)
          </span>
        ) : (
          <span style={{ color: '#94a3b8' }}>尚未建立快照快取</span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {importError && (
          <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}>
            <AlertCircle size={13} /> {importError}
          </span>
        )}

        {snapshot && (
          <button
            type="button"
            className="poe-button-secondary"
            onClick={handleExport}
            style={{ padding: '3px 8px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            title="將快照匯出為 JSON 備份檔"
          >
            {copied ? <Check size={12} color="#22c55e" /> : <Download size={12} />}
            {copied ? '已下載' : '匯出快照'}
          </button>
        )}

        <button
          type="button"
          className="poe-button-secondary"
          onClick={() => fileInputRef.current?.click()}
          style={{ padding: '3px 8px', fontSize: '0.74rem', display: 'flex', alignItems: 'center', gap: '4px' }}
          title="從 JSON 檔案匯入社群分享物價快照"
        >
          <Upload size={12} /> 匯入快照
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};
