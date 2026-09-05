import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import OverlayApp from './components/OverlayApp.tsx';
import { SettingsProvider } from './context/SettingsContext.tsx';
import { GameEngineProvider } from './context/GameEngineContext.tsx';

createRoot(document.getElementById('overlay-root')!).render(
  <StrictMode>
    <GameEngineProvider>
      <SettingsProvider>
        <OverlayApp />
      </SettingsProvider>
    </GameEngineProvider>
  </StrictMode>,
);
