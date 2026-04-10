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
import { requireNativeModule } from 'expo-modules-core';
import { WidgetData } from '../../src/types/WidgetData';

// Storage key used by both platforms
const WIDGET_DATA_KEY = 'widget_data_json';

// In-memory cache for widget data (simulates native storage for web/fallback)
let widgetDataCache: string | null = null;

let WidgetBridge: any = null;
try {
  WidgetBridge = requireNativeModule('WidgetBridge');
} catch (e) {
  console.warn('WidgetBridge native module not found');
}

/**
 * Write widget data to the native storage layer.
 */
export async function writeWidgetData(data: WidgetData): Promise<void> {
  const jsonString = JSON.stringify(data);

  if ((Platform.OS === 'android' || Platform.OS === 'ios') && WidgetBridge) {
    await WidgetBridge.writeWidgetData(jsonString);
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

  if ((Platform.OS === 'android' || Platform.OS === 'ios') && WidgetBridge) {
    try {
      jsonString = await WidgetBridge.readWidgetData();
    } catch {
      jsonString = null;
    }
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
 */
export async function refreshWidget(): Promise<void> {
  if ((Platform.OS === 'android' || Platform.OS === 'ios') && WidgetBridge) {
    console.log('[WidgetBridge] Triggering native widget refresh');
    await WidgetBridge.refreshWidget();
  }
}


