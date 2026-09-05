import type { TradeListing, TradeSearchResult } from '../../../types/poe';

export const mockListingWithHideoutToken: TradeListing = {
  id: 'item_token_1',
  indexed: new Date().toISOString(),
  sellerAccount: 'ProTrader#1234',
  characterName: 'SlayerGod',
  sellerIgn: 'SlayerGod',
  onlineStatus: 'online',
  priceAmount: 50,
  priceCurrency: 'chaos',
  priceInChaos: 50,
  priceInDivine: 0.33,
  whisper: '@SlayerGod Hi, I would like to buy your item',
  whisperToken: 'jwt_valid_token_xyz',
  hideoutToken: 'jwt_valid_token_xyz',
  isInstantBuyout: true,
  method: 'merchant',
  item: {
    name: 'Headhunter',
    typeLine: 'Leather Belt',
    icon: 'https://example.com/item.png'
  }
};

export const mockListingWithoutToken: TradeListing = {
  id: 'item_no_token_2',
  indexed: new Date().toISOString(),
  sellerAccount: 'CasualBuyer#5678',
  characterName: 'WitchMaster',
  sellerIgn: 'WitchMaster',
  onlineStatus: 'online',
  priceAmount: 1,
  priceCurrency: 'divine',
  priceInChaos: 150,
  priceInDivine: 1,
  whisper: '@WitchMaster Hi, I would like to buy your item',
  item: {
    name: 'Mageblood',
    typeLine: 'Heavy Belt',
    icon: 'https://example.com/item.png'
  }
};

export const mockTradeResults: TradeSearchResult = {
  id: 'search_test_1',
  searchId: 'search_test_1',
  total: 2,
  estimatedMinPriceChaos: 50,
  estimatedMinPriceDivine: 0.33,
  estimatedMedianPriceChaos: 150,
  estimatedMedianPriceDivine: 1,
  listings: [mockListingWithHideoutToken, mockListingWithoutToken]
};

export const mockListingWithFullItem: TradeListing = {
  ...mockListingWithHideoutToken,
  item: {
    name: 'Headhunter',
    typeLine: 'Leather Belt',
    icon: 'https://example.com/headhunter.png',
    rarity: 'Unique',
    ilvl: 86,
    corrupted: true,
    implicitMods: ['+40 to maximum Life'],
    explicitMods: [
      '+55 to Strength',
      '+55 to Dexterity',
      'When you Kill a Rare Monster, you gain its Modifiers for 60 seconds'
    ],
    craftedMods: ['+20 to maximum Energy Shield'],
    enchantMods: ['Enchanted mod test']
  }
};
