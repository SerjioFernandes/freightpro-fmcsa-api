import { create } from 'zustand';
import type { User } from '../types/user.types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  justLoggedOut: boolean;
  adminActivation: {
    isActive: boolean;
    title: string;
    subtitle: string;
  };
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  checkAuth: () => void;
  clearError: () => void;
  dismissAdminActivation: () => void;
  clearLogoutFlag: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true, // Start as loading to prevent premature routing decisions
  error: null,
  justLoggedOut: false,
  adminActivation: {
    isActive: false,
    title: '',
    subtitle: '',
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
    set({ user, isAuthenticated: !!user });
  },
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token, isAuthenticated: !!token, justLoggedOut: false });
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      if (response.token && response.user) {
        const isAdminUser = response.user.role === 'admin';
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        set({
          token: response.token,
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          justLoggedOut: false,
          adminActivation: isAdminUser
            ? {
                isActive: true,
                title: 'Admin Mode Activated',
                subtitle: `Welcome back, ${response.user.company || 'Admin'}`,
              }
            : { isActive: false, title: '', subtitle: '' },
        });

        if (isAdminUser) {
          setTimeout(() => {
            set({
              adminActivation: {
                isActive: false,
                title: '',
                subtitle: '',
              },
            });
          }, 6500);
        }

        return response.user;
      }
      return null;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    authService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      justLoggedOut: true,
    });
  },

  checkAuth: () => {
    set({ isLoading: true });
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          justLoggedOut: false,
        });
      } catch {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          justLoggedOut: false,
        });
      }
    } else {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        justLoggedOut: false,
      });
    }
  },

  clearError: () => set({ error: null }),

  dismissAdminActivation: () =>
    set({
      adminActivation: { isActive: false, title: '', subtitle: '' },
    }),
  clearLogoutFlag: () => set({ justLoggedOut: false }),
}));

