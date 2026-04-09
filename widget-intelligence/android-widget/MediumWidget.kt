package com.widget.intelligence.widget

import android.content.Context
import android.widget.RemoteViews
import android.app.PendingIntent
import android.content.Intent
import android.net.Uri
import android.view.View

/**
 * MediumWidget — Two-line message preview + Reply/Open action buttons.
 *
 * Layout:
 *   ┌───────────────────────────────────────┐
 *   │  [7] unread messages          2m ago  │
 *   │                                       │
 *   │  alex                                 │
 *   │  hey, are we still on for the...      │
 *   │                                       │
 *   │  [ reply ]  [ open ]                  │
 *   └───────────────────────────────────────┘
 */
object MediumWidget {

    fun buildRemoteViews(context: Context, data: WidgetData): RemoteViews {
        val views = RemoteViews(context.packageName, getLayoutId(context))

        // Unread count
        views.setTextViewText(
            getId(context, "widget_unread_count"),
            data.unreadCount.toString()
        )
        views.setTextViewText(
            getId(context, "widget_unread_label"),
            if (data.unreadCount == 1) "unread message" else "unread messages"
        )

        // Timestamp
        views.setTextViewText(
            getId(context, "widget_timestamp"),
            formatTimeAgo(data.updatedAt)
        )

        // Message preview
        if (data.messagePreview != null) {
            views.setTextViewText(
                getId(context, "widget_sender"),
                data.messagePreview.sender
            )
            views.setTextViewText(
                getId(context, "widget_snippet"),
                data.messagePreview.snippet
            )
            views.setViewVisibility(getId(context, "widget_preview_section"), View.VISIBLE)

            // Reply action — deep link
            val replyIntent = Intent(Intent.ACTION_VIEW, Uri.parse(data.messagePreview.deepLink))
            replyIntent.setPackage(context.packageName)
            val replyPendingIntent = PendingIntent.getActivity(
                context, 1, replyIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(getId(context, "widget_action_reply"), replyPendingIntent)
        } else {
            views.setViewVisibility(getId(context, "widget_preview_section"), View.GONE)
        }

        // Open action — deep link to main app
        val openIntent = Intent(Intent.ACTION_VIEW, Uri.parse("widget://chat"))
        openIntent.setPackage(context.packageName)
        val openPendingIntent = PendingIntent.getActivity(
            context, 2, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(getId(context, "widget_action_open"), openPendingIntent)

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
            "widget_medium", "layout", context.packageName
        )
    }

    private fun getId(context: Context, name: String): Int {
        return context.resources.getIdentifier(name, "id", context.packageName)
    }
}
