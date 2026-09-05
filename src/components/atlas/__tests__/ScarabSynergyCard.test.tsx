import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ScarabSynergyCard } from '../ScarabSynergyCard';
import type { ScarabSynergyRecommendation } from '../../../domain/atlas/scarabSynergyEngine';

describe('ScarabSynergyCard', () => {
  const mockRecommendation: ScarabSynergyRecommendation = {
    primaryMechanic: 'legion',
    tier: 'S',
    synergyMultiplier: 2.45,
    estimatedCostChaos: 120,
    totalScarabsCount: 5,
    summaryNote: '針對【legion】推薦最佳 5 顆甲蟲組合，綜合產出加乘約 2.45x (S 級協同)。',
    slots: [
      {
        scarab: {
          id: 'legion_scarab_commanders',
          name: '軍閥之戰亂甲蟲',
          nameEn: 'Legion Scarab of Commanders',
          category: 'legion',
          limit: 1,
          description: '戰亂遭遇戰各陣營均有 1 位將領率領。',
          basePriceChaos: 38
        },
        count: 1,
        unitCostChaos: 38,
        totalCostChaos: 38,
        synergyReason: '極致質變首選：解鎖頂級將領、倍增或質變機制'
      },
      {
        scarab: {
          id: 'legion_scarab',
          name: '戰亂甲蟲',
          nameEn: 'Legion Scarab',
          category: 'legion',
          limit: 4,
          description: '區域包含 1 個額外戰亂遭遇戰。',
          basePriceChaos: 5
        },
        count: 4,
        unitCostChaos: 5,
        totalCostChaos: 20,
        synergyReason: '基礎密度擴張：大幅增加區域遭遇戰基底數量'
      }
    ]
  };

  it('renders recommendation header, tier badge, and scarabs list', () => {
    render(
      <ScarabSynergyCard
        recommendation={mockRecommendation}
        divineRate={150}
      />
    );

    expect(screen.getByText('聖甲蟲協同組合推薦')).toBeInTheDocument();
    expect(screen.getByText('S 級協同')).toBeInTheDocument();
    expect(screen.getByText(/2.45x 乘數/)).toBeInTheDocument();
    expect(screen.getByText('軍閥之戰亂甲蟲')).toBeInTheDocument();
    expect(screen.getByText('戰亂甲蟲')).toBeInTheDocument();
    expect(screen.getByText('x1')).toBeInTheDocument();
    expect(screen.getByText('x4')).toBeInTheDocument();
  });

  it('calls onApplyToCurrentTier when apply button is clicked', () => {
    const handleApply = vi.fn();
    render(
      <ScarabSynergyCard
        recommendation={mockRecommendation}
        onApplyToCurrentTier={handleApply}
      />
    );

    const applyBtn = screen.getByText('一鍵套用此組合');
    fireEvent.click(applyBtn);

    expect(handleApply).toHaveBeenCalledTimes(1);
    const appliedScarabs = handleApply.mock.calls[0][0];
    expect(appliedScarabs).toHaveLength(2);
    expect(appliedScarabs[0].name).toBe('軍閥之戰亂甲蟲');
    expect(appliedScarabs[0].count).toBe(1);
    expect(appliedScarabs[1].name).toBe('戰亂甲蟲');
    expect(appliedScarabs[1].count).toBe(4);
  });

  it('renders null when slots are empty', () => {
    const emptyRec: ScarabSynergyRecommendation = {
      primaryMechanic: 'general',
      tier: 'B',
      synergyMultiplier: 1.0,
      estimatedCostChaos: 0,
      totalScarabsCount: 0,
      summaryNote: '無符合甲蟲',
      slots: []
    };

    const { container } = render(
      <ScarabSynergyCard recommendation={emptyRec} />
    );
    expect(container.firstChild).toBeNull();
  });
});
