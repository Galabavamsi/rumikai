/**
 * store.ts — Global state management using Zustand + MMKV persistence.
 *
 * Manages:
 *   - Widget data state (transient — not persisted)
 *   - Mock mode toggle (persisted)
 *   - Permission states (persisted)
 *   - Onboarding state (persisted)
 *   - Loading/error flags (transient)
 *
 * Persistence: MMKV is synchronous, so the store hydrates instantly on startup.
 */

import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { createMMKV, type MMKV } from 'react-native-mmkv';
import { WidgetData } from './types/WidgetData';

// ─── MMKV Instance ──────────────────────────────────────────────────────────

const storage: MMKV = createMMKV({ id: 'widget-intelligence-store' });

const mmkvStorage: StateStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.remove(name);
  },
};

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

  // ─── Permissions (persisted) ───────────────────────────────────────────
  permissions: Record<PermissionKey, PermissionStatus>;
  setPermission: (key: PermissionKey, status: PermissionStatus) => void;

  // ─── Onboarding (persisted) ────────────────────────────────────────────
  onboardingComplete: boolean;
  setOnboardingComplete: (complete: boolean) => void;
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
    }),
    {
      name: 'widget-intelligence-storage',
      storage: createJSONStorage(() => mmkvStorage),
      // Only persist these fields — widget data is transient
      partialize: (state) => ({
        useMockData: state.useMockData,
        permissions: state.permissions,
        onboardingComplete: state.onboardingComplete,
      }),
    },
  ),
);
