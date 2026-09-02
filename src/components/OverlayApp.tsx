import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { useOverlayPrice } from '../hooks/useOverlayPrice';
import { OverlayHeader } from './overlay/OverlayHeader';
import { OverlayPriceSummary } from './overlay/OverlayPriceSummary';
import { OverlayModList } from './overlay/OverlayModList';
import { OverlayQuickListings } from './overlay/OverlayQuickListings';
import { OverlayControlsBar } from './overlay/OverlayControlsBar';

export const OverlayApp: React.FC = () => {
  const {
    parsedItem, mods, tradeResults, searching, copiedId,
    pinned, setPinned, opacity, setOpacity, scale, setScale,
    clickThrough, handleToggleClickThrough, dangerEvaluation,
    handleCloseOverlay, handleSearchTrade, toggleMod,
    handleCopyWhisper, handleTravelToHideout, handleOpenOfficialTrade
  } = useOverlayPrice();

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      padding: '4px',
      boxSizing: 'border-box',
      background: 'transparent',
      overflow: 'hidden'
    }}>
      <div
        style={{
          width: '100%',
          maxWidth: '450px',
          background: `rgba(18, 22, 28, ${opacity})`,
          backdropFilter: 'blur(12px)',
          borderRadius: '8px',
          border: '1px solid rgba(200, 170, 110, 0.45)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 10px rgba(200, 170, 110, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          transition: 'transform 0.1s ease, opacity 0.1s ease'
        }}
      >
        {parsedItem ? (
          <>
            <OverlayHeader
              parsedItem={parsedItem}
              itemIconUrl={tradeResults?.listings?.[0]?.item?.icon}
              isPinned={pinned}
              onTogglePin={() => setPinned(!pinned)}
              onClose={handleCloseOverlay}
              onOpenOfficialTrade={handleOpenOfficialTrade}
            />

            {dangerEvaluation?.hasDanger && (
              <div style={{
                background: 'rgba(229, 80, 57, 0.28)',
                borderBottom: '1px solid rgba(229, 80, 57, 0.6)',
                padding: '6px 10px',
                color: '#ff7675',
                fontSize: '0.78rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <AlertOctagon size={16} color="#ff7675" />
                <span>⚠️ 警告：此地圖包含 {dangerEvaluation.matchedDangerMods.length + dangerEvaluation.matchedCustomKeywords.length} 個流派致命詞綴！</span>
              </div>
            )}

            <OverlayPriceSummary
              tradeResults={tradeResults}
              searching={searching}
              onRefreshSearch={handleSearchTrade}
            />

            <OverlayModList
              mods={mods}
              onToggleMod={toggleMod}
              dangerEvaluation={dangerEvaluation}
            />

            <OverlayQuickListings
              listings={tradeResults?.listings ?? []}
              copiedId={copiedId}
              onCopyWhisper={handleCopyWhisper}
              onTravelToHideout={handleTravelToHideout}
            />
          </>
        ) : (
          <div style={{
            padding: '24px 16px',
            textAlign: 'center',
            color: 'var(--text-gold)',
            fontSize: '0.85rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{ fontWeight: 'bold' }}>🎮 POE Tool 懸浮查價視窗已就緒</div>
            <div style={{ color: '#8c94a4', fontSize: '0.78rem' }}>
              在遊戲中將滑鼠移至裝備上方並按下複製鍵即可即時查價
            </div>
          </div>
        )}

        <OverlayControlsBar
          opacity={opacity}
          scale={scale}
          clickThrough={clickThrough}
          onChangeOpacity={setOpacity}
          onChangeScale={setScale}
          onToggleClickThrough={handleToggleClickThrough}
        />
      </div>
    </div>
  );
};

export default OverlayApp;
