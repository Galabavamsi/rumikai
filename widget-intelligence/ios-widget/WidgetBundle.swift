import WidgetKit
import SwiftUI

/**
 * WidgetBundle — Entry point for the iOS widget extension.
 * Registers all widget sizes (Small, Medium, Large) and Lock Screen variants.
 */
@main
struct IntelligenceWidgetBundle: WidgetBundle {
    var body: some Widget {
        IntelligenceWidget()
        // Lock screen widgets would be registered here as separate Widget types
        // IntelligenceLockScreenWidget()
    }
}

/**
 * IntelligenceWidget — Main widget configuration.
 */
struct IntelligenceWidget: Widget {
    let kind: String = "IntelligenceWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: IraProvider()) { entry in
            IntelligenceWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("widget intelligence")
        .description("contextual awareness — messages, events, and gentle suggestions")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge,
                            .accessoryRectangular, .accessoryCircular, .accessoryInline])
    }
}
