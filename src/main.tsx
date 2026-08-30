import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AlertDataProvider } from './context/AlertDataContext';
import { LanguageProvider } from './context/LanguageContext';
import { SettingsProvider } from './context/SettingsContext';
import { ToastProvider } from './context/ToastContext';
import { SocketProvider } from './context/SocketContext';
import { ThemeProvider } from './context/ThemeContext';
import { router } from './router/index';
import ErrorBoundary from './components/common/ErrorBoundary';
import { OperationsProvider } from './context/OperationsContext';
import { CasesProvider } from './context/CasesContext';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Tactical PWA Bootstrap: Engage Service Worker for offline forensics
registerSW({ immediate: true });

/**
 * Main Entry Point — The SOCOps Neural Root
 * Orchestrates the global injection of context providers and initializes the forensic-grade React tree.
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

const rootElement = document.getElementById('root');

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ErrorBoundary>
        <LanguageProvider>
          <QueryClientProvider client={queryClient}>
            <SettingsProvider>
              <ThemeProvider>
                <AuthProvider>
                  <ToastProvider>
                    <SocketProvider>
                      <AlertDataProvider>
                        <OperationsProvider>
                          <CasesProvider>
                            <RouterProvider router={router} />
                          </CasesProvider>
                        </OperationsProvider>
                      </AlertDataProvider>
                    </SocketProvider>
                  </ToastProvider>
                </AuthProvider>
              </ThemeProvider>
            </SettingsProvider>
          </QueryClientProvider>
        </LanguageProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}
