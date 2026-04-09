# Widget Intelligence

> Cross-App Intelligence & Home Screen Widget System  
> Google At a Glance × Siri Suggestions

A home-screen widget + intelligence engine built with Expo SDK 51 that surfaces contextual content (unread messages, upcoming meetings, health insights) and enables quick actions through native widgets.

## Architecture

```
Host App (Settings & Permissions shell)
  └── Widget Extension (Android Jetpack Glance functional; iOS WidgetKit code review)
  └── Intelligence Engine (Local rules, no backend)
  └── Permission Onboarding (Handles OS grants)
  └── Native Modules (Reads OS data OR Mock Data fallback)
```

### Data Pipeline

```
Signal Collector  →  Rule Engine  →  Suggestion Queue  →  Widget Data  →  Native Widget
     ↑                                                         ↓
  OS APIs / Mock Data                              SharedPreferences / App Group
```

## Deliverables

| Deliverable | Status |
|---|---|
| High-level architectural diagram | ✅ Complete |
| Low-level design (widget architecture, data pipeline, suggestion engine) | ✅ Complete |
| Working Android widget implementation (Jetpack Glance) | ✅ Complete |
| iOS widget implementation (WidgetKit SwiftUI — code review only) | ✅ Complete |
| Native modules for cross-app intelligence | ✅ Complete |
| React Native hooks (useWidget, useContextualSuggestions, usePermissions) | ✅ Complete |
| Contextual suggestion engine (pure TypeScript rules) | ✅ Complete |
| Permission onboarding (3-step progressive wizard) | ✅ Complete |
| Developer mock data mode | ✅ Complete |
| Tests for engine modules | ✅ 57 tests passing |
| Documentation | ✅ This file |

## Tech Stack

| Layer | Choice |
|---|---|
| App framework | Expo SDK 51 |
| Language — app | TypeScript |
| Language — Android widget | Kotlin (Jetpack Glance) |
| Language — iOS widget | Swift (WidgetKit SwiftUI) |
| Build system | EAS Build |
| State management | Zustand |
| Server state | @tanstack/react-query |
| Key-value store | react-native-mmkv |
| Local database | expo-sqlite |

## Project Structure

```
widget-intelligence/
├── app/                          # Expo Router screens
│   ├── _layout.tsx               # Root layout with providers
│   ├── index.tsx                 # Home — widget preview + dev toggle
│   ├── settings.tsx              # Permission settings screen
│   └── onboarding/
│       └── permissions.tsx       # 3-step permission wizard
│
├── src/
│   ├── engine/
│   │   ├── signalCollector.ts    # Gathers OS or mock signals
│   │   ├── ruleEngine.ts         # Pure TS scoring (6 rules)
│   │   ├── suggestionQueue.ts    # Priority queue + dedup + cooldown
│   │   └── mockDataGenerator.ts  # Synthetic data for reviewers
│   │
│   ├── hooks/
│   │   ├── useWidget.ts          # Read/write/refresh widget data
│   │   ├── useContextualSuggestions.ts  # Ranked suggestions
│   │   └── usePermissions.ts     # Permission management
│   │
│   ├── types/
│   │   ├── WidgetData.ts         # Shared JSON contract
│   │   └── Signal.ts             # Signal types + TTL constants
│   │
│   └── store.ts                  # Zustand global state
│
├── modules/
│   └── widget-bridge/            # Custom Expo Module
│       ├── index.ts
│       ├── bridge.ts
│       ├── android/WidgetBridgeModule.kt
│       └── ios/WidgetBridgeModule.swift
│
├── android-widget/               # Jetpack Glance (compiled)
│   ├── WidgetReceiver.kt
│   ├── GlanceWidget.kt          # Data models + parser
│   ├── SmallWidget.kt
│   ├── MediumWidget.kt
│   ├── LargeWidget.kt
│   └── PeriodicRefreshWorker.kt
│
├── ios-widget/                   # WidgetKit SwiftUI (code review only)
│   ├── WidgetBundle.swift
│   ├── TimelineProvider.swift
│   ├── TimelineEntry.swift
│   └── SmallWidgetView.swift     # All sizes + lock screen views
│
└── __tests__/
    └── engine/
        ├── ruleEngine.test.ts         # 23 tests
        ├── suggestionQueue.test.ts    # 18 tests
        └── signalCollector.test.ts    # 16 tests
```

