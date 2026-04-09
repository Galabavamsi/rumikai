/**
 * Home Screen — Widget Intelligence dashboard
 *
 * Shows:
 *   - Widget data preview (what the native widget displays)
 *   - Contextual suggestions
 *   - Developer mode toggle (mock data)
 *   - Quick actions
 *
 * Design: Warm minimalist — cream surfaces, organic typography, quiet intelligence
 */

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useWidget } from '../src/hooks/useWidget';
import { useContextualSuggestions } from '../src/hooks/useContextualSuggestions';
import { useStore } from '../src/store';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { widgetData, isLoading, refresh } = useWidget();
  const { suggestions, dismiss } = useContextualSuggestions();
  const useMockData = useStore((s) => s.useMockData);
  const toggleMockMode = useStore((s) => s.toggleMockMode);
  const onboardingComplete = useStore((s) => s.onboardingComplete);

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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={refresh}
          tintColor="#6B6560"
          colors={['#6B6560']}
        />
      }
    >
      {/* ─── Header ──────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Text style={styles.appName}>widget intelligence</Text>
        <Text style={styles.subtitle}>quiet, contextual awareness</Text>
      </View>

      {/* ─── Developer Mode Toggle ────────────────────────────────── */}
      <View style={styles.devToggle}>
        <View style={styles.devToggleText}>
          <Text style={styles.devToggleLabel}>developer mode</Text>
          <Text style={styles.devToggleHint}>
            {useMockData ? 'using mock signals' : 'using real device data'}
          </Text>
        </View>
        <Switch
          value={useMockData}
          onValueChange={() => {
            toggleMockMode();
            setTimeout(refresh, 100);
          }}
          trackColor={{ false: '#E0DAD0', true: '#4A7C59' }}
          thumbColor="#F5F0E8"
          ios_backgroundColor="#E0DAD0"
        />
      </View>

      {/* ─── Widget Preview Card ──────────────────────────────────── */}
      {widgetData && (
        <View style={styles.widgetCard}>
          <View style={styles.widgetHeader}>
            <Text style={styles.widgetTitle}>widget preview</Text>
            <Text style={styles.timestamp}>
              {formatTimeAgo(widgetData.updatedAt)}
            </Text>
          </View>

          {/* Unread Count */}
          <View style={styles.unreadRow}>
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{widgetData.unreadCount}</Text>
            </View>
            <Text style={styles.unreadLabel}>unread messages</Text>
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
                  <Text style={styles.actionPillText}>reply</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionPillOutline}>
                  <Text style={styles.actionPillOutlineText}>open</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Next Event */}
          {widgetData.nextEvent && (
            <View style={styles.eventSection}>
              <Text style={styles.eventIcon}>📅</Text>
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
              <Text style={styles.healthIcon}>
                {widgetData.healthInsight.type === 'sleep' ? '😴' : '🚶'}
              </Text>
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
          <Text style={styles.sectionTitle}>suggestions</Text>
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
                  relevance {(suggestion.relevanceScore * 100).toFixed(0)}%
                </Text>
              </View>
              <TouchableOpacity
                style={styles.dismissButton}
                onPress={() => dismiss(suggestion.id)}
              >
                <Text style={styles.dismissText}>×</Text>
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
        >
          <Text style={styles.navButtonText}>permission onboarding</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.navButtonText}>settings</Text>
        </TouchableOpacity>
      </View>

      {/* ─── Architecture Info ────────────────────────────────────── */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>architecture</Text>
        <Text style={styles.infoText}>
          signal collector → rule engine → suggestion queue → widget data
        </Text>
        <Text style={styles.infoText}>
          {widgetData?.suggestions.length ?? 0} active suggestions
          {' · '}
          {useMockData ? 'mock signals' : 'real signals'}
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
  appName: {
    fontSize: 28,
    fontWeight: '300',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Dev Toggle
  devToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  devToggleText: {
    flex: 1,
  },
  devToggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  devToggleHint: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Widget Card
  widgetCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  widgetTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '300',
  },

  // Unread
  unreadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  unreadBadge: {
    backgroundColor: colors.accentPillBg,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  unreadCount: {
    color: colors.accentPillText,
    fontSize: 16,
    fontWeight: '600',
  },
  unreadLabel: {
    fontSize: 15,
    color: colors.textPrimary,
    fontWeight: '400',
  },

  // Message Preview
  previewSection: {
    marginBottom: 8,
  },
  previewSender: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  previewSnippet: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionPill: {
    backgroundColor: colors.accentPillBg,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 36,
    justifyContent: 'center',
  },
  actionPillText: {
    color: colors.accentPillText,
    fontSize: 14,
    fontWeight: '500',
  },
  actionPillOutline: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    height: 36,
    justifyContent: 'center',
  },
  actionPillOutlineText: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },

  // Event
  eventSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eventIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  eventTextBlock: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  eventTime: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },

  // Health
  healthSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  healthIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  healthMessage: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  // Suggestions Section
  suggestionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  suggestionCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  suggestionContent: {
    flex: 1,
  },
  sourceTag: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  sourceText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  suggestionMessage: {
    fontSize: 15,
    color: colors.textPrimary,
    fontStyle: 'italic',
    lineHeight: 22,
    marginBottom: 10,
  },
  scoreBar: {
    height: 3,
    backgroundColor: colors.border,
    borderRadius: 2,
    marginBottom: 4,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    backgroundColor: colors.granted,
    borderRadius: 2,
  },
  scoreLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '300',
  },
  dismissButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  dismissText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '300',
  },

  // Navigation
  navSection: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  navButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textPrimary,
  },

  // Info Card
  infoCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
