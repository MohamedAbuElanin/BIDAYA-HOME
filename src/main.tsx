import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initPostHog } from './lib/posthog'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { BrowserRouter } from 'react-router-dom'
import { dataStore } from './services/dataStore'

initPostHog();
dataStore.initialize();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
