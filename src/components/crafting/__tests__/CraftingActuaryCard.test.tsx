import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CraftingActuaryCard } from '../CraftingActuaryCard';
import type { CraftActuaryResult } from '../../../domain/crafting/types';

describe('CraftingActuaryCard Component Unit Tests', () => {
  it('should render prompt when actuaryResult is null', () => {
    render(<CraftingActuaryCard actuaryResult={null} />);
    expect(screen.getByText(/請設定基底並至少選擇 1 條目標詞綴/i)).toBeInTheDocument();
  });

  it('should render recommendation banner and evaluation cards', () => {
    const mockResult: CraftActuaryResult = {
      recommendedMethod: {
        method: 'essence',
        title: '精髓工藝 (破空之哀傷精髓)',
        subtitle: '保底 T1 最大生命',
        successProbability: 0.25,
        averageAttempts: 4,
        costPerAttemptChaos: 4,
        totalExpectedCostChaos: 16,
        totalExpectedCostDivine: 0.1,
        confidence95Attempts: 11,
        confidence95CostChaos: 44,
        confidence95CostDivine: 0.3,
        isRecommended: true,
      },
      evaluations: [
        {
          method: 'essence',
          title: '精髓工藝 (破空之哀傷精髓)',
          subtitle: '保底 T1 最大生命',
          successProbability: 0.25,
          averageAttempts: 4,
          costPerAttemptChaos: 4,
          totalExpectedCostChaos: 16,
          totalExpectedCostDivine: 0.1,
          confidence95Attempts: 11,
          confidence95CostChaos: 44,
          confidence95CostDivine: 0.3,
          isRecommended: true,
        },
        {
          method: 'chaos',
          title: '混沌石點骰 (Chaos Spam)',
          subtitle: '純機率隨機 Roll',
          successProbability: 0.05,
          averageAttempts: 20,
          costPerAttemptChaos: 1,
          totalExpectedCostChaos: 20,
          totalExpectedCostDivine: 0.1,
          confidence95Attempts: 59,
          confidence95CostChaos: 59,
          confidence95CostDivine: 0.4,
        },
      ],
      totalPoolModsCount: 15,
      activeTargetModsCount: 2,
    };

    render(<CraftingActuaryCard actuaryResult={mockResult} />);

    expect(screen.getByText('最佳推薦工藝')).toBeInTheDocument();
    expect(screen.getByText('預估 ~16 Chaos')).toBeInTheDocument();
    expect(screen.getByText('混沌石點骰 (Chaos Spam)')).toBeInTheDocument();
  });
});
