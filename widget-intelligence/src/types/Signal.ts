/**
 * Signal — A single data point collected from an OS source or mock generator.
 *
 * Signals are the raw input to the rule engine. Each signal has a type,
 * a value (shape depends on type), a capture timestamp, and a TTL
 * indicating how long it remains fresh before re-fetch.
 */
export interface Signal {
  /** Which kind of signal this is. */
  type: SignalType;

  /** The signal payload — shape varies by type. */
  value: unknown;

  /** Unix timestamp in ms — when this signal was captured. */
  capturedAt: number;

  /** Time-to-live in milliseconds — how long this signal is considered fresh. */
  ttlMs: number;
}

/**
 * All supported signal types.
 *
 * TTL defaults:
 *   calendar_event  — 5 min (300_000 ms)
 *   step_count      — 30 min (1_800_000 ms)
 *   sleep_duration  — 30 min (1_800_000 ms)
 *   top_contact     — 1 hour (3_600_000 ms)
 *   app_usage       — 15 min (900_000 ms)
 *   now_playing     — 5 min (300_000 ms)
 */
export type SignalType =
  | 'calendar_event'
  | 'step_count'
  | 'sleep_duration'
  | 'top_contact'
  | 'app_usage'
  | 'now_playing';

/**
 * Per-type TTL values in milliseconds.
 */
export const SIGNAL_TTL: Record<SignalType, number> = {
  calendar_event: 5 * 60 * 1000,       // 5 minutes
  step_count: 30 * 60 * 1000,          // 30 minutes
  sleep_duration: 30 * 60 * 1000,      // 30 minutes
  top_contact: 60 * 60 * 1000,         // 1 hour
  app_usage: 15 * 60 * 1000,           // 15 minutes
  now_playing: 5 * 60 * 1000,          // 5 minutes
};

// ─── Typed Signal Value Shapes ──────────────────────────────────────────────

export interface CalendarEventSignal {
  id: string;
  title: string;
  startsAt: number;   // Unix ms
  endsAt: number;     // Unix ms
  location?: string;
}

export interface StepCountSignal {
  count: number;
  goal: number;       // default 10000
}

export interface SleepDurationSignal {
  /** Sleep duration in hours, e.g. 6.5 */
  hours: number;
  /** Quality rating: 'poor' | 'fair' | 'good' */
  quality: 'poor' | 'fair' | 'good';
}

export interface TopContactSignal {
  id: string;
  name: string;
  /** Days since last interaction. */
  daysSinceContact: number;
  /** Combined interaction count (calls + messages). */
  interactionCount: number;
}

export interface AppUsageSignal {
  category: string;
  dailyMinutes: number;
}

export interface NowPlayingSignal {
  trackName: string;
  artistName: string;
  genre?: string;
}
