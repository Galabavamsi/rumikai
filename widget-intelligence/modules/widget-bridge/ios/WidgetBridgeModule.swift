import ExpoModulesCore
import WidgetKit

/**
 * WidgetBridgeModule — Expo Module that bridges widget data between
 * the React Native app and the iOS WidgetKit extension.
 *
 * Writes JSON to App Group UserDefaults, which is then read by the
 * WidgetKit TimelineProvider on each timeline reload.
 */
public class WidgetBridgeModule: Module {

    public func definition() -> ModuleDefinition {
        Name("WidgetBridge")

        // Write widget data JSON to App Group UserDefaults
        AsyncFunction("writeWidgetData") { (jsonString: String) in
            guard let defaults = UserDefaults(suiteName: "group.widget.intelligence") else {
                throw NSError(domain: "WidgetBridge", code: 1,
                              userInfo: [NSLocalizedDescriptionKey: "Failed to access App Group"])
            }
            defaults.set(jsonString, forKey: "widget_data_json")
        }

        // Read widget data JSON from App Group UserDefaults
        AsyncFunction("readWidgetData") { () -> String? in
            let defaults = UserDefaults(suiteName: "group.widget.intelligence")
            return defaults?.string(forKey: "widget_data_json")
        }

        // Trigger widget refresh — reloads all WidgetKit timelines
        AsyncFunction("refreshWidget") {
            if #available(iOS 14.0, *) {
                WidgetCenter.shared.reloadAllTimelines()
            }
        }
    }
}
