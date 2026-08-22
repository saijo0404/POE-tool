import React from 'react';
import { Clipboard, RefreshCw, Sparkles, Search } from 'lucide-react';

interface ItemInputPanelProps {
  rawText: string;
  onChangeRawText: (text: string) => void;
  onReadClipboard: () => void;
  onInsertSample: () => void;
  onSearchTrade?: () => void;
  searching?: boolean;
}

export const ItemInputPanel: React.FC<ItemInputPanelProps> = ({
  rawText,
  onChangeRawText,
  onReadClipboard,
  onInsertSample,
  onSearchTrade,
  searching = false
}) => {
  return (
    <div className="poe-card" style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
        <label className="poe-font" style={{ fontSize: '1rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clipboard size={18} />
          遊戲內裝備屬性文字 (支援 Ctrl+C 複製直接帶入)
        </label>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={onInsertSample}
            className="poe-btn"
            style={{ fontSize: '0.8rem', padding: '4px 10px' }}
          >
            <Sparkles size={14} /> 範例裝備
          </button>
          <button
            onClick={onReadClipboard}
            className="poe-btn"
            style={{ fontSize: '0.8rem', padding: '4px 12px' }}
          >
            <RefreshCw size={14} /> 讀取剪貼簿
          </button>
          {onSearchTrade && (
            <button
              onClick={onSearchTrade}
              disabled={searching || !rawText.trim()}
              className="poe-btn poe-btn-primary"
              style={{ fontSize: '0.8rem', padding: '4px 14px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Search size={14} />
              {searching ? '查詢中...' : '🔍 立即市集查價'}
            </button>
          )}
        </div>
      </div>

      <textarea
        className="poe-input"
        style={{
          width: '100%',
          height: '140px',
          fontFamily: 'monospace',
          fontSize: '0.85rem',
          lineHeight: '1.4',
          resize: 'vertical',
          boxSizing: 'border-box'
        }}
        placeholder="在遊戲中對著裝備按 Ctrl+C，然後貼上至此處（支援繁中台服與英文國際服裝備複製文本）..."
        value={rawText}
        onChange={(e) => onChangeRawText(e.target.value)}
      />
    </div>
  );
};

export default ItemInputPanel;
