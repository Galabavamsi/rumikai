/**
 * usePermissions.ts — Manage permission states across all data sources.
 *
 * Provides:
 *   - permissions: Record<PermissionKey, PermissionStatus>
 *   - request(key): request a specific permission from the OS
 *   - checkAll(): re-check all permission statuses from OS
 *   - openSettings(): open the system settings app
 *   - hasMinimumPermissions: true if at least calendar is granted
 *
 * Real implementation:
 *   - Calendar: expo-calendar API
 *   - Contacts: expo-contacts API
 *   - Notifications: expo-notifications API
 *   - Health/AppUsage/Music: require platform-specific native modules (stubbed)
 */

import { useCallback, useEffect, useMemo } from 'react';
import { Linking, Platform } from 'react-native';
import * as Calendar from 'expo-calendar';
import * as Contacts from 'expo-contacts';
import * as Notifications from 'expo-notifications';
import { useStore, PermissionKey, PermissionStatus } from '../store';

/**
 * Map Expo's permission status string to our PermissionStatus type.
 */
function mapExpoStatus(status: string): PermissionStatus {
  switch (status) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'denied';
    default:
      return 'undetermined';
  }
}

export function usePermissions() {
  const permissions = useStore((s) => s.permissions);
  const setPermission = useStore((s) => s.setPermission);

  /**
   * Check the current status of a single permission without requesting it.
   */
  const check = useCallback(async (key: PermissionKey): Promise<PermissionStatus> => {
    try {
      switch (key) {
        case 'calendar': {
          const { status } = await Calendar.getCalendarPermissionsAsync();
          return mapExpoStatus(status);
        }
        case 'contacts': {
          const { status } = await Contacts.getPermissionsAsync();
          return mapExpoStatus(status);
        }
        case 'notifications': {
          const { status } = await Notifications.getPermissionsAsync();
          return mapExpoStatus(status);
        }
        // These require platform-specific native modules not available via Expo
        case 'health':
        case 'appUsage':
        case 'music':
          // Return current stored state — no API to check
          return permissions[key];
      }
    } catch {
      return 'undetermined';
    }
  }, [permissions]);

  /**
   * Check all permissions on mount and sync with OS state.
   * This ensures our stored state stays in sync if the user
   * changed permissions in system settings.
   */
  const checkAll = useCallback(async () => {
    const keys: PermissionKey[] = ['calendar', 'contacts', 'notifications'];
    for (const key of keys) {
      const status = await check(key);
      setPermission(key, status);
    }
  }, [check, setPermission]);

  // Sync with OS on mount
  useEffect(() => {
    checkAll();
  }, []);

  /**
   * Request a specific permission from the OS.
   * Returns the resulting status.
   */
  const request = useCallback(async (key: PermissionKey): Promise<PermissionStatus> => {
    try {
      let result: PermissionStatus = 'undetermined';

      switch (key) {
        case 'calendar': {
          const { status } = await Calendar.requestCalendarPermissionsAsync();
          result = mapExpoStatus(status);
          break;
        }
        case 'contacts': {
          const { status } = await Contacts.requestPermissionsAsync();
          result = mapExpoStatus(status);
          break;
        }
        case 'notifications': {
          const { status } = await Notifications.requestPermissionsAsync();
          result = mapExpoStatus(status);
          break;
        }
        // Platform-specific permissions that need native modules
        case 'health': {
          // Android: Requires Google Health Connect SDK
          // For now, mark as granted in mock mode; in real mode it's unsupported
          const useMock = useStore.getState().useMockData;
          result = useMock ? 'granted' : 'undetermined';
          break;
        }
        case 'appUsage': {
          // Android: Requires PACKAGE_USAGE_STATS via Settings intent
          // Cannot be requested via standard permission dialog
          if (Platform.OS === 'android') {
            // Open usage access settings — user must manually toggle
            try {
              await Linking.sendIntent('android.settings.USAGE_ACCESS_SETTINGS');
            } catch {
              // Fallback: open general settings
              await Linking.openSettings();
            }
          }
          result = 'undetermined'; // We can't know until they return
          break;
        }
        case 'music': {
          // No standard permission needed for media session detection
          const useMock = useStore.getState().useMockData;
          result = useMock ? 'granted' : 'undetermined';
          break;
        }
      }

      setPermission(key, result);
      return result;
    } catch {
      setPermission(key, 'denied');
      return 'denied';
    }
  }, [setPermission]);

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

  /**
   * Check if a permission key requires a special settings page
   * rather than a standard OS permission dialog.
   */
  const requiresSetup = useCallback((key: PermissionKey): boolean => {
    return key === 'health' || key === 'appUsage' || key === 'music';
  }, []);

  return {
    permissions,
    request,
    check,
    checkAll,
    openSettings,
    hasMinimumPermissions,
    requiresSetup,
  };
}
