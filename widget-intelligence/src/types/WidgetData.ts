/**
 * WidgetData — Shared JSON contract between app layer and native widgets.
 *
 * Serialized to DataStore (Android) or App Group UserDefaults (iOS).
 * Both platforms read the same JSON shape.
 */
export interface WidgetData {
  /** Unix timestamp in milliseconds — when this snapshot was generated. */
  updatedAt: number;

  /** Total number of unread messages across all threads. */
  unreadCount: number;

  /** Optional preview of the most recent message. */
  messagePreview?: {
    sender: string;
    /** Truncated to 120 characters max. */
    snippet: string;
    /** Deep link into the chat thread, e.g. widget://chat/{threadId} */
    deepLink: string;
  };

  /** Optional next upcoming calendar event. */
  nextEvent?: {
    title: string;
    /** Minutes until event starts — negative means already started. */
    startsInMinutes: number;
    /** Deep link to event detail, e.g. widget://meeting/{id} */
    deepLink: string;
  };

  /** Optional health insight card. */
  healthInsight?: {
    type: 'sleep' | 'steps' | 'streak';
    /** Max 60 characters, always lowercase per design guidelines. */
    message: string;
  };

  /** Contextual suggestions — max 3 items, pre-filtered by relevanceScore >= 0.45. */
  suggestions: Suggestion[];
}

/**
 * A single contextual suggestion surfaced to the user.
 */
export interface Suggestion {
  /** Unique identifier for deduplication and cooldown tracking. */
  id: string;

  /** Human-readable message — max 60 chars, always lowercase. */
  message: string;

  /**
   * Relevance score between 0.0 and 1.0.
   * Only suggestions scoring >= 0.45 are surfaced to the widget.
   */
  relevanceScore: number;

  /** Which data source generated this suggestion. */
  source: SuggestionSource;

  /** Optional deep link action, e.g. widget://contact/{id} */
  deepLinkAction?: string;

  /** Unix timestamp in ms — when this suggestion expires and should be removed. */
  expiresAt: number;
}

/**
 * The data source that produced a suggestion.
 */
export type SuggestionSource =
  | 'calendar'
  | 'health'
  | 'contacts'
  | 'music'
  | 'appUsage'
  | 'backend';
