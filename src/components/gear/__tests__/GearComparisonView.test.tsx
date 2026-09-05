import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GearComparisonView } from '../GearComparisonView';
import type { ParsedItem } from '../../../types/poe';

const sampleHelm: ParsedItem = {
  name: '精魂之盔',
  baseType: '皇家輕盔',
  rarity: 'Rare',
  language: 'en',
  rawText: '',
  implicits: [],
  explicits: [
    { id: '1', text: '+95 to maximum Life', englishText: '+95 to maximum Life', type: 'explicit', enabled: true },
    { id: '2', text: '+40% to Fire Resistance', englishText: '+40% to Fire Resistance', type: 'explicit', enabled: true }
  ]
};

describe('GearComparisonView', () => {
  it('renders slot badge and empty prompt initially', () => {
    render(<GearComparisonView item={sampleHelm} />);

    expect(screen.getByText(/裝備差額對比/i)).toBeDefined();
    expect(screen.getAllByText(/helmet/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/尚未記錄【helmet】槽位的穿戴裝備/i)).toBeDefined();
  });

  it('sets current item as baseline when button is clicked', () => {
    render(<GearComparisonView item={sampleHelm} />);

    const setBtn = screen.getByRole('button', { name: /設為穿戴基準/i });
    fireEvent.click(setBtn);

    // After setting, summary note and clear button appear
    expect(screen.getByRole('button', { name: /清除/i })).toBeDefined();
    expect(screen.getByText(/各有千秋/i)).toBeDefined();
  });
});
