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
    isSidebarCollapsed: false,
    onToggleSidebar: vi.fn()
  };

  it('renders title, active tab indicator, divine rate and account name', () => {
    renderNavbar(defaultProps);

    expect(screen.getByText('POE Tool')).toBeInTheDocument();
    expect(screen.getByText('裝備查價')).toBeInTheDocument();
    expect(screen.getByText(/Settlers/i)).toBeInTheDocument();
    expect(screen.getByText(/160 Chaos/i)).toBeInTheDocument();
    expect(screen.getByText(/TestUser#1234/i)).toBeInTheDocument();
  });

  it('calls onToggleSidebar when toggle button is clicked', () => {
    renderNavbar(defaultProps);

    const toggleBtn = screen.getByRole('button', { name: /收合側邊欄/i });
    fireEvent.click(toggleBtn);
    expect(defaultProps.onToggleSidebar).toHaveBeenCalledTimes(1);
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

  it('calls onOpenSettings when settings button is clicked', () => {
    renderNavbar(defaultProps);

    const settingsBtn = screen.getByRole('button', { name: /設定/i });
    fireEvent.click(settingsBtn);
    expect(defaultProps.onOpenSettings).toHaveBeenCalledTimes(1);
  });
});
