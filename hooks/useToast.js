'use client';

import { useState, useCallback } from 'react';

/**
 * Hook para manejar notificaciones toast.
 * Maneja una cola de toasts con auto-dismiss.
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = 'info', title, message, duration = 4000 }) => {
    const id = Date.now() + Math.random();
    
    setToasts((prev) => [...prev, { id, type, title, message }]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (title, message) => addToast({ type: 'success', title, message }),
    [addToast]
  );

  const error = useCallback(
    (title, message) => addToast({ type: 'error', title, message }),
    [addToast]
  );

  const warning = useCallback(
    (title, message) => addToast({ type: 'warning', title, message }),
    [addToast]
  );

  const info = useCallback(
    (title, message) => addToast({ type: 'info', title, message }),
    [addToast]
  );

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}
