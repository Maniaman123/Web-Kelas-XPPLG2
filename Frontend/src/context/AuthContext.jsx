import { createContext } from 'react';

// This file ONLY exports the raw context object.
// The Provider component lives in AuthProvider.jsx.
// The useAuth hook lives in useAuth.js.
const AuthContext = createContext(null);

export default AuthContext;
