/**
 * signalCollector.test.ts — Tests for signal collection, caching, and permission fallback.
 *
 * Coverage:
 *   - Mock mode returns synthetic signals
 *   - Cache hit/miss behavior
 *   - TTL-based cache freshness
 *   - Denied permission fallback
 *   - Cache clearing
 */

import {
  collectSignals,
  isCacheFresh,
  cacheSignal,
  getCachedSignal,
  clearCache,
} from '../../src/engine/signalCollector';
import { Signal, SIGNAL_TTL } from '../../src/types/Signal';

describe('signalCollector', () => {
  beforeEach(() => {
    clearCache();
  });

  // ─── Mock Mode ────────────────────────────────────────────────

  describe('mock mode', () => {
    it('should return mock signals when mock mode is enabled', async () => {
      const signals = await collectSignals(true);
      expect(signals.length).toBeGreaterThan(0);
    });

    it('should include calendar events in mock signals', async () => {
      const signals = await collectSignals(true);
      const calendarSignals = signals.filter(s => s.type === 'calendar_event');
      expect(calendarSignals.length).toBeGreaterThanOrEqual(2);
    });

    it('should include health signals in mock data', async () => {
      const signals = await collectSignals(true);
      const stepSignal = signals.find(s => s.type === 'step_count');
      const sleepSignal = signals.find(s => s.type === 'sleep_duration');
      expect(stepSignal).toBeDefined();
      expect(sleepSignal).toBeDefined();
    });

    it('should include contact signals in mock data', async () => {
      const signals = await collectSignals(true);
      const contactSignals = signals.filter(s => s.type === 'top_contact');
      expect(contactSignals.length).toBeGreaterThanOrEqual(1);
    });

    it('should include music signal in mock data', async () => {
      const signals = await collectSignals(true);
      const musicSignal = signals.find(s => s.type === 'now_playing');
      expect(musicSignal).toBeDefined();
    });

    it('should ignore permissions in mock mode', async () => {
      const signals = await collectSignals(true, new Set());
      expect(signals.length).toBeGreaterThan(0);
    });
  });

  // ─── Real Mode — Permission Handling ──────────────────────────

  describe('real mode permissions', () => {
    it('should return empty with no permissions granted', async () => {
      const signals = await collectSignals(false, new Set());
      expect(signals.length).toBe(0);
    });

    it('should attempt calendar signals when calendar permission granted', async () => {
      const signals = await collectSignals(false, new Set(['calendar']));
      // Returns empty in stub mode, but doesn't throw
      expect(Array.isArray(signals)).toBe(true);
    });

    it('should handle partial permissions gracefully', async () => {
      const signals = await collectSignals(false, new Set(['calendar']));
      // Should not throw even without health/contacts
      expect(Array.isArray(signals)).toBe(true);
    });
  });

  // ─── Cache Management ─────────────────────────────────────────

  describe('cache management', () => {
    it('should detect fresh cache correctly', () => {
      const signal: Signal = {
        type: 'calendar_event',
        value: { id: 'test', title: 'test event', startsAt: Date.now(), endsAt: Date.now() },
        capturedAt: Date.now(),
        ttlMs: SIGNAL_TTL.calendar_event,
      };

      cacheSignal(signal, 'test');
      expect(isCacheFresh('calendar_event', 'test')).toBe(true);
    });

    it('should detect stale cache correctly', () => {
      // Don't cache anything — should be stale
      expect(isCacheFresh('calendar_event', 'nonexistent')).toBe(false);
    });

    it('should retrieve cached signals', () => {
      const signal: Signal = {
        type: 'step_count',
        value: { count: 5000, goal: 10000 },
        capturedAt: Date.now(),
        ttlMs: SIGNAL_TTL.step_count,
      };

      cacheSignal(signal, 'steps');
      const cached = getCachedSignal('step_count', 'steps');
      expect(cached).toBeDefined();
      expect(cached!.value).toEqual({ count: 5000, goal: 10000 });
    });

    it('should return null for uncached signals', () => {
      const cached = getCachedSignal('step_count', 'nonexistent');
      expect(cached).toBeNull();
    });

    it('should clear all cached signals', () => {
      const signal: Signal = {
        type: 'calendar_event',
        value: {},
        capturedAt: Date.now(),
        ttlMs: 300000,
      };

      cacheSignal(signal, 'a');
      cacheSignal(signal, 'b');
      expect(isCacheFresh('calendar_event', 'a')).toBe(true);

      clearCache();
      expect(isCacheFresh('calendar_event', 'a')).toBe(false);
      expect(isCacheFresh('calendar_event', 'b')).toBe(false);
    });
  });

  // ─── Signal Freshness ─────────────────────────────────────────

  describe('signal freshness', () => {
    it('should respect per-source TTL values', () => {
      // Calendar has 5 min TTL
      expect(SIGNAL_TTL.calendar_event).toBe(5 * 60 * 1000);

      // Steps have 30 min TTL
      expect(SIGNAL_TTL.step_count).toBe(30 * 60 * 1000);

      // Contacts have 1 hour TTL
      expect(SIGNAL_TTL.top_contact).toBe(60 * 60 * 1000);
    });

    it('should have all signal types with defined TTLs', () => {
      const expectedTypes = [
        'calendar_event', 'step_count', 'sleep_duration',
        'top_contact', 'app_usage', 'now_playing',
      ];

      for (const type of expectedTypes) {
        expect(SIGNAL_TTL[type as keyof typeof SIGNAL_TTL]).toBeDefined();
        expect(SIGNAL_TTL[type as keyof typeof SIGNAL_TTL]).toBeGreaterThan(0);
      }
    });
  });
});
