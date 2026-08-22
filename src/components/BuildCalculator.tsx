import React, { useState, useMemo, useEffect } from 'react';
import { poeApi } from '../services/api';
import { getImageUrl } from '../utils/image';
import { useAppState } from '../hooks/useAppState';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PricedItem {
  name: string;
  typeLine: string;
  category: 'equipment' | 'gem' | 'flask' | 'jewel';
  rarity: string;
  icon: string;
  slot?: string;
  priceChaos: number;
  priceDivine: number;
  confidence: 'high' | 'medium' | 'low';
  details?: string;
  tradeSearchUrl?: string;
  tradeQueryJson?: string;
  isLivePrice?: boolean;
  listingCount?: number;
}

interface CategoryData {
  items: PricedItem[];
  totalChaos: number;
  totalDivine: number;
}

interface BuildCostResult {
  character: {
    account: string;
    name: string;
    league: string;
    level: number;
    class: string;
    ascendancy: string;
  };
  totalChaos: number;
  totalDivine: number;
  divineChaosRate: number;
  categories: {
    equipment: CategoryData;
    gems: CategoryData;
    flasks: CategoryData;
    jewels: CategoryData;
  };
}

interface BuildCalculatorProps {
  league: string;
  onShowToast: (msg: string) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const RARITY_COLORS: Record<string, string> = {
  Normal: '#c8c8c8',
  Magic: '#8888ff',
  Rare: '#ffff77',
  Unique: '#af6025',
  Gem: '#1ba29b',
  Currency: '#aa9e82',
};

const CONFIDENCE_LABELS: Record<string, { text: string; color: string }> = {
  high: { text: '精確', color: '#22c55e' },
  medium: { text: '估算', color: '#eab308' },
  low: { text: '未定價', color: '#64748b' },
};

const SLOT_LABELS: Record<string, string> = {
  Helm: '🪖 頭盔',
  BodyArmour: '🛡️ 胸甲',
  Gloves: '🧤 手套',
  Boots: '👢 鞋子',
  Weapon: '⚔️ 武器',
  Weapon2: '⚔️ 副武器',
  Offhand: '🛡️ 副手',
  Offhand2: '🛡️ 副手2',
  Ring: '💍 戒指',
  Ring2: '💍 戒指2',
  Amulet: '📿 項鍊',
  Belt: '🎗️ 腰帶',
};

const CATEGORY_CONFIG = {
  equipment: { label: '🛡️ 裝備 Equipment', gradient: 'linear-gradient(135deg, #8c7849 0%, #4a3d20 100%)' },
  gems: { label: '💎 寶石 Gems', gradient: 'linear-gradient(135deg, #1ba29b 0%, #0d5854 100%)' },
  flasks: { label: '🧪 藥劑 Flasks', gradient: 'linear-gradient(135deg, #a855f7 0%, #6b21a8 100%)' },
  jewels: { label: '🔮 珠寶 Jewels', gradient: 'linear-gradient(135deg, #38bdf8 0%, #0369a1 100%)' },
};

const DIVINE_ICON_URL = 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png';
const CHAOS_ICON_URL = 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png';

interface BuildHistoryEntry {
  url: string;
  account: string;
  name: string;
  className: string;
  ascendancy: string;
  level: number;
  league: string;
  totalChaos: number;
  totalDivine: number;
  timestamp: number;
  result: BuildCostResult;
}

export const getItemKey = (item: PricedItem) => {
  return `${item.category}_${item.name}_${item.typeLine}_${item.slot || ''}`;
};

// ─── Component ───────────────────────────────────────────────────────────────

export const BuildCalculator: React.FC<BuildCalculatorProps> = ({ league: _league, onShowToast }) => {
  let appState: any = null;
  try {
    appState = useAppState();
  } catch {}

  const cached = appState?.buildCalculatorState;
  const [ninjaUrl, setNinjaUrl] = useState(cached?.ninjaUrl || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BuildCostResult | null>(cached?.buildResult || null);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(cached?.activeCategoryTab || 'equipment');
  const [history, setHistory] = useState<BuildHistoryEntry[]>(() => {
    try {
      const saved = localStorage.getItem('poe_build_history_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // ─── Live Market Sync States ───
  const [livePrices, setLivePrices] = useState<Record<string, { priceChaos: number; priceDivine: number; total: number; isLive: boolean }>>({});
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncProgress, setSyncProgress] = useState<{ current: number; total: number } | null>(null);
  const [singleFetching, setSingleFetching] = useState<Record<string, boolean>>({});

  const updateBuildCalculatorState = appState?.updateBuildCalculatorState;

  useEffect(() => {
    if (updateBuildCalculatorState) {
      updateBuildCalculatorState({
        ninjaUrl,
        buildResult: result,
        activeCategoryTab: (expandedCategory as any) || 'equipment'
      });
    }
  }, [ninjaUrl, result, expandedCategory, updateBuildCalculatorState]);

  const matchedHistory = useMemo(() => {
    const clean = ninjaUrl.trim().toLowerCase();
    if (!clean) return null;
    return history.find(h => h.url.trim().toLowerCase() === clean);
  }, [history, ninjaUrl]);

  const handleCalculate = async (forceRefresh = false) => {
    const cleanUrl = ninjaUrl.trim();
    if (!cleanUrl) {
      onShowToast('請輸入 poe.ninja 或 pobb.in Build 網址！');
      return;
    }

    setLivePrices({}); // reset live price overrides on new calculate

    if (!forceRefresh && matchedHistory) {
      setResult(matchedHistory.result);
      setError(null);
      onShowToast(`⚡ 已從本機快取秒載入 [${matchedHistory.ascendancy || matchedHistory.className}] (總造價: ${matchedHistory.totalDivine} Div)`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await poeApi.calculateBuild(cleanUrl);
      setResult(data);

      const newEntry: BuildHistoryEntry = {
        url: cleanUrl,
        account: data.character.account,
        name: data.character.name,
        className: data.character.class,
        ascendancy: data.character.ascendancy,
        level: data.character.level,
        league: data.character.league,
        totalChaos: data.totalChaos,
        totalDivine: data.totalDivine,
        timestamp: Date.now(),
        result: data,
      };

      setHistory(prev => {
        const filtered = prev.filter(h => h.url.trim().toLowerCase() !== cleanUrl.toLowerCase());
        const updated = [newEntry, ...filtered].slice(0, 20);
        try {
          localStorage.setItem('poe_build_history_v1', JSON.stringify(updated));
        } catch {}
        return updated;
      });

      onShowToast('Build 成本計算完成並已儲存快取！');
    } catch (err: any) {
      const msg = err.response?.data?.error || err.message || '計算失敗';
      setError(msg);
      onShowToast(`錯誤: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistoryItem = (entry: BuildHistoryEntry) => {
    setNinjaUrl(entry.url);
    setResult(entry.result);
    setLivePrices({});
    setError(null);
    onShowToast(`⚡ 已載入歷史紀錄: ${entry.ascendancy || entry.className} (Lv.${entry.level})`);
  };

  const handleDeleteHistoryItem = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    setHistory(prev => {
      const updated = prev.filter(h => h.url !== url);
      try {
        localStorage.setItem('poe_build_history_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClearAllHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('poe_build_history_v1');
    } catch {}
    onShowToast('已清除所有 Build 歷史快取紀錄');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate(false);
    }
  };

  // ─── Single Item Live Price Fetch ───
  const handleSyncSingleItem = async (item: PricedItem) => {
    if (!result || !item.tradeQueryJson) return;
    const key = getItemKey(item);
    setSingleFetching(prev => ({ ...prev, [key]: true }));
    try {
      const res = await poeApi.fetchBuildItemLivePrice(result.character.league, item.tradeQueryJson);
      const minChaos = res?.estimatedMinPriceChaos ?? (res as any)?.estimated_min_price_chaos ?? 0;
      const minDivine = res?.estimatedMinPriceDivine ?? (res as any)?.estimated_min_price_divine ?? 0;

      if (res && res.total > 0 && minChaos > 0) {
        setLivePrices(prev => ({
          ...prev,
          [key]: {
            priceChaos: minChaos,
            priceDivine: minDivine,
            total: res.total,
            isLive: true
          }
        }));
        onShowToast(`✅ [${item.name || item.typeLine}] 官方現貨價: ${minDivine} Div (${minChaos} C, 共 ${res.total} 筆掛單)`);
      } else if (res && res.total === 0) {
        onShowToast(`⚠️ [${item.name || item.typeLine}] 官方市集目前 0 筆符合掛單`);
      } else {
        onShowToast(`ℹ️ [${item.name || item.typeLine}] 官方市集暫無有效報價`);
      }
    } catch (err: any) {
      onShowToast(`❌ [${item.name || item.typeLine}] 查詢失敗: ${err.message || err}`);
    } finally {
      setSingleFetching(prev => ({ ...prev, [key]: false }));
    }
  };

  // ─── Sync All Items Live Prices ───
  const handleSyncAllLivePrices = async () => {
    if (!result || syncingAll) return;
    const allItems: PricedItem[] = [
      ...result.categories.equipment.items,
      ...result.categories.jewels.items,
      ...result.categories.flasks.items,
      ...result.categories.gems.items
    ].filter(i => i.tradeQueryJson);

    if (allItems.length === 0) {
      onShowToast('查無可同步的物品市集條件');
      return;
    }

    setSyncingAll(true);
    setSyncProgress({ current: 0, total: allItems.length });
    onShowToast(`🚀 開始同步 ${allItems.length} 件物品的官方市集即時現貨價...`);

    let successCount = 0;
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      const key = getItemKey(item);
      setSyncProgress({ current: i + 1, total: allItems.length });
      try {
        const res = await poeApi.fetchBuildItemLivePrice(result.character.league, item.tradeQueryJson!);
        const minChaos = res?.estimatedMinPriceChaos ?? (res as any)?.estimated_min_price_chaos ?? 0;
        const minDivine = res?.estimatedMinPriceDivine ?? (res as any)?.estimated_min_price_divine ?? 0;

        if (res && res.total > 0 && minChaos > 0) {
          setLivePrices(prev => ({
            ...prev,
            [key]: {
              priceChaos: minChaos,
              priceDivine: minDivine,
              total: res.total,
              isLive: true
            }
          }));
          successCount++;
        }
      } catch (e) {
        console.warn('Sync failed for item', item.name, e);
      }
      if (i < allItems.length - 1) {
        await new Promise(r => setTimeout(r, 250));
      }
    }

    setSyncingAll(false);
    setSyncProgress(null);
    onShowToast(`🎉 官方現貨同步完成！成功取得 ${successCount} 件物品的即時市集價格。`);
  };

  // ─── Computed Result Overridden by Live Prices ───
  const computedResult = useMemo(() => {
    if (!result) return null;
    const cats = {
      equipment: { ...result.categories.equipment, items: [...result.categories.equipment.items] },
      gems: { ...result.categories.gems, items: [...result.categories.gems.items] },
      flasks: { ...result.categories.flasks, items: [...result.categories.flasks.items] },
      jewels: { ...result.categories.jewels, items: [...result.categories.jewels.items] },
    };

    let totalC = 0;
    let totalD = 0;

    (Object.keys(cats) as Array<keyof typeof cats>).forEach(catKey => {
      let catC = 0;
      let catD = 0;
      cats[catKey].items = cats[catKey].items.map(item => {
        const key = getItemKey(item);
        const live = livePrices[key];
        if (live && live.isLive) {
          catC += live.priceChaos;
          catD += live.priceDivine;
          return {
            ...item,
            priceChaos: live.priceChaos,
            priceDivine: live.priceDivine,
            confidence: 'high' as const,
            details: `官方現貨價 (${live.total} 筆掛單)`,
            isLivePrice: true,
            listingCount: live.total
          };
        }
        catC += item.priceChaos;
        catD += item.priceDivine;
        return item;
      });
      cats[catKey].totalChaos = Math.round(catC * 10) / 10;
      cats[catKey].totalDivine = Math.round(catD * 100) / 100;
      totalC += catC;
      totalD += catD;
    });

    return {
      ...result,
      categories: cats,
      totalChaos: Math.round(totalC * 10) / 10,
      totalDivine: Math.round(totalD * 100) / 100,
    };
  }, [result, livePrices]);

  const liveCount = Object.values(livePrices).filter(v => v.isLive).length;
  const divIcon = getImageUrl(DIVINE_ICON_URL);
  const chaosIcon = getImageUrl(CHAOS_ICON_URL);

  const displayData = computedResult || result;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      {/* URL Input Section */}
      <div className="poe-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 className="poe-font" style={{
            color: 'var(--text-gold)',
            fontSize: '1.3rem',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{ fontSize: '1.5rem' }}>📊</span>
            Build 成本估算器 (poe.ninja & pobb.in)
          </h2>
          {matchedHistory && (
            <span style={{
              background: 'rgba(34, 197, 94, 0.15)',
              border: '1px solid rgba(34, 197, 94, 0.4)',
              color: '#4ade80',
              padding: '3px 10px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 500
            }}>
              ⚡ 已命中本機快取 (可直接秒開)
            </span>
          )}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '12px' }}>
          貼上 <strong>poe.ninja Build</strong> 或 <strong>pobb.in 分享網址 / 代碼</strong>，自動估算全套裝備、技能寶石、藥劑與珠寶的總造價，並支援<strong>直接連線官方市集同步現貨價</strong>！
        </p>

        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            className="poe-input"
            type="text"
            value={ninjaUrl}
            onChange={e => setNinjaUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="貼上 poe.ninja 網址 或 https://pobb.in/xxxx..."
            style={{ flex: 1, fontSize: '0.9rem' }}
          />
          <button
            className="poe-btn poe-btn-primary"
            onClick={() => handleCalculate(false)}
            disabled={loading}
            style={{ whiteSpace: 'nowrap', minWidth: '120px' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="spinner" />
                計算中...
              </span>
            ) : matchedHistory && !result ? (
              '⚡ 從快取秒開'
            ) : (
              '🔍 計算成本'
            )}
          </button>
          {result && (
            <button
              className="poe-btn"
              onClick={() => handleCalculate(true)}
              disabled={loading || syncingAll}
              title="強制重新向網路抓取最新物價並更新快取"
              style={{
                background: 'rgba(56, 189, 248, 0.12)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: 'var(--accent-blue)',
                whiteSpace: 'nowrap'
              }}
            >
              🔄 強制重估
            </button>
          )}
        </div>

        {/* Sample URLs */}
        <div style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <span>範例：</span>
          <span
            style={{ color: 'var(--accent-blue)', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setNinjaUrl('https://poe.ninja/poe1/builds/allflame/character/Poteitik-3151/%D0%9F%D0%9E%D0%A2%D0%95%D0%99%D0%A2%D0%98%D0%9A?i=0')}
          >
            poe.ninja: Poteitik (Champion)
          </span>
          <span
            style={{ color: 'var(--text-gold)', cursor: 'pointer', textDecoration: 'underline' }}
            onClick={() => setNinjaUrl('https://pobb.in/sample_spark_inquisitor')}
          >
            pobb.in: Spark Inquisitor
          </span>
        </div>

        {/* ─── Build History / Cache List ─── */}
        {history.length > 0 && (
          <div style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(200, 170, 110, 0.15)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                🕒 歷史查詢紀錄 ({history.length}) · 點擊即可 0 延遲切換
              </span>
              <button
                onClick={handleClearAllHistory}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  textDecoration: 'underline'
                }}
              >
                清除所有紀錄
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {history.map((h, idx) => {
                const isActive = ninjaUrl.trim().toLowerCase() === h.url.trim().toLowerCase();
                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectHistoryItem(h)}
                    style={{
                      background: isActive ? 'rgba(200, 170, 110, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                      border: `1px solid ${isActive ? 'var(--text-gold)' : 'rgba(200, 170, 110, 0.2)'}`,
                      borderRadius: '8px',
                      padding: '4px 10px',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ color: 'var(--text-gold)', fontWeight: 600 }}>{h.ascendancy || h.className}</span>
                    <span style={{ color: 'var(--accent-green)' }}>Lv.{h.level}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{h.totalDivine} Div</span>
                    <button
                      onClick={(e) => handleDeleteHistoryItem(e, h.url)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0 2px',
                        fontSize: '0.8rem',
                        lineHeight: 1
                      }}
                      title="刪除此紀錄"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '6px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: '#ef4444',
          fontSize: '0.9rem'
        }}>
          ❌ {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="loading-pulse" style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: 'radial-gradient(circle, #f3d179 0%, #8c7849 60%, transparent 100%)',
            margin: '0 auto 20px',
            animation: 'pulse 1.5s infinite'
          }} />
          <p style={{ color: 'var(--text-gold)', fontSize: '1.1rem' }}>正在解析流派資料並計算即時市場價格...</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '8px' }}>支援 poe.ninja 與 pobb.in → 查詢市場價格 → 彙整各部位統計</p>
        </div>
      )}

      {/* Results */}
      {displayData && (
        <div>
          {/* Character Header & Actions */}
          <div className="poe-card" style={{
            marginBottom: '20px',
            background: 'linear-gradient(135deg, rgba(200, 170, 110, 0.08) 0%, rgba(16, 22, 34, 1) 60%)',
            borderColor: 'rgba(200, 170, 110, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 className="poe-font" style={{ color: 'var(--text-gold)', fontSize: '1.4rem', marginBottom: '4px' }}>
                  {displayData.character.name}
                </h3>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>
                    帳號: <span style={{ color: 'var(--text-main)' }}>{displayData.character.account}</span>
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    等級: <span style={{ color: 'var(--accent-green)' }}>Lv.{displayData.character.level}</span>
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    職業: <span style={{ color: '#a855f7' }}>{displayData.character.ascendancy || displayData.character.class}</span>
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    聯盟: <span style={{ color: 'var(--accent-blue)' }}>{displayData.character.league}</span>
                  </span>
                </div>

                {/* Live Sync Action Button */}
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <button
                    className="poe-btn"
                    onClick={handleSyncAllLivePrices}
                    disabled={syncingAll || loading}
                    style={{
                      background: syncingAll ? 'rgba(34, 197, 94, 0.2)' : 'linear-gradient(135deg, rgba(34, 197, 94, 0.25) 0%, rgba(16, 185, 129, 0.15) 100%)',
                      border: '1px solid #22c55e',
                      color: '#4ade80',
                      padding: '8px 16px',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 0 12px rgba(34, 197, 94, 0.2)'
                    }}
                  >
                    {syncingAll ? (
                      <>
                        <span className="spinner" style={{ borderColor: 'rgba(74, 222, 128, 0.3)', borderTopColor: '#4ade80' }} />
                        正在同步官方現貨 ({syncProgress?.current}/{syncProgress?.total})...
                      </>
                    ) : (
                      <>
                        <span>⚡</span>
                        一鍵同步官方市集現貨價 (Live Market Sync)
                      </>
                    )}
                  </button>

                  {liveCount > 0 && (
                    <span style={{
                      color: '#4ade80',
                      fontSize: '0.8rem',
                      background: 'rgba(34, 197, 94, 0.12)',
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      padding: '4px 10px',
                      borderRadius: '12px'
                    }}>
                      🔥 已套用 {liveCount} 項官方即時現貨價
                    </span>
                  )}
                </div>
              </div>

              {/* Total Cost Banner */}
              <div style={{
                background: 'rgba(243, 209, 121, 0.1)',
                border: '1px solid rgba(243, 209, 121, 0.3)',
                borderRadius: '12px',
                padding: '14px 24px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  {liveCount > 0 ? '即時同步總成本 (Live Cost)' : '估算總成本 (Estimated Cost)'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img src={divIcon} alt="Divine" style={{ width: '24px', height: '24px' }} />
                    <span className="poe-font" style={{ color: 'var(--text-gold)', fontSize: '1.6rem', fontWeight: 700 }}>
                      {displayData.totalDivine.toLocaleString()}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Divine</span>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>/</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <img src={chaosIcon} alt="Chaos" style={{ width: '20px', height: '20px' }} />
                    <span style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 600 }}>
                      {displayData.totalChaos.toLocaleString()}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Chaos</span>
                  </div>
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  匯率: 1 Divine = {displayData.divineChaosRate} Chaos
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {(Object.entries(CATEGORY_CONFIG) as [keyof typeof CATEGORY_CONFIG, typeof CATEGORY_CONFIG[keyof typeof CATEGORY_CONFIG]][]).map(([key, config]) => {
              const cat = displayData.categories[key as keyof typeof displayData.categories];
              const percentage = displayData.totalChaos > 0 ? Math.round((cat.totalChaos / displayData.totalChaos) * 100) : 0;
              const isExpanded = expandedCategory === key;

              return (
                <div
                  key={key}
                  onClick={() => setExpandedCategory(isExpanded ? null : key)}
                  style={{
                    background: isExpanded ? 'var(--bg-card-hover)' : 'var(--bg-card)',
                    border: isExpanded ? '1px solid rgba(200, 170, 110, 0.5)' : '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0,
                    height: '3px', background: 'rgba(255,255,255,0.05)'
                  }}>
                    <div style={{
                      height: '100%', width: `${percentage}%`,
                      background: config.gradient,
                      transition: 'width 0.5s ease'
                    }} />
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {config.label}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span className="poe-font" style={{ color: 'var(--text-gold)', fontSize: '1.2rem', fontWeight: 700 }}>
                      {cat.totalDivine.toLocaleString()}
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Div</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {cat.totalChaos.toLocaleString()} C · {cat.items.length} 件 · {percentage}%
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Breakdown Table with Category Filtering & Sorting */}
          <ItemTable
            allCategories={displayData.categories}
            expandedCategory={expandedCategory}
            onSelectCategory={setExpandedCategory}
            divIcon={divIcon}
            chaosIcon={chaosIcon}
            league={displayData.character.league}
            onSyncSingleItem={handleSyncSingleItem}
            singleFetching={singleFetching}
          />
        </div>
      )}

      {/* Inline Styles */}
      <style>{`
        .spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid #fff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

// ─── Item Table Sub-Component with Category Filter & Sorting ─────────────────

interface ItemTableProps {
  allCategories: BuildCostResult['categories'];
  expandedCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  divIcon: string;
  chaosIcon: string;
  league: string;
  onSyncSingleItem: (item: PricedItem) => void;
  singleFetching: Record<string, boolean>;
}

const ItemTable: React.FC<ItemTableProps> = ({
  allCategories,
  expandedCategory,
  onSelectCategory,
  divIcon,
  chaosIcon,
  league,
  onSyncSingleItem,
  singleFetching
}) => {
  const [filterCategory, setFilterCategory] = useState<string>(expandedCategory || 'all');
  const [sortBy, setSortBy] = useState<'priceDesc' | 'priceAsc' | 'name'>('priceDesc');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [openingTradeId, setOpeningTradeId] = useState<string | null>(null);

  const handleOpenTrade = async (item: PricedItem, e: React.MouseEvent) => {
    e.preventDefault();
    const key = getItemKey(item);
    setOpeningTradeId(key);
    try {
      if (item.tradeQueryJson) {
        await poeApi.createTradeSearchUrl(league, item.tradeQueryJson);
      } else if (item.tradeSearchUrl) {
        await poeApi.openExternalUrl(item.tradeSearchUrl);
      }
    } catch {
      if (item.tradeSearchUrl) {
        await poeApi.openExternalUrl(item.tradeSearchUrl);
      }
    } finally {
      setOpeningTradeId(null);
    }
  };

  useEffect(() => {
    if (expandedCategory) {
      setFilterCategory(expandedCategory);
    }
  }, [expandedCategory]);

  const items = useMemo(() => {
    let list: PricedItem[] = [];
    if (filterCategory === 'all') {
      list = [
        ...allCategories.equipment.items,
        ...allCategories.flasks.items,
        ...allCategories.jewels.items,
        ...allCategories.gems.items
      ];
    } else if (allCategories[filterCategory as keyof typeof allCategories]) {
      list = allCategories[filterCategory as keyof typeof allCategories].items;
    }

    if (searchKeyword.trim()) {
      const term = searchKeyword.toLowerCase();
      list = list.filter(i =>
        i.name.toLowerCase().includes(term) ||
        (i.slot && i.slot.toLowerCase().includes(term)) ||
        (i.details && i.details.toLowerCase().includes(term))
      );
    }

    return [...list].sort((a, b) => {
      if (sortBy === 'priceDesc') return b.priceChaos - a.priceChaos;
      if (sortBy === 'priceAsc') return a.priceChaos - b.priceChaos;
      return a.name.localeCompare(b.name);
    });
  }, [allCategories, filterCategory, searchKeyword, sortBy]);

  return (
    <div className="poe-card" style={{ overflowX: 'auto' }}>
      {/* Category Tabs & Sorting Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: '全部部位' },
            { id: 'equipment', label: '裝備武器' },
            { id: 'flasks', label: '藥劑裝配' },
            { id: 'jewels', label: '天賦珠寶' },
            { id: 'gems', label: '技能寶石' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterCategory(tab.id);
                onSelectCategory(tab.id === 'all' ? null : tab.id);
              }}
              style={{
                background: filterCategory === tab.id ? 'rgba(200, 170, 110, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                border: filterCategory === tab.id ? '1px solid var(--text-gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                color: filterCategory === tab.id ? 'var(--text-gold)' : 'var(--text-muted)',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                cursor: 'pointer',
                fontWeight: filterCategory === tab.id ? 600 : 400,
                transition: 'all 0.15s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Keyword Search */}
          <input
            type="text"
            className="poe-input"
            placeholder="搜尋物品/技能名稱..."
            value={searchKeyword}
            onChange={e => setSearchKeyword(e.target.value)}
            style={{ fontSize: '0.8rem', padding: '3px 8px', width: '150px' }}
          />

          {/* Sort By Dropdown */}
          <select
            className="poe-input"
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            style={{ fontSize: '0.8rem', padding: '3px 8px' }}
          >
            <option value="priceDesc">依造價 (最高 → 最低)</option>
            <option value="priceAsc">依造價 (最低 → 最高)</option>
            <option value="name">依名稱 (A → Z)</option>
          </select>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <th style={thStyle}>物品名稱</th>
            <th style={thStyle}>稀有度</th>
            <th style={thStyle}>裝備部位 / 細節</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>估價 (Chaos)</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>估價 (Divine)</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>信心度 / 現貨來源</th>
            <th style={{ ...thStyle, textAlign: 'center' }}>市集操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, i) => {
            const rarityColor = RARITY_COLORS[item.rarity] || '#c8c8c8';
            const conf = CONFIDENCE_LABELS[item.confidence] || CONFIDENCE_LABELS.low;
            const slotLabel = item.slot ? (SLOT_LABELS[item.slot] || item.slot) : '';
            const itemKey = getItemKey(item);
            const isFetchingThis = Boolean(singleFetching[itemKey]);

            return (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  background: item.isLivePrice ? 'rgba(34, 197, 94, 0.03)' : 'transparent',
                  transition: 'background 0.15s ease'
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,170,110,0.05)')}
                onMouseLeave={e => (e.currentTarget.style.background = item.isLivePrice ? 'rgba(34, 197, 94, 0.03)' : 'transparent')}
              >
                <td style={tdStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {item.icon && (
                      <img
                        src={item.icon}
                        alt={item.name}
                        referrerPolicy="no-referrer"
                        style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px', background: 'rgba(0,0,0,0.3)' }}
                      />
                    )}
                    <div>
                      <span style={{ color: rarityColor, fontWeight: 600 }}>{item.name}</span>
                      {item.isLivePrice && (
                        <span style={{
                          marginLeft: '6px',
                          background: 'rgba(34, 197, 94, 0.2)',
                          color: '#4ade80',
                          fontSize: '0.7rem',
                          padding: '1px 6px',
                          borderRadius: '8px',
                          fontWeight: 500
                        }}>
                          現貨
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    color: rarityColor,
                    fontSize: '0.75rem',
                    padding: '2px 8px',
                    border: `1px solid ${rarityColor}`,
                    borderRadius: '10px',
                    opacity: 0.8
                  }}>
                    {item.rarity}
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {slotLabel}{item.details ? ` · ${item.details}` : ''}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    <img src={chaosIcon} alt="C" style={{ width: '14px', height: '14px' }} />
                    <span style={{ color: item.priceChaos > 0 ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {item.priceChaos > 0 ? item.priceChaos.toLocaleString() : '—'}
                    </span>
                  </div>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px' }}>
                    <img src={divIcon} alt="Div" style={{ width: '14px', height: '14px' }} />
                    <span style={{ color: item.priceDivine > 0 ? 'var(--text-gold)' : 'var(--text-muted)', fontWeight: 700 }}>
                      {item.priceDivine > 0 ? item.priceDivine.toLocaleString() : '—'}
                    </span>
                  </div>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  {item.isLivePrice ? (
                    <span style={{ color: '#4ade80', fontSize: '0.75rem', fontWeight: 600 }}>
                      ⚡ 官方現貨 ({item.listingCount ?? 1} 筆)
                    </span>
                  ) : (
                    <span style={{ color: conf.color, fontSize: '0.75rem', fontWeight: 500 }}>
                      {conf.text}
                    </span>
                  )}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    {item.tradeQueryJson && (
                      <button
                        type="button"
                        onClick={() => onSyncSingleItem(item)}
                        disabled={isFetchingThis}
                        title="向官方市集即時查詢此裝備的真實現貨價格"
                        style={{
                          color: '#4ade80',
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          background: 'rgba(34, 197, 94, 0.1)',
                          border: '1px solid rgba(34, 197, 94, 0.4)',
                          borderRadius: '4px',
                          cursor: isFetchingThis ? 'wait' : 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(34, 197, 94, 0.2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(34, 197, 94, 0.1)')}
                      >
                        {isFetchingThis ? '⏳' : '⚡'}
                        {isFetchingThis ? '查詢中' : '同步現貨'}
                      </button>
                    )}
                    {(item.tradeQueryJson || item.tradeSearchUrl) && (
                      <button
                        type="button"
                        onClick={e => handleOpenTrade(item, e)}
                        disabled={openingTradeId === itemKey}
                        title="開啟 GGG 官方拍賣場搜尋頁面"
                        style={{
                          color: 'var(--accent-blue)',
                          fontSize: '0.75rem',
                          padding: '2px 8px',
                          background: 'transparent',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          borderRadius: '4px',
                          cursor: openingTradeId === itemKey ? 'wait' : 'pointer',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {openingTradeId === itemKey ? '⏳ 載入中...' : '🔗 Trade'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BuildCalculator;

const thStyle: React.CSSProperties = {
  padding: '10px 8px',
  textAlign: 'left',
  color: 'var(--text-muted)',
  fontWeight: 600,
  fontSize: '0.8rem',
  letterSpacing: '0.5px'
};

const tdStyle: React.CSSProperties = {
  padding: '10px 8px',
  verticalAlign: 'middle'
};
