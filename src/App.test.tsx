import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { App } from './App';
import { SettingsProvider } from './context/SettingsContext';
import axios from 'axios';

vi.mock('axios');
vi.mock('./hooks/useClipboardSync', () => ({
  useClipboardSync: vi.fn(),
  default: vi.fn()
}));

describe('App Component and Hotkey Integration', () => {
  beforeEach(() => {
    vi.mocked(axios.get).mockImplementation((url: string) => {
      if (url.includes('/api/settings')) {
        return Promise.resolve({
          data: {
            league: 'Settlers',
            poesessid: '',
            accountName: 'TestUser',
            hotkey: 'ctrl+c+d'
          }
        });
      }
      if (url.includes('/api/ninja/prices')) {
        return Promise.resolve({
          data: { divineChaosRate: 160 }
        });
      }
      if (url.includes('/api/clipboard/read')) {
        return Promise.resolve({
          data: { text: 'Rarity: Rare\nTest Belt\nHeavy Belt' }
        });
      }
      return Promise.resolve({ data: {} });
    });

    vi.mocked(axios.post).mockImplementation((url: string) => {
      if (url.includes('/api/parse')) {
        return Promise.resolve({
          data: {
            name: 'Test Belt',
            baseType: 'Heavy Belt',
            rarity: 'Rare',
            identified: true
          }
        });
      }
      return Promise.resolve({ data: {} });
    });

    // Mock clipboard readText
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        readText: vi.fn().mockResolvedValue('Rarity: Rare\nTest Belt\nHeavy Belt'),
      },
      writable: true,
      configurable: true,
    });
  });

  it('renders application navbar and default price checker tab', async () => {
    const { unmount } = render(
      <SettingsProvider>
        <App />
      </SettingsProvider>
    );

    const priceTab = await screen.findAllByText(/裝備查價/i);
    expect(priceTab[0]).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/在遊戲中對著裝備按 Ctrl\+C，然後貼上至此處/i)).toBeInTheDocument();
    unmount();
  });

  it('triggers global hotkey (Ctrl+C+D) to switch to price tab and read clipboard', async () => {
    const { unmount } = render(
      <SettingsProvider>
        <App />
      </SettingsProvider>
    );

    await screen.findAllByText(/裝備查價/i);

    // Trigger keydown event for Ctrl+D
    fireEvent.keyDown(window, {
      key: 'd',
      ctrlKey: true,
      code: 'KeyD',
    });

    await waitFor(() => {
      expect(navigator.clipboard.readText).toHaveBeenCalled();
    });
    unmount();
  });
});
