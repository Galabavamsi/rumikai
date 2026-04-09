/**
 * store.ts — Global state management using Zustand.
 *
 * Manages:
 *   - Widget data state
 *   - Mock mode toggle
 *   - Permission states
 *   - Loading/error flags
 */

import { create } from 'zustand';
import { WidgetData, Suggestion } from '../types/WidgetData';

export type PermissionKey =
  | 'calendar'
  | 'health'
  | 'contacts'
  | 'notifications'
  | 'appUsage'
  | 'music';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface WidgetStore {
  // ─── Widget Data ──────────────────────────────────────────────────────────
  widgetData: WidgetData | null;
  isLoading: boolean;
  setWidgetData: (data: WidgetData) => void;
  updateWidgetData: (partial: Partial<WidgetData>) => void;
  setLoading: (loading: boolean) => void;

  // ─── Mock Mode ────────────────────────────────────────────────────────────
  useMockData: boolean;
  toggleMockMode: () => void;
  setMockMode: (enabled: boolean) => void;

  // ─── Permissions ──────────────────────────────────────────────────────────
  permissions: Record<PermissionKey, PermissionStatus>;
  setPermission: (key: PermissionKey, status: PermissionStatus) => void;

  // ─── Onboarding ───────────────────────────────────────────────────────────
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
}

export const useStore = create<WidgetStore>((set) => ({
  // Widget Data
  widgetData: null,
  isLoading: false,
  setWidgetData: (data) => set({ widgetData: data }),
  updateWidgetData: (partial) =>
    set((state) => ({
      widgetData: state.widgetData
        ? { ...state.widgetData, ...partial }
        : null,
    })),
  setLoading: (loading) => set({ isLoading: loading }),

  // Mock Mode — default ON for demo purposes
  useMockData: true,
  toggleMockMode: () => set((state) => ({ useMockData: !state.useMockData })),
  setMockMode: (enabled) => set({ useMockData: enabled }),

  // Permissions — all undetermined initially
  permissions: {
    calendar: 'undetermined',
    health: 'undetermined',
    contacts: 'undetermined',
    notifications: 'undetermined',
    appUsage: 'undetermined',
    music: 'undetermined',
  },
  setPermission: (key, status) =>
    set((state) => ({
      permissions: { ...state.permissions, [key]: status },
    })),

  // Onboarding
  onboardingComplete: false,
  setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),
}));
