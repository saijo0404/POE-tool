import { useState, useMemo } from 'react';
import type { BlightedMapType } from '../domain/blight/types';
import { BLIGHT_OILS, NOTABLE_ANOINTMENTS } from '../domain/blight/blightData';
import {
  calculateAllUpgrades,
  findAnointmentByNotable,
  calculateBlightMapEv,
} from '../domain/blight/blightOilEngine';

export function useBlightOil() {
  const [activeTab, setActiveTab] = useState<'arbitrage' | 'anointment' | 'map'>('arbitrage');
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [anointKeyword, setAnointKeyword] = useState('');

  const [mapType, setMapType] = useState<BlightedMapType>('blighted');
  const [baseMapCost, setBaseMapCost] = useState<number>(25);
  const [selectedOils, setSelectedOils] = useState<string[]>(['amber', 'amber', 'teal']);

  const priceMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const oil of BLIGHT_OILS) {
      map[oil.id] = customPrices[oil.id] ?? oil.defaultPriceChaos;
    }
    return map;
  }, [customPrices]);

  const arbitrageList = useMemo(() => {
    return calculateAllUpgrades(BLIGHT_OILS, priceMap);
  }, [priceMap]);

  const filteredAnoints = useMemo(() => {
    return findAnointmentByNotable(anointKeyword, NOTABLE_ANOINTMENTS);
  }, [anointKeyword]);

  const mapEv = useMemo(() => {
    return calculateBlightMapEv(mapType, selectedOils, baseMapCost, priceMap);
  }, [mapType, selectedOils, baseMapCost, priceMap]);

  const handleUpdatePrice = (oilId: string, price: number) => {
    setCustomPrices((prev) => ({ ...prev, [oilId]: price }));
  };

  const handleToggleOil = (oilId: string) => {
    const max = mapType === 'blighted' ? 3 : 9;
    if (selectedOils.length >= max) {
      setSelectedOils((prev) => [...prev.slice(1), oilId]);
    } else {
      setSelectedOils((prev) => [...prev, oilId]);
    }
  };

  const handleClearOils = () => setSelectedOils([]);

  const handleSwitchMapType = (type: BlightedMapType) => {
    setMapType(type);
    setBaseMapCost(type === 'blighted' ? 25 : 120);
    setSelectedOils((prev) => prev.slice(0, type === 'blighted' ? 3 : 9));
  };

  return {
    activeTab,
    setActiveTab,
    priceMap,
    onUpdatePrice: handleUpdatePrice,
    arbitrageList,
    anointKeyword,
    onAnointKeywordChange: setAnointKeyword,
    filteredAnoints,
    mapType,
    onSwitchMapType: handleSwitchMapType,
    baseMapCost,
    onBaseMapCostChange: setBaseMapCost,
    selectedOils,
    onToggleOil: handleToggleOil,
    onClearOils: handleClearOils,
    mapEv,
  };
}
