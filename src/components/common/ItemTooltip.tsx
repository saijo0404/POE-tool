import React from 'react';

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
  const [visible, setVisible] = React.useState(false);
  const [coords, setCoords] = React.useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    updatePosition(e);
    setVisible(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    updatePosition(e);
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  const updatePosition = (e: React.MouseEvent) => {
    // Tooltip position offset near cursor, keeping within viewport boundaries
    const padding = 15;
    const tooltipWidth = 320;
    let x = e.clientX + padding;
    let y = e.clientY + padding;

    if (typeof window !== 'undefined') {
      if (x + tooltipWidth > window.innerWidth) {
        x = Math.max(10, e.clientX - tooltipWidth - padding);
      }
      if (y + 350 > window.innerHeight) {
        y = Math.max(10, window.innerHeight - 360);
      }
    }

    setCoords({ x, y });
  };

  const getRarityTheme = (r?: string) => {
    const rarity = (r || 'Rare').toLowerCase();
    if (rarity.includes('unique') || rarity.includes('傳奇')) {
      return {
        borderColor: '#af6025',
        titleColor: '#af6025',
        headerBg: 'linear-gradient(180deg, rgba(60, 25, 5, 0.95) 0%, rgba(30, 12, 3, 0.9) 100%)',
        glowColor: 'rgba(175, 96, 37, 0.3)'
      };
    }
    if (rarity.includes('magic') || rarity.includes('魔法')) {
      return {
        borderColor: '#6b7fff',
        titleColor: '#8888ff',
        headerBg: 'linear-gradient(180deg, rgba(15, 20, 60, 0.95) 0%, rgba(8, 10, 30, 0.9) 100%)',
        glowColor: 'rgba(107, 127, 255, 0.25)'
      };
    }
    if (rarity.includes('currency') || rarity.includes('通貨')) {
      return {
        borderColor: '#aa9e82',
        titleColor: '#aa9e82',
        headerBg: 'linear-gradient(180deg, rgba(40, 35, 30, 0.95) 0%, rgba(20, 18, 15, 0.9) 100%)',
        glowColor: 'rgba(170, 158, 130, 0.2)'
      };
    }
    if (rarity.includes('gem') || rarity.includes('寶石')) {
      return {
        borderColor: '#1ba29b',
        titleColor: '#1ba29b',
        headerBg: 'linear-gradient(180deg, rgba(10, 45, 42, 0.95) 0%, rgba(5, 25, 22, 0.9) 100%)',
        glowColor: 'rgba(27, 162, 155, 0.25)'
      };
    }
    // Default Rare
    return {
      borderColor: '#c8aa6e',
      titleColor: '#f5cc00',
      headerBg: 'linear-gradient(180deg, rgba(50, 42, 18, 0.95) 0%, rgba(25, 21, 9, 0.9) 100%)',
      glowColor: 'rgba(200, 170, 110, 0.3)'
    };
  };

  const theme = getRarityTheme(item.rarity);
  const displayName = item.name || item.typeLine || item.baseType || '物品';
  const displayBase = (item.name && item.baseType && item.name !== item.baseType) ? item.baseType : (item.typeLine !== item.name ? item.typeLine : '');

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ display: 'inline-block' }}
    >
      {children}

      {visible && (
        <div
          style={{
            position: 'fixed',
            left: `${coords.x}px`,
            top: `${coords.y}px`,
            width: '320px',
            backgroundColor: 'rgba(8, 10, 15, 0.97)',
            border: `1px solid ${theme.borderColor}`,
            boxShadow: `0 8px 30px rgba(0, 0, 0, 0.9), 0 0 15px ${theme.glowColor}`,
            borderRadius: '4px',
            zIndex: 99999,
            pointerEvents: 'none',
            fontFamily: "'Fontin', 'Cinzel', 'Noto Sans TC', sans-serif",
            fontSize: '0.82rem',
            lineHeight: 1.4,
            overflow: 'hidden',
            backdropFilter: 'blur(4px)'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: theme.headerBg,
              padding: '8px 12px',
              textAlign: 'center',
              borderBottom: `1px solid ${theme.borderColor}`
            }}
          >
            <div style={{ color: theme.titleColor, fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.5px' }}>
              {displayName}
            </div>
            {displayBase && (
              <div style={{ color: theme.titleColor, fontSize: '0.82rem', opacity: 0.9, marginTop: '2px' }}>
                {displayBase}
              </div>
            )}
          </div>

          {/* Body Content */}
          <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Meta Stats: Item Level, Quality, Sockets */}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#7e8a9b', fontSize: '0.76rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
              {item.ilvl !== undefined && item.ilvl > 0 ? (
                <span>物品等級: <strong style={{ color: '#fff' }}>{item.ilvl}</strong></span>
              ) : <span />}
              {item.quality !== undefined && item.quality > 0 ? (
                <span>品質: <strong style={{ color: '#38bdf8' }}>+{item.quality}%</strong></span>
              ) : null}
              {item.sockets ? (
                <span>插槽: <strong style={{ color: '#f5cc00' }}>{item.sockets}</strong></span>
              ) : null}
            </div>

            {/* Enchant Mods */}
            {item.enchantMods && item.enchantMods.length > 0 && (
              <div style={{ color: '#9bc4e2', fontSize: '0.8rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
                {item.enchantMods.map((mod, i) => (
                  <div key={`ench-${i}`}>{mod}</div>
                ))}
              </div>
            )}

            {/* Implicit Mods */}
            {item.implicitMods && item.implicitMods.length > 0 && (
              <div style={{ color: '#8888ff', fontSize: '0.82rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
                {item.implicitMods.map((mod, i) => (
                  <div key={`imp-${i}`}>{mod}</div>
                ))}
              </div>
            )}

            {/* Fractured Mods */}
            {item.fracturedMods && item.fracturedMods.length > 0 && (
              <div style={{ color: '#dfa85b', fontSize: '0.82rem' }}>
                {item.fracturedMods.map((mod, i) => (
                  <div key={`frac-${i}`}>{mod} <span style={{ fontSize: '0.7rem', opacity: 0.7 }}>(破裂)</span></div>
                ))}
              </div>
            )}

            {/* Explicit Mods */}
            {item.explicitMods && item.explicitMods.length > 0 && (
              <div style={{ color: '#b2c2d4', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {item.explicitMods.map((mod, i) => (
                  <div key={`exp-${i}`}>{mod}</div>
                ))}
              </div>
            )}

            {/* Crafted Mods */}
            {item.craftedMods && item.craftedMods.length > 0 && (
              <div style={{ color: '#76d7c4', fontSize: '0.82rem', fontStyle: 'italic' }}>
                {item.craftedMods.map((mod, i) => (
                  <div key={`craf-${i}`}>{mod} <span style={{ fontSize: '0.7rem' }}>(工藝)</span></div>
                ))}
              </div>
            )}

            {/* Corrupted Banner */}
            {item.corrupted && (
              <div style={{ color: '#ef4444', fontWeight: 'bold', textAlign: 'center', fontSize: '0.82rem', marginTop: '4px' }}>
                已汙染 (Corrupted)
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemTooltip;
