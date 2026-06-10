import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as authApi from '../services/api/auth';

export type UserRole = 'employee' | 'admin';

export interface UserInfo {
  userId: number;
  username: string;
  displayName: string;
  role: UserRole;
  points?: number;
  avatar?: string;
}

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const TOKEN_KEY = 'token';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        const res = await authApi.login({ username, password });
        localStorage.setItem(TOKEN_KEY, res.token);
        set({
          user: {
            userId: res.userId,
            username: res.username,
            displayName: res.nickname,
            role: res.role.toLowerCase() as UserRole,
          },
          isAuthenticated: true,
        });
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          localStorage.removeItem(TOKEN_KEY);
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
