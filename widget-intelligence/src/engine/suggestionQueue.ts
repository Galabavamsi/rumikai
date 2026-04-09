/**
 * suggestionQueue.ts — Priority queue with deduplication and TTL management.
 *
 * Features:
 *   - Priority ordering by relevanceScore (descending)
 *   - 4-hour cooldown per unique suggestion ID
 *   - TTL expiry enforcement  
 *   - Score threshold filtering (>= 0.45)
 *   - Max 3 suggestions surfaced at once
 */

import { Suggestion } from '../types/WidgetData';
import { RELEVANCE_THRESHOLD, MAX_SUGGESTIONS } from './ruleEngine';

/** Cooldown duration per suggestion ID in milliseconds (4 hours). */
const COOLDOWN_MS = 4 * 60 * 60 * 1000;

/** Map of suggestion ID → last surfaced timestamp (Unix ms). */
const cooldownMap = new Map<string, number>();

/**
 * Process raw suggestions through the priority queue pipeline.
 *
 * Pipeline:
 *   1. Remove expired suggestions (past expiresAt)
 *   2. Remove suggestions on cooldown (shown within last 4h)
 *   3. Filter by relevance threshold (>= 0.45)
 *   4. Sort by relevanceScore descending
 *   5. Trim to max 3 items
 *   6. Record surfaced IDs in cooldown map
 *
 * @param candidates — Raw suggestions from the rule engine
 * @returns Processed, prioritized suggestions ready for widget display
 */
export function processSuggestions(candidates: Suggestion[]): Suggestion[] {
  const now = Date.now();

  // 1. Remove expired
  let active = candidates.filter(s => s.expiresAt > now);

  // 2. Remove suggestions on cooldown
  active = active.filter(s => !isOnCooldown(s.id, now));

  // 3. Filter by threshold
  active = active.filter(s => s.relevanceScore >= RELEVANCE_THRESHOLD);

  // 4. Sort by score descending
  active.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // 5. Trim to max
  const surfaced = active.slice(0, MAX_SUGGESTIONS);

  // 6. Record surfaced IDs
  for (const suggestion of surfaced) {
    cooldownMap.set(suggestion.id, now);
  }

  return surfaced;
}

/**
 * Check if a suggestion ID is currently on cooldown.
 */
export function isOnCooldown(suggestionId: string, now: number = Date.now()): boolean {
  const lastSurfaced = cooldownMap.get(suggestionId);
  if (lastSurfaced === undefined) return false;
  return (now - lastSurfaced) < COOLDOWN_MS;
}

/**
 * Dismiss a suggestion — adds it to cooldown immediately.
 */
export function dismissSuggestion(suggestionId: string): void {
  cooldownMap.set(suggestionId, Date.now());
}

/**
 * Clear all cooldown records. Useful for testing.
 */
export function clearCooldowns(): void {
  cooldownMap.clear();
}

/**
 * Get the number of currently active cooldowns.
 */
export function getCooldownCount(): number {
  return cooldownMap.size;
}

/**
 * Clean up expired cooldown entries to prevent memory leaks.
 * Call periodically (e.g., on each refresh cycle).
 */
export function cleanupExpiredCooldowns(): void {
  const now = Date.now();
  for (const [id, timestamp] of cooldownMap.entries()) {
    if ((now - timestamp) >= COOLDOWN_MS) {
      cooldownMap.delete(id);
    }
  }
}
