import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Navbar } from '../Navbar';
import { SettingsContext, type SettingsContextType } from '../../context/settingsContextDef';
import { GameEngineContext, type GameEngineContextType } from '../../context/GameEngineContextDef';
import { ENGINE_METADATA } from '../../domain/engine/types';

function renderNavbar(
  props: React.ComponentProps<typeof Navbar>,
  options: { engine?: 'poe1' | 'poe2'; focusModeEnabled?: boolean } = {}
) {
  const engine = options.engine ?? 'poe1';
  const updateSettings = vi.fn().mockResolvedValue({});

  const settingsContextValue: SettingsContextType = {
    settings: {
      league: 'Settlers',
      poesessid: '',
      accountName: 'TestUser#1234',
      autoSnapshotEnabled: true,
      autoSnapshotIntervalMinutes: 60,
      useDemoData: false,
      focusModeEnabled: options.focusModeEnabled ?? false
    },
    isLoading: false,
    updateSettings,
    refreshSettings: vi.fn(),
    refreshCharacters: vi.fn(),
    refreshDivineRate: vi.fn(),
    sessionHealth: null,
    checkSessionHealth: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    divineRate: 160,
    isRateRefreshing: false,
    characters: [],
    activeLeague: 'Settlers'
  };

  const gameEngineContextValue: GameEngineContextType = {
    currentEngine: engine,
    mode: 'auto',
    metadata: ENGINE_METADATA[engine],
    features: ENGINE_METADATA[engine].features,
    detectedEngine: null,
    detectedProcess: null,
    detectedTitle: null,
    isAutoDetecting: false,
    setEngine: vi.fn(),
    setMode: vi.fn(),
    namespacedStorage: {
      getItem: <T,>(_key: string, defaultVal: T): T => defaultVal,
      setItem: () => {},
      removeItem: () => {}
    }
  };

  return {
    ...render(
      <SettingsContext.Provider value={settingsContextValue}>
        <GameEngineContext.Provider value={gameEngineContextValue}>
          <Navbar {...props} />
        </GameEngineContext.Provider>
      </SettingsContext.Provider>
    ),
    updateSettings
  };
}

describe('Navbar Component', () => {
  const defaultProps = {
    activeTab: 'price' as const,
    setActiveTab: vi.fn(),
    league: 'Settlers',
    divineRate: 160,
    onOpenSettings: vi.fn(),
    accountName: 'TestUser#1234',
  };

  it('renders tab buttons, league name, divine rate and account name', () => {
    renderNavbar(defaultProps);

    expect(screen.getAllByText(/裝備即時查價/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/大宗交易所/i)).toBeInTheDocument();
    expect(screen.getByText(/每小時資產估算/i)).toBeInTheDocument();
    expect(screen.getByText(/Build 成本/i)).toBeInTheDocument();
    expect(screen.getByText(/拓荒攻略/i)).toBeInTheDocument();
    expect(screen.getByText(/Settlers/i)).toBeInTheDocument();
    expect(screen.getByText(/160 Chaos/i)).toBeInTheDocument();
    expect(screen.getByText(/TestUser#1234/i)).toBeInTheDocument();
  });

  it('calls setActiveTab when tabs are clicked', () => {
    renderNavbar(defaultProps);

    const wealthTab = screen.getByText(/每小時資產估算/i);
    fireEvent.click(wealthTab);
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith('wealth');

    const exchangeTab = screen.getByText(/大宗交易所/i);
    fireEvent.click(exchangeTab);
    expect(defaultProps.setActiveTab).toHaveBeenCalledWith('exchange');
  });

  it('displays PoE 1 badges on generation-exclusive tabs', () => {
    renderNavbar(defaultProps);

    const poe1Badges = screen.getAllByTestId('engine-badge-poe1');
    expect(poe1Badges.length).toBeGreaterThanOrEqual(2); // atlas and craft
  });

  it('filters out unsupported tabs when focusModeEnabled is true in poe2 mode', () => {
    renderNavbar(defaultProps, { engine: 'poe2', focusModeEnabled: true });

    expect(screen.getByText(/裝備即時查價/i)).toBeInTheDocument();
    expect(screen.getByText(/大宗交易所/i)).toBeInTheDocument();
    expect(screen.queryByText(/輿圖天賦策略/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/工藝期望精算/i)).not.toBeInTheDocument();
  });

  it('toggles focusModeEnabled when clicking focus mode button', () => {
    const { updateSettings } = renderNavbar(defaultProps, { focusModeEnabled: false });

    const focusBtn = screen.getByRole('button', { name: /全功能/i });
    fireEvent.click(focusBtn);

    expect(updateSettings).toHaveBeenCalledWith({ focusModeEnabled: true });
  });

  it('opens FeatureCapabilityMatrixModal when clicking capability matrix button', () => {
    renderNavbar(defaultProps);

    expect(
      screen.queryByText(/PoE 1 vs PoE 2 功能支援與世代能力對照表/i)
    ).not.toBeInTheDocument();

    const matrixBtn = screen.getByRole('button', { name: /對照表/i });
    fireEvent.click(matrixBtn);

    expect(
      screen.getByText(/PoE 1 vs PoE 2 功能支援與世代能力對照表/i)
    ).toBeInTheDocument();
  });

  it('automatically redirects to price tab if activeTab is not supported in poe2 with focusModeEnabled', () => {
    const setActiveTab = vi.fn();
    renderNavbar(
      { ...defaultProps, activeTab: 'atlas', setActiveTab },
      { engine: 'poe2', focusModeEnabled: true }
    );

    expect(setActiveTab).toHaveBeenCalledWith('price');
  });
});
