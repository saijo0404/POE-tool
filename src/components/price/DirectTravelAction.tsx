import React, { useState } from 'react';
import { Home, Loader2, Zap } from 'lucide-react';
import type { TradeListing, TravelToHideoutResult } from '../../types/poe';
import { poeApi } from '../../services/api';

interface DirectTravelActionProps {
  listing: TradeListing;
  league?: string;
  searchId?: string;
  onShowToast?: (msg: string) => void;
}

export const DirectTravelAction: React.FC<DirectTravelActionProps> = ({
  listing,
  league,
  searchId,
  onShowToast
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [statusText, setStatusText] = useState<string | null>(null);

  const handleTravel = async () => {
    const targetName = listing.characterName || listing.sellerIgn || listing.accountName || listing.sellerAccount;
    if (!targetName) return;

    const hideoutCmd = `/hideout ${targetName}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try { await navigator.clipboard.writeText(hideoutCmd); } catch {}
    }

    setLoading(true);
    try {
      const res = await Promise.race([
        poeApi.travelToHideout({
          token: listing.whisperToken,
          characterName: targetName,
          league,
          searchId,
          itemId: listing.id
        }),
        new Promise<TravelToHideoutResult>((_, reject) => setTimeout(() => reject(new Error('連線逾時')), 4500))
      ]);

      if (res && res.gameTriggered && res.officialWhisperSent) {
        setStatusText('⚡ 已在遊戲中前往！');
        onShowToast?.(`⚡ 官方直購已發送，並已在遊戲中執行 ${hideoutCmd} 前往藏身處！`);
      } else if (res && res.gameTriggered) {
        setStatusText('⚡ 已在遊戲中前往！');
        onShowToast?.(`⚡ 已在遊戲中自動執行 ${hideoutCmd} 前往藏身處！`);
      } else if (res && res.officialWhisperSent) {
        setStatusText('⚡ 官方直購已發送！');
        onShowToast?.(`⚡ 官方直購連動成功！已發送前往請求，並已複製 ${hideoutCmd}`);
      } else {
        const msg = res?.message || `已複製 ${hideoutCmd}`;
        setStatusText(`已複製 ${hideoutCmd}`);
        onShowToast?.(
          listing.whisperToken
            ? `⚠️ 官方連動提示：${msg}（已複製 ${hideoutCmd}，可於遊戲內 Enter+Ctrl+V 傳送）`
            : `ℹ️ 已複製 ${hideoutCmd}！（提示：請於右上角設定登入 POESESSID，即可啟用官方遊戲內一鍵自動前往）`
        );
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : '連線逾時';
      setStatusText(`已複製 ${hideoutCmd}`);
      onShowToast?.(`⚠️ 官方直購連動提示：${errMsg}（已複製 ${hideoutCmd}，可於遊戲內 Enter+Ctrl+V 傳送）`);
    } finally {
      setLoading(false);
      setTimeout(() => setStatusText(null), 3000);
    }
  };

  const isInstant = Boolean(listing.whisperToken || listing.isInstant || listing.isInstantBuyout);

  return (
    <button
      onClick={handleTravel}
      disabled={loading}
      className={isInstant ? 'poe-button' : 'poe-button-secondary'}
      style={{
        padding: '5px 12px',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        borderRadius: '4px',
        fontWeight: isInstant ? 600 : 500,
        background: isInstant ? 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)' : undefined,
        color: isInstant ? '#000' : undefined,
        boxShadow: isInstant ? '0 0 10px rgba(234, 179, 8, 0.4)' : undefined,
        border: 'none',
        cursor: 'pointer'
      }}
      title={isInstant ? '⚡ 官方直購（Instant Buyout）一鍵前往藏身處' : '複製 /hideout 前往藏身處'}
    >
      {loading ? (
        <Loader2 size={13} className="spin" />
      ) : isInstant ? (
        <Zap size={13} fill="#000" />
      ) : (
        <Home size={13} />
      )}
      {statusText || (isInstant ? '⚡ 前往藏身處 (Travel to Hideout)' : '前往藏身處 (/hideout)')}
    </button>
  );
};
