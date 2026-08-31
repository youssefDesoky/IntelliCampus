import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './index.css'
import './i18n'
import { ErrorProvider } from './contexts/ErrorContext.jsx'
import { ToastProvider } from './contexts/ToastContext.jsx'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 30_000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
    },
  },
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </ErrorProvider>
    </QueryClientProvider>
  </StrictMode>,
)
