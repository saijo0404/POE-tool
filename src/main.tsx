import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { SettingsProvider } from './context/SettingsContext.tsx';
import { GameEngineProvider } from './context/GameEngineContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GameEngineProvider>
      <SettingsProvider>
        <App />
      </SettingsProvider>
    </GameEngineProvider>
  </StrictMode>,
);
