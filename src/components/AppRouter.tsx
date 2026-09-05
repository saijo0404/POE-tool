import React, { Suspense, lazy } from 'react';
import type { AppTabType } from './Navbar';
import { PriceChecker } from './PriceChecker';
import { ErrorBoundary } from './ErrorBoundary';

const WealthTracker = lazy(() => import('./WealthTracker'));
const MappingTracker = lazy(() => import('./mapping/MappingTracker'));
const BuildCalculator = lazy(() => import('./BuildCalculator'));
const ActLevelingGuide = lazy(() => import('./ActLevelingGuide'));
const AtlasStrategyHub = lazy(() => import('./AtlasStrategyHub'));
const MapModHub = lazy(() => import('./MapModHub'));
const CraftingSimulatorHub = lazy(() => import('./CraftingSimulatorHub'));
const FaustusExchangeHub = lazy(() => import('./exchange/FaustusExchangeHub'));

export const LoadingFallback: React.FC = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px', color: 'var(--text-gold)', gap: '10px' }}>
    <div className="spin" style={{ width: '20px', height: '20px', border: '2px solid rgba(200,170,110,0.3)', borderTopColor: 'var(--text-gold)', borderRadius: '50%' }} />
    <span style={{ fontSize: '0.9rem' }}>正在載入模組...</span>
  </div>
);

export interface AppRouterProps {
  activeTab: AppTabType;
  activeLeague: string;
  divineRate: number;
  pastedText: string;
  showToast: (msg: string) => void;
}

export const AppRouter: React.FC<AppRouterProps> = ({
  activeTab,
  activeLeague,
  divineRate,
  pastedText,
  showToast,
}) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        {activeTab === 'price' && <PriceChecker league={activeLeague} onShowToast={showToast} externalText={pastedText} />}
        {activeTab === 'exchange' && <FaustusExchangeHub league={activeLeague} onShowToast={showToast} />}
        {activeTab === 'build' && <BuildCalculator league={activeLeague} onShowToast={showToast} />}
        {activeTab === 'acts' && <ActLevelingGuide onShowToast={showToast} />}
        {activeTab === 'atlas' && <AtlasStrategyHub league={activeLeague} divineRate={divineRate} onShowToast={showToast} />}
        {activeTab === 'mapping' && <MappingTracker league={activeLeague} divineRate={divineRate} onShowToast={showToast} />}
        {activeTab === 'mapmod' && <MapModHub onShowToast={showToast} />}
        {activeTab === 'craft' && <CraftingSimulatorHub league={activeLeague} divineRate={divineRate} onShowToast={showToast} />}
        {activeTab === 'wealth' && <WealthTracker league={activeLeague} onShowToast={showToast} />}
      </Suspense>
    </ErrorBoundary>
  );
};
