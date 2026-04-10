package com.widget.intelligence.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.util.Log

/**
 * WidgetReceiver — AppWidgetProvider that handles widget lifecycle events.
 *
 * Triggers:
 *   - onUpdate: called by OS ~every 15-30 min or when manually refreshed
 *   - onEnabled: first widget placed on home screen
 *   - onDeleted: widget removed
 *   - onDisabled: last widget removed
 *
 * On each update, reads the latest WidgetData from SharedPreferences
 * and passes it to the appropriate size widget for rendering.
 */
class WidgetReceiver : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        Log.d(TAG, "onUpdate called for ${appWidgetIds.size} widget(s)")
        for (appWidgetId in appWidgetIds) {
            try {
                updateWidget(context, appWidgetManager, appWidgetId)
                Log.d(TAG, "Widget $appWidgetId updated successfully")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to update widget $appWidgetId", e)
            }
        }
    }

    override fun onEnabled(context: Context) {
        Log.d(TAG, "onEnabled — first widget placed, scheduling refresh")
        PeriodicRefreshWorker.schedule(context)
    }

    override fun onDisabled(context: Context) {
        Log.d(TAG, "onDisabled — last widget removed")
        PeriodicRefreshWorker.cancel(context)
    }

    override fun onReceive(context: Context, intent: Intent) {
        Log.d(TAG, "onReceive: action=${intent.action}")
        super.onReceive(context, intent)
    }

    companion object {
        private const val TAG = "WidgetIntelligence"

        /**
         * Update a single widget instance by reading WidgetData from SharedPreferences.
         */
        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            Log.d(TAG, "updateWidget($appWidgetId) — reading SharedPreferences")

            // Read widget data from SharedPreferences (bridged from Expo Module)
            val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
            val jsonString = prefs.getString("widget_data_json", null)
            Log.d(TAG, "SharedPreferences data: ${if (jsonString != null) "${jsonString.length} chars" else "null"}")

            val data = if (jsonString != null) {
                WidgetDataParser.parse(jsonString)
            } else {
                Log.d(TAG, "No data in SharedPreferences, using empty data")
                WidgetDataParser.empty()
            }

            Log.d(TAG, "Data parsed: unread=${data.unreadCount}, event=${data.nextEvent?.title}, suggestions=${data.suggestions.size}")

            // Determine widget size and render appropriate layout
            val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
            val minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)
            val minHeight = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_HEIGHT)
            Log.d(TAG, "Widget size: ${minWidth}dp x ${minHeight}dp")

            try {
                val views = when {
                    minWidth < 180 -> {
                        Log.d(TAG, "Rendering SmallWidget")
                        SmallWidget.buildRemoteViews(context, data)
                    }
                    minWidth < 300 -> {
                        Log.d(TAG, "Rendering MediumWidget")
                        MediumWidget.buildRemoteViews(context, data)
                    }
                    else -> {
                        Log.d(TAG, "Rendering LargeWidget")
                        LargeWidget.buildRemoteViews(context, data)
                    }
                }

                appWidgetManager.updateAppWidget(appWidgetId, views)
                Log.d(TAG, "Widget $appWidgetId rendered and updated")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to build RemoteViews for widget $appWidgetId", e)
                // Fallback: try to render a minimal error view
                try {
                    val fallbackLayoutId = context.resources.getIdentifier(
                        "widget_initial", "layout", context.packageName
                    )
                    if (fallbackLayoutId != 0) {
                        val fallback = android.widget.RemoteViews(context.packageName, fallbackLayoutId)
                        appWidgetManager.updateAppWidget(appWidgetId, fallback)
                        Log.d(TAG, "Rendered fallback layout for widget $appWidgetId")
                    }
                } catch (fallbackError: Exception) {
                    Log.e(TAG, "Even fallback layout failed", fallbackError)
                }
            }
        }
    }
}
