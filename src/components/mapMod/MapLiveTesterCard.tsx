import React, { useState } from 'react';
import { Search, AlertOctagon, CheckCircle2, Clipboard } from 'lucide-react';
import type { MapDangerEvaluation } from '../../domain/mapMod/types';
import { poeApi } from '../../services/api';
import { Card, Button } from '../ui';

interface MapLiveTesterCardProps {
  onEvaluate: (text: string, playSound?: boolean) => MapDangerEvaluation;
}

export const MapLiveTesterCard: React.FC<MapLiveTesterCardProps> = ({ onEvaluate }) => {
  const [inputText, setInputText] = useState('');
  const [evaluation, setEvaluation] = useState<MapDangerEvaluation | null>(null);

  const handleTestText = (text: string) => {
    setInputText(text);
    if (!text.trim()) {
      setEvaluation(null);
      return;
    }
    const res = onEvaluate(text, true);
    setEvaluation(res);
  };

  const handlePasteFromClipboard = async () => {
    try {
      const serverRes = await poeApi.readClipboard();
      if (serverRes?.text) {
        handleTestText(serverRes.text);
        return;
      }
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) handleTestText(text);
      }
    } catch {
      // Ignore
    }
  };

  return (
    <Card variant="default" padding="md" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', paddingBottom: '12px' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--text-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={18} color="var(--text-gold)" /> 即時地圖危險詞綴測試區 (Live Tester)
        </h3>
        <Button
          size="sm"
          variant="secondary"
          onClick={handlePasteFromClipboard}
          icon={<Clipboard size={13} />}
        >
          貼上剪貼簿地圖
        </Button>
      </div>

      <div>
        <textarea
          className="poe-input"
          value={inputText}
          onChange={e => handleTestText(e.target.value)}
          placeholder="在此貼上遊戲中複製的地圖 (Ctrl+C)，即可即時分析危險詞綴..."
          rows={5}
          style={{ width: '100%', fontSize: '0.8rem', fontFamily: 'monospace', resize: 'vertical' }}
        />
      </div>

      {evaluation && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {evaluation.isMap ? (
            evaluation.hasDanger ? (
              <div
                style={{
                  background: 'rgba(229, 80, 57, 0.18)',
                  border: '1px solid rgba(229, 80, 57, 0.6)',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  boxShadow: '0 0 16px rgba(229, 80, 57, 0.25)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ff7675', fontWeight: 'bold', fontSize: '0.92rem' }}>
                    <AlertOctagon size={20} color="#ff7675" />
                    <span>⚠️ 警告：此地圖包含 {evaluation.matchedDangerMods.length + evaluation.matchedCustomKeywords.length} 個流派致命詞綴！</span>
                  </div>
                  {evaluation.mapTier && (
                    <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(200, 170, 110, 0.2)', color: 'var(--text-gold)' }}>
                      T{evaluation.mapTier} 地圖
                    </span>
                  )}
                </div>

                {/* List of Matched Danger Mods */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  {evaluation.matchedDangerMods.map((m, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        padding: '8px 10px',
                        borderRadius: '4px',
                        borderLeft: '3px solid #e55039',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#ff7675', fontWeight: 'bold', fontSize: '0.82rem' }}>
                          ❌ {m.def.nameZh} ({m.def.nameEn})
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#e55039', fontWeight: 'bold' }}>
                          {m.def.severity === 'deadly' ? '致命級' : '高危級'}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#e0e0e0', fontFamily: 'monospace' }}>
                        &bull; 原始詞綴：{m.matchedLine}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {m.def.descriptionZh}
                      </div>
                    </div>
                  ))}

                  {evaluation.matchedCustomKeywords.map((kw, idx) => (
                    <div
                      key={`kw-${idx}`}
                      style={{
                        background: 'rgba(0, 0, 0, 0.4)',
                        padding: '6px 10px',
                        borderRadius: '4px',
                        borderLeft: '3px solid #f39c12',
                        fontSize: '0.78rem',
                        color: '#f39c12'
                      }}
                    >
                      🔍 命中自訂關鍵字黑名單：<code>{kw}</code>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ background: 'rgba(46, 204, 113, 0.12)', border: '1px solid rgba(46, 204, 113, 0.4)', borderRadius: '6px', padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '8px', color: '#2ecc71' }}>
                <CheckCircle2 size={18} color="#2ecc71" />
                <span style={{ fontSize: '0.86rem', fontWeight: 'bold' }}>
                  ✅ 安全地圖：未偵測到任何流派黑名單危險詞綴，可安心刷圖！
                </span>
              </div>
            )
          ) : (
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '6px', padding: '10px 14px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              ℹ️ 偵測到非地圖物品，地圖危險詞綴警報僅在地圖類型物品生效。
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
