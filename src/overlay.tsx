import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import OverlayApp from './components/OverlayApp.tsx';
import { SettingsProvider } from './context/SettingsContext.tsx';

createRoot(document.getElementById('overlay-root')!).render(
  <StrictMode>
    <SettingsProvider>
      <OverlayApp />
    </SettingsProvider>
  </StrictMode>,
);
