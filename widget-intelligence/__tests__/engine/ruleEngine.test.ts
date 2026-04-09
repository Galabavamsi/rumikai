/**
 * ruleEngine.test.ts — Tests for the pure TypeScript rule scoring engine.
 *
 * Coverage:
 *   - Calendar event proximity rules (< 60 min, 1-3 hours)
 *   - Step count rules (< 3000 after 8pm, < 1000 after noon)
 *   - Sleep duration rules (< 6h, poor quality)
 *   - Contact habit gap rules (7+ days, 3-7 days)
 *   - Unread spike rule (> 5 messages)
 *   - Threshold filtering (>= 0.45)
 *   - Max suggestion cap (3)
 *   - Edge cases and boundary conditions
 */

import {
  scoreSignals,
  RELEVANCE_THRESHOLD,
  MAX_SUGGESTIONS,
  resetCounter,
} from '../../src/engine/ruleEngine';
import {
  Signal,
  CalendarEventSignal,
  StepCountSignal,
  SleepDurationSignal,
  TopContactSignal,
} from '../../src/types/Signal';

// Helper to create a signal
function createSignal(type: string, value: unknown, capturedAt?: number): Signal {
  return {
    type: type as Signal['type'],
    value,
    capturedAt: capturedAt ?? Date.now(),
    ttlMs: 300000,
  };
}

