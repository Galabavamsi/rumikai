package com.widget.intelligence.bridge

import android.content.Context
import android.content.SharedPreferences
import android.appwidget.AppWidgetManager
import android.content.ComponentName
import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

/**
 * WidgetBridgeModule — Expo Module that bridges widget data between
 * the React Native app and the native Android widget.
 *
 * Writes JSON to SharedPreferences, which is then read by the
 * Jetpack Glance widget on each update cycle.
 */
class WidgetBridgeModule : Module() {

    override fun definition() = ModuleDefinition {
        Name("WidgetBridge")

        // Write widget data JSON to SharedPreferences
        AsyncFunction("writeWidgetData") { jsonString: String ->
            val context = appContext.reactContext ?: return@AsyncFunction null
            val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
            prefs.edit().putString("widget_data_json", jsonString).apply()
        }

        // Read widget data JSON from SharedPreferences
        AsyncFunction("readWidgetData") {
            val context = appContext.reactContext ?: return@AsyncFunction null
            val prefs = context.getSharedPreferences("widget_data", Context.MODE_PRIVATE)
            prefs.getString("widget_data_json", null)
        }

        // Trigger widget refresh — sends broadcast to AppWidgetProvider
        AsyncFunction("refreshWidget") {
            val context = appContext.reactContext ?: return@AsyncFunction null
            val intent = Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE)
            intent.setPackage(context.packageName)

            val appWidgetManager = AppWidgetManager.getInstance(context)
            val componentName = ComponentName(context, "com.widget.intelligence.widget.WidgetReceiver")
            val appWidgetIds = appWidgetManager.getAppWidgetIds(componentName)
            intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds)

            context.sendBroadcast(intent)
        }
    }
}
