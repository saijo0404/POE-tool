import { useState, useMemo } from 'react';
import type { FactionType } from '../domain/expedition/types';
import {
  calculateTujenHaggle,
  calculateDannigArbitrage,
  calculateLogbookEv,
} from '../domain/expedition/expeditionEngine';

export function useExpeditionOptimizer() {
  const [activeTab, setActiveTab] = useState<'tujen' | 'dannig' | 'logbook'>('tujen');

  // Tujen state
  const [tujenAskingPrice, setTujenAskingPrice] = useState<number>(350);

  // Dannig state
  const [sunArtifacts, setSunArtifacts] = useState<number>(500);
  const [targetFaction, setTargetFaction] = useState<FactionType>('black_scythe');
  const [sunRate, setSunRate] = useState<number>(0.35);
  const [targetRate, setTargetRate] = useState<number>(0.28);

  // Logbook state
  const [logbookFaction, setLogbookFaction] = useState<FactionType>('black_scythe');
  const [areaLevel, setAreaLevel] = useState<number>(83);
  const [logbookCost, setLogbookCost] = useState<number>(60);
  const [selectedRemnants, setSelectedRemnants] = useState<string[]>(['duplicated_runic', 'runic_item_quantity']);

  const tujenAdvice = useMemo(() => {
    return calculateTujenHaggle(tujenAskingPrice);
  }, [tujenAskingPrice]);

  const dannigResult = useMemo(() => {
    return calculateDannigArbitrage(sunArtifacts, targetFaction, sunRate, targetRate);
  }, [sunArtifacts, targetFaction, sunRate, targetRate]);

  const logbookEv = useMemo(() => {
    return calculateLogbookEv(logbookFaction, areaLevel, selectedRemnants, logbookCost);
  }, [logbookFaction, areaLevel, selectedRemnants, logbookCost]);

  const handleToggleRemnant = (id: string) => {
    setSelectedRemnants((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const handleClearRemnants = () => setSelectedRemnants([]);

  return {
    activeTab,
    setActiveTab,
    tujenAskingPrice,
    onTujenAskingPriceChange: setTujenAskingPrice,
    tujenAdvice,
    sunArtifacts,
    onSunArtifactsChange: setSunArtifacts,
    targetFaction,
    onTargetFactionChange: setTargetFaction,
    sunRate,
    onSunRateChange: setSunRate,
    targetRate,
    onTargetRateChange: setTargetRate,
    dannigResult,
    logbookFaction,
    onLogbookFactionChange: setLogbookFaction,
    areaLevel,
    onAreaLevelChange: setAreaLevel,
    logbookCost,
    onLogbookCostChange: setLogbookCost,
    selectedRemnants,
    onToggleRemnant: handleToggleRemnant,
    onClearRemnants: handleClearRemnants,
    logbookEv,
  };
}
