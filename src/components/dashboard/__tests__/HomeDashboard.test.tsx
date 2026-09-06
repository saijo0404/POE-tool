import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HomeDashboard } from '../HomeDashboard';
import { useSettings } from '../../../hooks/useSettings';
import { useGameEngine } from '../../../hooks/useGameEngine';
import { poeApi } from '../../../services/api';
import { ENGINE_METADATA } from '../../../domain/engine/types';

vi.mock('../../../hooks/useSettings');
vi.mock('../../../hooks/useGameEngine');
vi.mock('../../../services/api', () => ({
  poeApi: {
    showOverlayWindow: vi.fn().mockResolvedValue(undefined)
  }
}));

describe('HomeDashboard Component', () => {
  const refreshDivineRate = vi.fn().mockResolvedValue(undefined);
  const onNavigate = vi.fn();
  const onOpenTradeWhisper = vi.fn();
  const onShowToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettings).mockReturnValue({
      settings: {
        league: 'Settlers',
        poesessid: '',
        accountName: '',
        autoSnapshotEnabled: true,
        autoSnapshotIntervalMinutes: 60,
        useDemoData: false
      },
      isLoading: false,
      updateSettings: vi.fn(),
      refreshSettings: vi.fn(),
      refreshCharacters: vi.fn(),
      refreshDivineRate,
      sessionHealth: null,
      checkSessionHealth: vi.fn(),
      login: vi.fn(),
      logout: vi.fn(),
      divineRate: 165,
      isRateRefreshing: false,
      characters: [],
      activeLeague: 'Settlers'
    });

    vi.mocked(useGameEngine).mockReturnValue({
      currentEngine: 'poe1',
      mode: 'auto',
      metadata: ENGINE_METADATA.poe1,
      features: ENGINE_METADATA.poe1.features,
      detectedEngine: null,
      detectedProcess: null,
      detectedTitle: null,
      isAutoDetecting: false,
      setEngine: vi.fn(),
      setMode: vi.fn(),
      namespacedStorage: {
        getItem: <T,>(_key: string, defaultVal: T): T => defaultVal,
        setItem: vi.fn(),
        removeItem: vi.fn()
      }
    });
  });

  it('renders banner, economic ticker, and quick action cards', () => {
    render(
      <HomeDashboard
        league="Settlers"
        divineRate={165}
        onNavigate={onNavigate}
        onOpenTradeWhisper={onOpenTradeWhisper}
        onShowToast={onShowToast}
      />
    );

    expect(screen.getByText(/POE Helper Tool 控制總覽儀表板/i)).toBeInTheDocument();
    expect(screen.getByText('1 Divine ≈ 165 Chaos')).toBeInTheDocument();
    expect(screen.getByText('裝備查價')).toBeInTheDocument();
    expect(screen.getByText('大宗交易所')).toBeInTheDocument();
    expect(screen.getByText('每小時資產估算')).toBeInTheDocument();
  });

  it('calls refreshDivineRate when clicking refresh button', async () => {
    render(
      <HomeDashboard
        league="Settlers"
        divineRate={165}
        onNavigate={onNavigate}
        onOpenTradeWhisper={onOpenTradeWhisper}
        onShowToast={onShowToast}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /刷新/i }));
    expect(refreshDivineRate).toHaveBeenCalledWith('Settlers', true);
  });

  it('navigates to respective tabs when quick actions are clicked', () => {
    render(
      <HomeDashboard
        league="Settlers"
        divineRate={165}
        onNavigate={onNavigate}
        onOpenTradeWhisper={onOpenTradeWhisper}
        onShowToast={onShowToast}
      />
    );

    fireEvent.click(screen.getByText('裝備查價').closest('button')!);
    expect(onNavigate).toHaveBeenCalledWith('price');

    fireEvent.click(screen.getByText('大宗交易所').closest('button')!);
    expect(onNavigate).toHaveBeenCalledWith('exchange');

    fireEvent.click(screen.getByText('交易密語助理').closest('button')!);
    expect(onOpenTradeWhisper).toHaveBeenCalledTimes(1);
  });

  it('calls showOverlayWindow when overlay card is clicked', async () => {
    render(
      <HomeDashboard
        league="Settlers"
        divineRate={165}
        onNavigate={onNavigate}
        onOpenTradeWhisper={onOpenTradeWhisper}
        onShowToast={onShowToast}
      />
    );

    fireEvent.click(screen.getByText('懸浮查價小卡').closest('button')!);
    expect(poeApi.showOverlayWindow).toHaveBeenCalledTimes(1);
  });
});
