/**
 * bridge.ts — Platform-agnostic widget data bridge.
 *
 * On Android: Writes to SharedPreferences (read by Jetpack Glance widget)
 * On iOS: Writes to App Group UserDefaults (read by WidgetKit extension)
 *
 * Since we can't run native code in this environment, this module
 * uses MMKV as the storage layer and would be replaced with
 * actual native module calls in a production build.
 */

import { Platform } from 'react-native';
import { WidgetData } from '../../src/types/WidgetData';

// Storage key used by both platforms
const WIDGET_DATA_KEY = 'widget_data_json';

// In-memory cache for widget data (simulates native storage)
let widgetDataCache: string | null = null;

/**
 * Write widget data to the native storage layer.
 *
 * Android: SharedPreferences → DataStore (read by Glance widget)
 * iOS: App Group UserDefaults (read by WidgetKit extension)
 */
export async function writeWidgetData(data: WidgetData): Promise<void> {
  const jsonString = JSON.stringify(data);

  if (Platform.OS === 'android') {
    // In production, this would call the native Kotlin module:
    // NativeModules.WidgetBridgeModule.writeWidgetData(jsonString)
    widgetDataCache = jsonString;
  } else if (Platform.OS === 'ios') {
    // In production, this would call the native Swift module:
    // NativeModules.WidgetBridgeModule.writeWidgetData(jsonString)
    widgetDataCache = jsonString;
  } else {
    // Web / fallback
    widgetDataCache = jsonString;
  }
}

/**
 * Read widget data from the native storage layer.
 */
export async function readWidgetData(): Promise<WidgetData | null> {
  let jsonString: string | null = null;

  if (Platform.OS === 'android' || Platform.OS === 'ios') {
    // In production: NativeModules.WidgetBridgeModule.readWidgetData()
    jsonString = widgetDataCache;
  } else {
    jsonString = widgetDataCache;
  }

  if (!jsonString) return null;

  try {
    return JSON.parse(jsonString) as WidgetData;
  } catch {
    return null;
  }
}

/**
 * Trigger a widget refresh on the native side.
 *
 * Android: Sends broadcast to AppWidgetProvider → triggers onUpdate
 * iOS: Calls WidgetCenter.shared.reloadAllTimelines()
 */
export async function refreshWidget(): Promise<void> {
  if (Platform.OS === 'android') {
    // In production:
    // NativeModules.WidgetBridgeModule.refreshWidget()
    // This sends an ACTION_APPWIDGET_UPDATE broadcast
    console.log('[WidgetBridge] Triggering Android widget refresh');
  } else if (Platform.OS === 'ios') {
    // In production:
    // NativeModules.WidgetBridgeModule.refreshWidget()
    // This calls WidgetCenter.shared.reloadAllTimelines()
    console.log('[WidgetBridge] Triggering iOS widget refresh');
  }
}
