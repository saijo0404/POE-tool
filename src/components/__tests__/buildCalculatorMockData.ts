import { vi } from 'vitest';
import type { BuildCostResult } from '../../types/poe';

export const defaultProps = {
  league: 'Settlers',
  onShowToast: vi.fn(),
};

export const mockBuildResult: BuildCostResult = {
  character: {
    account: 'TestAccount',
    name: 'SlayerGod',
    league: 'Settlers',
    level: 98,
    class: 'Duelist',
    ascendancy: 'Slayer',
  },
  totalChaos: 32000,
  totalDivine: 200,
  divineChaosRate: 160,
  categories: {
    equipment: {
      totalChaos: 20000,
      totalDivine: 125,
      items: [
        {
          name: 'Mageblood',
          typeLine: 'Heavy Belt',
          category: 'equipment' as const,
          rarity: 'Unique',
          icon: '',
          slot: 'Belt',
          priceChaos: 16000,
          priceDivine: 100,
          confidence: 'high' as const,
          tradeQueryJson: '{"name":"Mageblood"}',
        },
        {
          name: 'Starforge',
          typeLine: 'Infernal Sword',
          category: 'equipment' as const,
          rarity: 'Unique',
          icon: '',
          slot: 'Weapon',
          priceChaos: 4000,
          priceDivine: 25,
          confidence: 'medium' as const,
          tradeSearchUrl: 'https://trade.search/starforge',
        }
      ]
    },
    gems: {
      totalChaos: 8000,
      totalDivine: 50,
      items: [
        {
          name: 'Awakened Multistrike Support',
          typeLine: 'Support Gem',
          category: 'gem' as const,
          rarity: 'Gem',
          icon: '',
          priceChaos: 8000,
          priceDivine: 50,
          confidence: 'high' as const,
        }
      ]
    },
    flasks: {
      totalChaos: 2000,
      totalDivine: 12.5,
      items: [
        {
          name: 'Progenesis',
          typeLine: 'Amethyst Flask',
          category: 'flask' as const,
          rarity: 'Unique',
          icon: '',
          priceChaos: 2000,
          priceDivine: 12.5,
          confidence: 'high' as const,
        }
      ]
    },
    jewels: {
      totalChaos: 2000,
      totalDivine: 12.5,
      items: [
        {
          name: 'Watcher\'s Eye',
          typeLine: 'Prismatic Jewel',
          category: 'jewel' as const,
          rarity: 'Unique',
          icon: '',
          priceChaos: 2000,
          priceDivine: 12.5,
          confidence: 'medium' as const,
        }
      ]
    }
  }
};

export const mockBuildWithMods: BuildCostResult = {
  ...mockBuildResult,
  categories: {
    ...mockBuildResult.categories,
    equipment: {
      ...mockBuildResult.categories.equipment,
      items: [
        {
          name: 'Mageblood',
          typeLine: 'Heavy Belt',
          category: 'equipment' as const,
          rarity: 'Unique',
          icon: '',
          slot: 'Belt',
          priceChaos: 16000,
          priceDivine: 100,
          confidence: 'high' as const,
          ilvl: 85,
          corrupted: false,
          implicitMods: ['+30 to Strength'],
          explicitMods: [
            'Magic Utility Flask Effects cannot be removed',
            'Leftmost 4 Magic Utility Flasks constantly apply their Flask Effects to you'
          ],
          craftedMods: ['+15% to all Elemental Resistances']
        }
      ]
    }
  }
};
