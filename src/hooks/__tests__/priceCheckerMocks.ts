import type { ParsedItem, TradeSearchResult } from '../../types/poe';

export const mockParsedItem: ParsedItem = {
  name: 'Headhunter',
  baseType: 'Leather Belt',
  rarity: 'Unique',
  sockets: 'W-W-W-W-W-W',
  corrupted: true,
  itemLevel: 85,
  language: 'en',
  rawText: 'Rarity: Unique\nHeadhunter\nLeather Belt',
  implicits: [
    { id: 'implicit.life', text: '+40 to maximum Life', englishText: '+40 to maximum Life', value: 40, type: 'implicit', enabled: true }
  ],
  explicits: [
    { id: 'explicit.dex', text: '+50 to Dexterity', englishText: '+50 to Dexterity', value: 50, type: 'explicit', enabled: true },
    { id: 'explicit.minor', text: 'increased stun and block recovery', englishText: 'increased stun and block recovery', value: 20, type: 'explicit', enabled: true }
  ]
};

export const mockTradeResult: TradeSearchResult = {
  id: 'search-headhunter',
  total: 25,
  estimatedMinPriceDivine: 45,
  estimatedMinPriceChaos: 7200,
  estimatedMedianPriceDivine: 50,
  estimatedMedianPriceChaos: 8000,
  tradeUrl: 'https://trade.url',
  listings: [
    {
      id: 'list-1',
      indexed: '2026-08-20T12:00:00Z',
      onlineStatus: 'online',
      priceAmount: 45,
      priceCurrency: 'divine',
      priceInChaos: 7200,
      priceInDivine: 45,
      whisper: '@Player Hi, I want to buy your Headhunter',
      accountName: 'Seller1',
      item: {
        name: 'Headhunter',
        typeLine: 'Leather Belt',
        icon: ''
      },
    }
  ]
};
