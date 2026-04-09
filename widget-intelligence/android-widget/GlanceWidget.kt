package com.widget.intelligence.widget

import org.json.JSONObject
import org.json.JSONArray

/**
 * WidgetData — Kotlin data class matching the TS WidgetData interface.
 * Parsed from JSON stored in SharedPreferences (bridged from Expo Module).
 */
data class WidgetData(
    val updatedAt: Long,
    val unreadCount: Int,
    val messagePreview: MessagePreview?,
    val nextEvent: NextEvent?,
    val healthInsight: HealthInsight?,
    val suggestions: List<Suggestion>
)

data class MessagePreview(
    val sender: String,
    val snippet: String,
    val deepLink: String
)

data class NextEvent(
    val title: String,
    val startsInMinutes: Int,
    val deepLink: String
)

data class HealthInsight(
    val type: String,  // "sleep" | "steps" | "streak"
    val message: String
)

data class Suggestion(
    val id: String,
    val message: String,
    val relevanceScore: Double,
    val source: String,
    val deepLinkAction: String?,
    val expiresAt: Long
)

/**
 * WidgetDataParser — Parses JSON from SharedPreferences into WidgetData.
 */
object WidgetDataParser {

    fun parse(jsonString: String): WidgetData {
        return try {
            val json = JSONObject(jsonString)
            WidgetData(
                updatedAt = json.optLong("updatedAt", System.currentTimeMillis()),
                unreadCount = json.optInt("unreadCount", 0),
                messagePreview = parseMessagePreview(json.optJSONObject("messagePreview")),
                nextEvent = parseNextEvent(json.optJSONObject("nextEvent")),
                healthInsight = parseHealthInsight(json.optJSONObject("healthInsight")),
                suggestions = parseSuggestions(json.optJSONArray("suggestions"))
            )
        } catch (e: Exception) {
            empty()
        }
    }

    fun empty(): WidgetData {
        return WidgetData(
            updatedAt = System.currentTimeMillis(),
            unreadCount = 0,
            messagePreview = null,
            nextEvent = null,
            healthInsight = null,
            suggestions = emptyList()
        )
    }

    private fun parseMessagePreview(json: JSONObject?): MessagePreview? {
        json ?: return null
        return MessagePreview(
            sender = json.optString("sender", ""),
            snippet = json.optString("snippet", ""),
            deepLink = json.optString("deepLink", "")
        )
    }

    private fun parseNextEvent(json: JSONObject?): NextEvent? {
        json ?: return null
        return NextEvent(
            title = json.optString("title", ""),
            startsInMinutes = json.optInt("startsInMinutes", 0),
            deepLink = json.optString("deepLink", "")
        )
    }

    private fun parseHealthInsight(json: JSONObject?): HealthInsight? {
        json ?: return null
        return HealthInsight(
            type = json.optString("type", ""),
            message = json.optString("message", "")
        )
    }

    private fun parseSuggestions(jsonArray: JSONArray?): List<Suggestion> {
        if (jsonArray == null) return emptyList()
        val suggestions = mutableListOf<Suggestion>()
        for (i in 0 until jsonArray.length()) {
            val json = jsonArray.optJSONObject(i) ?: continue
            suggestions.add(
                Suggestion(
                    id = json.optString("id", ""),
                    message = json.optString("message", ""),
                    relevanceScore = json.optDouble("relevanceScore", 0.0),
                    source = json.optString("source", ""),
                    deepLinkAction = json.optString("deepLinkAction", null),
                    expiresAt = json.optLong("expiresAt", 0)
                )
            )
        }
        return suggestions
    }
}
