package com.widget.intelligence.widget

import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent

/**
 * WidgetReceiver — AppWidgetProvider that handles widget lifecycle events.
 *
 * Triggers:
 *   - onUpdate: called by OS ~every 15 min or when manually refreshed
 *   - onEnabled: first widget placed on home screen
 *   - onDeleted: widget removed
 *   - onDisabled: last widget removed
 *
 * On each update, reads the latest WidgetData from DataStore
 * and passes it to GlanceWidget for rendering.
 */
class WidgetReceiver : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        // Trigger Glance widget update for all instances
        for (appWidgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId)
        }
    }

    override fun onEnabled(context: Context) {
        // Schedule periodic refresh via WorkManager
        PeriodicRefreshWorker.schedule(context)
    }

    override fun onDisabled(context: Context) {
        // Cancel periodic refresh when last widget removed
        PeriodicRefreshWorker.cancel(context)
    }

    companion object {
        /**
         * Update a single widget instance by reading WidgetData from DataStore.
         */
        fun updateWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            // Read widget data from SharedPreferences (bridged from Expo Module)
            val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
            val jsonString = prefs.getString("widget_data_json", null)

            val data = if (jsonString != null) {
                WidgetDataParser.parse(jsonString)
            } else {
                WidgetDataParser.empty()
            }

            // Determine widget size and render appropriate layout
            val options = appWidgetManager.getAppWidgetOptions(appWidgetId)
            val minWidth = options.getInt(AppWidgetManager.OPTION_APPWIDGET_MIN_WIDTH)

            val views = when {
                minWidth < 180 -> SmallWidget.buildRemoteViews(context, data)
                minWidth < 300 -> MediumWidget.buildRemoteViews(context, data)
                else -> LargeWidget.buildRemoteViews(context, data)
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
