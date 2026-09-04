import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TradeWhisperTester } from '../TradeWhisperTester';
import { DEFAULT_TRADE_WHISPER_CONFIG } from '../../../domain/tradeWhisper/constants';

describe('TradeWhisperTester', () => {
  it('renders presets and handles preset click simulation', () => {
    const onSimulate = vi.fn();
    const onUpdateConfig = vi.fn();

    render(
      <TradeWhisperTester
        onSimulate={onSimulate}
        config={DEFAULT_TRADE_WHISPER_CONFIG}
        onUpdateConfig={onUpdateConfig}
      />
    );

    const presetBtn = screen.getByText('英文裝備密語 (含分頁與座標)');
    fireEvent.click(presetBtn);

    expect(onSimulate).toHaveBeenCalled();
    const simulatedMsg = onSimulate.mock.calls[0][0];
    expect(simulatedMsg).toContain('@From <VIP> ShadowNinja');
  });

  it('updates configuration when editing templates', () => {
    const onSimulate = vi.fn();
    const onUpdateConfig = vi.fn();

    render(
      <TradeWhisperTester
        onSimulate={onSimulate}
        config={DEFAULT_TRADE_WHISPER_CONFIG}
        onUpdateConfig={onUpdateConfig}
      />
    );

    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '請稍候 30 秒！' } });

    expect(onUpdateConfig).toHaveBeenCalledWith({
      waitMessageTemplate: '請稍候 30 秒！'
    });
  });

  it('adds custom whisper template via form and allows reset', () => {
    const onSimulate = vi.fn();
    const onUpdateConfig = vi.fn();

    render(
      <TradeWhisperTester
        onSimulate={onSimulate}
        config={DEFAULT_TRADE_WHISPER_CONFIG}
        onUpdateConfig={onUpdateConfig}
      />
    );

    const labelInput = screen.getByPlaceholderText(/範本標籤/);
    const msgInput = screen.getByPlaceholderText(/回覆文字/);

    fireEvent.change(labelInput, { target: { value: '⚡ 快速刷圖中' } });
    fireEvent.change(msgInput, { target: { value: '請稍等 30 秒馬上來！' } });

    fireEvent.click(screen.getByRole('button', { name: /新增/ }));

    expect(onUpdateConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        customTemplates: expect.arrayContaining([
          expect.objectContaining({
            label: '⚡ 快速刷圖中',
            message: '請稍等 30 秒馬上來！'
          })
        ])
      })
    );

    // Test Reset
    fireEvent.click(screen.getByRole('button', { name: /重設預設值/ }));
    expect(onUpdateConfig).toHaveBeenCalledWith(
      expect.objectContaining({
        customTemplates: expect.any(Array)
      })
    );
  });
});
