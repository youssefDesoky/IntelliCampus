import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { registerSW } from 'virtual:pwa-register'
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


window.__updateSW = null
window.__deferredPrompt = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.__deferredPrompt = e
})

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    for (const reg of regs) {
      const url = reg.scriptURL || ''
      if (url.endsWith('/push-sw.js') || url.includes('firebase-messaging-sw')) {
        reg.unregister()
      }
    }
  })
}

const updateSW = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent('sw:updateReady'))
  },
  onOfflineReady() {},
})
window.__updateSW = updateSW

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
