import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isInitializing: true,
  setAccessToken: (accessToken) => set({ accessToken, isAuthenticated: Boolean(accessToken) }),
  setUser: (user) => set({ user }),
  setInitializing: (isInitializing) => set({ isInitializing }),
  clearSession: () => set({ user: null, accessToken: null, isAuthenticated: false }),
}));
