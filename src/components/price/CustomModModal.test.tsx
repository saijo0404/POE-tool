import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CustomModModal } from './CustomModModal';

describe('CustomModModal Component', () => {
  it('should render preset mod buttons and trigger onAddCustomMod when clicked', () => {
    const onAddCustomMod = vi.fn();
    const onClose = vi.fn();

    render(<CustomModModal onAddCustomMod={onAddCustomMod} onClose={onClose} />);

    const lifePresetButton = screen.getByRole('button', { name: /\+# 最大生命/ });
    expect(lifePresetButton).toBeInTheDocument();

    fireEvent.click(lifePresetButton);
    expect(onAddCustomMod).toHaveBeenCalledWith({
      text: '+# 最大生命',
      englishText: '+# to Maximum Life',
      value: 70,
      minValue: 70,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('should allow manual mod input and trigger onAddCustomMod', () => {
    const onAddCustomMod = vi.fn();
    const onClose = vi.fn();

    render(<CustomModModal onAddCustomMod={onAddCustomMod} onClose={onClose} />);

    const textInput = screen.getByPlaceholderText(/自訂詞綴名稱/);
    const minInput = screen.getByPlaceholderText('Min');
    const addButton = screen.getByRole('button', { name: /確認新增/ });

    fireEvent.change(textInput, { target: { value: '+# to Dexterity' } });
    fireEvent.change(minInput, { target: { value: '45' } });
    fireEvent.click(addButton);

    expect(onAddCustomMod).toHaveBeenCalledWith({
      text: '+# to Dexterity',
      englishText: '+# to Dexterity',
      value: 45,
      minValue: 45,
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('should handle cancel button click', () => {
    const onClose = vi.fn();
    render(<CustomModModal onAddCustomMod={vi.fn()} onClose={onClose} />);

    const cancelButton = screen.getByRole('button', { name: '取消' });
    fireEvent.click(cancelButton);
    expect(onClose).toHaveBeenCalled();
  });
});