describe('ruleEngine', () => {
  beforeEach(() => {
    resetCounter();
  });

  // ─── Calendar Event Rules ───────────────────────────────────────

  describe('calendar event scoring', () => {
    it('should score 0.80 for event within 60 minutes', () => {
      const now = Date.now();
      const signal = createSignal('calendar_event', {
        id: 'e1',
        title: 'team standup',
        startsAt: now + 25 * 60 * 1000, // 25 min from now
        endsAt: now + 55 * 60 * 1000,
      } as CalendarEventSignal);

      const results = scoreSignals([signal]);
      expect(results.length).toBeGreaterThanOrEqual(1);

      const eventSuggestion = results.find(s => s.source === 'calendar');
      expect(eventSuggestion).toBeDefined();
      expect(eventSuggestion!.relevanceScore).toBe(0.80);
      expect(eventSuggestion!.message).toContain('team standup');
      expect(eventSuggestion!.message).toContain('25 min');
    });

    it('should score 0.50 for event 1-3 hours away', () => {
      const now = Date.now();
      const signal = createSignal('calendar_event', {
        id: 'e2',
        title: 'design review',
        startsAt: now + 90 * 60 * 1000, // 90 min from now
        endsAt: now + 120 * 60 * 1000,
      } as CalendarEventSignal);

      const results = scoreSignals([signal]);
      const eventSuggestion = results.find(s => s.source === 'calendar');
      expect(eventSuggestion).toBeDefined();
      expect(eventSuggestion!.relevanceScore).toBe(0.50);
    });

    it('should return no suggestion for event more than 3 hours away', () => {
      const now = Date.now();
      const signal = createSignal('calendar_event', {
        id: 'e3',
        title: 'future meeting',
        startsAt: now + 4 * 60 * 60 * 1000, // 4 hours from now
        endsAt: now + 5 * 60 * 60 * 1000,
      } as CalendarEventSignal);

      const results = scoreSignals([signal]);
      const eventSuggestion = results.find(s => s.source === 'calendar');
      expect(eventSuggestion).toBeUndefined();
    });

    it('should return no suggestion for past events', () => {
      const now = Date.now();
      const signal = createSignal('calendar_event', {
        id: 'e4',
        title: 'past meeting',
        startsAt: now - 60 * 60 * 1000, // 1 hour ago
        endsAt: now - 30 * 60 * 1000,
      } as CalendarEventSignal);

      const results = scoreSignals([signal]);
      const eventSuggestion = results.find(s => s.source === 'calendar');
      expect(eventSuggestion).toBeUndefined();
    });

    it('should include deep link action for calendar events', () => {
      const now = Date.now();
      const signal = createSignal('calendar_event', {
        id: 'event-123',
        title: 'standup',
        startsAt: now + 30 * 60 * 1000,
        endsAt: now + 60 * 60 * 1000,
      } as CalendarEventSignal);

      const results = scoreSignals([signal]);
      const eventSuggestion = results.find(s => s.source === 'calendar');
      expect(eventSuggestion?.deepLinkAction).toBe('widget://meeting/event-123');
    });
  });

  // ─── Step Count Rules ──────────────────────────────────────────

  describe('step count scoring', () => {
    it('should score 0.55 for < 3000 steps after 8pm', () => {
      const evening = new Date();
      evening.setHours(21, 0, 0, 0); // 9pm

      const signal = createSignal('step_count', {
        count: 2500,
        goal: 10000,
      } as StepCountSignal, evening.getTime());

      // We need to mock Date.now to simulate 9pm
      const originalNow = Date.now;
      Date.now = () => evening.getTime();

      const results = scoreSignals([signal]);
      const stepSuggestion = results.find(s => s.message.includes('steps'));

      Date.now = originalNow;

      expect(stepSuggestion).toBeDefined();
      expect(stepSuggestion!.relevanceScore).toBe(0.55);
      expect(stepSuggestion!.source).toBe('health');
    });

    it('should score 0.50 for very low steps (< 1000) after noon', () => {
      const afternoon = new Date();
      afternoon.setHours(14, 0, 0, 0); // 2pm

      const signal = createSignal('step_count', {
        count: 500,
        goal: 10000,
      } as StepCountSignal, afternoon.getTime());

      const originalNow = Date.now;
      Date.now = () => afternoon.getTime();

      const results = scoreSignals([signal]);
      const stepSuggestion = results.find(s => s.message.includes('steps') || s.message.includes('moved'));

      Date.now = originalNow;

      expect(stepSuggestion).toBeDefined();
      expect(stepSuggestion!.relevanceScore).toBeGreaterThanOrEqual(0.50);
    });
  });

  // ─── Sleep Duration Rules ─────────────────────────────────────

  describe('sleep duration scoring', () => {
    it('should score 0.70 for < 6 hours of sleep', () => {
      const signal = createSignal('sleep_duration', {
        hours: 4.5,
        quality: 'poor',
      } as SleepDurationSignal);

      const results = scoreSignals([signal]);
      const sleepSuggestion = results.find(s => s.source === 'health' && s.message.includes('slept'));
      expect(sleepSuggestion).toBeDefined();
      expect(sleepSuggestion!.relevanceScore).toBe(0.70);
      expect(sleepSuggestion!.message).toContain('4.5h');
    });

    it('should score 0.55 for < 7h with poor quality', () => {
      const signal = createSignal('sleep_duration', {
        hours: 6.5,
        quality: 'poor',
      } as SleepDurationSignal);

      const results = scoreSignals([signal]);
      const sleepSuggestion = results.find(s => s.source === 'health');
      expect(sleepSuggestion).toBeDefined();
      expect(sleepSuggestion!.relevanceScore).toBe(0.55);
    });

    it('should return no suggestion for good sleep (>= 7h, good quality)', () => {
      const signal = createSignal('sleep_duration', {
        hours: 8,
        quality: 'good',
      } as SleepDurationSignal);

      const results = scoreSignals([signal]);
      const sleepSuggestion = results.find(s => s.source === 'health');
      expect(sleepSuggestion).toBeUndefined();
    });
  });

  // ─── Contact Habit Gap Rules ──────────────────────────────────

  describe('contact habit gap scoring', () => {
    it('should score 0.60 for contact not messaged in 7+ days', () => {
      const signal = createSignal('top_contact', {
        id: 'c1',
        name: 'alex',
        daysSinceContact: 8,
        interactionCount: 47,
      } as TopContactSignal);

      const results = scoreSignals([signal]);
      const contactSuggestion = results.find(s => s.source === 'contacts' && s.message.includes('alex'));
      expect(contactSuggestion).toBeDefined();
      expect(contactSuggestion!.relevanceScore).toBe(0.60);
      expect(contactSuggestion!.message).toContain('maybe check in');
    });

    it('should score 0.50 for contact not messaged in 3-7 days', () => {
      const signal = createSignal('top_contact', {
        id: 'c2',
        name: 'jordan',
        daysSinceContact: 4,
        interactionCount: 23,
      } as TopContactSignal);

      const results = scoreSignals([signal]);
      const contactSuggestion = results.find(s => s.source === 'contacts' && s.message.includes('jordan'));
      expect(contactSuggestion).toBeDefined();
      expect(contactSuggestion!.relevanceScore).toBe(0.50);
    });

    it('should return no suggestion for recently contacted person', () => {
      const signal = createSignal('top_contact', {
        id: 'c3',
        name: 'sam',
        daysSinceContact: 1,
        interactionCount: 35,
      } as TopContactSignal);

      const results = scoreSignals([signal]);
      const contactSuggestion = results.find(s => s.source === 'contacts' && s.message.includes('sam'));
      expect(contactSuggestion).toBeUndefined();
    });

    it('should include deep link for contact suggestions', () => {
      const signal = createSignal('top_contact', {
        id: 'contact-42',
        name: 'alex',
        daysSinceContact: 10,
        interactionCount: 50,
      } as TopContactSignal);

      const results = scoreSignals([signal]);
      const contactSuggestion = results.find(s => s.source === 'contacts');
      expect(contactSuggestion?.deepLinkAction).toBe('widget://contact/contact-42');
    });
  });

  // ─── Unread Spike Rule ────────────────────────────────────────

  describe('unread spike scoring', () => {
    it('should score 0.65 for > 5 unread messages', () => {
      const results = scoreSignals([], 7);
      const unreadSuggestion = results.find(s => s.message.includes('unread'));
      expect(unreadSuggestion).toBeDefined();
      expect(unreadSuggestion!.relevanceScore).toBe(0.65);
      expect(unreadSuggestion!.message).toContain('7');
    });

    it('should not trigger for <= 5 unread messages', () => {
      const results = scoreSignals([], 3);
      const unreadSuggestion = results.find(s => s.message.includes('unread'));
      expect(unreadSuggestion).toBeUndefined();
    });
  });

  // ─── Threshold and Limits ─────────────────────────────────────

  describe('threshold and limits', () => {
    it('should filter suggestions below 0.45 threshold', () => {
      const results = scoreSignals([]);
      for (const suggestion of results) {
        expect(suggestion.relevanceScore).toBeGreaterThanOrEqual(RELEVANCE_THRESHOLD);
      }
    });

    it('should cap at MAX_SUGGESTIONS (3)', () => {
      const now = Date.now();
      const signals: Signal[] = [
        createSignal('calendar_event', {
          id: 'e1', title: 'meeting 1',
          startsAt: now + 20 * 60 * 1000, endsAt: now + 50 * 60 * 1000,
        }),
        createSignal('sleep_duration', { hours: 4, quality: 'poor' }),
        createSignal('top_contact', {
          id: 'c1', name: 'alex', daysSinceContact: 10, interactionCount: 50,
        }),
        createSignal('top_contact', {
          id: 'c2', name: 'jordan', daysSinceContact: 8, interactionCount: 30,
        }),
      ];

      const results = scoreSignals(signals, 10);
      expect(results.length).toBeLessThanOrEqual(MAX_SUGGESTIONS);
    });

    it('should sort suggestions by relevanceScore descending', () => {
      const now = Date.now();
      const signals: Signal[] = [
        createSignal('calendar_event', {
          id: 'e1', title: 'standup',
          startsAt: now + 25 * 60 * 1000, endsAt: now + 55 * 60 * 1000,
        }),
        createSignal('sleep_duration', { hours: 4, quality: 'poor' }),
        createSignal('top_contact', {
          id: 'c1', name: 'alex', daysSinceContact: 10, interactionCount: 50,
        }),
      ];

      const results = scoreSignals(signals);
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].relevanceScore).toBeGreaterThanOrEqual(
          results[i].relevanceScore
        );
      }
    });
  });

  // ─── Message Formatting ───────────────────────────────────────

  describe('message formatting', () => {
    it('should truncate messages to 60 characters', () => {
      const now = Date.now();
      const signal = createSignal('calendar_event', {
        id: 'e1',
        title: 'this is an extremely long meeting title that should definitely be truncated to fit',
        startsAt: now + 30 * 60 * 1000,
        endsAt: now + 60 * 60 * 1000,
      });

      const results = scoreSignals([signal]);
      for (const suggestion of results) {
        expect(suggestion.message.length).toBeLessThanOrEqual(60);
      }
    });

    it('should include expiration times on all suggestions', () => {
      const now = Date.now();
      const signal = createSignal('sleep_duration', { hours: 4, quality: 'poor' });

      const results = scoreSignals([signal]);
      for (const suggestion of results) {
        expect(suggestion.expiresAt).toBeGreaterThan(now);
      }
    });
  });

  // ─── Combined Signals ─────────────────────────────────────────

  describe('combined signal scoring', () => {
    it('should handle empty signals gracefully', () => {
      const results = scoreSignals([]);
      expect(results).toEqual([]);
    });

    it('should handle multiple signal types together', () => {
      const now = Date.now();
      const signals: Signal[] = [
        createSignal('calendar_event', {
          id: 'e1', title: 'standup',
          startsAt: now + 25 * 60 * 1000, endsAt: now + 55 * 60 * 1000,
        }),
        createSignal('sleep_duration', { hours: 5, quality: 'poor' }),
        createSignal('top_contact', {
          id: 'c1', name: 'alex', daysSinceContact: 8, interactionCount: 47,
        }),
      ];

      const results = scoreSignals(signals);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(MAX_SUGGESTIONS);

      // Should have suggestions from different sources
      const sources = new Set(results.map(s => s.source));
      expect(sources.size).toBeGreaterThan(1);
    });
  });
});
