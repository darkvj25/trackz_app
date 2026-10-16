import React, { createContext, useState, useCallback, useEffect } from 'react';
import { Toast } from '../components/common/Toast';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    setToast({ message, type });

    if (duration > 0) {
      setTimeout(() => {
        setToast(null);
      }, duration);
    }
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  useEffect(() => {
    const handleInactivityLogout = () => {
      showToast('You were automatically logged out due to inactivity.', 'warning', 5000);
    };

    window.addEventListener('trakz:inactivity-logout', handleInactivityLogout);
    return () => {
      window.removeEventListener('trakz:inactivity-logout', handleInactivityLogout);
    };
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};
