/**
 * usePermissions.ts — Manage permission states across all data sources.
 *
 * Provides:
 *   - permissions: Record<PermissionKey, PermissionStatus>
 *   - request(key): request a specific permission from the OS
 *   - openSettings(): open the system settings app
 *   - hasMinimumPermissions: true if at least calendar is granted
 *
 * Re-request logic:
 *   - Wait 7 days after denial before re-prompting
 *   - Maximum 2 re-request attempts per permission
 *   - After 2 denials, permanently silent for that permission
 */

import { useCallback, useMemo } from 'react';
import { Linking, Platform } from 'react-native';
import { useStore, PermissionKey, PermissionStatus } from '../store';

interface PermissionRequestTracker {
  lastDeniedAt: number | null;
  denyCount: number;
}

// In-memory tracking — in production, persist to MMKV
const requestTracking = new Map<PermissionKey, PermissionRequestTracker>();

const MAX_RETRY_COUNT = 2;
const RETRY_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function usePermissions() {
  const permissions = useStore((s) => s.permissions);
  const setPermission = useStore((s) => s.setPermission);

  /**
   * Request a specific permission from the OS.
   * Returns the resulting status.
   */
  const request = useCallback(async (key: PermissionKey): Promise<PermissionStatus> => {
    // Check re-request eligibility
    const tracker = requestTracking.get(key) ?? { lastDeniedAt: null, denyCount: 0 };

    if (tracker.denyCount >= MAX_RETRY_COUNT) {
      // Permanently silent — don't bother the user
      return permissions[key];
    }

    if (tracker.lastDeniedAt) {
      const timeSinceDenial = Date.now() - tracker.lastDeniedAt;
      if (timeSinceDenial < RETRY_COOLDOWN_MS) {
        // Too soon to re-request
        return permissions[key];
      }
    }

    try {
      // Platform-specific permission requests
      // In production, this would use expo-calendar, expo-contacts, etc.
      let result: PermissionStatus = 'undetermined';

      switch (key) {
        case 'calendar':
          // const { status } = await Calendar.requestCalendarPermissionsAsync();
          // result = mapExpoStatus(status);
          result = 'granted'; // Stub for demo
          break;

        case 'contacts':
          // const { status } = await Contacts.requestPermissionsAsync();
          // result = mapExpoStatus(status);
          result = 'granted';
          break;

        case 'notifications':
          // const { status } = await Notifications.requestPermissionsAsync();
          // result = mapExpoStatus(status);
          result = 'granted';
          break;

        case 'health':
        case 'appUsage':
        case 'music':
          // These require platform-specific native modules
          result = 'granted';
          break;
      }

      setPermission(key, result);

      if (result === 'denied') {
        requestTracking.set(key, {
          lastDeniedAt: Date.now(),
          denyCount: tracker.denyCount + 1,
        });
      }

      return result;
    } catch {
      setPermission(key, 'denied');
      return 'denied';
    }
  }, [permissions, setPermission]);

  /**
   * Open the system settings app so the user can manually toggle permissions.
   */
  const openSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  /**
   * True if the minimum viable set of permissions is granted.
   * Widget can provide basic value with just calendar access.
   */
  const hasMinimumPermissions = useMemo(
    () => permissions.calendar === 'granted',
    [permissions.calendar],
  );

  return {
    permissions,
    request,
    openSettings,
    hasMinimumPermissions,
  };
}
