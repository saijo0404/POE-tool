import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { TradeListingView } from '../TradeListingView';
import { poeApi } from '../../../services/api';
import type { TravelToHideoutResult } from '../../../domain/trade/types';
import { mockTradeResults } from './tradeListingTestMocks';

describe('TradeListingView - Travel to Hideout Actions', () => {
  let writeTextMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock
      }
    });
  });

  it('triggers travelToHideout with searchId and itemId when clicked', async () => {
    const mockResult: TravelToHideoutResult = {
      success: true,
      gameTriggered: true,
      officialWhisperSent: true,
      hideoutCmd: '/hideout SlayerGod',
      message: '⚡ 官方直購 (Travel to Hideout) 已觸發，並在遊戲中執行 /hideout SlayerGod！'
    };
    const travelSpy = vi.spyOn(poeApi, 'travelToHideout').mockResolvedValueOnce(mockResult);
    const toastSpy = vi.fn();

    render(
      <TradeListingView
        tradeResults={mockTradeResults}
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
    const mockResult: TravelToHideoutResult = {
      success: true,
      gameTriggered: false,
      officialWhisperSent: false,
      hideoutCmd: '/hideout WitchMaster',
      message: '已複製 /hideout WitchMaster'
    };
    const travelSpy = vi.spyOn(poeApi, 'travelToHideout').mockResolvedValueOnce(mockResult);
    const toastSpy = vi.fn();

    render(
      <TradeListingView
        tradeResults={mockTradeResults}
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
    const mockResult: TravelToHideoutResult = {
      success: true,
      gameTriggered: false,
      officialWhisperSent: false,
      hideoutCmd: '/hideout SlayerGod',
      message: '已複製 /hideout SlayerGod (官方伺服器：角色目前未在遊戲中在線)'
    };
    vi.spyOn(poeApi, 'travelToHideout').mockResolvedValueOnce(mockResult);
    const toastSpy = vi.fn();

    render(
      <TradeListingView
        tradeResults={mockTradeResults}
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
});
