package com.widget.intelligence.widget

import android.content.Context
import android.widget.RemoteViews
import android.app.PendingIntent
import android.content.Intent
import android.net.Uri
import android.view.View

/**
 * SmallWidget — Compact widget showing unread count + quick action.
 *
 * Layout:
 *   ┌─────────────────────┐
 *   │  [7] unread messages │
 *   │                      │
 *   │   [ open chat ]      │
 *   └─────────────────────┘
 *
 * Design: warm cream background, dark pill button, 16dp padding all sides.
 */
object SmallWidget {

    fun buildRemoteViews(context: Context, data: WidgetData): RemoteViews {
        val views = RemoteViews(context.packageName, getLayoutId(context))

        // Unread count
        views.setTextViewText(
            getId(context, "widget_unread_count"),
            data.unreadCount.toString()
        )

        // Label
        views.setTextViewText(
            getId(context, "widget_unread_label"),
            if (data.unreadCount == 1) "unread message" else "unread messages"
        )

        // Quick action — deep link to chat
        val chatIntent = Intent(Intent.ACTION_VIEW, Uri.parse("widget://chat"))
        chatIntent.setPackage(context.packageName)
        val chatPendingIntent = PendingIntent.getActivity(
            context, 0, chatIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(getId(context, "widget_action_open"), chatPendingIntent)

        return views
    }

    private fun getLayoutId(context: Context): Int {
        return context.resources.getIdentifier(
            "widget_small", "layout", context.packageName
        )
    }

    private fun getId(context: Context, name: String): Int {
        return context.resources.getIdentifier(name, "id", context.packageName)
    }
}
