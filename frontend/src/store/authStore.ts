import { create } from 'zustand';
import type { User } from '../types/user.types';
import { authService } from '../services/auth.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  adminActivation: {
    isActive: boolean;
    title: string;
    subtitle: string;
  };
  
  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  clearError: () => void;
  dismissAdminActivation: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: true, // Start as loading to prevent premature routing decisions
  error: null,
  adminActivation: {
    isActive: false,
    title: '',
    subtitle: '',
  },

  setUser: (user) => {
    set((state) => ({
      user,
      isAuthenticated: !!user,
      adminActivation: state.adminActivation,
    }));
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  },
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set((state) => ({
      token,
      isAuthenticated: !!token,
      adminActivation: state.adminActivation,
    }));
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      if (response.token && response.user) {
        const isAdminUser = response.user.role === 'admin';
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));

        set((state) => ({
          token: response.token,
          user: response.user,
          isAuthenticated: true,
          isLoading: false,
          adminActivation: isAdminUser
            ? {
                isActive: true,
                title: 'Admin Mode Activated',
                subtitle: `Welcome back, ${response.user.company || 'Admin'}`,
              }
            : state.adminActivation,
        }));

        if (isAdminUser) {
          setTimeout(() => {
            set((current) => {
              if (!current.adminActivation.isActive) {
                return current;
              }
              return {
                ...current,
                adminActivation: {
                  isActive: false,
                  title: '',
                  subtitle: '',
                },
              };
            });
          }, 1800);
        }
      }
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
    });
  },

  checkAuth: () => {
    set({ isLoading: true });
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set((state) => ({
          token,
          user,
          isAuthenticated: true,
          isLoading: false,
          adminActivation: state.adminActivation,
        }));
      } catch {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isLoading: false,
          adminActivation: { isActive: false, title: '', subtitle: '' },
        });
      }
    } else {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        adminActivation: { isActive: false, title: '', subtitle: '' },
      });
    }
  },

  clearError: () => set({ error: null }),

  dismissAdminActivation: () =>
    set((state) => ({
      ...state,
      adminActivation: { isActive: false, title: '', subtitle: '' },
    })),
}));

