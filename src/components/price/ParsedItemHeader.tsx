import React from 'react';
import type { ParsedItem } from '../../types/poe';
import { getImageUrl } from '../../utils/image';

interface ParsedItemHeaderProps {
  parsedItem: ParsedItem;
  itemIconUrl?: string;
}

const FALLBACK_SVG_ICON = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="%23c8aa6e" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;

function getFallbackCategoryIcon(baseType?: string, itemClass?: string): string {
  const target = `${baseType || ''} ${itemClass || ''}`;
  if (/頭盔|頭部|冠|邪冠|Circlet|Burgonet|Pelt|Helmet|Bascinet|Crown|Diadem|Hood|Mask|Coif|Hat|Helm|Cap/i.test(target)) return '/images/hubris_circlet.png';
  if (/盾牌|盾|Shield/i.test(target)) return '/images/titanium_spirit_shield.png';
  if (/胸甲|法衣|鎧甲|皮甲|長袍|Body Armour|Regalia|Plate|Chest|Vestment|Robe/i.test(target)) return '/images/vaal_regalia.png';
  if (/手套|Gauntlets|Gloves|Mitts/i.test(target)) return '/images/fingerless_silk_gloves.png';
  if (/靴子|長靴|鞋|Boots|Greaves|Shoes|Slippers/i.test(target)) return '/images/two_tone_boots.png';
  if (/項鍊|首飾|Amulet/i.test(target)) return '/images/onyx_amulet.png';
  if (/腰帶|束帶|Belt/i.test(target)) return '/images/leather_belt.png';
  if (/珠寶|Cobalt|Crimson|Viridian|Prismatic|Jewel/i.test(target)) return '/images/cobalt_jewel.png';
  if (/戒指|指環|Ring/i.test(target)) return '/images/two_stone_ring.png';
  if (/武器|劍|斧|弓|法杖|匕首|爪|杖|Sword|Axe|Bow|Wand|Dagger|Claw|Staff|Sceptre|Weapon/i.test(target)) return '/images/vaal_axe.png';
  if (/藥劑|藥水|Flask/i.test(target)) return '/images/flask.png';
  if (/寶石|Gem/i.test(target)) return '/images/gem.png';
  return '/images/contract.png';
}

export const ParsedItemHeader: React.FC<ParsedItemHeaderProps> = ({ parsedItem, itemIconUrl }) => {
  const resolvedIcon = itemIconUrl ? getImageUrl(itemIconUrl) : getFallbackCategoryIcon(parsedItem.baseType, parsedItem.itemClass);

  return (
    <div style={{
      borderBottom: '1px solid rgba(200, 170, 110, 0.2)',
      paddingBottom: '14px',
      marginBottom: '16px',
      textAlign: 'center'
    }}>
      <span className={`rarity-${parsedItem.rarity || 'Rare'}`} style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
        {parsedItem.rarity} {parsedItem.itemClass || ''}
      </span>
      <h2 className={`poe-font rarity-${parsedItem.rarity || 'Rare'}`} style={{ fontSize: '1.25rem', margin: '4px 0 2px 0' }}>
        {parsedItem.name}
      </h2>
      {parsedItem.baseType && parsedItem.baseType !== parsedItem.name && (
        <div style={{ fontSize: '0.9rem', color: 'var(--text-gold)', fontWeight: 600 }}>
          基底: {parsedItem.baseType}
        </div>
      )}

      {/* Icon */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '12px 0 6px 0' }}>
        <div style={{
          width: '60px',
          height: '60px',
          background: '#090c10',
          border: '1px solid var(--border-gold)',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 12px rgba(200, 170, 110, 0.2)'
        }}>
          <img
            src={resolvedIcon}
            alt={parsedItem.baseType || parsedItem.name}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src !== FALLBACK_SVG_ICON) {
                img.onerror = null;
                img.src = FALLBACK_SVG_ICON;
              }
            }}
            style={{ maxWidth: '52px', maxHeight: '52px', objectFit: 'contain' }}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '8px', fontSize: '0.8rem' }}>
        {parsedItem.itemLevel && (
          <span style={{ background: '#172030', padding: '2px 8px', borderRadius: '4px', border: '1px solid #2a364f' }}>
            物品等級: iLvl {parsedItem.itemLevel}
          </span>
        )}
        {parsedItem.quality && (
          <span style={{ background: '#172030', padding: '2px 8px', borderRadius: '4px', border: '1px solid #2a364f', color: 'var(--accent-blue)' }}>
            品質: +{parsedItem.quality}%
          </span>
        )}
      </div>
    </div>
  );
};

export default ParsedItemHeader;
