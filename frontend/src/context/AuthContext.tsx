import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type { User, AuthState, LoginPayload, RegisterPayload } from '../types/auth';
import { authApi } from '../api/auth';

interface AuthContextValue extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // On app load — restore session from localStorage
  useEffect(() => {
    const token = localStorage.getItem('rs_token');
    const userRaw = localStorage.getItem('rs_user');
    if (token && userRaw) {
      try {
        const user: User = JSON.parse(userRaw);
        setState({ user, token, isAuthenticated: true, isLoading: false });
      } catch {
        setState(s => ({ ...s, isLoading: false }));
      }
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (payload: LoginPayload) => {
    const res = await authApi.login(payload);
    localStorage.setItem('rs_token', res.token);
    localStorage.setItem('rs_user', JSON.stringify(res.user));
    setState({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
  };

  const register = async (payload: RegisterPayload) => {
    const res = await authApi.register(payload);
    localStorage.setItem('rs_token', res.token);
    localStorage.setItem('rs_user', JSON.stringify(res.user));
    setState({ user: res.user, token: res.token, isAuthenticated: true, isLoading: false });
  };

  const logout = () => {
    localStorage.removeItem('rs_token');
    localStorage.removeItem('rs_user');
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be inside AuthProvider');
  return ctx;
}