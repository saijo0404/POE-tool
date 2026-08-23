import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemTooltip } from '../common/ItemTooltip';

describe('ItemTooltip Component', () => {
  it('renders item name, typeLine, and rarity classes properly when hovered', () => {
    const mockItem = {
      name: 'Doom Sanctuary',
      typeLine: 'Hubris Circlet',
      baseType: 'Hubris Circlet',
      rarity: 'Rare',
      itemClass: 'Helmets',
      corrupted: true,
      ilvl: 85,
      quality: 20,
      sockets: 'B-B-B-B',
      requirements: [{ name: '等級', values: [['68', 0]] as [string, number][] }, { name: '智慧', values: [['154', 0]] as [string, number][] }],
      properties: [{ name: '能量護盾', values: [['350', 0]] as [string, number][] }],
      enchantMods: ['+15% to Chaos Resistance while affected by Purity of Elements'],
      implicitMods: ['+25 to maximum Mana'],
      explicitMods: ['+105 to maximum Life', '+45% to Fire Resistance'],
      craftedMods: ['+20 to Strength'],
      flavourText: ['A relic from the ancient times.']
    };

    render(
      <ItemTooltip item={mockItem}>
        <button>Hover Item</button>
      </ItemTooltip>
    );

    const triggerBtn = screen.getByText('Hover Item');
    expect(triggerBtn).toBeDefined();

    // Trigger hover
    fireEvent.mouseEnter(triggerBtn);

    // Tooltip card items
    expect(screen.getByText('Doom Sanctuary')).toBeDefined();
    expect(screen.getByText('Hubris Circlet')).toBeDefined();
    expect(screen.getByText('85')).toBeDefined();
    expect(screen.getByText('+20%')).toBeDefined();
    expect(screen.getByText('B-B-B-B')).toBeDefined();
    expect(screen.getByText(/物品等級:/)).toBeDefined();
    expect(screen.getByText(/需求:/)).toBeDefined();
    expect(screen.getByText('68')).toBeDefined();
    expect(screen.getByText('能量護盾:')).toBeDefined();
    expect(screen.getByText('350')).toBeDefined();
    expect(screen.getByText((content) => content.includes('+15% to Chaos Resistance'))).toBeDefined();
    expect(screen.getByText('+105 to maximum Life')).toBeDefined();
    expect(screen.getByText('+45% to Fire Resistance')).toBeDefined();
    expect(screen.getByText((content) => content.includes('+20 to Strength'))).toBeDefined();
    expect(screen.getByText('A relic from the ancient times.')).toBeDefined();
    expect(screen.getByText('已汙染 (Corrupted)')).toBeDefined();
  });
});
