import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ParsedItemHeader } from './ParsedItemHeader';
import type { ParsedItem } from '../../types/poe';

describe('ParsedItemHeader Component', () => {
  it('renders item name, rarity, baseType and fallback category icon for Helmets', () => {
    const mockItem: ParsedItem = {
      name: 'Doom Crown',
      baseType: 'Hubris Circlet',
      rarity: 'Rare',
      itemClass: 'Helmets',
      itemLevel: 86,
      quality: 20,
      language: 'en',
      rawText: '',
      implicits: [],
      explicits: [],
    };

    render(<ParsedItemHeader parsedItem={mockItem} />);

    expect(screen.getByText(/RARE Helmets/i)).toBeInTheDocument();
    expect(screen.getByText('Doom Crown')).toBeInTheDocument();
    expect(screen.getByText('基底: Hubris Circlet')).toBeInTheDocument();
    expect(screen.getByText('物品等級: iLvl 86')).toBeInTheDocument();
    expect(screen.getByText('品質: +20%')).toBeInTheDocument();

    const img = screen.getByAltText('Hubris Circlet') as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('/images/hubris_circlet.png');
  });

  it('hides baseType line when name is identical to baseType', () => {
    const mockUnique: ParsedItem = {
      name: 'Mageblood',
      baseType: 'Heavy Belt',
      rarity: 'Unique',
      language: 'en',
      rawText: '',
      implicits: [],
      explicits: [],
    };

    const { rerender } = render(<ParsedItemHeader parsedItem={mockUnique} />);
    expect(screen.getByText('基底: Heavy Belt')).toBeInTheDocument();

    const mockCurrency: ParsedItem = {
      name: 'Chaos Orb',
      baseType: 'Chaos Orb',
      rarity: 'Currency',
      language: 'en',
      rawText: '',
      implicits: [],
      explicits: [],
    };

    rerender(<ParsedItemHeader parsedItem={mockCurrency} />);
    expect(screen.queryByText(/基底:/i)).toBeNull();
  });

  it('uses itemIconUrl when provided and triggers onError fallback to SVG icon', () => {
    const mockItem: ParsedItem = {
      name: 'Custom Shield',
      baseType: 'Titanium Spirit Shield',
      rarity: 'Rare',
      language: 'en',
      rawText: '',
      implicits: [],
      explicits: [],
    };

    render(<ParsedItemHeader parsedItem={mockItem} itemIconUrl="https://example.com/shield.png" />);

    const img = screen.getByAltText('Titanium Spirit Shield') as HTMLImageElement;
    expect(img.src).toBe('https://example.com/shield.png');

    // Simulate image loading failure
    fireEvent.error(img);
    expect(img.src).toContain('data:image/svg+xml;utf8');
  });

  it('correctly maps various category fallback icons', () => {
    const testCategories: Array<{ baseType: string; itemClass: string; expectedImg: string }> = [
      { baseType: 'Vaal Regalia', itemClass: 'Body Armours', expectedImg: '/images/vaal_regalia.png' },
      { baseType: 'Fingerless Silk Gloves', itemClass: 'Gloves', expectedImg: '/images/fingerless_silk_gloves.png' },
      { baseType: 'Two-Tone Boots', itemClass: 'Boots', expectedImg: '/images/two_tone_boots.png' },
      { baseType: 'Onyx Amulet', itemClass: 'Amulets', expectedImg: '/images/onyx_amulet.png' },
      { baseType: 'Leather Belt', itemClass: 'Belts', expectedImg: '/images/leather_belt.png' },
      { baseType: 'Cobalt Jewel', itemClass: 'Jewels', expectedImg: '/images/cobalt_jewel.png' },
      { baseType: 'Two-Stone Ring', itemClass: 'Rings', expectedImg: '/images/two_stone_ring.png' },
      { baseType: 'Vaal Axe', itemClass: 'Two Hand Axes', expectedImg: '/images/vaal_axe.png' },
      { baseType: 'Diamond Flask', itemClass: 'Utility Flasks', expectedImg: '/images/flask.png' },
      { baseType: 'Empower Support', itemClass: 'Support Skill Gems', expectedImg: '/images/gem.png' },
      { baseType: 'Unknown Item', itemClass: 'Misc', expectedImg: '/images/contract.png' },
    ];

    testCategories.forEach(({ baseType, itemClass, expectedImg }) => {
      const { unmount } = render(
        <ParsedItemHeader
          parsedItem={{
            name: baseType,
            baseType,
            itemClass,
            rarity: 'Rare',
            language: 'en',
            rawText: '',
            implicits: [],
            explicits: [],
          }}
        />
      );

      const img = screen.getByAltText(baseType) as HTMLImageElement;
      expect(img.src).toContain(expectedImg);
      unmount();
    });
  });

  it('renders PoE 2 attributes when present on parsedItem', () => {
    const poe2Item: ParsedItem = {
      name: 'Doom Shell',
      baseType: 'Golden Plate',
      rarity: 'Rare',
      language: 'en',
      engine: 'poe2',
      spirit: 60,
      waystoneTier: 14,
      uncutTier: 19,
      runeSockets: 'S S',
      rawText: '',
      implicits: [],
      explicits: []
    };

    render(<ParsedItemHeader parsedItem={poe2Item} />);
    expect(screen.getByText('PoE 2')).toBeInTheDocument();
    expect(screen.getByText('精魂: 60')).toBeInTheDocument();
    expect(screen.getByText('銘刻地圖: Tier 14')).toBeInTheDocument();
    expect(screen.getByText('寶石階級: Tier 19')).toBeInTheDocument();
    expect(screen.getByText('符文插槽: S S')).toBeInTheDocument();
  });
});
