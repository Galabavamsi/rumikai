package com.widget.intelligence.widget

import android.content.Context
import android.widget.RemoteViews
import android.app.PendingIntent
import android.content.Intent
import android.net.Uri
import android.view.View

/**
 * LargeWidget — Full dashboard with message preview + suggestions + events.
 *
 * Layout:
 *   ┌──────────────────────────────────────────────┐
 *   │  [7] unread messages               2m ago    │
 *   │                                              │
 *   │  alex                                        │
 *   │  hey, are we still on for the...             │
 *   │  [ reply ]  [ open ]                         │
 *   │  ──────────────────────────────────          │
 *   │  📅 team standup           in 25 min         │
 *   │  😴 4.5h of sleep last night                 │
 *   │  ──────────────────────────────────          │
 *   │  ┌─suggestion─────────────────────┐          │
 *   │  │ maybe check in with alex?      │          │
 *   │  └────────────────────────────────┘          │
 *   └──────────────────────────────────────────────┘
 */
object LargeWidget {

    fun buildRemoteViews(context: Context, data: WidgetData): RemoteViews {
        val views = RemoteViews(context.packageName, getLayoutId(context))

        // ── Unread Section ──
        views.setTextViewText(
            getId(context, "widget_unread_count"),
            data.unreadCount.toString()
        )
        views.setTextViewText(
            getId(context, "widget_unread_label"),
            if (data.unreadCount == 1) "unread message" else "unread messages"
        )
        views.setTextViewText(
            getId(context, "widget_timestamp"),
            formatTimeAgo(data.updatedAt)
        )

        // ── Message Preview ──
        if (data.messagePreview != null) {
            views.setTextViewText(getId(context, "widget_sender"), data.messagePreview.sender)
            views.setTextViewText(getId(context, "widget_snippet"), data.messagePreview.snippet)
            views.setViewVisibility(getId(context, "widget_preview_section"), View.VISIBLE)

            val replyIntent = Intent(Intent.ACTION_VIEW, Uri.parse(data.messagePreview.deepLink))
            replyIntent.setPackage(context.packageName)
            val replyPI = PendingIntent.getActivity(
                context, 10, replyIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(getId(context, "widget_action_reply"), replyPI)
        } else {
            views.setViewVisibility(getId(context, "widget_preview_section"), View.GONE)
        }

        // ── Next Event ──
        if (data.nextEvent != null) {
            views.setTextViewText(getId(context, "widget_event_title"), data.nextEvent.title)
            views.setTextViewText(
                getId(context, "widget_event_time"),
                "in ${data.nextEvent.startsInMinutes} min"
            )
            views.setViewVisibility(getId(context, "widget_event_section"), View.VISIBLE)

            val eventIntent = Intent(Intent.ACTION_VIEW, Uri.parse(data.nextEvent.deepLink))
            eventIntent.setPackage(context.packageName)
            val eventPI = PendingIntent.getActivity(
                context, 11, eventIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(getId(context, "widget_event_section"), eventPI)
        } else {
            views.setViewVisibility(getId(context, "widget_event_section"), View.GONE)
        }

        // ── Health Insight ──
        if (data.healthInsight != null) {
            views.setTextViewText(
                getId(context, "widget_health_message"),
                data.healthInsight.message
            )
            views.setViewVisibility(getId(context, "widget_health_section"), View.VISIBLE)
        } else {
            views.setViewVisibility(getId(context, "widget_health_section"), View.GONE)
        }

        // ── Suggestion Card ──
        if (data.suggestions.isNotEmpty()) {
            val suggestion = data.suggestions[0]
            views.setTextViewText(
                getId(context, "widget_suggestion_message"),
                suggestion.message
            )
            views.setTextViewText(
                getId(context, "widget_suggestion_source"),
                suggestion.source
            )
            views.setViewVisibility(getId(context, "widget_suggestion_section"), View.VISIBLE)

            if (suggestion.deepLinkAction != null) {
                val suggestIntent = Intent(Intent.ACTION_VIEW, Uri.parse(suggestion.deepLinkAction))
                suggestIntent.setPackage(context.packageName)
                val suggestPI = PendingIntent.getActivity(
                    context, 12, suggestIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(
                    getId(context, "widget_suggestion_section"),
                    suggestPI
                )
            }
        } else {
            views.setViewVisibility(getId(context, "widget_suggestion_section"), View.GONE)
        }

        // Open action
        val openIntent = Intent(Intent.ACTION_VIEW, Uri.parse("widget://chat"))
        openIntent.setPackage(context.packageName)
        val openPI = PendingIntent.getActivity(
            context, 13, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(getId(context, "widget_action_open"), openPI)

        return views
    }

    private fun formatTimeAgo(timestamp: Long): String {
        val diffMs = System.currentTimeMillis() - timestamp
        val minutes = diffMs / 60000
        return when {
            minutes < 1 -> "just now"
            minutes < 60 -> "${minutes}m ago"
            else -> "${minutes / 60}h ago"
        }
    }

    private fun getLayoutId(context: Context): Int {
        return context.resources.getIdentifier(
            "widget_large", "layout", context.packageName
        )
    }

    private fun getId(context: Context, name: String): Int {
        return context.resources.getIdentifier(name, "id", context.packageName)
    }
}
