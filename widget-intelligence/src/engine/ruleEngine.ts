/**
 * ruleEngine.ts — Pure TypeScript contextual rule scoring.
 *
 * Each rule examines one or more signals and produces scored Suggestion objects.
 * No ML, no network calls — everything runs synchronously on-device.
 *
 * Rules:
 *   1. Time proximity: calendar event starts in < 60 min  → 0.80
 *   2. Habit gap: top contact not messaged in 7+ days     → 0.60
 *   3. Wellness nudge: sleep < 6h last night               → 0.70
 *   4. Step alert: steps < 3000 after 8pm                  → 0.55
 *   5. Unread spike: > 5 unread messages                   → 0.65
 *   6. Contact reconnect: top contact 3-7 days             → 0.50
 */

import {
  Signal,
  CalendarEventSignal,
  StepCountSignal,
  SleepDurationSignal,
  TopContactSignal,
} from '../types/Signal';
import { Suggestion, SuggestionSource } from '../types/WidgetData';

/** Minimum relevance score to surface a suggestion to the widget. */
export const RELEVANCE_THRESHOLD = 0.45;

/** Maximum number of suggestions surfaced at once. */
export const MAX_SUGGESTIONS = 3;

/**
 * Run all rules against the provided signals and return scored suggestions.
 * Results are sorted by relevanceScore descending and capped at MAX_SUGGESTIONS.
 */
export function scoreSignals(signals: Signal[], unreadCount: number = 0): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const now = Date.now();

  for (const signal of signals) {
    switch (signal.type) {
      case 'calendar_event':
        suggestions.push(...scoreCalendarEvent(signal.value as CalendarEventSignal, now));
        break;

      case 'step_count':
        suggestions.push(...scoreStepCount(signal.value as StepCountSignal, now));
        break;

      case 'sleep_duration':
        suggestions.push(...scoreSleepDuration(signal.value as SleepDurationSignal, now));
        break;

      case 'top_contact':
        suggestions.push(...scoreTopContact(signal.value as TopContactSignal, now));
        break;

      default:
        break;
    }
  }

  // Unread spike rule — independent of signal type
  if (unreadCount > 5) {
    suggestions.push(createSuggestion(
      `you have ${unreadCount} unread messages`,
      0.65,
      'contacts',
      now,
      'widget://chat',
    ));
  }

  // Sort by score descending, filter by threshold, cap at MAX_SUGGESTIONS
  return suggestions
    .filter(s => s.relevanceScore >= RELEVANCE_THRESHOLD)
    .sort((a, b) => b.relevanceScore - a.relevanceScore)
    .slice(0, MAX_SUGGESTIONS);
}

// ─── Individual Rule Scorers ────────────────────────────────────────────────

function scoreCalendarEvent(event: CalendarEventSignal, now: number): Suggestion[] {
  const minutesUntilStart = (event.startsAt - now) / (60 * 1000);

  // Event within 60 minutes
  if (minutesUntilStart > 0 && minutesUntilStart <= 60) {
    const minutesDisplay = Math.round(minutesUntilStart);
    return [createSuggestion(
      `${event.title} starts in ${minutesDisplay} min`,
      0.80,
      'calendar',
      now,
      `widget://meeting/${event.id}`,
      4 * 60 * 60 * 1000, // 4 hour expiry
    )];
  }

  // Event within 3 hours — lower score
  if (minutesUntilStart > 60 && minutesUntilStart <= 180) {
    const hoursDisplay = Math.round(minutesUntilStart / 60 * 10) / 10;
    return [createSuggestion(
      `${event.title} in ${hoursDisplay}h`,
      0.50,
      'calendar',
      now,
      `widget://meeting/${event.id}`,
      4 * 60 * 60 * 1000,
    )];
  }

  return [];
}

function scoreStepCount(steps: StepCountSignal, now: number): Suggestion[] {
  const hour = new Date(now).getHours();

  // Steps below 3000 after 8pm
  if (steps.count < 3000 && hour >= 20) {
    return [createSuggestion(
      `only ${steps.count} steps today — maybe a short walk?`,
      0.55,
      'health',
      now,
    )];
  }

  // Very low steps any time after noon
  if (steps.count < 1000 && hour >= 12) {
    return [createSuggestion(
      `you've barely moved today — ${steps.count} steps so far`,
      0.50,
      'health',
      now,
    )];
  }

  return [];
}

function scoreSleepDuration(sleep: SleepDurationSignal, now: number): Suggestion[] {
  // Poor sleep — fewer than 6 hours
  if (sleep.hours < 6) {
    return [createSuggestion(
      `you slept ${sleep.hours}h last night — take it easy today`,
      0.70,
      'health',
      now,
    )];
  }

  // Fair sleep with poor quality
  if (sleep.hours < 7 && sleep.quality === 'poor') {
    return [createSuggestion(
      'rough night — maybe take a break this afternoon',
      0.55,
      'health',
      now,
    )];
  }

  return [];
}

function scoreTopContact(contact: TopContactSignal, now: number): Suggestion[] {
  // Haven't messaged in 7+ days — strong nudge
  if (contact.daysSinceContact >= 7) {
    return [createSuggestion(
      `maybe check in with ${contact.name}?`,
      0.60,
      'contacts',
      now,
      `widget://contact/${contact.id}`,
    )];
  }

  // 3-7 days — gentle reconnect
  if (contact.daysSinceContact >= 3) {
    return [createSuggestion(
      `it's been a few days since you talked to ${contact.name}`,
      0.50,
      'contacts',
      now,
      `widget://contact/${contact.id}`,
    )];
  }

  return [];
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Generate a deterministic hash for a string.
 * Used to create stable suggestion IDs that survive across refresh cycles,
 * so the cooldown map can correctly deduplicate repeat suggestions.
 */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

function createSuggestion(
  message: string,
  relevanceScore: number,
  source: SuggestionSource,
  now: number,
  deepLinkAction?: string,
  expiryDurationMs: number = 4 * 60 * 60 * 1000, // default 4 hours
): Suggestion {
  const truncatedMessage = message.substring(0, 60);
  return {
    id: `suggestion-${source}-${simpleHash(truncatedMessage)}`,
    message: truncatedMessage, // enforce 60 char max
    relevanceScore,
    source,
    deepLinkAction,
    expiresAt: now + expiryDurationMs,
  };
}

/**
 * Reset the internal suggestion counter. Useful for testing.
 * @deprecated — IDs are now deterministic, this is a no-op kept for test compatibility.
 */
export function resetCounter(): void {
  // No-op: IDs are now content-hashed, not counter-based.
}
