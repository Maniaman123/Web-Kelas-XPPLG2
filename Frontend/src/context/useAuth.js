import { useContext } from 'react';
import AuthContext from './AuthContext';

// Hook-only file — no components, no context creation.
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
