import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  role: string;
  bgmiVerified: boolean;
  kycStatus: string;
  walletBalance: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await axios.post(`${API}/api/v1/auth/login`, { email, password });
          if (data.success) {
            set({
              user: data.user,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            });
            axios.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
          }
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          await axios.post(`${API}/api/v1/auth/logout`, { refreshToken });
        } catch {/* ignore */}
        set({ user: null, accessToken: null, refreshToken: null });
        delete axios.defaults.headers.common['Authorization'];
      },

      setUser: (user) => set({ user }),
      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      },
    }),
    {
      name: 'playhive-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
