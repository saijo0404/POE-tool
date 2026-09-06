import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import { useSettings } from '../../../hooks/useSettings';
import { useGameEngine } from '../../../hooks/useGameEngine';
import { ENGINE_METADATA } from '../../../domain/engine/types';
import { poeApi } from '../../../services/api';

vi.mock('../../../hooks/useSettings');
vi.mock('../../../hooks/useGameEngine');
vi.mock('../../../services/api', () => ({
  poeApi: {
    showOverlayWindow: vi.fn().mockResolvedValue(undefined)
  }
}));

describe('Sidebar Component', () => {
  const setActiveTab = vi.fn();
  const onToggleCollapse = vi.fn();
  const onOpenTradeWhisper = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSettings).mockReturnValue({
      settings: {
        league: 'Settlers',
        poesessid: '',
        accountName: '',
        autoSnapshotEnabled: true,
        autoSnapshotIntervalMinutes: 60,
        useDemoData: false,
        focusModeEnabled: false
      },
      isLoading: false,
      updateSettings: vi.fn(),
      refreshSettings: vi.fn(),
      refreshCharacters: vi.fn(),
      refreshDivineRate: vi.fn(),
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

  it('renders all categorized navigation items in expanded mode', () => {
    render(
      <Sidebar
        activeTab="price"
        setActiveTab={setActiveTab}
        isCollapsed={false}
        onToggleCollapse={onToggleCollapse}
        onOpenTradeWhisper={onOpenTradeWhisper}
      />
    );

    expect(screen.getByText('首頁儀表板')).toBeInTheDocument();
    expect(screen.getByText('裝備查價')).toBeInTheDocument();
    expect(screen.getByText('大宗交易所')).toBeInTheDocument();
    expect(screen.getByText('輿圖天賦策略')).toBeInTheDocument();
    expect(screen.getByText('工藝期望精算')).toBeInTheDocument();
    expect(screen.getByText('密語助理')).toBeInTheDocument();
    expect(screen.getByText('懸浮小卡')).toBeInTheDocument();
  });

  it('hides text labels when isCollapsed is true', () => {
    render(
      <Sidebar
        activeTab="price"
        setActiveTab={setActiveTab}
        isCollapsed={true}
        onToggleCollapse={onToggleCollapse}
        onOpenTradeWhisper={onOpenTradeWhisper}
      />
    );

    expect(screen.queryByText('首頁儀表板')).not.toBeInTheDocument();
    expect(screen.queryByText('裝備查價')).not.toBeInTheDocument();
  });

  it('calls onToggleCollapse when collapse button is clicked', () => {
    render(
      <Sidebar
        activeTab="price"
        setActiveTab={setActiveTab}
        isCollapsed={false}
        onToggleCollapse={onToggleCollapse}
        onOpenTradeWhisper={onOpenTradeWhisper}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /收合側邊欄/i }));
    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it('calls setActiveTab when clicking nav item', () => {
    render(
      <Sidebar
        activeTab="price"
        setActiveTab={setActiveTab}
        isCollapsed={false}
        onToggleCollapse={onToggleCollapse}
        onOpenTradeWhisper={onOpenTradeWhisper}
      />
    );

    fireEvent.click(screen.getByText('大宗交易所'));
    expect(setActiveTab).toHaveBeenCalledWith('exchange');
  });

  it('filters out PoE 1 items in PoE 2 mode when focusModeEnabled is true', () => {
    vi.mocked(useSettings).mockReturnValue({
      settings: {
        league: 'Settlers',
        poesessid: '',
        accountName: '',
        autoSnapshotEnabled: true,
        autoSnapshotIntervalMinutes: 60,
        useDemoData: false,
        focusModeEnabled: true
      },
      isLoading: false,
      updateSettings: vi.fn(),
      refreshSettings: vi.fn(),
      refreshCharacters: vi.fn(),
      refreshDivineRate: vi.fn(),
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
      currentEngine: 'poe2',
      mode: 'auto',
      metadata: ENGINE_METADATA.poe2,
      features: ENGINE_METADATA.poe2.features,
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

    render(
      <Sidebar
        activeTab="price"
        setActiveTab={setActiveTab}
        isCollapsed={false}
        onToggleCollapse={onToggleCollapse}
        onOpenTradeWhisper={onOpenTradeWhisper}
      />
    );

    expect(screen.getByText('首頁儀表板')).toBeInTheDocument();
    expect(screen.getByText('裝備查價')).toBeInTheDocument();
    expect(screen.queryByText('輿圖天賦策略')).not.toBeInTheDocument();
    expect(screen.queryByText('工藝期望精算')).not.toBeInTheDocument();
  });

  it('triggers whisper and overlay actions from bottom buttons', () => {
    render(
      <Sidebar
        activeTab="price"
        setActiveTab={setActiveTab}
        isCollapsed={false}
        onToggleCollapse={onToggleCollapse}
        onOpenTradeWhisper={onOpenTradeWhisper}
      />
    );

    fireEvent.click(screen.getByText('密語助理'));
    expect(onOpenTradeWhisper).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText('懸浮小卡'));
    expect(poeApi.showOverlayWindow).toHaveBeenCalledTimes(1);
  });
});
