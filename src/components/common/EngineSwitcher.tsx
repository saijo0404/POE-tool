import React from 'react';
import { useGameEngine } from '../../hooks/useGameEngine';
import { Gamepad2, Radio } from 'lucide-react';

export const EngineSwitcher: React.FC = () => {
  const {
    currentEngine,
    mode,
    detectedProcess,
    setEngine,
    setMode
  } = useGameEngine();

  const isPoe2 = currentEngine === 'poe2';
  const targetEngine = isPoe2 ? 'poe1' : 'poe2';
  const targetName = isPoe2 ? 'PoE 1' : 'PoE 2';

  const handleToggleEngine = () => {
    setEngine(targetEngine);
    setMode('manual');
  };

  const handleToggleMode = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMode(mode === 'auto' ? 'manual' : 'auto');
  };

  const tooltipText = mode === 'auto'
    ? `當前模式: 自動偵測${detectedProcess ? ` (偵測到進程: ${detectedProcess})` : ' (等待遊戲視窗)'}`
    : `當前模式: 手動鎖定 (${isPoe2 ? 'PoE 2' : 'PoE 1'})`;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        background: 'rgba(15, 23, 42, 0.7)',
        border: isPoe2 ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(200, 170, 110, 0.3)',
        borderRadius: '6px',
        padding: '3px 6px',
        fontSize: '0.78rem'
      }}
      title={tooltipText}
    >
      <button
        type="button"
        onClick={handleToggleEngine}
        aria-label={`切換至 ${targetName}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          background: 'none',
          border: 'none',
          color: isPoe2 ? '#38bdf8' : 'var(--text-gold)',
          fontWeight: 700,
          cursor: 'pointer',
          padding: '2px 4px',
          borderRadius: '4px'
        }}
      >
        <Gamepad2 size={14} />
        <span>{isPoe2 ? 'PoE 2' : 'PoE 1'}</span>
      </button>

      <button
        type="button"
        onClick={handleToggleMode}
        aria-label="切換偵測模式"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '3px',
          background: mode === 'auto' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(148, 163, 184, 0.15)',
          border: `1px solid ${mode === 'auto' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(148, 163, 184, 0.3)'}`,
          color: mode === 'auto' ? '#4ade80' : '#94a3b8',
          fontSize: '0.68rem',
          borderRadius: '4px',
          padding: '1px 5px',
          cursor: 'pointer'
        }}
      >
        <Radio size={10} />
        <span>{mode === 'auto' ? '自動' : '手動'}</span>
      </button>
    </div>
  );
};
