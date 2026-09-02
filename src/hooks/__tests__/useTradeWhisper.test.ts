import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTradeWhisper } from '../useTradeWhisper';
import { poeApi } from '../../services/api';

vi.mock('../../services/api', () => ({
  poeApi: {
    triggerInGameCommand: vi.fn().mockResolvedValue(true)
  }
}));

vi.mock('../../utils/tauri', () => ({
  isTauri: vi.fn(() => false)
}));

describe('useTradeWhisper', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes with empty whispers queue and default config', () => {
    const { result } = renderHook(() => useTradeWhisper());
    expect(result.current.whispers).toEqual([]);
    expect(result.current.activeWhisper).toBeNull();
    expect(result.current.config.waitMessageTemplate).toBe('正在刷圖中，請稍候 1 分鐘！');
  });

  it('adds and parses incoming whisper message', () => {
    const { result } = renderHook(() => useTradeWhisper());
    const raw = '@From BuyerPro: Hi, I would like to buy your Mageblood listed for 200 divine in Settlers (stash tab "Sale"; position: left 4, top 8)';

    act(() => {
      result.current.handleNewWhisper(raw);
    });

    expect(result.current.whispers.length).toBe(1);
    expect(result.current.activeWhisper?.sender).toBe('BuyerPro');
    expect(result.current.activeWhisper?.itemName).toBe('Mageblood');
    expect(result.current.activeWhisper?.position).toEqual({ left: 4, top: 8 });
  });

  it('dispatches quick response actions properly', async () => {
    const { result } = renderHook(() => useTradeWhisper());
    const raw = '@From BuyerPro: Hi, I would like to buy your Mageblood listed for 200 divine in Settlers';

    act(() => {
      result.current.handleNewWhisper(raw);
    });

    const target = result.current.activeWhisper!;

    // Test Invite
    await act(async () => {
      const ok = await result.current.handleAction(target, 'invite');
      expect(ok).toBe(true);
    });
    expect(poeApi.triggerInGameCommand).toHaveBeenCalledWith('/invite BuyerPro');

    // Test Wait
    await act(async () => {
      await result.current.handleAction(target, 'wait');
    });
    expect(poeApi.triggerInGameCommand).toHaveBeenCalledWith('@BuyerPro 正在刷圖中，請稍候 1 分鐘！');

    // Test Trade
    await act(async () => {
      await result.current.handleAction(target, 'trade');
    });
    expect(poeApi.triggerInGameCommand).toHaveBeenCalledWith('/tradewith BuyerPro');

    // Test Thanks & Kick
    await act(async () => {
      await result.current.handleAction(target, 'thanksAndKick');
    });
    expect(poeApi.triggerInGameCommand).toHaveBeenCalledWith('@BuyerPro ty gl!\n/kick BuyerPro');

    // Test Hideout
    await act(async () => {
      await result.current.handleAction(target, 'hideout');
    });
    expect(poeApi.triggerInGameCommand).toHaveBeenCalledWith('/hideout');
  });

  it('allows dismissing whispers from queue', () => {
    const { result } = renderHook(() => useTradeWhisper());
    const raw = '@From BuyerPro: Hi, I would like to buy your Mageblood listed for 200 divine in Settlers';

    act(() => {
      result.current.handleNewWhisper(raw);
    });
    expect(result.current.whispers.length).toBe(1);

    act(() => {
      result.current.dismissWhisper(result.current.whispers[0].id);
    });
    expect(result.current.whispers.length).toBe(0);
  });
});
