package com.widget.intelligence.widget

import android.content.Context
import android.widget.RemoteViews
import android.app.PendingIntent
import android.content.Intent
import android.net.Uri
import android.util.Log

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

    private const val TAG = "WidgetIntelligence"

    fun buildRemoteViews(context: Context, data: WidgetData): RemoteViews {
        val layoutId = getLayoutId(context)
        Log.d(TAG, "SmallWidget.buildRemoteViews — layoutId=$layoutId")

        if (layoutId == 0) {
            Log.e(TAG, "SmallWidget layout 'widget_small' not found! Using fallback.")
            // Use the initial layout as fallback
            val fallbackId = context.resources.getIdentifier(
                "widget_initial", "layout", context.packageName
            )
            return RemoteViews(context.packageName, fallbackId)
        }

        val views = RemoteViews(context.packageName, layoutId)

        // Unread count
        val countId = getId(context, "widget_unread_count")
        Log.d(TAG, "SmallWidget — widget_unread_count id=$countId, value=${data.unreadCount}")
        if (countId != 0) {
            views.setTextViewText(countId, data.unreadCount.toString())
        }

        // Label
        val labelId = getId(context, "widget_unread_label")
        if (labelId != 0) {
            views.setTextViewText(
                labelId,
                if (data.unreadCount == 1) "Unread message" else "Unread messages"
            )
        }

        // Quick action — deep link to chat
        val actionId = getId(context, "widget_action_open")
        if (actionId != 0) {
            val chatIntent = Intent(Intent.ACTION_VIEW, Uri.parse("widget://chat"))
            chatIntent.setPackage(context.packageName)
            val chatPendingIntent = PendingIntent.getActivity(
                context, 0, chatIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(actionId, chatPendingIntent)
        }

        return views
    }

    private fun getLayoutId(context: Context): Int {
        val id = context.resources.getIdentifier(
            "widget_small", "layout", context.packageName
        )
        Log.d(TAG, "SmallWidget.getLayoutId — 'widget_small' resolved to $id")
        return id
    }

    private fun getId(context: Context, name: String): Int {
        val id = context.resources.getIdentifier(name, "id", context.packageName)
        if (id == 0) {
            Log.w(TAG, "SmallWidget — view id '$name' not found in layout")
        }
        return id
    }
}
