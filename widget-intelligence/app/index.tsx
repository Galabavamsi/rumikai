/**
 * Home Screen — Widget Intelligence dashboard
 *
 * Shows:
 *   - Widget data preview (what the native widget displays)
 *   - Contextual suggestions with relevance scores
 *   - Developer mode toggle (mock data)
 *   - Quick navigation to settings and onboarding
 *
 * Design: Warm minimalist — cream surfaces, Inter font, SVG icons
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useWidget } from '../src/hooks/useWidget';
import { useContextualSuggestions } from '../src/hooks/useContextualSuggestions';
import { useStore } from '../src/store';
import { colors, typography, spacing, radii, commonStyles, fonts } from '../src/theme';
import {
  CalendarIcon,
  SleepIcon,
  StepsIcon,
  MessageIcon,
  CloseIcon,
  SettingsIcon,
} from '../src/components/Icons';

export default function HomeScreen() {
  const router = useRouter();
  const { widgetData, isLoading, refresh } = useWidget();
  const { suggestions, dismiss } = useContextualSuggestions();
  const useMockData = useStore((s) => s.useMockData);
  const toggleMockMode = useStore((s) => s.toggleMockMode);
  const onboardingComplete = useStore((s) => s.onboardingComplete);
  const permissions = useStore((s) => s.permissions);

  // Initial data load
  useEffect(() => {
    refresh();
  }, []);

  // Navigate to onboarding if not completed
  useEffect(() => {
    if (!onboardingComplete && !useMockData) {
      router.push('/onboarding/permissions');
    }
  }, [onboardingComplete, useMockData]);

  const formatTimeAgo = (timestamp: number): string => {
    const diffMs = Date.now() - timestamp;
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={refresh}
            tintColor={colors.textSecondary}
            colors={[colors.textSecondary]}
          />
        }
      >
        {/* ─── Header ──────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.appName}>Widget Intelligence</Text>
          <Text style={styles.subtitle}>Quiet, contextual awareness</Text>
        </View>

        {/* ─── Developer Mode Toggle ────────────────────────────────── */}
        <View style={styles.devToggle}>
          <View style={styles.devToggleText}>
            <Text style={styles.devToggleLabel}>Developer Mode</Text>
            <Text style={styles.devToggleHint}>
              {useMockData ? 'Using mock signals' : 'Using real device data'}
            </Text>
          </View>
          <Switch
            value={useMockData}
            onValueChange={() => {
              toggleMockMode();
              setTimeout(refresh, 100);
            }}
            trackColor={{ false: colors.border, true: colors.granted }}
            thumbColor={colors.surfaceElevated}
            ios_backgroundColor={colors.border}
          />
        </View>

        {/* ─── Widget Preview Card ──────────────────────────────────── */}
        {widgetData && (
          <View style={styles.widgetCard}>
            <View style={styles.widgetHeader}>
              <Text style={styles.widgetTitle}>WIDGET PREVIEW</Text>
              <Text style={styles.timestamp}>
                {formatTimeAgo(widgetData.updatedAt)}
              </Text>
            </View>

            {/* Unread Count */}
            <View style={styles.unreadRow}>
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{widgetData.unreadCount}</Text>
              </View>
              <Text style={styles.unreadLabel}>Unread messages</Text>
            </View>

            {/* Message Preview */}
            {widgetData.messagePreview && (
              <View style={styles.previewSection}>
                <Text style={styles.previewSender}>
                  {widgetData.messagePreview.sender}
                </Text>
                <Text style={styles.previewSnippet} numberOfLines={2}>
                  {widgetData.messagePreview.snippet}
                </Text>
                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.actionPill}>
                    <Text style={styles.actionPillText}>Reply</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionPillOutline}>
                    <Text style={styles.actionPillOutlineText}>Open</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Next Event */}
            {widgetData.nextEvent && (
              <View style={styles.eventSection}>
                <View style={styles.iconWrapper}>
                  <CalendarIcon size={20} color={colors.textPrimary} />
                </View>
                <View style={styles.eventTextBlock}>
                  <Text style={styles.eventTitle}>
                    {widgetData.nextEvent.title}
                  </Text>
                  <Text style={styles.eventTime}>
                    in {widgetData.nextEvent.startsInMinutes} min
                  </Text>
                </View>
              </View>
            )}

            {/* Health Insight */}
            {widgetData.healthInsight && (
              <View style={styles.healthSection}>
                <View style={styles.iconWrapper}>
                  {widgetData.healthInsight.type === 'sleep' ? (
                    <SleepIcon size={20} color={colors.textSecondary} />
                  ) : (
                    <StepsIcon size={20} color={colors.textSecondary} />
                  )}
                </View>
                <Text style={styles.healthMessage}>
                  {widgetData.healthInsight.message}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ─── Suggestion Cards ─────────────────────────────────────── */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsSection}>
            <Text style={styles.sectionTitle}>SUGGESTIONS</Text>
            {suggestions.map((suggestion) => (
              <View key={suggestion.id} style={styles.suggestionCard}>
                <View style={styles.suggestionContent}>
                  <View style={styles.sourceTag}>
                    <Text style={styles.sourceText}>{suggestion.source}</Text>
                  </View>
                  <Text style={styles.suggestionMessage}>
                    {suggestion.message}
                  </Text>
                  <View style={styles.scoreBar}>
                    <View
                      style={[
                        styles.scoreBarFill,
                        { width: `${suggestion.relevanceScore * 100}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.scoreLabel}>
                    Relevance {(suggestion.relevanceScore * 100).toFixed(0)}%
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.dismissButton}
                  onPress={() => dismiss(suggestion.id)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <CloseIcon size={14} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ─── Navigation ───────────────────────────────────────────── */}
        <View style={styles.navSection}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/onboarding/permissions')}
            activeOpacity={0.7}
          >
            <MessageIcon size={20} color={colors.textPrimary} />
            <Text style={styles.navButtonText}>Permission{'\n'}Onboarding</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navButton}
            onPress={() => router.push('/settings')}
            activeOpacity={0.7}
          >
            <SettingsIcon size={20} color={colors.textPrimary} />
            <Text style={styles.navButtonText}>Settings</Text>
          </TouchableOpacity>
        </View>

        {/* ─── Signal Status / Architecture Info ────────────────────── */}
        {!useMockData && (
          <View style={styles.signalStatusCard}>
            <Text style={styles.infoTitle}>SIGNAL STATUS</Text>
            <Text style={styles.signalStatusHint}>
              real mode — showing available device signals
            </Text>
            <View style={styles.signalRow}>
              <View style={[styles.signalDot, permissions.calendar === 'granted' ? styles.signalActive : styles.signalInactive]} />
              <Text style={styles.signalLabel}>
                calendar {permissions.calendar === 'granted' ? '· active' : '· not granted'}
              </Text>
            </View>
            <View style={styles.signalRow}>
              <View style={[styles.signalDot, permissions.contacts === 'granted' ? styles.signalActive : styles.signalInactive]} />
              <Text style={styles.signalLabel}>
                contacts {permissions.contacts === 'granted' ? '· active' : '· not granted'}
              </Text>
            </View>
            <View style={styles.signalRow}>
              <View style={[styles.signalDot, styles.signalUnavailable]} />
              <Text style={styles.signalLabel}>health · not available (needs native module)</Text>
            </View>
            <View style={styles.signalRow}>
              <View style={[styles.signalDot, styles.signalUnavailable]} />
              <Text style={styles.signalLabel}>messages · manual count via settings</Text>
            </View>
          </View>
        )}

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ARCHITECTURE</Text>
          <Text style={styles.infoText}>
            Signal Collector → Rule Engine → Suggestion Queue → Widget Data
          </Text>
          <Text style={styles.infoText}>
            {widgetData?.suggestions.length ?? 0} active suggestions
            {' · '}
            {useMockData ? 'Mock signals' : 'Real signals'}
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
    marginBottom: spacing['3xl'],
  },
  appName: {
    ...typography.h2,
    fontFamily: 'Outfit_600SemiBold',
    letterSpacing: -0.5,
  },
  subtitle: {
    ...typography.bodySmall,
    fontFamily: fonts.light,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },

  // Dev Toggle
  devToggle: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  devToggleText: {
    flex: 1,
  },
  devToggleLabel: {
    ...typography.label,
  },
  devToggleHint: {
    ...typography.caption,
    marginTop: 2,
  },

  // Widget Card
  widgetCard: {
    ...commonStyles.cardElevated,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  widgetTitle: {
    ...typography.sectionHeader,
  },
  timestamp: {
    ...typography.caption,
    fontFamily: fonts.light,
  },

  // Unread
  unreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  unreadBadge: {
    backgroundColor: colors.accentPillBg,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  unreadCount: {
    color: colors.accentPillText,
    fontFamily: fonts.semiBold,
    fontSize: 17,
  },
  unreadLabel: {
    ...typography.body,
  },

  // Message Preview
  previewSection: {
    marginBottom: spacing.sm,
  },
  previewSender: {
    ...typography.label,
    fontSize: 14,
    marginBottom: spacing.xs,
  },
  previewSnippet: {
    ...typography.bodySmall,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionPill: {
    backgroundColor: colors.accentPillBg,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingVertical: 10,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPillText: {
    color: colors.accentPillText,
    fontFamily: fonts.medium,
    fontSize: 14,
  },
  actionPillOutline: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPillOutlineText: {
    color: colors.textPrimary,
    fontFamily: fonts.medium,
    fontSize: 14,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },

  // Event
  eventSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  eventTextBlock: {
    flex: 1,
  },
  eventTitle: {
    ...typography.label,
    fontSize: 14,
  },
  eventTime: {
    ...typography.caption,
    marginTop: 2,
  },

  // Health
  healthSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthMessage: {
    ...typography.bodySmall,
  },

  // Suggestions Section
  suggestionsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.sectionHeader,
    marginBottom: spacing.md,
  },
  suggestionCard: {
    ...commonStyles.card,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  suggestionContent: {
    flex: 1,
  },
  sourceTag: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  sourceText: {
    ...typography.micro,
  },
  suggestionMessage: {
    ...typography.body,
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  scoreBar: {
    height: 3,
    backgroundColor: colors.scoreBarBg,
    borderRadius: 2,
    marginBottom: spacing.xs,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: colors.scoreBar,
    borderRadius: 2,
  },
  scoreLabel: {
    ...typography.micro,
    fontFamily: fonts.light,
    fontWeight: '300',
  },
  dismissButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.surfaceElevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },

  // Navigation
  navSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.xl,
  },
  navButton: {
    flex: 1,
    ...commonStyles.card,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 80,
  },
  navButtonText: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textPrimary,
    textAlign: 'center',
  },

  // Info Card
  infoCard: {
    ...commonStyles.card,
    padding: spacing.lg,
  },
  infoTitle: {
    ...typography.sectionHeader,
    marginBottom: spacing.sm,
  },
  infoText: {
    ...typography.bodySmall,
    fontSize: 13,
    lineHeight: 20,
  },

  // Signal Status (Real Mode)
  signalStatusCard: {
    ...commonStyles.card,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  signalStatusHint: {
    ...typography.caption,
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  signalActive: {
    backgroundColor: colors.granted,
  },
  signalInactive: {
    backgroundColor: colors.denied,
  },
  signalUnavailable: {
    backgroundColor: colors.textTertiary,
  },
  signalLabel: {
    ...typography.bodySmall,
    fontSize: 13,
  },
});
