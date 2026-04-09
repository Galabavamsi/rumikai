/**
 * signalCollector.ts — Gathers, normalizes, and caches signals from OS APIs or mock data.
 *
 * Architecture:
 *   1. Check mock mode toggle — if on, return mock signals immediately.
 *   2. For each signal type, check cache freshness (TTL per source).
 *   3. If stale, attempt to fetch from OS API. If permission denied, skip.
 *   4. Write fresh signals to cache, return merged array.
 *
 * Cache strategy: expo-sqlite with per-source TTL tracking.
 * Denial handling: Omit that signal source — engine continues with remaining signals.
 */

import {
  Signal,
  SignalType,
  SIGNAL_TTL,
  CalendarEventSignal,
  StepCountSignal,
  SleepDurationSignal,
  TopContactSignal,
} from '../types/Signal';
import { generateMockSignals } from './mockDataGenerator';

// ─── In-Memory Signal Cache ─────────────────────────────────────────────────
// For simplicity and testability, we use an in-memory cache with TTL checks.
// In production, this would be backed by expo-sqlite.

interface CachedSignal {
  signal: Signal;
  cachedAt: number;
}

const signalCache = new Map<string, CachedSignal>();

/**
 * Collect all available signals from either mock or real sources.
 *
 * @param useMockData — If true, bypass OS APIs and return synthetic signals.
 * @param grantedPermissions — Set of permission keys the user has granted.
 */
export async function collectSignals(
  useMockData: boolean,
  grantedPermissions: Set<string> = new Set(),
): Promise<Signal[]> {
  if (useMockData) {
    return generateMockSignals();
  }

  const signals: Signal[] = [];

  // Calendar events
  if (grantedPermissions.has('calendar')) {
    const calendarSignals = await collectCalendarSignals();
    signals.push(...calendarSignals);
  }

  // Health data (steps + sleep)
  if (grantedPermissions.has('health')) {
    const healthSignals = await collectHealthSignals();
    signals.push(...healthSignals);
  }

  // Contacts
  if (grantedPermissions.has('contacts')) {
    const contactSignals = await collectContactSignals();
    signals.push(...contactSignals);
  }

  return signals;
}

/**
 * Check if a cached signal is still fresh based on its TTL.
 */
export function isCacheFresh(type: SignalType, id: string = 'default'): boolean {
  const key = `${type}:${id}`;
  const cached = signalCache.get(key);
  if (!cached) return false;

  const age = Date.now() - cached.cachedAt;
  return age < SIGNAL_TTL[type];
}

/**
 * Store a signal in the cache.
 */
export function cacheSignal(signal: Signal, id: string = 'default'): void {
  const key = `${signal.type}:${id}`;
  signalCache.set(key, { signal, cachedAt: Date.now() });
}

/**
 * Retrieve a cached signal.
 */
export function getCachedSignal(type: SignalType, id: string = 'default'): Signal | null {
  const key = `${type}:${id}`;
  const cached = signalCache.get(key);
  if (!cached) return null;
  return cached.signal;
}

/**
 * Clear all cached signals.
 */
export function clearCache(): void {
  signalCache.clear();
}

// ─── OS Signal Collectors (Platform-Specific Implementations) ───────────────
// These are stubs that would be replaced with actual Expo module calls.
// In production, they'd call expo-calendar, expo-contacts, etc.

async function collectCalendarSignals(): Promise<Signal[]> {
  const type: SignalType = 'calendar_event';

  // Check cache first
  if (isCacheFresh(type)) {
    const cached = getCachedSignal(type);
    return cached ? [cached] : [];
  }

  try {
    // In production: const { status } = await Calendar.requestCalendarPermissionsAsync();
    // Then: const events = await Calendar.getEventsAsync(calendarIds, startDate, endDate);
    // For now, return empty — mock mode handles the demo case.
    return [];
  } catch {
    // Permission denied or API error — degrade gracefully
    return [];
  }
}

async function collectHealthSignals(): Promise<Signal[]> {
  const signals: Signal[] = [];

  // Steps
  if (!isCacheFresh('step_count')) {
    try {
      // In production: query Health Connect (Android) or HealthKit (iOS)
      // For now, return empty — mock mode handles the demo case.
    } catch {
      // Degrade gracefully
    }
  } else {
    const cached = getCachedSignal('step_count');
    if (cached) signals.push(cached);
  }

  // Sleep
  if (!isCacheFresh('sleep_duration')) {
    try {
      // In production: query sleep data from Health Connect / HealthKit
    } catch {
      // Degrade gracefully
    }
  } else {
    const cached = getCachedSignal('sleep_duration');
    if (cached) signals.push(cached);
  }

  return signals;
}

async function collectContactSignals(): Promise<Signal[]> {
  if (isCacheFresh('top_contact')) {
    const cached = getCachedSignal('top_contact');
    return cached ? [cached] : [];
  }

  try {
    // In production: const { data } = await Contacts.getContactsAsync({ ... });
    // Sort by interaction frequency, return top 5
    return [];
  } catch {
    return [];
  }
}