## Intelligence Engine

### Rule Scoring

| Rule | Condition | Score |
|---|---|---|
| Event proximity | Calendar event < 60 min | 0.80 |
| Event upcoming | Calendar event 1-3 hours | 0.50 |
| Sleep alert | Sleep < 6 hours | 0.70 |
| Sleep quality | Sleep < 7h + poor quality | 0.55 |
| Habit gap | Contact not messaged 7+ days | 0.60 |
| Contact reconnect | Contact not messaged 3-7 days | 0.50 |
| Step alert | Steps < 3000 after 8pm | 0.55 |
| Very low steps | Steps < 1000 after noon | 0.50 |
| Unread spike | > 5 unread messages | 0.65 |

- **Threshold**: Only suggestions scoring ≥ 0.45 are surfaced
- **Cap**: Maximum 3 suggestions at once
- **Cooldown**: 4-hour deduplication per suggestion ID
- **TTL**: Each signal source has independent TTL (5 min to 1 hour)

### Signal Sources

| Source | TTL | Data |
|---|---|---|
| Calendar | 5 min | Next 5 events in 24h window |
| Steps | 30 min | Today's count vs 10k goal |
| Sleep | 30 min | Last night's hours + quality |
| Contacts | 1 hour | Top 5 by interaction frequency |
| App Usage | 15 min | Top 3 categories by screen time |
| Music | 5 min | Currently/last played track |

## Widget Sizes

### Android (Jetpack Glance)

| Size | Content |
|---|---|
| Small | Unread count + quick chat action |
| Medium | Unread count + message preview + Reply/Open buttons |
| Large | Full dashboard: messages, event, health insight, suggestion |

### iOS (WidgetKit SwiftUI)

| Size | Content |
|---|---|
| Small | Unread count + greeting/next event |
| Medium | Unread + preview + event + suggestion |
| Large | Full dashboard with all sections |
| Lock Screen (Rectangular) | Next event title + time |
| Lock Screen (Circular) | Unread count |
| Lock Screen (Inline) | Suggestion text or event |

## Design System

**Warm minimalist** — cream surfaces, organic typography, quiet intelligence.

| Token | Light | Dark |
|---|---|---|
| surface | `#F5F0E8` cream | `#1C1A18` warm dark |
| card | `#FFFFFF` | `#2A2723` |
| text-primary | `#1A1A1A` | `#F0EBE1` |
| text-secondary | `#6B6560` | `#9A948D` |
| accent-pill | `#1A1A1A` bg / `#F5F0E8` text | inverted |
| granted | `#4A7C59` muted green | same |
| denied | `#C17A3A` muted amber | same |

### Copy Principles

- Always lowercase
- No exclamation marks
- 60 char max for suggestions
- Warm but not performative ("maybe check in with alex?" not "Don't forget to message Alex!")
- Relative timestamps ("2 min ago", "in 20 min")

## iOS Constraint

> **No Apple Developer Account available.** The iOS WidgetKit code is provided as complete Swift source for code review but cannot be compiled into an IPA. The Android APK is the primary functional deliverable.

## Quick Start

```bash
# Install dependencies
npm install

# Run tests (57 tests across 3 suites)
npm test

# Start development server
npm start

# EAS cloud build for Android
eas build --platform android --profile development
```

## Mock Data Mode

A Developer Mode toggle is included in the app to inject synthetic signals:
- 2 upcoming calendar events
- Poor sleep data (4.5h)
- Low step count (1847)
- Contacts with varying recency (1-8 days)
- Social media app usage
- Ambient music playing

This allows evaluators to test the intelligence engine without requiring real calendar, health, or contact data on the device.
