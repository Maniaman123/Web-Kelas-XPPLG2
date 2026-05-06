import { useState, useCallback } from 'react';
import AuthContext from './AuthContext';
import { storage } from '../utils/storage';

// Initialize the DB once at module level
storage.init();

function getInitialUser() {
  const savedSession = localStorage.getItem('activeUser');
  if (savedSession) {
    try { return JSON.parse(savedSession); } catch { return null; }
  }
  return null;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser);
  const [showLogin, setShowLogin] = useState(false);

  const isAuthenticated = !!user;
  const role = user?.role || 'guest';

  const login = useCallback((usernameOrEmail, password) => {
    const users = storage.getUsers();
    const foundUser = users.find(
      u => (u.username === usernameOrEmail || u.email === usernameOrEmail) && u.password === password
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('activeUser', JSON.stringify(foundUser));
      setShowLogin(false);
      return { success: true };
    }

    return { success: false, error: 'Username/Email atau password salah' };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('activeUser');
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, role, login, logout, showLogin, setShowLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
}
