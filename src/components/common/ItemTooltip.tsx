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
  properties?: { name: string; values: [string, number][]; displayMode?: number; type?: number }[];
  requirements?: { name: string; values: [string, number][]; displayMode?: number; type?: number }[];
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
      if (x + tooltipWidth > window.innerWidth) {
        x = Math.max(10, e.clientX - tooltipWidth - padding);
      }
      if (y + 400 > window.innerHeight) {
        y = Math.max(10, window.innerHeight - 420);
      }
      if (y < 10) y = 10;
    }
    setCoords({ x, y });
  };

  const hasContent = Boolean(
    item.name || item.typeLine || item.baseType ||
    (item.explicitMods && item.explicitMods.length > 0) ||
    (item.implicitMods && item.implicitMods.length > 0)
  );

  const theme = getRarityTheme(item.rarity);

  return (
    <div
      style={{ display: 'inline-flex', position: 'relative', alignItems: 'center' }}
      onMouseEnter={e => { updatePosition(e); setVisible(true); }}
      onMouseMove={updatePosition}
      onMouseLeave={() => setVisible(false)}
    >
      {children}

      {visible && hasContent && (
        <div
          style={{
            position: 'fixed',
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            width: '320px',
            maxHeight: 'calc(100vh - 30px)',
            overflowY: 'auto',
            backgroundColor: 'rgba(10, 10, 14, 0.98)',
            border: `1px solid ${theme.borderColor}`,
            borderRadius: '4px',
            boxShadow: `0 8px 24px rgba(0, 0, 0, 0.9), 0 0 12px ${theme.glowColor}`,
            zIndex: 99999,
            pointerEvents: 'none',
          }}
        >
          <TooltipContent item={item} theme={theme} />
        </div>
      )}
    </div>
  );
};
