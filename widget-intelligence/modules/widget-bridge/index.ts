/**
 * widget-bridge — Custom Expo Module for bridging widget data
 * from the React Native app layer to native widget layers.
 *
 * This module provides TypeScript functions that native widgets
 * can use to read/write the shared WidgetData JSON.
 */

export { writeWidgetData, readWidgetData, refreshWidget } from './bridge';
