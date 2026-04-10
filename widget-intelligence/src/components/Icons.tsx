/**
 * Icons.tsx — SVG icon library for Widget Intelligence.
 *
 * Replaces all emoji usage with crisp, scalable SVG icons.
 * Each icon uses the same 24×24 viewport for consistent sizing.
 * Color defaults to textPrimary but can be overridden.
 */

import React from 'react';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { colors } from '../theme';

interface IconProps {
  size?: number;
  color?: string;
}

const DEFAULT_SIZE = 24;
const DEFAULT_COLOR = colors.textSecondary;

// ─── Calendar ───────────────────────────────────────────────────────────────

export function CalendarIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="3" stroke={color} strokeWidth="1.8" />
      <Path d="M3 9h18" stroke={color} strokeWidth="1.8" />
      <Path d="M8 2v4M16 2v4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Rect x="7" y="12" width="3" height="3" rx="0.5" fill={color} opacity={0.7} />
    </Svg>
  );
}

// ─── Heart / Health ─────────────────────────────────────────────────────────

export function HeartIcon({ size = DEFAULT_SIZE, color = '#E57373' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={color}
      />
    </Svg>
  );
}

// ─── Contacts / People ──────────────────────────────────────────────────────

export function ContactsIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="7" r="3.5" stroke={color} strokeWidth="1.8" />
      <Path
        d="M2 19.5c0-3.04 2.69-5.5 6-5.5h2c3.31 0 6 2.46 6 5.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <Circle cx="17" cy="8" r="2.5" stroke={color} strokeWidth="1.5" />
      <Path
        d="M19 14c1.97 0 3.5 1.57 3.5 3.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Bell / Notifications ───────────────────────────────────────────────────

export function BellIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M13.73 21a2 2 0 01-3.46 0"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Phone / App Usage ──────────────────────────────────────────────────────

export function PhoneIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="2" width="14" height="20" rx="3" stroke={color} strokeWidth="1.8" />
      <Path d="M10 18h4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </Svg>
  );
}

// ─── Music ──────────────────────────────────────────────────────────────────

export function MusicIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18V5l12-2v13" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="6" cy="18" r="3" stroke={color} strokeWidth="1.8" />
      <Circle cx="18" cy="16" r="3" stroke={color} strokeWidth="1.8" />
    </Svg>
  );
}

// ─── Sleep (Moon) ───────────────────────────────────────────────────────────

export function SleepIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={color}
        fillOpacity={0.1}
      />
    </Svg>
  );
}

// ─── Steps (Walking) ────────────────────────────────────────────────────────

export function StepsIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M13.5 5.5C14.3 5.5 15 4.8 15 4s-.7-1.5-1.5-1.5S12 3.2 12 4s.7 1.5 1.5 1.5z"
        fill={color}
      />
      <Path
        d="M9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z"
        fill={color}
      />
    </Svg>
  );
}

// ─── Chevrons ───────────────────────────────────────────────────────────────

export function ChevronDownIcon({ size = 16, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M6 9l6 6 6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ChevronUpIcon({ size = 16, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 15l-6-6-6 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Close / Dismiss ────────────────────────────────────────────────────────

export function CloseIcon({ size = 18, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ─── Arrow Left ─────────────────────────────────────────────────────────────

export function ArrowLeftIcon({ size = 20, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M5 12l7 7M5 12l7-7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Settings Gear ──────────────────────────────────────────────────────────

export function SettingsIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.8" />
      <Path
        d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Message / Chat ─────────────────────────────────────────────────────────

export function MessageIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── External Link ──────────────────────────────────────────────────────────

export function ExternalLinkIcon({ size = DEFAULT_SIZE, color = DEFAULT_COLOR }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
