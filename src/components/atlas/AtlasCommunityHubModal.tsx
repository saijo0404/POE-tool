import React, { useState, useMemo } from 'react';
import type { AtlasStrategy } from '../../domain/atlas/types';
import { COMMUNITY_STRATEGIES, calculateBulkShoppingList } from '../../domain/atlas/communityStrategies';
import { encodeAtlasStrategyShareCode, decodeAtlasStrategyShareCode } from '../../domain/atlas/atlasShareCodec';
import { X, Sparkles, Share2, ShoppingBag, Copy, Check, ArrowRight, BookOpen } from 'lucide-react';

interface AtlasCommunityHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStrategy: (strategy: AtlasStrategy) => void;
  currentStrategy?: AtlasStrategy | null;
}

export const AtlasCommunityHubModal: React.FC<AtlasCommunityHubModalProps> = ({
  isOpen,
  onClose,
  onImportStrategy,
  currentStrategy
}) => {
  const [activeTab, setActiveTab] = useState<'curated' | 'sharecode' | 'shopping'>('curated');
  const [importCodeInput, setImportCodeInput] = useState<string>('');
  const [importError, setImportError] = useState<string>('');
  const [copiedShareCode, setCopiedShareCode] = useState<boolean>(false);
  const [selectedStrategyForShopping, setSelectedStrategyForShopping] = useState<AtlasStrategy>(
    currentStrategy || COMMUNITY_STRATEGIES[0]
  );
  const [runsCount, setRunsCount] = useState<number>(50);

  const currentShareCode = useMemo(() => {
    return currentStrategy ? encodeAtlasStrategyShareCode(currentStrategy) : '';
  }, [currentStrategy]);

  const shoppingList = useMemo(() => {
    return calculateBulkShoppingList(selectedStrategyForShopping, runsCount, 150);
  }, [selectedStrategyForShopping, runsCount]);

  if (!isOpen) return null;

  const handleCopyCode = () => {
    if (currentShareCode && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentShareCode);
      setCopiedShareCode(true);
      setTimeout(() => setCopiedShareCode(false), 2000);
    }
  };

  const handleImportCode = (e: React.FormEvent) => {
    e.preventDefault();
    setImportError('');
    const res = decodeAtlasStrategyShareCode(importCodeInput);
    if (res.isOk()) {
      onImportStrategy(res.value);
      setImportCodeInput('');
      onClose();
    } else {
      setImportError(res.error.message);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
    }}>
      <div className="poe-card" style={{
        width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto',
        backgroundColor: '#0d121c', border: '1.5px solid var(--border-gold)',
        display: 'flex', flexDirection: 'column', gap: '12px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(200, 170, 110, 0.2)', paddingBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--text-gold)" />
            <h3 className="poe-font" style={{ fontSize: '1.15rem', color: 'var(--text-gold)', margin: 0 }}>
              輿圖策略社群雲端分享中心
            </h3>
          </div>
          <button type="button" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '6px' }}>
          <button
            type="button"
            className={activeTab === 'curated' ? 'poe-button' : 'poe-button-secondary'}
            onClick={() => setActiveTab('curated')}
            style={{ fontSize: '0.8rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <BookOpen size={14} /> 精選熱門策略
          </button>
          <button
            type="button"
            className={activeTab === 'sharecode' ? 'poe-button' : 'poe-button-secondary'}
            onClick={() => setActiveTab('sharecode')}
            style={{ fontSize: '0.8rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Share2 size={14} /> 短代碼匯入/分享
          </button>
          <button
            type="button"
            className={activeTab === 'shopping' ? 'poe-button' : 'poe-button-secondary'}
            onClick={() => setActiveTab('shopping')}
            style={{ fontSize: '0.8rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <ShoppingBag size={14} /> 批量備料採購單
          </button>
        </div>

        {/* Tab 1: Curated Community Strategies */}
        {activeTab === 'curated' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {COMMUNITY_STRATEGIES.map(strat => (
              <div key={strat.id} style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '4px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ maxWidth: '75%' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-gold)', marginBottom: '3px' }}>
                    {strat.name}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginBottom: '6px' }}>
                    {strat.description}
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                    {strat.tags?.map(t => (
                      <span key={t} style={{ fontSize: '0.68rem', padding: '1px 6px', borderRadius: '3px', background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button
                    type="button"
                    className="poe-button"
                    onClick={() => { onImportStrategy(strat); onClose(); }}
                    style={{ fontSize: '0.78rem', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    套用策略 <ArrowRight size={13} />
                  </button>
                  <button
                    type="button"
                    className="poe-button-secondary"
                    onClick={() => { setSelectedStrategyForShopping(strat); setActiveTab('shopping'); }}
                    style={{ fontSize: '0.72rem', padding: '3px 8px' }}
                  >
                    試算備料
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Share Code Import / Export */}
        {activeTab === 'sharecode' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Export Current Strategy */}
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                目前使用中的策略短代碼 (Share Code)：
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  readOnly
                  value={currentShareCode || '尚未選擇或建立有效策略'}
                  className="poe-input"
                  style={{ flex: 1, fontSize: '0.78rem', height: '34px' }}
                />
                <button
                  type="button"
                  className="poe-button"
                  disabled={!currentShareCode}
                  onClick={handleCopyCode}
                  style={{ fontSize: '0.8rem', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  {copiedShareCode ? <Check size={14} /> : <Copy size={14} />}
                  {copiedShareCode ? '已複製' : '一鍵複製'}
                </button>
              </div>
            </div>

            {/* Import Custom Strategy */}
            <form onSubmit={handleImportCode} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-gold)', fontWeight: 600, display: 'block' }}>
                匯入他人分享的短代碼 (以 POEATLAS-v1- 開頭)：
              </label>
              <textarea
                rows={3}
                className="poe-input"
                placeholder="在此貼上 POEATLAS-v1-... 短代碼"
                value={importCodeInput}
                onChange={e => setImportCodeInput(e.target.value)}
                style={{ width: '100%', fontSize: '0.78rem' }}
              />
              {importError && (
                <div style={{ color: '#f87171', fontSize: '0.78rem' }}>
                  ⚠️ {importError}
                </div>
              )}
              <button
                type="submit"
                className="poe-button"
                disabled={!importCodeInput.trim()}
                style={{ alignSelf: 'flex-start', fontSize: '0.8rem', padding: '6px 18px', marginTop: '4px' }}
              >
                解析並匯入為新策略
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Bulk Shopping List Estimator */}
        {activeTab === 'shopping' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.86rem', color: 'var(--text-gold)', fontWeight: 600 }}>
                策略目標：{selectedStrategyForShopping.name}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>規劃刷圖場次：</span>
                {[20, 50, 100].map(cnt => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setRunsCount(cnt)}
                    style={{
                      padding: '2px 8px', fontSize: '0.74rem', borderRadius: '3px',
                      background: runsCount === cnt ? 'var(--gold)' : 'rgba(255, 255, 255, 0.05)',
                      color: runsCount === cnt ? '#000' : '#fff', border: 'none', cursor: 'pointer'
                    }}
                  >
                    {cnt} 場
                  </button>
                ))}
              </div>
            </div>

            {/* Shopping Items Table */}
            <div style={{ background: 'rgba(0, 0, 0, 0.3)', borderRadius: '4px', padding: '10px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <th style={{ textAlign: 'left', paddingBottom: '6px' }}>採購項目</th>
                    <th style={{ textAlign: 'center', paddingBottom: '6px' }}>單場用量</th>
                    <th style={{ textAlign: 'center', paddingBottom: '6px' }}>總需求量</th>
                    <th style={{ textAlign: 'right', paddingBottom: '6px' }}>預估總價 (Chaos)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '6px 0', color: '#e2e8f0' }}>🗺️ 推薦基礎地圖 (預估)</td>
                    <td style={{ textAlign: 'center' }}>1 張</td>
                    <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-gold)' }}>{shoppingList.totalMaps} 張</td>
                    <td style={{ textAlign: 'right', color: '#94a3b8' }}>~{shoppingList.totalMaps * 5}c</td>
                  </tr>
                  {shoppingList.scarabs.map((item, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '6px 0', color: '#e2e8f0' }}>🐞 {item.name}</td>
                      <td style={{ textAlign: 'center' }}>{item.singleRunCount} 顆</td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-gold)' }}>{item.totalCount} 顆</td>
                      <td style={{ textAlign: 'right', color: '#fbbf24' }}>{item.totalCostChaos}c</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.15)', marginTop: '10px', paddingTop: '8px', fontSize: '0.86rem', fontWeight: 600 }}>
                <span>預估備料總成本：</span>
                <span style={{ color: '#fbbf24' }}>{shoppingList.totalCostChaos} Chaos (~{shoppingList.totalCostDivine} Divine)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
