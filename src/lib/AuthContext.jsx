import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

const STORAGE_KEY = 'futurework_user';

function loadUser() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(loadUser);

  const login = (userData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, login, logout,
      isLoadingAuth: false, isLoadingPublicSettings: false,
      authError: null, navigateToLogin: () => {}, checkUserAuth: async () => {}, checkAppState: async () => {},
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
