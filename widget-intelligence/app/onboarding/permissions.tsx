/**
 * Permission Onboarding — 3-step progressive permission wizard.
 *
 * Design principles:
 *   - One permission group per screen, never two dialogs at once
 *   - Warm justification copy explaining the benefit in plain language
 *   - Graceful skip/deny handling — app works in degraded mode
 *   - No exclamation marks, always lowercase
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { usePermissions } from '../../src/hooks/usePermissions';
import { useStore, PermissionKey } from '../../src/store';

const { width } = Dimensions.get('window');

interface PermissionStep {
  key: PermissionKey;
  icon: string;
  title: string;
  description: string;
  benefit: string;
}

const STEPS: PermissionStep[] = [
  {
    key: 'calendar',
    icon: '📅',
    title: 'calendar',
    description: 'so the widget knows what\'s ahead',
    benefit: 'the widget will show your next meeting and remind you before it starts',
  },
  {
    key: 'health',
    icon: '❤️',
    title: 'health',
    description: 'so the widget can nudge you to rest',
    benefit: 'sleep and step data help us suggest breaks when you need them most',
  },
  {
    key: 'contacts',
    icon: '👥',
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

  return (
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
        <Text style={styles.icon}>{step.icon}</Text>
        <Text style={styles.title}>{step.title}</Text>
        <Text style={styles.description}>{step.description}</Text>

        <View style={styles.benefitCard}>
          <Text style={styles.benefitLabel}>why this helps</Text>
          <Text style={styles.benefitText}>{step.benefit}</Text>
        </View>
      </Animated.View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.allowButton} onPress={handleAllow}>
          <Text style={styles.allowButtonText}>allow access</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipButtonText}>
            {isLastStep ? 'finish without' : 'skip for now'}
          </Text>
        </TouchableOpacity>

        {currentStep === 0 && (
          <TouchableOpacity style={styles.skipAllButton} onPress={handleSkipAll}>
            <Text style={styles.skipAllText}>skip all — i'll do this later</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Privacy Note */}
      <Text style={styles.privacyNote}>
        all data stays on your device. nothing is sent to any server.
      </Text>
    </View>
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
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },

  // Progress
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  progressDotActive: {
    backgroundColor: colors.accentPillBg,
    width: 24,
  },
  progressDotComplete: {
    backgroundColor: colors.granted,
  },
  stepCounter: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
    fontWeight: '300',
  },

  // Step Content
  stepContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '300',
    color: colors.textPrimary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 32,
  },

  // Benefit Card
  benefitCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
  },
  benefitLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 15,
    color: colors.textPrimary,
    lineHeight: 22,
  },

  // Actions
  actions: {
    paddingTop: 24,
    gap: 12,
  },
  allowButton: {
    backgroundColor: colors.accentPillBg,
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  allowButtonText: {
    color: colors.accentPillText,
    fontSize: 16,
    fontWeight: '500',
  },
  skipButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
  },
  skipButtonText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '400',
  },
  skipAllButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  skipAllText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '300',
  },

  // Privacy
  privacyNote: {
    fontSize: 11,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '300',
    fontStyle: 'italic',
  },
});
