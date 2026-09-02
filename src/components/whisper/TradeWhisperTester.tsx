import React, { useState } from 'react';
import type { TradeQuickResponseConfig } from '../../domain/tradeWhisper/types';
import { MessageSquare, Send, Volume2, VolumeX, Sparkles } from 'lucide-react';

interface TradeWhisperTesterProps {
  onSimulate: (rawText: string) => void;
  config: TradeQuickResponseConfig;
  onUpdateConfig: (partial: Partial<TradeQuickResponseConfig>) => void;
}

const PRESET_WHISPERS = [
  {
    label: '英文裝備密語 (含分頁與座標)',
    text: '@From <VIP> ShadowNinja: Hi, I would like to buy your Mageblood Heavy Belt listed for 200 divine in Settlers (stash tab "~b/o 200 divine"; position: left 4, top 8)'
  },
  {
    label: '繁中裝備密語 (台服格式)',
    text: '@來自 <榮耀> 冰霜法師: 你好，我想購買 獵首 皮革腰帶 標價 50 divine 在 聯盟 (倉庫分頁 "精選特價"; 位置: 左 2, 上 5)'
  },
  {
    label: '英文大宗通貨交易',
    text: "@From CurrencyKing: Hi, I'd like to buy your 50 Divine Orb for my 7500 Chaos Orb in Settlers."
  },
  {
    label: '繁中通貨密語 (國服/台服)',
    text: '@來自 散裝商人: 你好，我想要購買 1 個 神聖石 標價 150 混沌石 在 聯盟'
  }
];

export const TradeWhisperTester: React.FC<TradeWhisperTesterProps> = ({
  onSimulate,
  config,
  onUpdateConfig
}) => {
  const [customText, setCustomText] = useState<string>('');

  const handleApplyPreset = (text: string) => {
    setCustomText(text);
    onSimulate(text);
  };

  const handleSimulateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customText.trim()) {
      onSimulate(customText.trim());
    }
  };

  return (
    <div style={{
      background: 'rgba(15, 20, 28, 0.95)',
      border: '1px solid rgba(200, 170, 110, 0.35)',
      borderRadius: '8px',
      padding: '16px',
      color: '#e2e8f0',
      fontSize: '0.85rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={18} color="var(--text-gold)" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-gold)', fontWeight: 600 }}>
            💬 交易密語助理與快捷回覆設定 (Trade Whisper Assistant)
          </h3>
        </div>
        <button
          type="button"
          onClick={() => onUpdateConfig({ soundAlertEnabled: !config.soundAlertEnabled })}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: '1px solid rgba(200, 170, 110, 0.3)',
            borderRadius: '4px', padding: '4px 8px', color: '#c8aa6e', cursor: 'pointer', fontSize: '0.78rem'
          }}
          title="切換密語到來提示音"
        >
          {config.soundAlertEnabled ? <Volume2 size={14} color="#2ecc71" /> : <VolumeX size={14} color="#e74c3c" />}
          <span>提示音效: {config.soundAlertEnabled ? '開啟' : '靜音'}</span>
        </button>
      </div>

      {/* Quick response templates inputs */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#8c94a4', marginBottom: '4px' }}>
            🔵 「稍候 (Wait)」快速回覆模板：
          </label>
          <input
            type="text"
            value={config.waitMessageTemplate}
            onChange={(e) => onUpdateConfig({ waitMessageTemplate: e.target.value })}
            style={{ width: '100%', background: '#0a0d14', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '4px', padding: '6px 8px', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#8c94a4', marginBottom: '4px' }}>
            ⚪ 「謝踢 (Thanks & Kick)」致謝模板：
          </label>
          <input
            type="text"
            value={config.thanksMessageTemplate}
            onChange={(e) => onUpdateConfig({ thanksMessageTemplate: e.target.value })}
            style={{ width: '100%', background: '#0a0d14', border: '1px solid rgba(255, 255, 255, 0.15)', borderRadius: '4px', padding: '6px 8px', color: '#fff', fontSize: '0.8rem', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {/* Preset simulation buttons */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '0.75rem', color: '#8c94a4', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={13} color="#f1c40f" />
          <span>點選範例快速模擬買家密語：</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {PRESET_WHISPERS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset.text)}
              style={{
                background: 'rgba(200, 170, 110, 0.1)',
                border: '1px solid rgba(200, 170, 110, 0.3)',
                borderRadius: '4px',
                padding: '4px 10px',
                color: '#f3d179',
                cursor: 'pointer',
                fontSize: '0.75rem'
              }}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom input simulation form */}
      <form onSubmit={handleSimulateSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="貼上或輸入自訂交易密語 (@From 玩家名: Hi, I would like to buy...)"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          style={{ flex: 1, background: '#0a0d14', border: '1px solid rgba(200, 170, 110, 0.25)', borderRadius: '4px', padding: '6px 10px', color: '#fff', fontSize: '0.8rem' }}
        />
        <button
          type="submit"
          className="poe-button"
          style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 14px', borderRadius: '4px', fontSize: '0.8rem' }}
        >
          <Send size={13} />
          <span>模擬密語</span>
        </button>
      </form>
    </div>
  );
};
