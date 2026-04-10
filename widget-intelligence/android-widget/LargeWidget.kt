package com.widget.intelligence.widget

import android.content.Context
import android.widget.RemoteViews
import android.app.PendingIntent
import android.content.Intent
import android.net.Uri
import android.view.View
import android.util.Log

/**
 * LargeWidget — Full dashboard with message preview + events + health + suggestions.
 */
object LargeWidget {

    private const val TAG = "WidgetIntelligence"

    fun buildRemoteViews(context: Context, data: WidgetData): RemoteViews {
        val layoutId = getLayoutId(context)
        Log.d(TAG, "LargeWidget.buildRemoteViews — layoutId=$layoutId")

        if (layoutId == 0) {
            Log.e(TAG, "LargeWidget layout 'widget_large' not found! Using fallback.")
            val fallbackId = context.resources.getIdentifier(
                "widget_initial", "layout", context.packageName
            )
            return RemoteViews(context.packageName, fallbackId)
        }

        val views = RemoteViews(context.packageName, layoutId)

        // ── Unread Section ──
        safeSetText(context, views, "widget_unread_count", data.unreadCount.toString())
        safeSetText(context, views, "widget_unread_label",
            if (data.unreadCount == 1) "Unread message" else "Unread messages")
        safeSetText(context, views, "widget_timestamp", formatTimeAgo(data.updatedAt))

        // ── Message Preview ──
        if (data.messagePreview != null) {
            safeSetText(context, views, "widget_sender", data.messagePreview.sender)
            safeSetText(context, views, "widget_snippet", data.messagePreview.snippet)
            safeSetVisibility(context, views, "widget_preview_section", View.VISIBLE)

            val replyId = getId(context, "widget_action_reply")
            if (replyId != 0) {
                val replyIntent = Intent(Intent.ACTION_VIEW, Uri.parse(data.messagePreview.deepLink))
                replyIntent.setPackage(context.packageName)
                val replyPI = PendingIntent.getActivity(
                    context, 10, replyIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(replyId, replyPI)
            }
        } else {
            safeSetVisibility(context, views, "widget_preview_section", View.GONE)
        }

        // ── Next Event ──
        if (data.nextEvent != null) {
            safeSetText(context, views, "widget_event_title", data.nextEvent.title)
            safeSetText(context, views, "widget_event_time", "in ${data.nextEvent.startsInMinutes} min")
            safeSetVisibility(context, views, "widget_event_section", View.VISIBLE)

            val eventId = getId(context, "widget_event_section")
            if (eventId != 0) {
                val eventIntent = Intent(Intent.ACTION_VIEW, Uri.parse(data.nextEvent.deepLink))
                eventIntent.setPackage(context.packageName)
                val eventPI = PendingIntent.getActivity(
                    context, 11, eventIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(eventId, eventPI)
            }
        } else {
            safeSetVisibility(context, views, "widget_event_section", View.GONE)
        }

        // ── Health Insight ──
        if (data.healthInsight != null) {
            safeSetText(context, views, "widget_health_message", data.healthInsight.message)
            safeSetVisibility(context, views, "widget_health_section", View.VISIBLE)
        } else {
            safeSetVisibility(context, views, "widget_health_section", View.GONE)
        }

        // ── Suggestion Card ──
        if (data.suggestions.isNotEmpty()) {
            val suggestion = data.suggestions[0]
            safeSetText(context, views, "widget_suggestion_message", suggestion.message)
            safeSetText(context, views, "widget_suggestion_source", suggestion.source)
            safeSetVisibility(context, views, "widget_suggestion_section", View.VISIBLE)

            if (suggestion.deepLinkAction != null) {
                val suggestId = getId(context, "widget_suggestion_section")
                if (suggestId != 0) {
                    val suggestIntent = Intent(Intent.ACTION_VIEW, Uri.parse(suggestion.deepLinkAction))
                    suggestIntent.setPackage(context.packageName)
                    val suggestPI = PendingIntent.getActivity(
                        context, 12, suggestIntent,
                        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                    )
                    views.setOnClickPendingIntent(suggestId, suggestPI)
                }
            }
        } else {
            safeSetVisibility(context, views, "widget_suggestion_section", View.GONE)
        }

        // Open action
        val openId = getId(context, "widget_action_open")
        if (openId != 0) {
            val openIntent = Intent(Intent.ACTION_VIEW, Uri.parse("widget://chat"))
            openIntent.setPackage(context.packageName)
            val openPI = PendingIntent.getActivity(
                context, 13, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(openId, openPI)
        }

        return views
    }

    private fun safeSetText(context: Context, views: RemoteViews, name: String, text: String) {
        val id = getId(context, name)
        if (id != 0) views.setTextViewText(id, text)
    }

    private fun safeSetVisibility(context: Context, views: RemoteViews, name: String, visibility: Int) {
        val id = getId(context, name)
        if (id != 0) views.setViewVisibility(id, visibility)
    }

    private fun formatTimeAgo(timestamp: Long): String {
        val diffMs = System.currentTimeMillis() - timestamp
        val minutes = diffMs / 60000
        return when {
            minutes < 1 -> "Just now"
            minutes < 60 -> "${minutes}m ago"
            else -> "${minutes / 60}h ago"
        }
    }

    private fun getLayoutId(context: Context): Int {
        return context.resources.getIdentifier("widget_large", "layout", context.packageName)
    }

    private fun getId(context: Context, name: String): Int {
        val id = context.resources.getIdentifier(name, "id", context.packageName)
        if (id == 0) Log.w(TAG, "LargeWidget — view id '$name' not found")
        return id
    }
}
