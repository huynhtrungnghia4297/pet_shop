'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  authService,
  DEMO_ACCOUNT_CREDENTIALS,
} from '@/services/authService';
import type {
  ApiResponse,
  AuthResponseDto,
  LoginRequestDto,
  MemberDto,
  RegisterRequestDto,
} from '@/types';

interface AuthContextValue {
  member: MemberDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    payload: LoginRequestDto
  ) => Promise<ApiResponse<AuthResponseDto | null>>;
  register: (
    payload: RegisterRequestDto
  ) => Promise<ApiResponse<AuthResponseDto | null>>;
  loginDemo: () => Promise<ApiResponse<AuthResponseDto | null>>;
  logout: () => Promise<void>;
  refreshMember: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [member, setMember] = useState<MemberDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshMember = useCallback(async () => {
    try {
      const res = await authService.getCurrentMember();
      setMember(res.success ? res.data : null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshMember();
    return authService.subscribe(() => {
      void refreshMember();
    });
  }, [refreshMember]);

  const login = useCallback(async (payload: LoginRequestDto) => {
    const res = await authService.login(payload);
    if (res.success && res.data) {
      setMember(res.data.member);
    }
    return res;
  }, []);

  const register = useCallback(async (payload: RegisterRequestDto) => {
    const res = await authService.register(payload);
    if (res.success && res.data) {
      setMember(res.data.member);
    }
    return res;
  }, []);

  const loginDemo = useCallback(async () => {
    return login(DEMO_ACCOUNT_CREDENTIALS);
  }, [login]);

  const logout = useCallback(async () => {
    await authService.logout();
    setMember(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      member,
      isAuthenticated: Boolean(member),
      isLoading,
      login,
      register,
      loginDemo,
      logout,
      refreshMember,
    }),
    [member, isLoading, login, register, loginDemo, logout, refreshMember]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
