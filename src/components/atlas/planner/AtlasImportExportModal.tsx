import React, { useState } from 'react';
import {
  parseAtlasUrlOrBase64,
  generateAtlasTreeUrl,
  encodeAtlasTreeBase64
} from '../../../domain/atlas/atlasTreeEncoder';
import { X, Upload, Copy } from 'lucide-react';

interface AtlasImportExportModalProps {
  allocatedNodeIds: Set<string>;
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedNodeIds: string[]) => void;
  onShowToast: (msg: string) => void;
}

export const AtlasImportExportModal: React.FC<AtlasImportExportModalProps> = ({
  allocatedNodeIds,
  isOpen,
  onClose,
  onImportSuccess,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [importInput, setImportInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  const allocatedList = Array.from(allocatedNodeIds);
  const base64Code = encodeAtlasTreeBase64(allocatedList);
  const officialUrl = generateAtlasTreeUrl(allocatedList, 'official');
  const poePlannerUrl = generateAtlasTreeUrl(allocatedList, 'poeplanner');

  const handleImport = () => {
    setErrorMessage('');
    const res = parseAtlasUrlOrBase64(importInput);
    if (res.isErr()) {
      setErrorMessage(res.error.message);
      return;
    }
    const decoded = res.value;
    if (decoded.nodeIds.length === 0) {
      if (decoded.numIds.length > 0) {
        setErrorMessage(`⚠️ 此天賦代碼為舊版 PoE 賽季節點（解析出 ${decoded.numIds.length} 個舊版本 ID），與當前賽季不相容。請在 PoEPlanner 上載入並重新生成最新網址。`);
      } else {
        setErrorMessage('未解析到任何有效的天賦節點');
      }
      return;
    }
    onImportSuccess(decoded.nodeIds);
    const suffix = decoded.unmatchedNumIds.length > 0 ? ` (已略過 ${decoded.unmatchedNumIds.length} 個不相容舊節點)` : '';
    onShowToast(`🎉 成功匯入 ${decoded.nodeIds.length} 個天賦節點！${suffix}`);
    onClose();
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      onShowToast(`📋 已複製【${label}】至剪貼簿！`);
    } catch {
      onShowToast('複製失敗');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2100,
      padding: '16px'
    }}>
      <div className="poe-modal" style={{ width: '560px', maxWidth: '100%', background: '#0e1420', border: '1.5px solid var(--border-gold)', borderRadius: '8px', padding: '18px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={activeTab === 'import' ? 'poe-button' : 'poe-button-secondary'}
              onClick={() => setActiveTab('import')}
              style={{ fontSize: '0.82rem', padding: '5px 12px' }}
            >
              📥 匯入天賦 (Import)
            </button>
            <button
              type="button"
              className={activeTab === 'export' ? 'poe-button' : 'poe-button-secondary'}
              onClick={() => setActiveTab('export')}
              style={{ fontSize: '0.82rem', padding: '5px 12px' }}
            >
              📤 匯出分享 (Export)
            </button>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Import Tab */}
        {activeTab === 'import' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              支援貼上官方天賦樹網址、PoEPlanner 網址或標準 Base64 編碼字串：
            </p>
            <textarea
              className="poe-input"
              rows={4}
              placeholder="例如：https://poeplanner.com/atlas-tree/BAAFA... 或 AAAAB..."
              value={importInput}
              onChange={e => {
                setImportInput(e.target.value);
                setErrorMessage('');
              }}
              style={{ fontSize: '0.8rem', width: '100%', resize: 'vertical' }}
            />
            {errorMessage && (
              <div style={{ color: '#f87171', fontSize: '0.78rem' }}>
                ⚠️ {errorMessage}
              </div>
            )}
            <button
              type="button"
              className="poe-button"
              onClick={handleImport}
              style={{ marginTop: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
            >
              <Upload size={14} /> 解析並載入天賦配置
            </button>
          </div>
        )}

        {/* Export Tab */}
        {activeTab === 'export' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginBottom: '4px' }}>PoEPlanner 分享網址：</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input type="text" readOnly value={poePlannerUrl} className="poe-input" style={{ fontSize: '0.75rem', flex: 1 }} />
                <button type="button" className="poe-button-secondary" onClick={() => copyToClipboard(poePlannerUrl, 'PoEPlanner 網址')}>
                  <Copy size={13} />
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginBottom: '4px' }}>PoE 官方全螢幕天賦樹網址：</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input type="text" readOnly value={officialUrl} className="poe-input" style={{ fontSize: '0.75rem', flex: 1 }} />
                <button type="button" className="poe-button-secondary" onClick={() => copyToClipboard(officialUrl, '官方天賦網址')}>
                  <Copy size={13} />
                </button>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Base64 二進制編碼：</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input type="text" readOnly value={base64Code} className="poe-input" style={{ fontSize: '0.75rem', flex: 1 }} />
                <button type="button" className="poe-button-secondary" onClick={() => copyToClipboard(base64Code, 'Base64 編碼')}>
                  <Copy size={13} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
