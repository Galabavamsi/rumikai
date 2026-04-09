import SwiftUI
import WidgetKit

/**
 * IntelligenceWidgetEntryView — Routes to size-specific views.
 */
struct IntelligenceWidgetEntryView: View {
    @Environment(\.widgetFamily) var family
    let entry: IraEntry
    
    var body: some View {
        switch family {
        case .systemSmall:
            SmallWidgetView(entry: entry)
        case .systemMedium:
            MediumWidgetView(entry: entry)
        case .systemLarge:
            LargeWidgetView(entry: entry)
        case .accessoryRectangular:
            LockScreenRectangularView(entry: entry)
        case .accessoryCircular:
            LockScreenCircularView(entry: entry)
        case .accessoryInline:
            LockScreenInlineView(entry: entry)
        @unknown default:
            SmallWidgetView(entry: entry)
        }
    }
}

// MARK: - Design Tokens

struct DesignTokens {
    static let surfaceCream = Color(red: 0.96, green: 0.94, blue: 0.91)   // #F5F0E8
    static let surfaceDark = Color(red: 0.11, green: 0.10, blue: 0.09)    // #1C1A18
    static let textPrimary = Color(red: 0.10, green: 0.10, blue: 0.10)    // #1A1A1A
    static let textSecondary = Color(red: 0.42, green: 0.40, blue: 0.38)  // #6B6560
    static let border = Color(red: 0.88, green: 0.85, blue: 0.82)         // #E0DAD0
    static let granted = Color(red: 0.29, green: 0.49, blue: 0.35)        // #4A7C59
}

// MARK: - Small Widget

struct SmallWidgetView: View {
    let entry: IraEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Unread count
            HStack(spacing: 8) {
                Text("\(entry.widgetData?.unreadCount ?? 0)")
                    .font(.system(size: 24, weight: .semibold, design: .rounded))
                    .foregroundColor(.white)
                    .frame(width: 36, height: 36)
                    .background(DesignTokens.textPrimary)
                    .clipShape(Circle())
                
                Text("unread")
                    .font(.system(size: 14))
                    .foregroundColor(DesignTokens.textSecondary)
            }
            
            Spacer()
            
            // Greeting or event
            if let event = entry.widgetData?.nextEvent {
                Text(event.title)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(DesignTokens.textPrimary)
                    .lineLimit(1)
                
                Text("in \(event.startsInMinutes) min")
                    .font(.system(size: 12, weight: .light))
                    .foregroundColor(DesignTokens.textSecondary)
            } else {
                Text("nothing ahead")
                    .font(.system(size: 13))
                    .foregroundColor(DesignTokens.textSecondary)
                    .italic()
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(DesignTokens.surfaceCream)
        .widgetURL(URL(string: "widget://chat"))
    }
}

// MARK: - Medium Widget

struct MediumWidgetView: View {
    let entry: IraEntry
    
    var body: some View {
        HStack(spacing: 16) {
            // Left — unread + message
            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    Text("\(entry.widgetData?.unreadCount ?? 0)")
                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                        .foregroundColor(.white)
                        .frame(width: 32, height: 32)
                        .background(DesignTokens.textPrimary)
                        .clipShape(Circle())
                    
                    Text("unread messages")
                        .font(.system(size: 13))
                        .foregroundColor(DesignTokens.textSecondary)
                }
                
                if let preview = entry.widgetData?.messagePreview {
                    Text(preview.sender)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(DesignTokens.textPrimary)
                    
                    Text(preview.snippet)
                        .font(.system(size: 13))
                        .foregroundColor(DesignTokens.textSecondary)
                        .lineLimit(2)
                }
            }
            .frame(maxWidth: .infinity, alignment: .topLeading)
            
            // Right — event + suggestion
            VStack(alignment: .leading, spacing: 8) {
                if let event = entry.widgetData?.nextEvent {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("📅 \(event.title)")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(DesignTokens.textPrimary)
                            .lineLimit(1)
                        
                        Text("in \(event.startsInMinutes) min")
                            .font(.system(size: 11, weight: .light))
                            .foregroundColor(DesignTokens.textSecondary)
                    }
                }
                
                if let suggestion = entry.widgetData?.suggestions.first {
                    Text(suggestion.message)
                        .font(.system(size: 12).italic())
                        .foregroundColor(DesignTokens.textSecondary)
                        .lineLimit(2)
                        .padding(8)
                        .background(DesignTokens.surfaceCream)
                        .cornerRadius(8)
                }
            }
            .frame(maxWidth: .infinity, alignment: .topLeading)
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color.white)
        .widgetURL(URL(string: "widget://chat"))
    }
}

