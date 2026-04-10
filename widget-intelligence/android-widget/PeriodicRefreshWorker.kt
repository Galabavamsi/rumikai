package com.widget.intelligence.widget

import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Context
import android.util.Log
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.Worker
import androidx.work.WorkerParameters
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

/**
 * PeriodicRefreshWorker — WorkManager-based periodic widget refresh.
 *
 * Triggers a widget update every 15 minutes (WorkManager minimum interval).
 * Battery-aware: only runs when battery is not critically low.
 *
 * The widget also has OS-level updatePeriodMillis (30 min) as a backup,
 * but WorkManager provides more reliable and frequent updates.
 */
class RefreshWorker(
    context: Context,
    params: WorkerParameters
) : Worker(context, params) {

    override fun doWork(): Result {
        Log.d(TAG, "RefreshWorker.doWork() — triggering widget update")
        return try {
            val appWidgetManager = AppWidgetManager.getInstance(applicationContext)
            val componentName = ComponentName(
                applicationContext, WidgetReceiver::class.java
            )
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)

            if (appWidgetIds.isNotEmpty()) {
                for (id in appWidgetIds) {
                    WidgetReceiver.updateWidget(applicationContext, appWidgetManager, id)
                }
                Log.d(TAG, "RefreshWorker updated ${appWidgetIds.size} widget(s)")
            } else {
                Log.d(TAG, "RefreshWorker — no widgets placed, skipping update")
            }

            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "RefreshWorker failed", e)
            Result.retry()
        }
    }

    companion object {
        private const val TAG = "WidgetIntelligence"
    }
}

/**
 * Schedule/cancel the periodic refresh worker.
 */
object PeriodicRefreshWorker {

    private const val TAG = "WidgetIntelligence"
    private const val UNIQUE_WORK_NAME = "widget_intelligence_refresh"

    fun schedule(context: Context) {
        Log.d(TAG, "PeriodicRefreshWorker.schedule() — registering 15-min periodic refresh")

        val constraints = Constraints.Builder()
            .setRequiresBatteryNotLow(true)
            .build()

        val request = PeriodicWorkRequestBuilder<RefreshWorker>(
            15, TimeUnit.MINUTES
        )
            .setConstraints(constraints)
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            UNIQUE_WORK_NAME,
            ExistingPeriodicWorkPolicy.KEEP,
            request
        )

        Log.d(TAG, "PeriodicRefreshWorker scheduled successfully")
    }

    fun cancel(context: Context) {
        Log.d(TAG, "PeriodicRefreshWorker.cancel() — cancelling periodic refresh")
        WorkManager.getInstance(context).cancelUniqueWork(UNIQUE_WORK_NAME)
    }
}
