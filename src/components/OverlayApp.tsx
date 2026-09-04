import React from 'react';
import { AlertOctagon } from 'lucide-react';
import { useOverlayPrice } from '../hooks/useOverlayPrice';
import { OverlayHeader } from './overlay/OverlayHeader';
import { OverlayPriceSummary } from './overlay/OverlayPriceSummary';
import { OverlayModList } from './overlay/OverlayModList';
import { OverlayQuickListings } from './overlay/OverlayQuickListings';
import { OverlayControlsBar } from './overlay/OverlayControlsBar';
import { useTradeWhisper } from '../hooks/useTradeWhisper';
import { TradeWhisperCard } from './whisper/TradeWhisperCard';

export const OverlayApp: React.FC = () => {
  const {
    parsedItem, mods, tradeResults, searching, copiedId,
    pinned, setPinned, opacity, setOpacity, scale, setScale,
    clickThrough, handleToggleClickThrough, dangerEvaluation,
    handleCloseOverlay, handleSearchTrade, toggleMod,
    handleCopyWhisper, handleTravelToHideout, handleOpenOfficialTrade
  } = useOverlayPrice();

  const {
    whispers,
    activeWhisper,
    setActiveWhisperId,
    handleAction: handleWhisperAction,
    handleSendTemplate: handleWhisperTemplate,
    config: whisperConfig,
    dismissWhisper
  } = useTradeWhisper();

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
        {/* Trade Whisper Floating Assistant Section */}
        {whispers.length > 0 && activeWhisper && (
          <div style={{ padding: '8px 8px 0 8px' }}>
            {whispers.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.72rem', color: '#c8aa6e' }}>
                <span>💬 待處理密語 ({whispers.findIndex(w => w.id === activeWhisper.id) + 1}/{whispers.length})</span>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {whispers.map((w, idx) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => setActiveWhisperId(w.id)}
                      style={{
                        padding: '1px 5px',
                        borderRadius: '3px',
                        border: '1px solid rgba(200, 170, 110, 0.4)',
                        background: w.id === activeWhisper.id ? 'rgba(200, 170, 110, 0.3)' : 'transparent',
                        color: w.id === activeWhisper.id ? '#f3d179' : '#8c94a4',
                        cursor: 'pointer',
                        fontSize: '0.68rem'
                      }}
                    >
                      #{idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <TradeWhisperCard
              whisper={activeWhisper}
              templates={whisperConfig.customTemplates}
              onAction={handleWhisperAction}
              onSendTemplate={handleWhisperTemplate}
              onDismiss={dismissWhisper}
            />
          </div>
        )}

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
        ) : whispers.length === 0 ? (
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
        ) : null}

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
