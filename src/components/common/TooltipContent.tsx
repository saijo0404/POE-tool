import React from 'react';
import type { TooltipItemData } from './ItemTooltip';
import type { TooltipTheme } from './tooltipThemes';

interface TooltipContentProps {
  item: TooltipItemData;
  theme: TooltipTheme;
}

export const TooltipContent: React.FC<TooltipContentProps> = ({ item, theme }) => {
  const hasName = Boolean(item.name && item.name.trim());
  const hasType = Boolean(item.typeLine && item.typeLine.trim());

  return (
    <>
      <div style={{ padding: '8px 12px', background: theme.headerBg, borderBottom: `1px solid ${theme.borderColor}`, textAlign: 'center' }}>
        {hasName && (
          <div style={{ color: theme.titleColor, fontWeight: 'bold', fontSize: '0.95rem', letterSpacing: '0.5px' }}>
            {item.name}
          </div>
        )}
        {hasType && (
          <div style={{ color: hasName ? 'var(--text-bright)' : theme.titleColor, fontSize: '0.9rem', fontWeight: hasName ? 'normal' : 'bold' }}>
            {item.typeLine}
          </div>
        )}
      </div>

      <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
        {item.itemClass && <div style={{ color: 'var(--text-muted)' }}>物品類別: <span style={{ color: 'var(--text-bright)' }}>{item.itemClass}</span></div>}
        {item.ilvl && item.ilvl > 0 && <div style={{ color: 'var(--text-muted)' }}>物品等級: <span style={{ color: 'var(--text-bright)' }}>{item.ilvl}</span></div>}
        {item.quality !== undefined && item.quality > 0 && (
          <div style={{ color: '#8888ff' }}>
            品質: <span style={{ color: '#8888ff' }}>+{item.quality}%</span>
          </div>
        )}
        {item.sockets && (
          <div style={{ color: 'var(--text-muted)' }}>
            插槽: <span style={{ color: 'var(--text-bright)' }}>{item.sockets}</span>
          </div>
        )}

        {item.requirements && item.requirements.length > 0 && (
          <div style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
            需求: {item.requirements.map((r, idx) => (
              <span key={idx} style={{ marginRight: '8px' }}>
                {r.name}: <span style={{ color: 'var(--text-bright)' }}>{r.values.map(v => v[0]).join(', ')}</span>
              </span>
            ))}
          </div>
        )}

        {item.properties && item.properties.length > 0 && (
          <div style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
            {item.properties
              .filter(p => {
                // If quality is already shown at top, skip Quality in properties
                if (item.quality !== undefined && item.quality > 0 && (p.name.toLowerCase() === 'quality' || p.name.includes('品質'))) {
                  return false;
                }
                return true;
              })
              .map((p, idx) => {
                if (p.values && p.values.length > 0) {
                  let renderedText = p.name;
                  if (p.name.includes('%0') || p.displayMode === 3) {
                    p.values.forEach((v, i) => {
                      renderedText = renderedText.replace(`%${i}`, v[0]);
                    });
                    return <div key={idx} style={{ color: 'var(--text-muted)' }}>{renderedText}</div>;
                  }
                  return (
                    <div key={idx} style={{ color: 'var(--text-muted)' }}>
                      {p.name}: <span style={{ color: 'var(--text-bright)' }}>{p.values.map(v => v[0]).join(', ')}</span>
                    </div>
                  );
                }
                return <div key={idx} style={{ color: 'var(--text-muted)' }}>{p.name}</div>;
              })}
          </div>
        )}

        {item.enchantMods && item.enchantMods.length > 0 && (
          <div style={{ color: '#b8d0ff', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
            {item.enchantMods.map((m, idx) => <div key={idx}>{m} (附魔)</div>)}
          </div>
        )}

        {item.implicitMods && item.implicitMods.length > 0 && (
          <div style={{ color: '#8888ff', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '6px' }}>
            {item.implicitMods.map((m, idx) => <div key={idx}>{m}</div>)}
          </div>
        )}

        {item.fracturedMods && item.fracturedMods.length > 0 && (
          <div style={{ color: '#caa560', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {item.fracturedMods.map((m, idx) => <div key={idx}>{m} (已分裂)</div>)}
          </div>
        )}

        {item.explicitMods && item.explicitMods.length > 0 && (
          <div style={{ color: '#8888ff', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {item.explicitMods.map((m, idx) => <div key={idx}>{m}</div>)}
          </div>
        )}

        {item.craftedMods && item.craftedMods.length > 0 && (
          <div style={{ color: '#a8d8ff' }}>
            {item.craftedMods.map((m, idx) => <div key={idx}>{m} (工藝)</div>)}
          </div>
        )}

        {item.flavourText && item.flavourText.length > 0 && (
          <div style={{ color: '#af6025', fontStyle: 'italic', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '6px', fontSize: '0.78rem' }}>
            {item.flavourText.map((t, idx) => <div key={idx}>{t}</div>)}
          </div>
        )}

        {item.corrupted && (
          <div style={{ color: '#ef4444', fontWeight: 'bold', textAlign: 'center', marginTop: '4px' }}>
            已汙染 (Corrupted)
          </div>
        )}
      </div>
    </>
  );
};
