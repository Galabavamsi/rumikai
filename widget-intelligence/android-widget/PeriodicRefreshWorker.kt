package com.widget.intelligence.widget

import android.content.Context
import android.util.Log

/**
 * PeriodicRefreshWorker — Placeholder for WorkManager-based periodic refresh.
 *
 * NOTE: androidx.work (WorkManager) requires an explicit Gradle dependency.
 * Until that is added, this class provides stub methods that log but don't
 * schedule any work. The widget still works — it just relies on the OS
 * updatePeriodMillis (30 min) for refreshes instead of WorkManager (15 min).
 *
 * To enable WorkManager:
 * 1. Add to build.gradle: implementation "androidx.work:work-runtime-ktx:2.9.0"
 * 2. Uncomment the WorkManager code below
 */
object PeriodicRefreshWorker {

    private const val TAG = "WidgetIntelligence"

    fun schedule(context: Context) {
        Log.d(TAG, "PeriodicRefreshWorker.schedule() called — WorkManager not configured, using OS updatePeriodMillis instead")
        // TODO: Enable when androidx.work dependency is added
        // val constraints = Constraints.Builder()
        //     .setRequiresBatteryNotLow(true)
        //     .build()
        // val request = PeriodicWorkRequestBuilder<RefreshWorker>(15, TimeUnit.MINUTES)
        //     .setConstraints(constraints)
        //     .build()
        // WorkManager.getInstance(context).enqueueUniquePeriodicWork(
        //     "widget_refresh", ExistingPeriodicWorkPolicy.KEEP, request
        // )
    }

    fun cancel(context: Context) {
        Log.d(TAG, "PeriodicRefreshWorker.cancel() called — WorkManager not configured")
        // TODO: Enable when androidx.work dependency is added
        // WorkManager.getInstance(context).cancelAllWorkByTag("widget_refresh")
    }
}
