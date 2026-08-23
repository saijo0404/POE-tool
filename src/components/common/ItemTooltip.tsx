import React, { useState } from 'react';
import { getRarityTheme } from './tooltipThemes';
import { TooltipContent } from './TooltipContent';

export interface TooltipItemData {
  name?: string;
  typeLine?: string;
  baseType?: string;
  rarity?: string;
  itemClass?: string;
  ilvl?: number;
  quality?: number;
  corrupted?: boolean;
  sockets?: string;
  implicitMods?: string[];
  explicitMods?: string[];
  craftedMods?: string[];
  fracturedMods?: string[];
  enchantMods?: string[];
  flavourText?: string[];
  properties?: { name: string; values: [string, number][] }[];
  requirements?: { name: string; values: [string, number][] }[];
}

interface ItemTooltipProps {
  item: TooltipItemData;
  children: React.ReactNode;
}

export const ItemTooltip: React.FC<ItemTooltipProps> = ({ item, children }) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const updatePosition = (e: React.MouseEvent) => {
    const padding = 15;
    const tooltipWidth = 320;
    let x = e.clientX + padding;
    let y = e.clientY + padding;

    if (typeof window !== 'undefined') {
      if (x + tooltipWidth > window.innerWidth) x = Math.max(10, e.clientX - tooltipWidth - padding);
      if (y + 350 > window.innerHeight) y = Math.max(10, window.innerHeight - 360);
    }
    setCoords({ x, y });
  };

  const theme = getRarityTheme(item.rarity);

  return (
    <div
      style={{ display: 'inline-block', position: 'relative' }}
      onMouseEnter={e => { updatePosition(e); setVisible(true); }}
      onMouseMove={updatePosition}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible && (
        <div
          style={{
            position: 'fixed',
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            width: '320px',
            backgroundColor: 'rgba(10, 10, 14, 0.98)',
            border: `1px solid ${theme.borderColor}`,
            borderRadius: '4px',
            boxShadow: `0 8px 24px rgba(0, 0, 0, 0.9), 0 0 12px ${theme.glowColor}`,
            zIndex: 99999,
            pointerEvents: 'none',
            overflow: 'hidden',
          }}
        >
          <TooltipContent item={item} theme={theme} />
        </div>
      )}
    </div>
  );
};
