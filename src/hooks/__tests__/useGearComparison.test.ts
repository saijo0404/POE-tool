import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGearComparison } from '../useGearComparison';
import type { ParsedItem } from '../../types/poe';

const mockItem: ParsedItem = {
  name: '風暴之冠',
  baseType: '皇家輕盔',
  rarity: 'Rare',
  language: 'en',
  rawText: '',
  implicits: [],
  explicits: [
    { id: '1', text: '+80 to maximum Life', englishText: '+80 to maximum Life', type: 'explicit', enabled: true }
  ]
};

describe('useGearComparison', () => {
  it('detects slot and manages equipped baseline state', () => {
    const { result } = renderHook(() => useGearComparison(mockItem));

    expect(result.current.slot).toBe('helmet');

    act(() => {
      result.current.handleSetCurrentAsEquipped();
    });

    expect(result.current.equippedItem?.name).toBe('風暴之冠');
    expect(result.current.deltaReport).not.toBeNull();

    act(() => {
      result.current.handleClearEquipped();
    });

    expect(result.current.equippedItem).toBeNull();
    expect(result.current.deltaReport).toBeNull();
  });
});
