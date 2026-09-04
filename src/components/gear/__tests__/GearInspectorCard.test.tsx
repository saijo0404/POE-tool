import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { GearInspectorCard } from '../GearInspectorCard';
import type { ParsedItem } from '../../../types/poe';

describe('GearInspectorCard Component', () => {
  const mockItem: ParsedItem = {
    name: '狂風 穿行者',
    baseType: 'Two-Toned Boots (雙色鞋)',
    rarity: 'Rare',
    itemClass: 'boots',
    itemLevel: 86,
    language: 'zh',
    implicits: [],
    explicits: [
      { id: '1', text: '+125 最大生命', englishText: '+125 to Maximum Life', type: 'explicit', tier: 1, enabled: true },
      { id: '2', text: '35% 移動速度', englishText: '35% increased Movement Speed', type: 'explicit', tier: 1, enabled: true },
      { id: '3', text: '+48% 火焰抗性', englishText: '+48% to Fire Resistance', type: 'explicit', tier: 1, enabled: true }
    ],
    rawText: ''
  };

  it('renders item header, score badge and high value banner', () => {
    render(<GearInspectorCard item={mockItem} />);

    expect(screen.getByText('狂風 穿行者')).toBeInTheDocument();
    expect(screen.getByText(/Two-Toned Boots \(雙色鞋\)/)).toBeInTheDocument();
    expect(screen.getByText(/評級 S/)).toBeInTheDocument();
    expect(screen.getAllByText(/🌟 頂級工藝胚子/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders open slots and bench craft badges', () => {
    render(<GearInspectorCard item={mockItem} />);

    expect(screen.getByText('+ 空前綴 (Open Slot)')).toBeInTheDocument();
    expect(screen.getAllByText('+ 空後綴 (Open Slot)').length).toBe(2);
    expect(screen.getByText('可上工藝台附魔')).toBeInTheDocument();
  });
});
