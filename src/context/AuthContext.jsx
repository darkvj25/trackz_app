import React, { createContext, useState, useEffect, useRef, useCallback } from 'react';
import { authService } from '../services/authService';
import {
  INACTIVITY_TIMEOUT_MS,
  LAST_ACTIVITY_STORAGE_KEY,
  INACTIVITY_LOGOUT_FLAG
} from '../utils/constants';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wasAutoLoggedOut, setWasAutoLoggedOut] = useState(false);
  const lastActivityRef = useRef(Date.now());

  // Check stored user and session validity on initial mount
  useEffect(() => {
    const initialUser = authService.getCurrentUser();
    if (initialUser) {
      const savedLastActive = localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY);
      const now = Date.now();

      if (savedLastActive && now - parseInt(savedLastActive, 10) >= INACTIVITY_TIMEOUT_MS) {
        // Session expired while application was closed or inactive
        authService.logout();
        localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
        sessionStorage.setItem(INACTIVITY_LOGOUT_FLAG, 'true');
        setUser(null);
        setWasAutoLoggedOut(true);
      } else {
        setUser(initialUser);
        lastActivityRef.current = now;
        localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, now.toString());
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  // Monitor user activity and auto logout when inactive
  useEffect(() => {
    if (!user) return;

    const updateActivity = () => {
      const now = Date.now();
      // Throttle updates to local storage (at most once every 1 second)
      if (now - lastActivityRef.current > 1000) {
        lastActivityRef.current = now;
        localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, now.toString());
      }
    };

    const checkInactivity = () => {
      const savedLastActive = localStorage.getItem(LAST_ACTIVITY_STORAGE_KEY);
      const lastActive = savedLastActive ? parseInt(savedLastActive, 10) : lastActivityRef.current;
      const now = Date.now();

      if (now - lastActive >= INACTIVITY_TIMEOUT_MS) {
        authService.logout();
        localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
        sessionStorage.setItem(INACTIVITY_LOGOUT_FLAG, 'true');
        setUser(null);
        setWasAutoLoggedOut(true);
        window.dispatchEvent(new CustomEvent('trakz:inactivity-logout'));
      }
    };

    const userActivityEvents = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

    userActivityEvents.forEach((eventType) => {
      window.addEventListener(eventType, updateActivity, { passive: true });
    });

    // Periodically verify activity status
    const timerInterval = setInterval(checkInactivity, 5000);

    // Re-verify immediately when tab or window regains focus
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        checkInactivity();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    return () => {
      userActivityEvents.forEach((eventType) => {
        window.removeEventListener(eventType, updateActivity);
      });
      clearInterval(timerInterval);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
    };
  }, [user]);

  const login = async (emailOrPhone, password) => {
    setLoading(true);
    try {
      const result = await authService.login(emailOrPhone, password);
      setUser(result.user);
      const now = Date.now();
      lastActivityRef.current = now;
      localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, now.toString());
      sessionStorage.removeItem(INACTIVITY_LOGOUT_FLAG);
      setWasAutoLoggedOut(false);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (fullName, email, phone, password, role = 'customer', merchantDetails = null) => {
    setLoading(true);
    try {
      const result = await authService.signUp(fullName, email, phone, password, role, merchantDetails);
      if (role === 'rider' || result?.pendingApproval) {
        // Pending riders are NOT logged in automatically!
        setUser(null);
        authService.logout();
      } else {
        setUser(result.user);
        const now = Date.now();
        lastActivityRef.current = now;
        localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, now.toString());
        sessionStorage.removeItem(INACTIVITY_LOGOUT_FLAG);
        setWasAutoLoggedOut(false);
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    const result = await authService.updateProfile(updates);
    setUser(result.user);
    return result;
  };

  const approveRider = async (riderId) => {
    const result = await authService.approveRider(riderId || user?.id);
    setUser(result.user);
    return result;
  };

  const logout = useCallback(() => {
    authService.logout();
    localStorage.removeItem(LAST_ACTIVITY_STORAGE_KEY);
    sessionStorage.removeItem(INACTIVITY_LOGOUT_FLAG);
    setUser(null);
    setWasAutoLoggedOut(false);
  }, []);

  const resetInactivityTimer = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    localStorage.setItem(LAST_ACTIVITY_STORAGE_KEY, now.toString());
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signUp,
        updateProfile,
        approveRider,
        logout,
        wasAutoLoggedOut,
        resetInactivityTimer
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
