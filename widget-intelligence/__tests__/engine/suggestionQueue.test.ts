/**
 * suggestionQueue.test.ts — Tests for the priority queue with dedup and TTL.
 *
 * Coverage:
 *   - Priority ordering by score
 *   - 4-hour cooldown deduplication
 *   - TTL expiry enforcement
 *   - Score threshold filtering (>= 0.45)
 *   - Max 3 suggestion cap
 *   - Dismiss functionality
 *   - Cooldown cleanup
 */

import {
  processSuggestions,
  isOnCooldown,
  dismissSuggestion,
  clearCooldowns,
  getCooldownCount,
  cleanupExpiredCooldowns,
} from '../../src/engine/suggestionQueue';
import { Suggestion } from '../../src/types/WidgetData';

// Helper to create a suggestion
function createSuggestion(
  id: string,
  score: number,
  expiresInMs: number = 4 * 60 * 60 * 1000,
): Suggestion {
  return {
    id,
    message: `suggestion ${id}`,
    relevanceScore: score,
    source: 'calendar',
    expiresAt: Date.now() + expiresInMs,
  };
}

describe('suggestionQueue', () => {
  beforeEach(() => {
    clearCooldowns();
  });

  // ─── Priority Ordering ────────────────────────────────────────

  describe('priority ordering', () => {
    it('should sort suggestions by relevanceScore descending', () => {
      const candidates = [
        createSuggestion('a', 0.50),
        createSuggestion('b', 0.80),
        createSuggestion('c', 0.65),
      ];

      const result = processSuggestions(candidates);
      expect(result[0].id).toBe('b');
      expect(result[1].id).toBe('c');
      expect(result[2].id).toBe('a');
    });

    it('should cap at 3 suggestions', () => {
      const candidates = [
        createSuggestion('a', 0.90),
        createSuggestion('b', 0.85),
        createSuggestion('c', 0.80),
        createSuggestion('d', 0.75),
        createSuggestion('e', 0.70),
      ];

      const result = processSuggestions(candidates);
      expect(result.length).toBe(3);
      expect(result.map(s => s.id)).toEqual(['a', 'b', 'c']);
    });
  });

  // ─── Threshold Filtering ──────────────────────────────────────

  describe('threshold filtering', () => {
    it('should filter suggestions below 0.45', () => {
      const candidates = [
        createSuggestion('high', 0.80),
        createSuggestion('low', 0.30),
        createSuggestion('threshold', 0.45),
      ];

      const result = processSuggestions(candidates);
      expect(result.length).toBe(2);
      expect(result.find(s => s.id === 'low')).toBeUndefined();
      expect(result.find(s => s.id === 'threshold')).toBeDefined();
    });

    it('should return empty array when all below threshold', () => {
      const candidates = [
        createSuggestion('a', 0.10),
        createSuggestion('b', 0.20),
        createSuggestion('c', 0.30),
      ];

      const result = processSuggestions(candidates);
      expect(result).toEqual([]);
    });
  });

  // ─── TTL Expiry ───────────────────────────────────────────────

  describe('TTL expiry', () => {
    it('should remove expired suggestions', () => {
      const candidates = [
        createSuggestion('active', 0.80, 60000),      // expires in 1 min
        createSuggestion('expired', 0.90, -60000),     // already expired
      ];

      const result = processSuggestions(candidates);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('active');
    });

    it('should handle all expired suggestions', () => {
      const candidates = [
        createSuggestion('a', 0.80, -1000),
        createSuggestion('b', 0.90, -2000),
      ];

      const result = processSuggestions(candidates);
      expect(result).toEqual([]);
    });
  });

  // ─── 4-Hour Cooldown Deduplication ────────────────────────────

  describe('cooldown deduplication', () => {
    it('should add surfaced suggestions to cooldown', () => {
      const candidates = [createSuggestion('s1', 0.80)];

      // First call — surfaces the suggestion
      const result1 = processSuggestions(candidates);
      expect(result1.length).toBe(1);

      // Second call — same ID should be on cooldown
      const result2 = processSuggestions(candidates);
      expect(result2.length).toBe(0);
    });

    it('should respect cooldown period (4 hours)', () => {
      const suggestion = createSuggestion('s2', 0.80);

      // Surface it
      processSuggestions([suggestion]);
      expect(isOnCooldown('s2')).toBe(true);

      // Check with a future timestamp beyond cooldown
      const futureTime = Date.now() + 5 * 60 * 60 * 1000; // 5 hours later
      expect(isOnCooldown('s2', futureTime)).toBe(false);
    });

    it('should not affect different suggestion IDs', () => {
      const candidates1 = [createSuggestion('s3', 0.80)];
      processSuggestions(candidates1);

      const candidates2 = [createSuggestion('s4', 0.80)];
      const result = processSuggestions(candidates2);
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('s4');
    });
  });

  // ─── Dismiss ──────────────────────────────────────────────────

  describe('dismiss', () => {
    it('should add dismissed suggestion to cooldown', () => {
      dismissSuggestion('dismissed-1');
      expect(isOnCooldown('dismissed-1')).toBe(true);
    });

    it('should prevent dismissed suggestion from reappearing', () => {
      dismissSuggestion('dismissed-2');

      const candidates = [createSuggestion('dismissed-2', 0.90)];
      const result = processSuggestions(candidates);
      expect(result.length).toBe(0);
    });
  });

  // ─── Cooldown Management ──────────────────────────────────────

  describe('cooldown management', () => {
    it('should track cooldown count', () => {
      expect(getCooldownCount()).toBe(0);

      processSuggestions([createSuggestion('c1', 0.80)]);
      expect(getCooldownCount()).toBe(1);

      processSuggestions([createSuggestion('c2', 0.80)]);
      expect(getCooldownCount()).toBe(2);
    });

    it('should clear all cooldowns', () => {
      processSuggestions([createSuggestion('c1', 0.80)]);
      processSuggestions([createSuggestion('c2', 0.80)]);
      expect(getCooldownCount()).toBe(2);

      clearCooldowns();
      expect(getCooldownCount()).toBe(0);
    });
  });

  // ─── Edge Cases ───────────────────────────────────────────────

  describe('edge cases', () => {
    it('should handle empty candidates array', () => {
      const result = processSuggestions([]);
      expect(result).toEqual([]);
    });

    it('should handle single candidate above threshold', () => {
      const result = processSuggestions([createSuggestion('solo', 0.80)]);
      expect(result.length).toBe(1);
    });

    it('should handle suggestions with equal scores', () => {
      const candidates = [
        createSuggestion('a', 0.70),
        createSuggestion('b', 0.70),
        createSuggestion('c', 0.70),
      ];

      const result = processSuggestions(candidates);
      expect(result.length).toBe(3);
    });

    it('should handle score exactly at threshold (0.45)', () => {
      const result = processSuggestions([createSuggestion('edge', 0.45)]);
      expect(result.length).toBe(1);
    });

    it('should handle score just below threshold', () => {
      const result = processSuggestions([createSuggestion('below', 0.44)]);
      expect(result.length).toBe(0);
    });
  });
});
