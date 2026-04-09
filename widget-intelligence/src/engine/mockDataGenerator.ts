/**
 * mockDataGenerator.ts — Synthetic signal generator for evaluator testing.
 *
 * When "Developer Mode" is enabled, this module produces realistic
 * but fake signals so the intelligence engine can be demonstrated
 * without requiring real calendar, health, or contact data on the device.
 */

import {
  Signal,
  SignalType,
  SIGNAL_TTL,
  CalendarEventSignal,
  StepCountSignal,
  SleepDurationSignal,
  TopContactSignal,
  AppUsageSignal,
  NowPlayingSignal,
} from '../types/Signal';

/**
 * Generate a complete set of mock signals covering all source types.
 * These simulate a realistic mid-day scenario for a working professional.
 */
export function generateMockSignals(): Signal[] {
  const now = Date.now();

  return [
    // Two upcoming calendar events
    createSignal('calendar_event', {
      id: 'mock-event-1',
      title: 'team standup',
      startsAt: now + 25 * 60 * 1000,   // 25 minutes from now
      endsAt: now + 55 * 60 * 1000,     // 55 minutes from now
      location: 'zoom meeting room',
    } as CalendarEventSignal),

    createSignal('calendar_event', {
      id: 'mock-event-2',
      title: 'design review with alex',
      startsAt: now + 3 * 60 * 60 * 1000,  // 3 hours from now
      endsAt: now + 4 * 60 * 60 * 1000,    // 4 hours from now
    } as CalendarEventSignal),

    // Low step count — should trigger wellness nudge
    createSignal('step_count', {
      count: 1847,
      goal: 10000,
    } as StepCountSignal),

    // Poor sleep — should trigger rest suggestion
    createSignal('sleep_duration', {
      hours: 4.5,
      quality: 'poor',
    } as SleepDurationSignal),

    // Frequent contacts — one not contacted recently
    createSignal('top_contact', {
      id: 'contact-1',
      name: 'alex',
      daysSinceContact: 8,
      interactionCount: 47,
    } as TopContactSignal),

    createSignal('top_contact', {
      id: 'contact-2',
      name: 'jordan',
      daysSinceContact: 1,
      interactionCount: 23,
    } as TopContactSignal),

    createSignal('top_contact', {
      id: 'contact-3',
      name: 'sam',
      daysSinceContact: 4,
      interactionCount: 35,
    } as TopContactSignal),

    // App usage — social media heavy
    createSignal('app_usage', {
      category: 'social media',
      dailyMinutes: 142,
    } as AppUsageSignal),

    createSignal('app_usage', {
      category: 'productivity',
      dailyMinutes: 67,
    } as AppUsageSignal),

    // Currently playing music
    createSignal('now_playing', {
      trackName: 'weightless',
      artistName: 'marconi union',
      genre: 'ambient',
    } as NowPlayingSignal),
  ];
}

/**
 * Generate mock unread message data for widget preview.
 */
export function generateMockMessages() {
  return {
    unreadCount: 7,
    messagePreview: {
      sender: 'alex',
      snippet: 'hey, are we still on for the design review later today? i had some thoughts about the navigation flow',
      deepLink: 'widget://chat/mock-thread-1',
    },
  };
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function createSignal(type: SignalType, value: unknown): Signal {
  return {
    type,
    value,
    capturedAt: Date.now(),
    ttlMs: SIGNAL_TTL[type],
  };
}
