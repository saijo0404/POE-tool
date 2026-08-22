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
      implicitMods: ['+25 to maximum Mana'],
      explicitMods: ['+105 to maximum Life', '+45% to Fire Resistance'],
      craftedMods: ['+20 to Strength']
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
    expect(screen.getByText('+105 to maximum Life')).toBeDefined();
    expect(screen.getByText('+45% to Fire Resistance')).toBeDefined();
    expect(screen.getByText((content) => content.includes('+20 to Strength'))).toBeDefined();
    expect(screen.getByText('已汙染 (Corrupted)')).toBeDefined();
  });
});
