/**
 * Default Faustus Exchange Overview & Mock Generator
 */
import { KNOWN_ITEM_ZH_NAMES } from './constants';
import { calculateItemGoldFee } from './goldCalculator';
import { findArbitrageOpportunities } from './arbitrageEvaluator';
import type { ExchangeItem, FaustusMarketOverview } from './types';

export const INITIAL_EXCHANGE_FIXTURES: readonly Omit<ExchangeItem, 'goldCostPerUnit'>[] = [
  {
    id: 'divine',
    name: 'Divine Orb',
    nameZh: '神聖石',
    category: 'Currency',
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lNb2RWYWx1ZXMiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/e1a54ff97d/CurrencyModValues.png',
    primaryValue: 155,
    secondaryValue: 1,
    tradePriceChaos: 158,
    volume24h: 38400,
    maxVolumeCurrency: 'chaos',
    maxVolumeRate: 155,
    change24h: 2.5,
  },
  {
    id: 'mirror',
    name: 'Mirror of Kalandra',
    nameZh: '卡蘭德的魔鏡',
    category: 'Currency',
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lEdXBsaWNhdGUiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/09ec011d88/CurrencyDuplicate.png',
    primaryValue: 108500,
    secondaryValue: 700,
    tradePriceChaos: 110000,
    volume24h: 120,
    maxVolumeCurrency: 'divine',
    maxVolumeRate: 700,
    change24h: 0.8,
  },
  {
    id: 'exalted',
    name: 'Exalted Orb',
    nameZh: '崇高石',
    category: 'Currency',
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lBZGRNb2RUb1JhcmUiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/da806ef92e/CurrencyAddModToRare.png',
    primaryValue: 14.5,
    secondaryValue: 0.093,
    tradePriceChaos: 18.0, // Arbitrage: +3.5c
    volume24h: 18500,
    maxVolumeCurrency: 'chaos',
    maxVolumeRate: 14.5,
    change24h: -1.2,
  },
  {
    id: 'annul',
    name: 'Orb of Annulment',
    nameZh: '無效石',
    category: 'Currency',
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvQ3VycmVuY3lSZW1vdmVNb2QiLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/cb3902347a/CurrencyRemoveMod.png',
    primaryValue: 8.0,
    secondaryValue: 0.051,
    tradePriceChaos: 11.5, // Arbitrage: +3.5c
    volume24h: 9400,
    maxVolumeCurrency: 'chaos',
    maxVolumeRate: 8.0,
    change24h: 4.1,
  },
  {
    id: 'scarab-divination-curio',
    name: 'Divination Scarab of Curation',
    nameZh: '命運之保全聖甲蟲',
    category: 'Scarab',
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvU2NhcmFicy9UaWVyNFNjYXJhYkRpdmluYXRpb24iLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/2a8a1ff1b5/Tier4ScarabDivination.png',
    primaryValue: 120,
    secondaryValue: 0.77,
    tradePriceChaos: 145, // Arbitrage: +25c
    volume24h: 1250,
    maxVolumeCurrency: 'chaos',
    maxVolumeRate: 120,
    change24h: 5.6,
  },
  {
    id: 'essence-deafening-greed',
    name: 'Deafening Essence of Greed',
    nameZh: '破空之貪婪精髓',
    category: 'Essence',
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvQ3VycmVuY3kvRXNzZW5jZS9HcmVlZDciLCJ3IjoxLCJoIjoxLCJzY2FsZSI6MX1d/24bbba346c/Greed7.png',
    primaryValue: 12.0,
    secondaryValue: 0.077,
    tradePriceChaos: 16.0, // Arbitrage: +4c
    volume24h: 15200,
    maxVolumeCurrency: 'chaos',
    maxVolumeRate: 12.0,
    change24h: 1.8,
  },
  {
    id: 'card-apothecary',
    name: 'The Apothecary',
    nameZh: '藥劑師',
    category: 'DivinationCard',
    icon: 'https://web.poecdn.com/gen/image/WzI1LDE0LHsiZiI6IjJESXRlbXMvRGl2aW5hdGlvbi9JbnZlbnRvcnlJY29uIiwidyI6MSwiaCI6MSwic2NhbGUiOjF9XQ/f34bf8c10b/InventoryIcon.png',
    primaryValue: 54250,
    secondaryValue: 350,
    tradePriceChaos: 57350, // 370 Div (+20 Div)
    volume24h: 85,
    maxVolumeCurrency: 'divine',
    maxVolumeRate: 350,
    change24h: 3.2,
  },
];

/**
 * Creates default initial market overview
 */
export function createDefaultExchangeOverview(league: string = 'Settlers'): FaustusMarketOverview {
  const divineRate = 155;
  const items: ExchangeItem[] = INITIAL_EXCHANGE_FIXTURES.map((item) => ({
    ...item,
    nameZh: item.nameZh || KNOWN_ITEM_ZH_NAMES[item.name],
    goldCostPerUnit: calculateItemGoldFee(item.name, item.primaryValue, item.category),
  }));

  const arbitrageOpportunities = findArbitrageOpportunities(items, divineRate, 5, 20);

  return {
    league,
    updatedAt: Date.now(),
    divineChaosRate: divineRate,
    mirrorDivineRate: 700,
    totalItems: items.length,
    items,
    arbitrageOpportunities,
  };
}
