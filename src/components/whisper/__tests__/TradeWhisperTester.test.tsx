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
});
