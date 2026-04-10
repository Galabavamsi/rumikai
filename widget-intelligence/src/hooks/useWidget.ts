/**
 * useWidget.ts — Read and write widget data, trigger background refresh.
 *
 * Provides:
 *   - widgetData: the current widget snapshot
 *   - isLoading: loading state
 *   - refresh(): re-collect signals and regenerate widget data
 *   - updateWidget(partial): update widget data directly
 */

import { useCallback } from 'react';
import { useStore } from '../store';
import { WidgetData } from '../types/WidgetData';
import { collectSignals } from '../engine/signalCollector';
import { scoreSignals } from '../engine/ruleEngine';
import { processSuggestions } from '../engine/suggestionQueue';
import { generateMockMessages } from '../engine/mockDataGenerator';

export function useWidget() {
  const widgetData = useStore((s) => s.widgetData);
  const isLoading = useStore((s) => s.isLoading);
  const setWidgetData = useStore((s) => s.setWidgetData);
  const updateWidgetData = useStore((s) => s.updateWidgetData);
  const setLoading = useStore((s) => s.setLoading);
  const useMockData = useStore((s) => s.useMockData);
  const permissions = useStore((s) => s.permissions);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      // Build granted permissions set
      const granted = new Set<string>();
      for (const [key, status] of Object.entries(permissions)) {
        if (status === 'granted') granted.add(key);
      }

      // Collect signals
      const signals = await collectSignals(useMockData, granted);

      // Get mock messages if in mock mode
      const mockMessages = useMockData ? generateMockMessages() : null;
      const unreadCount = mockMessages?.unreadCount ?? 0;

      // Score signals into suggestions
      const rawSuggestions = scoreSignals(signals, unreadCount);

      // Process through priority queue (dedup, cooldown, threshold)
      const suggestions = processSuggestions(rawSuggestions);

      // Find the nearest calendar event for the widget
      const calendarSignals = signals.filter(s => s.type === 'calendar_event');
      let nextEvent: WidgetData['nextEvent'] = undefined;

      if (calendarSignals.length > 0) {
        const nearest = calendarSignals
          .map(s => s.value as { id: string; title: string; startsAt: number })
          .filter(e => e.startsAt > Date.now())
          .sort((a, b) => a.startsAt - b.startsAt)[0];

        if (nearest) {
          nextEvent = {
            title: nearest.title,
            startsInMinutes: Math.round((nearest.startsAt - Date.now()) / (60 * 1000)),
            deepLink: `widget://meeting/${nearest.id}`,
          };
        }
      }

      // Find health insight
      const sleepSignal = signals.find(s => s.type === 'sleep_duration');
      const stepSignal = signals.find(s => s.type === 'step_count');

      let healthInsight: WidgetData['healthInsight'] = undefined;
      if (sleepSignal) {
        const sleep = sleepSignal.value as { hours: number; quality: string };
        if (sleep.hours < 6) {
          healthInsight = {
            type: 'sleep',
            message: `${sleep.hours}h of sleep last night`,
          };
        }
      } else if (stepSignal) {
        const steps = stepSignal.value as { count: number; goal: number };
        healthInsight = {
          type: 'steps',
          message: `${steps.count.toLocaleString()} steps today`,
        };
      }

      // Build WidgetData
      const data: WidgetData = {
        updatedAt: Date.now(),
        unreadCount,
        messagePreview: mockMessages?.messagePreview,
        nextEvent,
        healthInsight,
        suggestions,
      };

      setWidgetData(data);
      
      // FIRE NATIVE BRIDGE CALLS
      try {
        const { writeWidgetData, refreshWidget } = require('../../modules/widget-bridge');
        await writeWidgetData(data);
        await refreshWidget();
      } catch (e) {
        console.warn('Bridge failed to write local updates:', e);
      }
    } catch (error) {
      console.error('Widget refresh failed:', error);
    } finally {
      setLoading(false);
    }
  }, [useMockData, permissions, setWidgetData, setLoading]);

  const updateWidget = useCallback(
    async (partial: Partial<WidgetData>) => {
      updateWidgetData(partial);
      // Wait for the store update then push to native? 
      // Actually since we don't have the full derived state here easily,
      // it's better if we just wait for the store to update, or we pass 
      // it combined if we had it. But useStore returns the current state.
      const current = useStore.getState().widgetData;
      if (current) {
        const next = { ...current, ...partial };
        try {
          const { writeWidgetData, refreshWidget } = require('../../modules/widget-bridge');
          await writeWidgetData(next);
          await refreshWidget();
        } catch (e) {}
      }
    },
    [updateWidgetData]
  );

  return {
    widgetData,
    isLoading,
    refresh,
    updateWidget,
  };
}
