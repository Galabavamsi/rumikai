import WidgetKit
import Foundation

/**
 * IraEntry — TimelineEntry containing widget data for a point in time.
 */
struct IraEntry: TimelineEntry {
    let date: Date
    let widgetData: WidgetDataModel?
    
    static func placeholder() -> IraEntry {
        IraEntry(
            date: Date(),
            widgetData: WidgetDataModel(
                updatedAt: Date().timeIntervalSince1970 * 1000,
                unreadCount: 3,
                messagePreview: MessagePreviewModel(
                    sender: "alex",
                    snippet: "hey, are we still on for later?",
                    deepLink: "widget://chat/1"
                ),
                nextEvent: NextEventModel(
                    title: "team standup",
                    startsInMinutes: 25,
                    deepLink: "widget://meeting/1"
                ),
                healthInsight: HealthInsightModel(
                    type: "sleep",
                    message: "4.5h of sleep last night"
                ),
                suggestions: [
                    SuggestionModel(
                        id: "s1",
                        message: "maybe check in with alex?",
                        relevanceScore: 0.6,
                        source: "contacts",
                        deepLinkAction: "widget://contact/1",
                        expiresAt: Date().timeIntervalSince1970 * 1000 + 14400000
                    )
                ]
            )
        )
    }
}

// MARK: - Data Models

struct WidgetDataModel: Codable {
    let updatedAt: Double
    let unreadCount: Int
    let messagePreview: MessagePreviewModel?
    let nextEvent: NextEventModel?
    let healthInsight: HealthInsightModel?
    let suggestions: [SuggestionModel]
}

struct MessagePreviewModel: Codable {
    let sender: String
    let snippet: String
    let deepLink: String
}

struct NextEventModel: Codable {
    let title: String
    let startsInMinutes: Int
    let deepLink: String
}

struct HealthInsightModel: Codable {
    let type: String
    let message: String
}

struct SuggestionModel: Codable {
    let id: String
    let message: String
    let relevanceScore: Double
    let source: String
    let deepLinkAction: String?
    let expiresAt: Double
}
