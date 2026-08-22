import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { TradeListingView } from './TradeListingView';
import { poeApi } from '../../services/api';

describe('TradeListingView - Travel to Hideout & Whisper Actions', () => {
  const mockListingWithHideoutToken = {
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

  const mockListingWithoutToken = {
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

  const mockTradeResults = {
    id: 'search_test_1',
    searchId: 'search_test_1',
    total: 2,
    estimatedMinPriceChaos: 50,
    estimatedMinPriceDivine: 0.33,
    estimatedMedianPriceChaos: 150,
    estimatedMedianPriceDivine: 1,
    listings: [mockListingWithHideoutToken, mockListingWithoutToken]
  };

  let writeTextMock: any;

  beforeEach(() => {
    vi.clearAllMocks();
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });
  });

  it('renders listings with Travel to Hideout and Whisper buttons', () => {
    render(
      <TradeListingView
        tradeResults={mockTradeResults as any}
        copiedId={null}
        onCopyWhisper={vi.fn()}
      />
    );

    expect(screen.getByText(/刊登清單明細/)).toBeInTheDocument();
    expect(screen.getByText('ProTrader#1234')).toBeInTheDocument();
    expect(screen.getByText('CasualBuyer#5678')).toBeInTheDocument();
    expect(screen.getByText(/⚡ 前往藏身處 \(Travel to Hideout\)/)).toBeInTheDocument();
    expect(screen.getByText(/前往藏身處 \(\/hideout\)/)).toBeInTheDocument();
  });

  it('triggers travelToHideout with searchId and itemId when clicked', async () => {
    const travelSpy = vi.spyOn(poeApi, 'travelToHideout').mockResolvedValueOnce({
      success: true,
      gameTriggered: true,
      officialWhisperSent: true,
      hideoutCmd: '/hideout SlayerGod',
      message: '⚡ 官方直購 (Travel to Hideout) 已觸發，並在遊戲中執行 /hideout SlayerGod！'
    } as any);
    const toastSpy = vi.fn();

    render(
      <TradeListingView
        tradeResults={mockTradeResults as any}
        copiedId={null}
        onCopyWhisper={vi.fn()}
        league="Allflame"
        onShowToast={toastSpy}
      />
    );

    const directBtn = screen.getByText(/⚡ 前往藏身處 \(Travel to Hideout\)/);
    await act(async () => {
      fireEvent.click(directBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith('/hideout SlayerGod');
    expect(travelSpy).toHaveBeenCalledWith({
      token: 'jwt_valid_token_xyz',
      characterName: 'SlayerGod',
      league: 'Allflame',
      searchId: 'search_test_1',
      itemId: 'item_token_1'
    });

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('官方直購'));
    });
  });

  it('copies /hideout and informs user when listing does not have whisperToken', async () => {
    const travelSpy = vi.spyOn(poeApi, 'travelToHideout').mockResolvedValueOnce({
      success: true,
      gameTriggered: false,
      officialWhisperSent: false,
      hideoutCmd: '/hideout WitchMaster',
      message: '已複製 /hideout WitchMaster'
    } as any);
    const toastSpy = vi.fn();

    render(
      <TradeListingView
        tradeResults={mockTradeResults as any}
        copiedId={null}
        onCopyWhisper={vi.fn()}
        league="Allflame"
        onShowToast={toastSpy}
      />
    );

    const noTokenBtn = screen.getByText(/前往藏身處 \(\/hideout\)/);
    await act(async () => {
      fireEvent.click(noTokenBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith('/hideout WitchMaster');
    expect(travelSpy).toHaveBeenCalledWith({
      token: undefined,
      characterName: 'WitchMaster',
      league: 'Allflame',
      searchId: 'search_test_1',
      itemId: 'item_no_token_2'
    });
    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('POESESSID'));
    });
  });

  it('handles official whisper API failure gracefully and shows informative toast', async () => {
    vi.spyOn(poeApi, 'travelToHideout').mockResolvedValueOnce({
      success: true,
      gameTriggered: false,
      officialWhisperSent: false,
      hideoutCmd: '/hideout SlayerGod',
      message: '已複製 /hideout SlayerGod (官方伺服器：角色目前未在遊戲中在線)'
    } as any);
    const toastSpy = vi.fn();

    render(
      <TradeListingView
        tradeResults={mockTradeResults as any}
        copiedId={null}
        onCopyWhisper={vi.fn()}
        league="Allflame"
        onShowToast={toastSpy}
      />
    );

    const directBtn = screen.getByText(/⚡ 前往藏身處 \(Travel to Hideout\)/);
    await act(async () => {
      fireEvent.click(directBtn);
    });

    expect(writeTextMock).toHaveBeenCalledWith('/hideout SlayerGod');

    await waitFor(() => {
      expect(toastSpy).toHaveBeenCalledWith(expect.stringContaining('官方連動提示'));
    });
  });

  it('handles load more and sort changes', () => {
    const loadMoreSpy = vi.fn();
    const sortChangeSpy = vi.fn();

    const extendedResults = {
      ...mockTradeResults,
      total: 50,
      listings: [mockListingWithHideoutToken]
    };

    render(
      <TradeListingView
        tradeResults={extendedResults as any}
        copiedId={null}
        onCopyWhisper={vi.fn()}
        onLoadMore={loadMoreSpy}
        onChangeSortBy={sortChangeSpy}
      />
    );

    const loadMoreBtn = screen.getByText(/載入更多刊登/);
    fireEvent.click(loadMoreBtn);
    expect(loadMoreSpy).toHaveBeenCalled();

    const sortSelect = screen.getByRole('combobox');
    fireEvent.change(sortSelect, { target: { value: 'price_desc' } });
    expect(sortChangeSpy).toHaveBeenCalledWith('price_desc');
  });
});
