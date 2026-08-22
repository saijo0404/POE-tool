import React, { useState } from 'react';
import type { TradeSearchResult, TradeListing } from '../../types/poe';
import { Copy, Check, MessageSquare, ShieldCheck, User, Home, ExternalLink, Loader2, ArrowUpDown, ChevronDown, Zap } from 'lucide-react';
import { getImageUrl } from '../../utils/image';
import { poeApi } from '../../services/api';
import { ItemTooltip } from '../common/ItemTooltip';

interface TradeListingViewProps {
  tradeResults: TradeSearchResult | null;
  copiedId: string | null;
  onCopyWhisper: (listing: TradeListing) => void;
  sortBy?: 'price_asc' | 'price_desc' | 'indexed_desc';
  onChangeSortBy?: (val: 'price_asc' | 'price_desc' | 'indexed_desc') => void;
  onLoadMore?: () => void;
  loadingMore?: boolean;
  league?: string;
  onShowToast?: (msg: string) => void;
}

export const TradeListingView: React.FC<TradeListingViewProps> = ({
  tradeResults,
  copiedId,
  onCopyWhisper,
  sortBy = 'price_asc',
  onChangeSortBy,
  onLoadMore,
  loadingMore = false,
  league,
  onShowToast
}) => {
  const [activeHideoutId, setActiveHideoutId] = useState<string | null>(null);
  const [hideoutStatusText, setHideoutStatusText] = useState<Record<string, string>>({});
  const [loadingHideoutId, setLoadingHideoutId] = useState<string | null>(null);

  if (!tradeResults) {
    return null;
  }

  if (!tradeResults.listings || tradeResults.listings.length === 0) {
    return (
      <div className="poe-card" style={{
        padding: '30px 20px',
        textAlign: 'center',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px dashed rgba(200, 170, 110, 0.3)',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-gold)', marginBottom: '8px', fontWeight: 600 }}>
          🔍 未找到符合條件的市集刊登物件 (0 筆)
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '580px', margin: '0 auto 16px', lineHeight: 1.6 }}>
          可能原因：
          <br />• 勾選的詞綴數量過多或數值過於嚴苛，導致市場上無完全一致的裝備。
          <br />• 交易方式設為「<strong>Instant Buyout (僅即時直購)</strong>」，該類別在當前聯盟可能尚無玩家以直購方式刊登，建議將上方「交易方式」切換為「<strong>In Person (Online)</strong>」或「<strong>Instant Buyout and In Person</strong>」。
          <br />• 建議取消勾選次要詞綴（如防禦回復、自訂工藝等），保留 2~3 項核心數值後點擊「重新查詢」。
        </p>
      </div>
    );
  }

  const handleDirectTravelToHideout = async (listing: any) => {
    const targetName = listing.characterName || listing.sellerIgn || listing.accountName || listing.sellerAccount;
    if (!targetName) return;

    // 1. Always copy in-game /hideout command to clipboard as a seamless fallback
    const hideoutCmd = `/hideout ${targetName}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(hideoutCmd);
      } catch (e) {
        console.warn('Clipboard write error:', e);
      }
    }

    setActiveHideoutId(listing.id);
    setLoadingHideoutId(listing.id);

    try {
      // 2. Call backend travelToHideout service with 4.5s safety timeout
      const res = await Promise.race([
        poeApi.travelToHideout({
          token: listing.whisperToken,
          characterName: targetName,
          league,
          searchId: tradeResults?.searchId || tradeResults?.id,
          itemId: listing.id
        }),
        new Promise<any>((_, reject) => setTimeout(() => reject(new Error('連線逾時')), 4500))
      ]);

      if (res && res.gameTriggered && res.officialWhisperSent) {
        setHideoutStatusText(prev => ({ ...prev, [listing.id]: '⚡ 已在遊戲中前往！' }));
        onShowToast?.(`⚡ 官方直購已發送，並已在遊戲中執行 ${hideoutCmd} 前往藏身處！`);
      } else if (res && res.gameTriggered) {
        setHideoutStatusText(prev => ({ ...prev, [listing.id]: '⚡ 已在遊戲中前往！' }));
        onShowToast?.(`⚡ 已在遊戲中自動執行 ${hideoutCmd} 前往藏身處！`);
      } else if (res && res.officialWhisperSent) {
        setHideoutStatusText(prev => ({ ...prev, [listing.id]: '⚡ 官方直購已發送！' }));
        onShowToast?.(`⚡ 官方直購連動成功！已發送前往請求，並已複製 ${hideoutCmd}`);
      } else {
        const msg = res?.message || `已複製 ${hideoutCmd}`;
        setHideoutStatusText(prev => ({ ...prev, [listing.id]: `已複製 ${hideoutCmd}` }));
        onShowToast?.(
          listing.whisperToken
            ? `⚠️ 官方連動提示：${msg}（已複製 ${hideoutCmd}，可於遊戲內 Enter+Ctrl+V 傳送）`
            : `ℹ️ 已複製 ${hideoutCmd}！（提示：請於右上角設定登入 POESESSID，即可啟用官方遊戲內一鍵自動前往）`
        );
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.error || err?.message || '連線逾時';
      setHideoutStatusText(prev => ({ ...prev, [listing.id]: `已複製 ${hideoutCmd}` }));
      onShowToast?.(`⚠️ 官方直購連動提示：${errMsg}（已複製 ${hideoutCmd}，可於遊戲內 Enter+Ctrl+V 傳送）`);
    } finally {
      setLoadingHideoutId(null);
      setTimeout(() => {
        setActiveHideoutId(null);
        setHideoutStatusText(prev => {
          const next = { ...prev };
          delete next[listing.id];
          return next;
        });
      }, 2500);
    }
  };

  const tradeSearchUrl = tradeResults.searchUrl || tradeResults.tradeUrl;
  const hasMoreListings = tradeResults.listings.length < tradeResults.total;

  return (
    <div className="poe-card">
      {/* Header bar with total counts, sort selector, and external official link */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h3 className="poe-font" style={{ fontSize: '1rem', color: 'var(--text-gold)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={18} />
            刊登清單明細 ({tradeResults.listings.length} / {tradeResults.total} 筆)
          </h3>

          {/* Sort Selector */}
          {onChangeSortBy && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', background: '#090d14', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(200, 170, 110, 0.25)' }}>
              <ArrowUpDown size={13} color="var(--text-gold)" />
              <select
                value={sortBy}
                onChange={e => onChangeSortBy(e.target.value as any)}
                style={{ background: 'transparent', color: 'var(--text-bright)', border: 'none', outline: 'none', cursor: 'pointer', fontSize: '0.78rem' }}
              >
                <option value="price_asc" style={{ background: '#0f141f' }}>價格由低到高 (預設)</option>
                <option value="price_desc" style={{ background: '#0f141f' }}>價格由高到低</option>
                <option value="indexed_desc" style={{ background: '#0f141f' }}>刊登時間最新</option>
              </select>
            </div>
          )}
        </div>

        {tradeSearchUrl && (
          <a
            href={tradeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="poe-btn"
            style={{
              fontSize: '0.8rem',
              padding: '4px 10px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent-blue)',
              borderColor: 'rgba(56, 189, 248, 0.3)'
            }}
          >
            <ExternalLink size={14} />
            在官方市集開啟此搜尋
          </a>
        )}
      </div>

      {/* Listings List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tradeResults.listings.map((listing: any) => {
          const isCopied = copiedId === listing.id;
          const isHideoutActive = activeHideoutId === listing.id;
          const isLoadingHideout = loadingHideoutId === listing.id;
          const isHideoutBuyout = Boolean(listing.hideoutToken || listing.whisperToken || listing.isInstantBuyout || listing.method === 'merchant');
          const hasOfficialToken = isHideoutBuyout;
          const defaultHideoutText = isHideoutBuyout
            ? '⚡ 前往藏身處 (Travel to Hideout)'
            : '前往藏身處 (/hideout)';

          const statusText = hideoutStatusText[listing.id] || (isHideoutActive ? '已複製藏身處指令！' : defaultHideoutText);
          const currencyIcon = listing.priceCurrency === 'divine'
            ? 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png'
            : 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZXJvbGxSYXJlIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/d119a0d734/CurrencyRerollRare.png';

          const tooltipItem = {
            name: listing.itemName || listing.item?.name || '裝備',
            typeLine: listing.baseType || listing.item?.typeLine || '',
            baseType: listing.baseType || listing.item?.baseType || '',
            rarity: listing.item?.rarity || 'Rare',
            ilvl: listing.ilvl || listing.item?.ilvl,
            corrupted: listing.item?.corrupted,
            implicitMods: listing.implicitMods || listing.item?.implicitMods || [],
            explicitMods: listing.explicitMods || listing.item?.explicitMods || [],
            craftedMods: listing.craftedMods || listing.item?.craftedMods || [],
            enchantMods: listing.enchantMods || listing.item?.enchantMods || []
          };

          return (
            <div
              key={listing.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                background: isCopied ? 'rgba(34, 197, 94, 0.05)' : (isHideoutActive ? 'rgba(56, 189, 248, 0.06)' : 'rgba(255, 255, 255, 0.02)'),
                border: isCopied ? '1px solid rgba(34, 197, 94, 0.35)' : (isHideoutActive ? '1px solid rgba(56, 189, 248, 0.45)' : '1px solid rgba(255, 255, 255, 0.06)'),
                borderRadius: '8px',
                flexWrap: 'wrap',
                gap: '12px',
                transition: 'all 0.2s ease'
              }}
            >
              {/* Left: Price & Seller Info & Tooltip preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <ItemTooltip item={tooltipItem}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'rgba(200, 170, 110, 0.1)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid rgba(200, 170, 110, 0.3)',
                    cursor: 'help'
                  }}>
                    <img src={getImageUrl(currencyIcon)} alt="Currency" referrerPolicy="no-referrer" style={{ width: '20px', height: '20px' }} />
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-gold)' }}>
                      {listing.priceAmount} {listing.priceCurrency}
                    </span>
                  </div>
                </ItemTooltip>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    <User size={14} color="var(--text-muted)" />
                    <span style={{ fontWeight: 600 }}>{listing.accountName || listing.sellerAccount || '匿名賣家'}</span>
                    {(listing.characterName || listing.sellerIgn) && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                        (角色: <strong style={{ color: 'var(--text-gold)' }}>{listing.characterName || listing.sellerIgn}</strong>)
                      </span>
                    )}
                  </div>
                  {listing.age && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      刊登時間: {listing.age}
                    </span>
                  )}
                </div>
              </div>

              {/* Right: Whisper & Direct Hideout Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {/* Direct Travel to Hideout Button */}
                <button
                  type="button"
                  onClick={() => handleDirectTravelToHideout(listing)}
                  disabled={isLoadingHideout}
                  className="poe-btn"
                  style={{
                    fontSize: '0.82rem',
                    padding: '7px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: isHideoutActive
                      ? 'rgba(56, 189, 248, 0.2)'
                      : hasOfficialToken
                        ? 'rgba(56, 189, 248, 0.1)'
                        : 'rgba(200, 170, 110, 0.08)',
                    borderColor: isHideoutActive
                      ? 'rgba(56, 189, 248, 0.6)'
                      : hasOfficialToken
                        ? 'rgba(56, 189, 248, 0.4)'
                        : 'rgba(200, 170, 110, 0.25)',
                    color: isHideoutActive
                      ? '#38bdf8'
                      : hasOfficialToken
                        ? '#7dd3fc'
                        : 'var(--text-gold)',
                    fontWeight: 600
                  }}
                  title={
                    hasOfficialToken
                      ? '點擊自動向 GGG 官方發送直購前往請求（遊戲內即時觸發），並同時複製 /hideout 指令保底'
                      : '已複製 /hideout 指令。提示：於設定中登入 POESESSID，即可在查價時啟用官方遊戲內一鍵自動前往！'
                  }
                >
                  {isLoadingHideout ? (
                    <Loader2 className="animate-spin" size={14} color="#38bdf8" />
                  ) : isHideoutActive ? (
                    <Check size={14} color="#38bdf8" />
                  ) : hasOfficialToken ? (
                    <Zap size={14} color="#38bdf8" />
                  ) : (
                    <Home size={14} color="var(--text-gold)" />
                  )}
                  {isLoadingHideout ? '發送官方直購中...' : statusText}
                </button>

                {/* Whisper Action */}
                {listing.whisper ? (
                  <button
                    type="button"
                    onClick={() => onCopyWhisper(listing)}
                    className="poe-btn poe-btn-primary"
                    style={{
                      fontSize: '0.82rem',
                      padding: '7px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: isCopied ? 'rgba(34, 197, 94, 0.25)' : undefined,
                      borderColor: isCopied ? 'rgba(34, 197, 94, 0.6)' : undefined,
                      color: isCopied ? '#4ade80' : undefined
                    }}
                  >
                    {isCopied ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
                    {isCopied ? '已複製購買密語！' : '複製密語 (Whisper)'}
                  </button>
                ) : (
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <ShieldCheck size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                    即時拍賣場刊登
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMoreListings && onLoadMore && (
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <button
            type="button"
            className="poe-btn"
            onClick={onLoadMore}
            disabled={loadingMore}
            style={{
              padding: '8px 24px',
              fontSize: '0.85rem',
              color: 'var(--text-gold)',
              borderColor: 'rgba(200, 170, 110, 0.4)',
              background: 'rgba(200, 170, 110, 0.08)'
            }}
          >
            {loadingMore ? (
              <>
                <Loader2 className="animate-spin" size={14} style={{ display: 'inline', marginRight: '6px' }} />
                載入更多刊登資料中...
              </>
            ) : (
              <>
                <ChevronDown size={14} style={{ display: 'inline', marginRight: '4px' }} />
                載入更多刊登 (已載入 {tradeResults.listings.length} / {tradeResults.total} 筆)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default TradeListingView;

