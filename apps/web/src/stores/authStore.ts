import { create } from 'zustand';
import { apiFetch, getAccessToken, setAuthTokens } from '../lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  emailVerified: boolean;
  profile?: {
    onboardingCompleted: boolean;
    totalXp: number;
    levelName: string;
    targetScore: number;
    targetExamDate?: string | null;
    dailyStudyMinutes: number;
    bio?: string | null;
    targetAgency?: string | null;
  } | null;
  preferences?: {
    dailyTwkTarget: number;
    dailyTiuTarget: number;
    dailyTkpTarget: number;
    preferredStudyDays: number[];
    isLeaderboardPublic: boolean;
    showQuickTricks: boolean;
    disabilityExtraTime: boolean;
    emailReminders: boolean;
  } | null;
  streak?: {
    currentStreak: number;
    longestStreak: number;
  } | null;
  levelInfo?: {
    name: string;
    minXp: number;
    nextXp: number | null;
    nextLevelName: string | null;
    progressPct: number;
  };
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchMe: () => Promise<void>;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: Boolean(getAccessToken()),
  isAuthenticated: Boolean(getAccessToken()),

  fetchMe: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    try {
      const me = await apiFetch<AuthUser>('/auth/me');
      set({ user: me, isAuthenticated: true, isLoading: false });
    } catch {
      setAuthTokens(null, null);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setSession: (user, accessToken, refreshToken) => {
    setAuthTokens(accessToken, refreshToken);
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('nippia_refresh_token');
    try {
      await apiFetch('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
    } catch {
      // ignore logout error
    }
    setAuthTokens(null, null);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },
}));