// MARK: - Large Widget

struct LargeWidgetView: View {
    let entry: IraEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header — unread count + timestamp
            HStack {
                HStack(spacing: 8) {
                    Text("\(entry.widgetData?.unreadCount ?? 0)")
                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                        .foregroundColor(.white)
                        .frame(width: 32, height: 32)
                        .background(DesignTokens.textPrimary)
                        .clipShape(Circle())
                    
                    Text("unread messages")
                        .font(.system(size: 13))
                        .foregroundColor(DesignTokens.textSecondary)
                }
                
                Spacer()
                
                Text(formatTimeAgo(entry.widgetData?.updatedAt ?? 0))
                    .font(.system(size: 11, weight: .light))
                    .foregroundColor(DesignTokens.textSecondary)
            }
            
            // Message preview
            if let preview = entry.widgetData?.messagePreview {
                VStack(alignment: .leading, spacing: 4) {
                    Text(preview.sender)
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(DesignTokens.textPrimary)
                    
                    Text(preview.snippet)
                        .font(.system(size: 13))
                        .foregroundColor(DesignTokens.textSecondary)
                        .lineLimit(2)
                }
            }
            
            Divider()
                .background(DesignTokens.border)
            
            // Event + Health
            HStack(spacing: 16) {
                if let event = entry.widgetData?.nextEvent {
                    Link(destination: URL(string: event.deepLink)!) {
                        HStack(spacing: 4) {
                            Text("📅")
                            VStack(alignment: .leading) {
                                Text(event.title)
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(DesignTokens.textPrimary)
                                    .lineLimit(1)
                                Text("in \(event.startsInMinutes) min")
                                    .font(.system(size: 11, weight: .light))
                                    .foregroundColor(DesignTokens.textSecondary)
                            }
                        }
                    }
                }
                
                if let health = entry.widgetData?.healthInsight {
                    HStack(spacing: 4) {
                        Text(health.type == "sleep" ? "😴" : "🚶")
                        Text(health.message)
                            .font(.system(size: 12))
                            .foregroundColor(DesignTokens.textSecondary)
                            .lineLimit(1)
                    }
                }
            }
            
            // Suggestion card
            if let suggestion = entry.widgetData?.suggestions.first {
                VStack(alignment: .leading, spacing: 4) {
                    Text(suggestion.source)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(DesignTokens.textSecondary)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(DesignTokens.surfaceCream)
                        .cornerRadius(4)
                    
                    Text(suggestion.message)
                        .font(.system(size: 14).italic())
                        .foregroundColor(DesignTokens.textPrimary)
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(DesignTokens.surfaceCream)
                .cornerRadius(12)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
        .background(Color.white)
        .widgetURL(URL(string: "widget://chat"))
    }
    
    private func formatTimeAgo(_ timestamp: Double) -> String {
        let diffMs = Date().timeIntervalSince1970 * 1000 - timestamp
        let minutes = Int(diffMs / 60000)
        if minutes < 1 { return "just now" }
        if minutes < 60 { return "\(minutes)m ago" }
        return "\(minutes / 60)h ago"
    }
}

// MARK: - Lock Screen Widgets

struct LockScreenRectangularView: View {
    let entry: IraEntry
    
    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            if let event = entry.widgetData?.nextEvent {
                Text("📅 \(event.title)")
                    .font(.system(size: 13, weight: .medium))
                    .lineLimit(1)
                Text("in \(event.startsInMinutes) min")
                    .font(.system(size: 11, weight: .light))
            } else {
                Text("nothing ahead")
                    .font(.system(size: 13))
                    .italic()
            }
        }
    }
}

struct LockScreenCircularView: View {
    let entry: IraEntry
    
    var body: some View {
        ZStack {
            AccessoryWidgetBackground()
            Text("\(entry.widgetData?.unreadCount ?? 0)")
                .font(.system(size: 20, weight: .semibold, design: .rounded))
        }
    }
}

struct LockScreenInlineView: View {
    let entry: IraEntry
    
    var body: some View {
        if let suggestion = entry.widgetData?.suggestions.first {
            Text(suggestion.message)
        } else if let event = entry.widgetData?.nextEvent {
            Text("\(event.title) in \(event.startsInMinutes)m")
        } else {
            Text("no suggestions right now")
        }
    }
}
