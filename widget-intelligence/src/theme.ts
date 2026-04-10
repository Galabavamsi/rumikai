/**
 * theme.ts — Centralized design tokens for the Widget Intelligence app.
 *
 * "Warm Minimalism" design system:
 *   - Cream surfaces, organic typography, quiet intelligence
 *   - All lowercase copy, no exclamation marks
 *   - Inter font family for clean, modern readability
 */

import { Platform, TextStyle, ViewStyle } from 'react-native';

// ─── Colors ─────────────────────────────────────────────────────────────────

export const colors = {
  surface: '#F5F0E8',
  surfaceElevated: '#FAF7F2',
  card: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6560',
  textTertiary: '#9E9890',
  accentPillBg: '#1A1A1A',
  accentPillText: '#F5F0E8',
  border: '#E0DAD0',
  borderLight: '#EBE6DE',
  granted: '#4A7C59',
  grantedBg: '#E8F5E9',
  denied: '#C17A3A',
  deniedBg: '#FFF3E0',
  info: '#5B7FA5',
  infoBg: '#E8F0F8',
  scoreBar: '#4A7C59',
  scoreBarBg: '#E0DAD0',
  shadow: 'rgba(26, 26, 26, 0.06)',
  shadowDark: 'rgba(26, 26, 26, 0.12)',
} as const;

// ─── Typography ─────────────────────────────────────────────────────────────

export const fonts = {
  light: 'Inter_300Light',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
} as const;

export const typography = {
  /** 32px — Page titles */
  h1: {
    fontFamily: fonts.light,
    fontSize: 32,
    fontWeight: '300' as TextStyle['fontWeight'],
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  /** 28px — Section titles */
  h2: {
    fontFamily: fonts.light,
    fontSize: 28,
    fontWeight: '300' as TextStyle['fontWeight'],
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  /** 16px — Body text, descriptions */
  body: {
    fontFamily: fonts.regular,
    fontSize: 15,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: colors.textPrimary,
    lineHeight: 22,
  },
  /** 14px — Secondary text */
  bodySmall: {
    fontFamily: fonts.regular,
    fontSize: 14,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: colors.textSecondary,
    lineHeight: 20,
  },
  /** 15px — Labels, emphasis */
  label: {
    fontFamily: fonts.medium,
    fontSize: 15,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: colors.textPrimary,
  },
  /** 13px — Section headers (uppercase) */
  sectionHeader: {
    fontFamily: fonts.medium,
    fontSize: 13,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: colors.textSecondary,
    textTransform: 'uppercase' as TextStyle['textTransform'],
    letterSpacing: 1,
  },
  /** 12px — Timestamps, hints */
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    fontWeight: '400' as TextStyle['fontWeight'],
    color: colors.textSecondary,
  },
  /** 11px — Small badges, metadata */
  micro: {
    fontFamily: fonts.medium,
    fontSize: 11,
    fontWeight: '500' as TextStyle['fontWeight'],
    color: colors.textSecondary,
  },
  /** 16px — Button text */
  button: {
    fontFamily: fonts.medium,
    fontSize: 16,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  /** 14px — Smaller button text */
  buttonSmall: {
    fontFamily: fonts.medium,
    fontSize: 14,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
} as const;

// ─── Spacing ────────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 48,
} as const;

// ─── Radii ──────────────────────────────────────────────────────────────────

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

// ─── Shadows ────────────────────────────────────────────────────────────────

export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 8,
    },
    android: {
      elevation: 2,
    },
    default: {},
  }) as ViewStyle,
  cardElevated: Platform.select<ViewStyle>({
    ios: {
      shadowColor: colors.shadowDark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 12,
    },
    android: {
      elevation: 4,
    },
    default: {},
  }) as ViewStyle,
} as const;

// ─── Common Styles ──────────────────────────────────────────────────────────

export const commonStyles = {
  card: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  } as ViewStyle,
  cardElevated: {
    backgroundColor: colors.card,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.cardElevated,
  } as ViewStyle,
  pillButton: {
    backgroundColor: colors.accentPillBg,
    borderRadius: radii.xl,
    paddingVertical: spacing.lg,
    alignItems: 'center' as ViewStyle['alignItems'],
  } as ViewStyle,
  outlineButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.xl,
    paddingVertical: 14,
    alignItems: 'center' as ViewStyle['alignItems'],
  } as ViewStyle,
} as const;
