/**
 * Settings Screen — Permission management and developer options.
 *
 * Features:
 *   - Toggle per data source with status badges (granted / denied / not set)
 *   - Expandable "why we need this" sections
 *   - Direct link to system settings
 *   - Mock data toggle
 *   - Architecture info
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePermissions } from '../src/hooks/usePermissions';
import { useStore, PermissionKey } from '../src/store';

interface PermissionInfo {
  key: PermissionKey;
  icon: string;
  label: string;
  description: string;
}

const PERMISSION_INFO: PermissionInfo[] = [
  {
    key: 'calendar',
    icon: '📅',
    label: 'calendar',
    description: 'reads your next 5 events in a 24-hour window to surface meeting reminders and schedule-aware suggestions',
  },
  {
    key: 'health',
    icon: '❤️',
    label: 'health data',
    description: 'reads today\'s step count and last night\'s sleep duration to provide wellness nudges when you need rest',
  },
  {
    key: 'contacts',
    icon: '👥',
    label: 'contacts',
    description: 'identifies your top 5 contacts by interaction frequency to suggest people you might want to check in with',
  },
  {
    key: 'notifications',
    icon: '🔔',
    label: 'notifications',
    description: 'enables push-triggered widget refreshes so your widget data stays current',
  },
  {
    key: 'appUsage',
    icon: '📱',
    label: 'app usage',
    description: 'reads your top 3 app categories by screen time (android only) for contextual suggestions',
  },
  {
    key: 'music',
    icon: '🎵',
    label: 'music history',
    description: 'reads currently playing or last played track and genre for ambient presence moments',
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { permissions, request, openSettings } = usePermissions();
  const useMockData = useStore((s) => s.useMockData);
  const toggleMockMode = useStore((s) => s.toggleMockMode);
  const [expandedKey, setExpandedKey] = useState<PermissionKey | null>(null);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'granted': return styles.statusGranted;
      case 'denied': return styles.statusDenied;
      default: return styles.statusUndetermined;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'granted': return 'granted';
      case 'denied': return 'denied';
      default: return 'not set';
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>settings</Text>
      </View>

      {/* Data Sources Section */}
      <Text style={styles.sectionTitle}>data sources</Text>
      <View style={styles.card}>
        {PERMISSION_INFO.map((info, index) => (
          <View key={info.key}>
            {index > 0 && <View style={styles.divider} />}
            <TouchableOpacity
              style={styles.permissionRow}
              onPress={() =>
                setExpandedKey(expandedKey === info.key ? null : info.key)
              }
            >
              <Text style={styles.permissionIcon}>{info.icon}</Text>
              <View style={styles.permissionTextBlock}>
                <Text style={styles.permissionLabel}>{info.label}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    getStatusStyle(permissions[info.key]),
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      permissions[info.key] === 'granted' && styles.statusTextGranted,
                      permissions[info.key] === 'denied' && styles.statusTextDenied,
                    ]}
                  >
                    {getStatusText(permissions[info.key])}
                  </Text>
                </View>
              </View>
              <Text style={styles.expandArrow}>
                {expandedKey === info.key ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {expandedKey === info.key && (
              <View style={styles.expandedSection}>
                <Text style={styles.expandedLabel}>why we need this</Text>
                <Text style={styles.expandedText}>{info.description}</Text>
                {permissions[info.key] !== 'granted' && (
                  <TouchableOpacity
                    style={styles.grantButton}
                    onPress={() => request(info.key)}
                  >
                    <Text style={styles.grantButtonText}>grant access</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        ))}
      </View>

      {/* System Settings Link */}
      <TouchableOpacity style={styles.systemSettingsButton} onPress={openSettings}>
        <Text style={styles.systemSettingsText}>open system settings</Text>
      </TouchableOpacity>

      {/* Developer Section */}
      <Text style={styles.sectionTitle}>developer</Text>
      <View style={styles.card}>
        <View style={styles.toggleRow}>
          <View style={styles.toggleTextBlock}>
            <Text style={styles.toggleLabel}>mock data mode</Text>
            <Text style={styles.toggleHint}>
              inject synthetic signals for testing without real device data
            </Text>
          </View>
          <Switch
            value={useMockData}
            onValueChange={toggleMockMode}
            trackColor={{ false: '#E0DAD0', true: '#4A7C59' }}
            thumbColor="#F5F0E8"
            ios_backgroundColor="#E0DAD0"
          />
        </View>
      </View>

      {/* Privacy Section */}
      <Text style={styles.sectionTitle}>privacy</Text>
      <View style={styles.card}>
        <Text style={styles.privacyText}>
          all data is processed and stored locally on your device.
          no personal information is sent to any server.
          you can revoke any permission at any time through system settings.
        </Text>
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const colors = {
  surface: '#F5F0E8',
  card: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6560',
  accentPillBg: '#1A1A1A',
  accentPillText: '#F5F0E8',
  border: '#E0DAD0',
  granted: '#4A7C59',
  denied: '#C17A3A',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 60,
  },

  // Header
  header: {
    marginBottom: 28,
  },
  backButton: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },

  // Sections
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  // Permission Row
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  permissionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  permissionTextBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  permissionLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textPrimary,
  },

  // Status Badge
  statusBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusGranted: {
    backgroundColor: '#E8F5E9',
  },
  statusDenied: {
    backgroundColor: '#FFF3E0',
  },
  statusUndetermined: {
    backgroundColor: colors.surface,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  statusTextGranted: {
    color: colors.granted,
  },
  statusTextDenied: {
    color: colors.denied,
  },
  expandArrow: {
    fontSize: 10,
    color: colors.textSecondary,
  },

  // Expanded Section
  expandedSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  expandedLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  expandedText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  grantButton: {
    backgroundColor: colors.accentPillBg,
    borderRadius: 24,
    paddingVertical: 10,
    alignItems: 'center',
  },
  grantButtonText: {
    color: colors.accentPillText,
    fontSize: 14,
    fontWeight: '500',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: 16,
  },

  // System Settings
  systemSettingsButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  systemSettingsText: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
  },

  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  toggleTextBlock: {
    flex: 1,
    marginRight: 12,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  toggleHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Privacy
  privacyText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    padding: 16,
  },
});
