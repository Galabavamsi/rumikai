package com.widget.intelligence.widget

import android.content.Context
import android.widget.RemoteViews
import android.app.PendingIntent
import android.content.Intent
import android.net.Uri
import android.view.View
import android.util.Log

/**
 * MediumWidget — Two-line message preview + Reply/Open action buttons.
 */
object MediumWidget {

    private const val TAG = "WidgetIntelligence"

    fun buildRemoteViews(context: Context, data: WidgetData): RemoteViews {
        val layoutId = getLayoutId(context)
        Log.d(TAG, "MediumWidget.buildRemoteViews — layoutId=$layoutId")

        if (layoutId == 0) {
            Log.e(TAG, "MediumWidget layout 'widget_medium' not found! Using fallback.")
            val fallbackId = context.resources.getIdentifier(
                "widget_initial", "layout", context.packageName
            )
            return RemoteViews(context.packageName, fallbackId)
        }

        val views = RemoteViews(context.packageName, layoutId)

        // Unread count
        safeSetText(context, views, "widget_unread_count", data.unreadCount.toString())
        safeSetText(context, views, "widget_unread_label",
            if (data.unreadCount == 1) "unread message" else "unread messages")
        safeSetText(context, views, "widget_timestamp", formatTimeAgo(data.updatedAt))

        // Message preview
        if (data.messagePreview != null) {
            safeSetText(context, views, "widget_sender", data.messagePreview.sender)
            safeSetText(context, views, "widget_snippet", data.messagePreview.snippet)
            safeSetVisibility(context, views, "widget_preview_section", View.VISIBLE)

            val replyId = getId(context, "widget_action_reply")
            if (replyId != 0) {
                val replyIntent = Intent(Intent.ACTION_VIEW, Uri.parse(data.messagePreview.deepLink))
                replyIntent.setPackage(context.packageName)
                val replyPendingIntent = PendingIntent.getActivity(
                    context, 1, replyIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                )
                views.setOnClickPendingIntent(replyId, replyPendingIntent)
            }
        } else {
            safeSetVisibility(context, views, "widget_preview_section", View.GONE)
        }

        // Open action
        val openId = getId(context, "widget_action_open")
        if (openId != 0) {
            val openIntent = Intent(Intent.ACTION_VIEW, Uri.parse("widget://chat"))
            openIntent.setPackage(context.packageName)
            val openPendingIntent = PendingIntent.getActivity(
                context, 2, openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(openId, openPendingIntent)
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
            minutes < 1 -> "just now"
            minutes < 60 -> "${minutes}m ago"
            else -> "${minutes / 60}h ago"
        }
    }

    private fun getLayoutId(context: Context): Int {
        return context.resources.getIdentifier("widget_medium", "layout", context.packageName)
    }

    private fun getId(context: Context, name: String): Int {
        val id = context.resources.getIdentifier(name, "id", context.packageName)
        if (id == 0) Log.w(TAG, "MediumWidget — view id '$name' not found")
        return id
    }
}
