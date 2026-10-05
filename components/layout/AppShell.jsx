'use client';

import Sidebar from './Sidebar';
import Header from './Header';
import ToastContainer from '@/components/ui/Toast';
import UserPicker from '@/components/ui/UserPicker';
import { useToast } from '@/hooks/useToast';
import { UserProvider } from '@/context/UserContext';
import { createContext, useContext } from 'react';

// Context to share toast functions across the app
const ToastContext = createContext(null);

export function useAppToast() {
  return useContext(ToastContext);
}

/**
 * Shell principal de la aplicación.
 * Envuelve toda la UI con sidebar, header, sistema de toasts y contexto de usuario.
 */
export default function AppShell({ children }) {
  const toast = useToast();

  return (
    <UserProvider>
      <ToastContext.Provider value={toast}>
        <div className="app-layout">
          <Sidebar />
          <div className="app-main">
            <Header />
            <main className="app-content">
              {children}
            </main>
          </div>
        </div>
        <UserPicker />
        <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
      </ToastContext.Provider>
    </UserProvider>
  );
}
