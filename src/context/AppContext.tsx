import React, { createContext, useContext, useState, useEffect } from 'react';
import { isFirebaseConfigured } from '../firebase';
import { CONFIG } from '../data';

export interface UserProfile {
  email: string;
  displayName: string;
  role: 'admin' | 'affiliate';
  uid: string;
}

interface AppContextType {
  user: UserProfile | null;
  login: (email: string, role?: 'admin' | 'affiliate') => void;
  logout: () => void;
  previewMode: boolean;
  isPreviewMode: boolean;
  setPreviewMode: (val: boolean) => void;
  isFirebaseConfigured: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Saved preview mode (default true if keys are empty so user can review design)
  const [previewMode, setPreviewModeState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('upt_preview_mode');
      if (saved !== null) return saved === 'true';
      return !isFirebaseConfigured;
    } catch {
      return true;
    }
  });

  // Current session user (persisted in localStorage for preview/testing)
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const savedUser = localStorage.getItem('upt_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const setPreviewMode = (val: boolean) => {
    setPreviewModeState(val);
    try {
      localStorage.setItem('upt_preview_mode', String(val));
    } catch {
      // ignore
    }
  };

  const login = (email: string, role?: 'admin' | 'affiliate') => {
    const determinedRole = role || (email.toLowerCase() === CONFIG.adminEmail.toLowerCase() ? 'admin' : 'affiliate');
    const newUser: UserProfile = {
      email,
      displayName: email.split('@')[0],
      role: determinedRole,
      uid: 'user-' + Math.random().toString(36).substring(2, 9),
    };
    setUser(newUser);
    try {
      localStorage.setItem('upt_user', JSON.stringify(newUser));
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem('upt_user');
    } catch {
      // ignore
    }
  };

  const activePreview = !isFirebaseConfigured ? previewMode : false;

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        previewMode: activePreview,
        isPreviewMode: activePreview,
        setPreviewMode,
        isFirebaseConfigured,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const useAppContext = useApp;

