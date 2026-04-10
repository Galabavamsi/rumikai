/**
 * Settings Screen — Permission management and developer options.
 *
 * Features:
 *   - Toggle per data source with status badges (granted / denied / not set)
 *   - Expandable "why we need this" sections
 *   - "Requires setup" badge for platform-specific permissions
 *   - Direct link to system settings
 *   - Mock data toggle
 *   - Privacy section
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePermissions } from '../src/hooks/usePermissions';
import { useStore, PermissionKey } from '../src/store';
import { colors, typography, spacing, radii, commonStyles, fonts, shadows } from '../src/theme';
import {
  CalendarIcon,
  HeartIcon,
  ContactsIcon,
  BellIcon,
  PhoneIcon,
  MusicIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
  ExternalLinkIcon,
} from '../src/components/Icons';

interface PermissionInfo {
  key: PermissionKey;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor?: string;
  label: string;
  description: string;
}

const PERMISSION_INFO: PermissionInfo[] = [
  {
    key: 'calendar',
    icon: CalendarIcon,
    label: 'calendar',
    description: 'reads your next 5 events in a 24-hour window to surface meeting reminders and schedule-aware suggestions',
  },
  {
    key: 'health',
    icon: HeartIcon,
    iconColor: '#E57373',
    label: 'health data',
    description: 'reads today\'s step count and last night\'s sleep duration to provide wellness nudges when you need rest',
  },
  {
    key: 'contacts',
    icon: ContactsIcon,
    label: 'contacts',
    description: 'identifies your top 5 contacts by interaction frequency to suggest people you might want to check in with',
  },
  {
    key: 'notifications',
    icon: BellIcon,
    label: 'notifications',
    description: 'enables push-triggered widget refreshes so your widget data stays current',
  },
  {
    key: 'appUsage',
    icon: PhoneIcon,
    label: 'app usage',
    description: 'reads your top 3 app categories by screen time (android only) for contextual suggestions',
  },
  {
    key: 'music',
    icon: MusicIcon,
    label: 'music history',
    description: 'reads currently playing or last played track and genre for ambient presence moments',
  },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { permissions, request, openSettings, requiresSetup } = usePermissions();
  const useMockData = useStore((s) => s.useMockData);
  const toggleMockMode = useStore((s) => s.toggleMockMode);
  const manualUnreadCount = useStore((s) => s.manualUnreadCount);
  const setManualUnreadCount = useStore((s) => s.setManualUnreadCount);
  const [expandedKey, setExpandedKey] = useState<PermissionKey | null>(null);

  const getStatusStyle = (key: PermissionKey) => {
    const status = permissions[key];
    if (requiresSetup(key) && status !== 'granted') return styles.statusInfo;
    switch (status) {
      case 'granted': return styles.statusGranted;
      case 'denied': return styles.statusDenied;
      default: return styles.statusUndetermined;
    }
  };

  const getStatusText = (key: PermissionKey) => {
    const status = permissions[key];
    if (requiresSetup(key) && status !== 'granted') return 'requires setup';
    switch (status) {
      case 'granted': return 'granted';
      case 'denied': return 'denied';
      default: return 'not set';
    }
  };

  const getStatusTextStyle = (key: PermissionKey) => {
    const status = permissions[key];
    if (requiresSetup(key) && status !== 'granted') return styles.statusTextInfo;
    if (status === 'granted') return styles.statusTextGranted;
    if (status === 'denied') return styles.statusTextDenied;
    return {};
  };

  const getActionLabel = (key: PermissionKey) => {
    if (requiresSetup(key)) return 'open settings';
    return 'grant access';
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButtonRow}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ArrowLeftIcon size={18} color={colors.textSecondary} />
            <Text style={styles.backButtonText}>back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>settings</Text>
        </View>

        {/* Data Sources Section */}
        <Text style={styles.sectionTitle}>data sources</Text>
        <View style={styles.card}>
          {PERMISSION_INFO.map((info, index) => {
            const IconComponent = info.icon;
            return (
              <View key={info.key}>
                {index > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.permissionRow}
                  onPress={() =>
                    setExpandedKey(expandedKey === info.key ? null : info.key)
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.iconBg}>
                    <IconComponent size={20} color={info.iconColor || colors.textSecondary} />
                  </View>
                  <View style={styles.permissionTextBlock}>
                    <Text style={styles.permissionLabel}>{info.label}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        getStatusStyle(info.key),
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          getStatusTextStyle(info.key),
                        ]}
                      >
                        {getStatusText(info.key)}
                      </Text>
                    </View>
                  </View>
                  {expandedKey === info.key ? (
                    <ChevronUpIcon size={16} color={colors.textTertiary} />
                  ) : (
                    <ChevronDownIcon size={16} color={colors.textTertiary} />
                  )}
                </TouchableOpacity>

                {expandedKey === info.key && (
                  <View style={styles.expandedSection}>
                    <Text style={styles.expandedLabel}>why we need this</Text>
                    <Text style={styles.expandedText}>{info.description}</Text>
                    {permissions[info.key] !== 'granted' && (
                      <TouchableOpacity
                        style={styles.grantButton}
                        onPress={() => request(info.key)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.grantButtonText}>
                          {getActionLabel(info.key)}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* System Settings Link */}
        <TouchableOpacity
          style={styles.systemSettingsButton}
          onPress={openSettings}
          activeOpacity={0.7}
        >
          <ExternalLinkIcon size={16} color={colors.textSecondary} />
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
              trackColor={{ false: colors.border, true: colors.granted }}
              thumbColor={colors.surfaceElevated}
              ios_backgroundColor={colors.border}
            />
          </View>

          <View style={styles.divider} />

          {/* Manual Unread Count — only shown when NOT in mock mode */}
          <View style={styles.unreadCountRow}>
            <View style={styles.toggleTextBlock}>
              <Text style={styles.toggleLabel}>manual unread count</Text>
              <Text style={styles.toggleHint}>
                {useMockData
                  ? 'disabled in mock mode (uses 7 auto)'
                  : 'set unread count for real mode widget testing'
                }
              </Text>
            </View>
            <TextInput
              style={[
                styles.unreadInput,
                useMockData && styles.unreadInputDisabled,
              ]}
              keyboardType="number-pad"
              value={useMockData ? '7' : manualUnreadCount.toString()}
              editable={!useMockData}
              onChangeText={(text) => {
                const num = parseInt(text, 10);
                if (!isNaN(num)) {
                  setManualUnreadCount(num);
                } else if (text === '') {
                  setManualUnreadCount(0);
                }
              }}
              maxLength={3}
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
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
    </SafeAreaView>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },

  // Header
  header: {
    marginBottom: spacing['2xl'],
  },
  backButtonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.xs,
  },
  backButtonText: {
    ...typography.bodySmall,
  },
  title: {
    ...typography.h2,
  },

  // Sections
  sectionTitle: {
    ...typography.sectionHeader,
    marginBottom: 10,
    marginTop: spacing.xl,
  },
  card: {
    ...commonStyles.card,
    overflow: 'hidden',
  },

  // Permission Row
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  permissionTextBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  permissionLabel: {
    ...typography.body,
  },

  // Status Badge
  statusBadge: {
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  statusGranted: {
    backgroundColor: colors.grantedBg,
  },
  statusDenied: {
    backgroundColor: colors.deniedBg,
  },
  statusUndetermined: {
    backgroundColor: colors.surfaceElevated,
  },
  statusInfo: {
    backgroundColor: colors.infoBg,
  },
  statusText: {
    ...typography.micro,
  },
  statusTextGranted: {
    color: colors.granted,
  },
  statusTextDenied: {
    color: colors.denied,
  },
  statusTextInfo: {
    color: colors.info,
  },

  // Expanded Section
  expandedSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xs,
  },
  expandedLabel: {
    ...typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  expandedText: {
    ...typography.bodySmall,
    marginBottom: spacing.md,
  },
  grantButton: {
    ...commonStyles.pillButton,
    paddingVertical: 12,
  },
  grantButtonText: {
    color: colors.accentPillText,
    ...typography.buttonSmall,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginHorizontal: spacing.lg,
  },

  // System Settings
  systemSettingsButton: {
    ...commonStyles.outlineButton,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  systemSettingsText: {
    ...typography.bodySmall,
  },

  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  toggleTextBlock: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleLabel: {
    ...typography.label,
  },
  toggleHint: {
    ...typography.caption,
    marginTop: 2,
  },

  // Privacy
  privacyText: {
    ...typography.bodySmall,
    lineHeight: 22,
    padding: spacing.lg,
  },

  // Unread Count Input
  unreadCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  unreadInput: {
    width: 56,
    height: 40,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    textAlign: 'center',
    fontFamily: fonts.medium,
    fontSize: 16,
    color: colors.textPrimary,
  },
  unreadInputDisabled: {
    opacity: 0.4,
    backgroundColor: colors.surface,
  },
});
