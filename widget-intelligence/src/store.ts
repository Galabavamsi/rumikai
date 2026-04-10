/**
 * store.ts — Global state management using Zustand + AsyncStorage persistence.
 *
 * Manages:
 *   - Widget data state (transient — not persisted)
 *   - Mock mode toggle (persisted)
 *   - Permission states (persisted)
 *   - Onboarding state (persisted)
 *   - Loading/error flags (transient)
 *
 * Persistence: AsyncStorage is async, so we use Zustand's built-in persist middleware
 * which handles the hydration lifecycle automatically.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WidgetData } from './types/WidgetData';

// ─── Types ──────────────────────────────────────────────────────────────────

export type PermissionKey =
  | 'calendar'
  | 'health'
  | 'contacts'
  | 'notifications'
  | 'appUsage'
  | 'music';

export type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface WidgetStore {
  // ─── Widget Data (transient) ────────────────────────────────────────────
  widgetData: WidgetData | null;
  isLoading: boolean;
  setWidgetData: (data: WidgetData) => void;
  updateWidgetData: (partial: Partial<WidgetData>) => void;
  setLoading: (loading: boolean) => void;

  // ─── Mock Mode (persisted) ─────────────────────────────────────────────
  useMockData: boolean;
  toggleMockMode: () => void;
  setMockMode: (enabled: boolean) => void;

  // ─── Manual Unread Count (persisted) — for real mode testing ───────────
  manualUnreadCount: number;
  setManualUnreadCount: (count: number) => void;

  // ─── Permissions (persisted) ───────────────────────────────────────────
  permissions: Record<PermissionKey, PermissionStatus>;
  setPermission: (key: PermissionKey, status: PermissionStatus) => void;

  // ─── Onboarding (persisted) ────────────────────────────────────────────
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;

  // ─── Hydration ─────────────────────────────────────────────────────────
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useStore = create<WidgetStore>()(
  persist(
    (set) => ({
      // Widget Data — transient
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

      // Manual Unread Count — allows testing in real mode
      manualUnreadCount: 0,
      setManualUnreadCount: (count) => set({ manualUnreadCount: Math.max(0, Math.round(count)) }),

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

      // Hydration tracking
      _hasHydrated: false,
      setHasHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: 'widget-intelligence-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist these fields — widget data is transient
      partialize: (state) => ({
        useMockData: state.useMockData,
        manualUnreadCount: state.manualUnreadCount,
        permissions: state.permissions,
        onboardingComplete: state.onboardingComplete,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
