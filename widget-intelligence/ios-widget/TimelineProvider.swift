import WidgetKit
import Foundation

/**
 * IraProvider — TimelineProvider that generates widget entries.
 *
 * Timeline phases: morning (6am), afternoon (12pm), evening (6pm), night (10pm).
 * Reads shared data from App Group: group.widget.intelligence
 */
struct IraProvider: TimelineProvider {
    
    typealias Entry = IraEntry
    
    /// Placeholder for widget gallery
    func placeholder(in context: Context) -> IraEntry {
        IraEntry.placeholder()
    }
    
    /// Snapshot for widget gallery preview
    func getSnapshot(in context: Context, completion: @escaping (IraEntry) -> Void) {
        completion(IraEntry.placeholder())
    }
    
    /// Generate timeline with entries at phase boundaries
    func getTimeline(in context: Context, completion: @escaping (Timeline<IraEntry>) -> Void) {
        let data = readWidgetData()
        let entry = IraEntry(date: Date(), widgetData: data)
        
        // Next refresh: at the next phase boundary
        let nextUpdate = nextPhaseDate()
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }
    
    // MARK: - Data Reading
    
    private func readWidgetData() -> WidgetDataModel? {
        guard let defaults = UserDefaults(suiteName: "group.widget.intelligence"),
              let jsonString = defaults.string(forKey: "widget_data_json"),
              let jsonData = jsonString.data(using: .utf8) else {
            return nil
        }
        
        return try? JSONDecoder().decode(WidgetDataModel.self, from: jsonData)
    }
    
    // MARK: - Phase Calculation
    
    /// Returns the next phase boundary date:
    /// morning (6am), afternoon (12pm), evening (6pm), night (10pm)
    private func nextPhaseDate() -> Date {
        let calendar = Calendar.current
        let now = Date()
        let hour = calendar.component(.hour, from: now)
        
        var nextHour: Int
        if hour < 6 { nextHour = 6 }
        else if hour < 12 { nextHour = 12 }
        else if hour < 18 { nextHour = 18 }
        else if hour < 22 { nextHour = 22 }
        else {
            // After 10pm — next phase is 6am tomorrow
            let tomorrow = calendar.date(byAdding: .day, value: 1, to: now)!
            return calendar.date(bySettingHour: 6, minute: 0, second: 0, of: tomorrow)!
        }
        
        return calendar.date(bySettingHour: nextHour, minute: 0, second: 0, of: now)!
    }
}
