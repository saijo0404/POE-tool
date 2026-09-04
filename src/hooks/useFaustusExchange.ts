import { useState, useEffect, useCallback, useMemo } from 'react';
import { poeApi } from '../services/api';
import { calculateTotalGoldFee } from '../domain/exchange/goldCalculator';
import type {
  ExchangeFilterOptions,
  ExchangeItem,
  FaustusMarketOverview,
  GoldFeeCalculation,
  CurrencyRates,
} from '../domain/exchange/types';

interface UseFaustusExchangeOptions {
  league?: string;
  defaultCategory?: import('../domain/exchange/types').ExchangeCategory;
}

export function useFaustusExchange(options: UseFaustusExchangeOptions = {}) {
  const { league = 'Settlers', defaultCategory = 'All' } = options;

  const [marketData, setMarketData] = useState<FaustusMarketOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [filter, setFilter] = useState<ExchangeFilterOptions>({
    category: defaultCategory,
    searchQuery: '',
    onlyArbitrage: false,
    minVolume: 0,
    sortBy: 'volume',
  });

  const [selectedItemForGoldCalc, setSelectedItemForGoldCalc] = useState<ExchangeItem | null>(null);
  const [goldCalcQuantity, setGoldCalcQuantity] = useState<number>(10);

  const fetchExchangeData = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const res = await poeApi.getFaustusExchangeOverview(league, forceRefresh);
      setMarketData(res);
      setSelectedItemForGoldCalc((prev) => prev ?? (res.items.length > 0 ? res.items[0] : null));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '載入交易所行情失敗');
    } finally {
      setLoading(false);
    }
  }, [league]);

  useEffect(() => {
    void fetchExchangeData(false);
  }, [fetchExchangeData]);

  const rates: CurrencyRates = useMemo(() => ({
    divineChaosRate: marketData?.divineChaosRate || 155,
    mirrorChaosRate: (marketData?.divineChaosRate || 155) * (marketData?.mirrorDivineRate || 700),
    exaltedChaosRate: 15,
  }), [marketData]);

  const filteredItems = useMemo(() => {
    if (!marketData) return [];
    let items = [...marketData.items];

    if (filter.category !== 'All') {
      items = items.filter((it) => it.category === filter.category);
    }

    if (filter.searchQuery.trim()) {
      const q = filter.searchQuery.trim().toLowerCase();
      items = items.filter((it) =>
        it.name.toLowerCase().includes(q) || (it.nameZh && it.nameZh.includes(q))
      );
    }

    if (filter.onlyArbitrage) {
      const arbIds = new Set(marketData.arbitrageOpportunities.map((o) => o.itemId));
      items = items.filter((it) => arbIds.has(it.id));
    }

    if (filter.minVolume > 0) {
      items = items.filter((it) => it.volume24h >= filter.minVolume);
    }

    return sortItems(items, filter.sortBy);
  }, [marketData, filter]);

  const goldFeeCalculation: GoldFeeCalculation | null = useMemo(() => {
    if (!selectedItemForGoldCalc) return null;
    return calculateTotalGoldFee(
      selectedItemForGoldCalc.name,
      goldCalcQuantity,
      selectedItemForGoldCalc.primaryValue,
      selectedItemForGoldCalc.category
    );
  }, [selectedItemForGoldCalc, goldCalcQuantity]);

  return {
    marketData,
    loading,
    error,
    filter,
    setFilter,
    filteredItems,
    arbitrageOpportunities: marketData?.arbitrageOpportunities || [],
    rates,
    refresh: () => fetchExchangeData(true),
    selectedItemForGoldCalc,
    setSelectedItemForGoldCalc,
    goldCalcQuantity,
    setGoldCalcQuantity,
    goldFeeCalculation,
  };
}

function sortItems(items: ExchangeItem[], sortBy: ExchangeFilterOptions['sortBy']): ExchangeItem[] {
  switch (sortBy) {
    case 'priceAsc':
      return items.sort((a, b) => a.primaryValue - b.primaryValue);
    case 'priceDesc':
      return items.sort((a, b) => b.primaryValue - a.primaryValue);
    case 'volume':
    default:
      return items.sort((a, b) => b.volume24h - a.volume24h);
  }
}
