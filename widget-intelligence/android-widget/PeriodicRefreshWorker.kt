package com.widget.intelligence.widget

import android.content.Context
import androidx.work.*
import java.util.concurrent.TimeUnit

/**
 * PeriodicRefreshWorker — WorkManager job that refreshes widget data every ~15 minutes.
 *
 * Constraints:
 *   - BATTERY_NOT_LOW: Don't refresh when battery is critically low
 *   - Periodic: ~15 min interval (WorkManager minimum)
 *
 * On each execution:
 *   1. Read latest data from Expo Module bridge (SharedPreferences)
 *   2. Trigger widget update for all instances
 */
class PeriodicRefreshWorker(
    context: Context,
    workerParams: WorkerParameters
) : Worker(context, workerParams) {

    override fun doWork(): Result {
        return try {
            // Read the latest widget data from SharedPreferences
            // (written by the Expo Module bridge)
            val prefs = applicationContext.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
            val jsonString = prefs.getString("widget_data_json", null)

            if (jsonString != null) {
                // Trigger update for all widget instances
                val appWidgetManager = android.appwidget.AppWidgetManager.getInstance(applicationContext)
                val componentName = android.content.ComponentName(
                    applicationContext, WidgetReceiver::class.java
                )
                val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

                for (appWidgetId in appWidgetIds) {
                    WidgetReceiver.updateWidget(applicationContext, appWidgetManager, appWidgetId)
                }
            }

            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }

    companion object {
        private const val WORK_TAG = "widget_periodic_refresh"

        /**
         * Schedule periodic widget refresh — runs every ~15 minutes.
         */
        fun schedule(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiresBatteryNotLow(true)
                .build()

            val request = PeriodicWorkRequestBuilder<PeriodicRefreshWorker>(
                15, TimeUnit.MINUTES
            )
                .setConstraints(constraints)
                .addTag(WORK_TAG)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_TAG,
                ExistingPeriodicWorkPolicy.KEEP,
                request
            )
        }

        /**
         * Cancel periodic refresh — called when last widget is removed.
         */
        fun cancel(context: Context) {
            WorkManager.getInstance(context).cancelAllWorkByTag(WORK_TAG)
        }
    }
}
