import React, { useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { WealthSnapshot } from '../types/poe';
import type {
  PriceCheckerCacheState,
  BuildCalculatorCacheState,
  WealthFilterState
} from './AppStateContext';
import {
  AppStateContext,
  defaultPriceCheckerState,
  defaultBuildCalculatorState,
  defaultWealthFilterState
} from './AppStateContext';

export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [priceCheckerState, setPriceCheckerState] = useState<PriceCheckerCacheState>(defaultPriceCheckerState);
  const [buildCalculatorState, setBuildCalculatorState] = useState<BuildCalculatorCacheState>(defaultBuildCalculatorState);
  const [wealthFilterState, setWealthFilterState] = useState<WealthFilterState>(defaultWealthFilterState);
  const [cachedSnapshots, setCachedSnapshots] = useState<WealthSnapshot[]>([]);

  const updatePriceCheckerState = useCallback((partial: Partial<PriceCheckerCacheState>) => {
    setPriceCheckerState(prev => ({ ...prev, ...partial }));
  }, []);

  const updateBuildCalculatorState = useCallback((partial: Partial<BuildCalculatorCacheState>) => {
    setBuildCalculatorState(prev => ({ ...prev, ...partial }));
  }, []);

  const updateWealthFilterState = useCallback((partial: Partial<WealthFilterState>) => {
    setWealthFilterState(prev => ({ ...prev, ...partial }));
  }, []);

  return (
    <AppStateContext.Provider
      value={{
        priceCheckerState,
        setPriceCheckerState,
        updatePriceCheckerState,
        buildCalculatorState,
        setBuildCalculatorState,
        updateBuildCalculatorState,
        wealthFilterState,
        setWealthFilterState,
        updateWealthFilterState,
        cachedSnapshots,
        setCachedSnapshots
      }}
    >
      {children}
    </AppStateContext.Provider>
  );
};

export default AppStateProvider;
