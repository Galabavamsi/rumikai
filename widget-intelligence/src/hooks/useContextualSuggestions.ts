/**
 * useContextualSuggestions.ts — Fetch ranked suggestions, dismiss individual ones.
 *
 * Provides:
 *   - suggestions: filtered and ranked suggestion array
 *   - isLoading: loading state
 *   - dismiss(id): dismiss a suggestion (adds to cooldown)
 *   - refetch(): re-run the suggestion pipeline
 */

import { useCallback, useMemo } from 'react';
import { useStore } from '../store';
import { Suggestion } from '../types/WidgetData';
import { dismissSuggestion as addToCooldown } from '../engine/suggestionQueue';
import { RELEVANCE_THRESHOLD, MAX_SUGGESTIONS } from '../engine/ruleEngine';
import { useWidget } from './useWidget';

interface UseContextualSuggestionsOptions {
  /** Minimum relevance score to include. Default: 0.45 */
  minScore?: number;
  /** Maximum number of suggestions to return. Default: 3 */
  limit?: number;
}

export function useContextualSuggestions(opts?: UseContextualSuggestionsOptions) {
  const minScore = opts?.minScore ?? RELEVANCE_THRESHOLD;
  const limit = opts?.limit ?? MAX_SUGGESTIONS;

  const widgetData = useStore((s) => s.widgetData);
  const isLoading = useStore((s) => s.isLoading);
  const updateWidgetData = useStore((s) => s.updateWidgetData);
  const { refresh } = useWidget();

  const suggestions = useMemo((): Suggestion[] => {
    if (!widgetData?.suggestions) return [];

    return widgetData.suggestions
      .filter(s => s.relevanceScore >= minScore && s.expiresAt > Date.now())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }, [widgetData?.suggestions, minScore, limit]);

  const dismiss = useCallback((id: string) => {
    // Add to cooldown map
    addToCooldown(id);

    // Remove from current widget data
    if (widgetData) {
      updateWidgetData({
        suggestions: widgetData.suggestions.filter(s => s.id !== id),
      });
    }
  }, [widgetData, updateWidgetData]);

  const refetch = useCallback(() => {
    refresh();
  }, [refresh]);

  return {
    suggestions,
    isLoading,
    dismiss,
    refetch,
  };
}
