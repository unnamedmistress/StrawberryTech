import { StrictMode } from 'react'
import { ErrorBoundary } from '../../shared/ErrorBoundary'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { UserProvider } from './shared/UserProvider'
import { NotificationProvider } from './contexts/NotificationContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NotificationProvider>
      <UserProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </UserProvider>
    </NotificationProvider>
  </StrictMode>
)
