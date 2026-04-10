/**
 * Permission Onboarding — 3-step progressive permission wizard.
 *
 * Design principles:
 *   - One permission group per screen, never two dialogs at once
 *   - Warm justification copy explaining the benefit in plain language
 *   - Graceful skip/deny handling — app works in degraded mode
 *   - No exclamation marks, always lowercase
 *   - SVG icons instead of emoji
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePermissions } from '../../src/hooks/usePermissions';
import { useStore, PermissionKey } from '../../src/store';
import { colors, typography, spacing, radii, commonStyles, fonts } from '../../src/theme';
import {
  CalendarIcon,
  HeartIcon,
  ContactsIcon,
} from '../../src/components/Icons';

interface PermissionStep {
  key: PermissionKey;
  icon: React.ComponentType<{ size?: number; color?: string }>;
  iconColor?: string;
  title: string;
  description: string;
  benefit: string;
}

const STEPS: PermissionStep[] = [
  {
    key: 'calendar',
    icon: CalendarIcon,
    title: 'calendar',
    description: 'so the widget knows what\'s ahead',
    benefit: 'the widget will show your next meeting and remind you before it starts',
  },
  {
    key: 'health',
    icon: HeartIcon,
    iconColor: '#E57373',
    title: 'health',
    description: 'so the widget can nudge you to rest',
    benefit: 'sleep and step data help us suggest breaks when you need them most',
  },
  {
    key: 'contacts',
    icon: ContactsIcon,
    title: 'contacts & notifications',
    description: 'so the widget can suggest who to reach out to',
    benefit: 'we\'ll gently remind you about friends you haven\'t talked to in a while',
  },
];

export default function PermissionOnboarding() {
  const router = useRouter();
  const { request } = usePermissions();
  const setOnboardingComplete = useStore((s) => s.setOnboardingComplete);
  const [currentStep, setCurrentStep] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const animateTransition = useCallback((callback: () => void) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(callback, 150);
  }, [fadeAnim]);

  const handleAllow = useCallback(async () => {
    await request(step.key);

    // Also request notifications with contacts
    if (step.key === 'contacts') {
      await request('notifications');
    }

    if (isLastStep) {
      setOnboardingComplete(true);
      router.back();
    } else {
      animateTransition(() => setCurrentStep(currentStep + 1));
    }
  }, [step, isLastStep, currentStep, request, setOnboardingComplete, router, animateTransition]);

  const handleSkip = useCallback(() => {
    if (isLastStep) {
      setOnboardingComplete(true);
      router.back();
    } else {
      animateTransition(() => setCurrentStep(currentStep + 1));
    }
  }, [isLastStep, currentStep, setOnboardingComplete, router, animateTransition]);

  const handleSkipAll = useCallback(() => {
    setOnboardingComplete(true);
    router.back();
  }, [setOnboardingComplete, router]);

  const IconComponent = step.icon;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.container}>
        {/* Progress Dots */}
        <View style={styles.progressRow}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[
                styles.progressDot,
                i === currentStep && styles.progressDotActive,
                i < currentStep && styles.progressDotComplete,
              ]}
            />
          ))}
        </View>

        {/* Step Counter */}
        <Text style={styles.stepCounter}>
          step {currentStep + 1} of {STEPS.length}
        </Text>

        {/* Step Content */}
        <Animated.View style={[styles.stepContent, { opacity: fadeAnim }]}>
          <View style={styles.iconCircle}>
            <IconComponent
              size={48}
              color={step.iconColor || colors.textPrimary}
            />
          </View>
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          <View style={styles.benefitCard}>
            <Text style={styles.benefitLabel}>why this helps</Text>
            <Text style={styles.benefitText}>{step.benefit}</Text>
          </View>
        </Animated.View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.allowButton}
            onPress={handleAllow}
            activeOpacity={0.8}
          >
            <Text style={styles.allowButtonText}>allow access</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.7}
          >
            <Text style={styles.skipButtonText}>
              {isLastStep ? 'finish without' : 'skip for now'}
            </Text>
          </TouchableOpacity>

          {currentStep === 0 && (
            <TouchableOpacity
              style={styles.skipAllButton}
              onPress={handleSkipAll}
              activeOpacity={0.7}
            >
              <Text style={styles.skipAllText}>skip all — i'll do this later</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Privacy Note */}
        <Text style={styles.privacyNote}>
          all data stays on your device. nothing is sent to any server.
        </Text>
      </View>
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
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['3xl'],
    paddingBottom: spacing.xl,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.accentPillBg,
    width: 28,
    borderRadius: radii.sm,
  },
  progressDotComplete: {
    backgroundColor: colors.granted,
  },
  stepCounter: {
    ...typography.caption,
    fontFamily: fonts.light,
    textAlign: 'center',
    marginBottom: spacing['4xl'],
  },

  // Step Content
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.card,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['3xl'],
    borderWidth: 1,
    borderColor: colors.borderLight,
    elevation: 3,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.bodySmall,
    fontFamily: fonts.light,
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: spacing['3xl'],
  },

  // Benefit Card
  benefitCard: {
    ...commonStyles.cardElevated,
    padding: spacing.xl,
    width: '100%',
  },
  benefitLabel: {
    ...typography.micro,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  benefitText: {
    ...typography.body,
  },

  // Actions
  actions: {
    paddingTop: spacing['2xl'],
    gap: spacing.md,
  },
  allowButton: {
    ...commonStyles.pillButton,
  },
  allowButtonText: {
    color: colors.accentPillText,
    ...typography.button,
  },
  skipButton: {
    ...commonStyles.outlineButton,
  },
  skipButtonText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  skipAllButton: {
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  skipAllText: {
    ...typography.caption,
    fontFamily: fonts.light,
  },

  // Privacy
  privacyNote: {
    ...typography.micro,
    fontFamily: fonts.light,
    fontWeight: '300',
    textAlign: 'center',
    marginTop: spacing.lg,
    fontStyle: 'italic',
  },
});
