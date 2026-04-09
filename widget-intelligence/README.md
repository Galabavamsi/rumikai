# ✧ Widget Intelligence
### Google At a Glance × Siri Suggestions

[![Expo SDK 54](https://img.shields.io/badge/Expo-SDK%2054-4630EB?logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Logic-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Kotlin](https://img.shields.io/badge/Kotlin-Android%20Widget-7F52FF?logo=kotlin&logoColor=white)](https://kotlinlang.org)
[![Swift](https://img.shields.io/badge/Swift-iOS%20Widget-F05138?logo=swift&logoColor=white)](https://developer.apple.com/swift/)

A zero-backend, on-device intelligence engine and home-screen widget system that surfaces quiet, contextual awareness through cross-app signal analysis.

---

## 🏗 System Architecture

The project consists of a React Native host app that orchestrates the intelligence engine, which then bridges data to native widget extensions on Android (Jetpack Glance) and iOS (WidgetKit).

```mermaid
graph TD
    subgraph "OS Layer (Signals)"
        Cal["📅 Calendar"]
        Hea["🚶 Health (Steps/Sleep)"]
        Con["👤 Contacts"]
        App["📱 App Usage"]
        Mus["🎵 Music"]
    end

    subgraph "Intelligence Engine (src/engine/)"
        SC["Signal Collector"]
        RE["Rule Engine (Scoring)"]
        SQ["Suggestion Queue (Priority/Dedup)"]
    end

    subgraph "Bridge Layer"
        EB["Expo Module Bridge"]
        SP["SharedPreferences (Android)"]
        UD["UserDefaults (iOS App Group)"]
    end

    subgraph "Presentation Layer"
        Android["Android Widget (Glance)"]
        iOS["iOS Widget (WidgetKit)"]
    end

    %% Data Flow
    Cal & Hea & Con & App & Mus --> SC
    SC -->|Signals| RE
    RE -->|Candidates| SQ
    SQ -->|WidgetData JSON| EB
    EB --> SP & UD
    SP --> Android
    UD --> iOS
```

---

## 🧠 Intelligence Engine: Signal Lifecycle

Every suggestion follows a strict lifecycle of scoring, thresholding, and cooldown to ensure it remains "quiet" and helpful, not intrusive.

```mermaid
sequenceDiagram
    participant OS as OS APIs / Mock Data
    participant SC as Signal Collector
    participant RE as Rule Engine
    participant SQ as Suggestion Queue
    participant W as Native Widget

    Note over OS,W: Cycle runs every ~15 minutes or on app wake

    OS->>SC: Raw data (Events, Steps, etc.)
    SC->>SC: Cache & TTL Check
    SC->>RE: Fresh Signals
    RE->>RE: Apply 6 Native Rules
    RE->>SQ: Candidate Suggestions (Scores 0.0-1.0)
    SQ->>SQ: Filter < 0.45 Threshold
    SQ->>SQ: Apply 4h Cooldown (Dedup)
    SQ->>SQ: Cap at Top 3
    SQ->>W: Push WidgetData.json
    W->>W: Render size-specific UI
```

---

## 🎨 Design System: Warm Minimalism

The UI is designed to feel human and organic, using cream surfaces and quiet typography.

### Color Palette

| Usage | Color | Sample | HSL / Hex |
|:--- |:--- |:---:|:--- |
| **Surface** | Cream | <img src="https://via.placeholder.com/60x20/F5F0E8/F5F0E8" alt="#F5F0E8" /> | `#F5F0E8` |
| **Card** | White | <img src="https://via.placeholder.com/60x20/FFFFFF/FFFFFF" alt="#FFFFFF" /> | `#FFFFFF` |
| **Primary Text** | Graphite | <img src="https://via.placeholder.com/60x20/1A1A1A/1A1A1A" alt="#1A1A1A" /> | `#1A1A1A` |
| **Secondary Text** | Muted Umber | <img src="https://via.placeholder.com/60x20/6B6560/6B6560" alt="#6B6560" /> | `#6B6560` |
| **Border** | Sand | <img src="https://via.placeholder.com/60x20/E0DAD0/E0DAD0" alt="#E0DAD0" /> | `#E0DAD0` |
| **Success/Score** | Sage | <img src="https://via.placeholder.com/60x20/4A7C59/4A7C59" alt="#4A7C59" /> | `#4A7C59` |
| **Warning/Denied** | Ochre | <img src="https://via.placeholder.com/60x20/C17A3A/C17A3A" alt="#C17A3A" /> | `#C17A3A` |

### Copy Principles
- **lowercase**: always lowercase, never shouting.
- **no exclamations**: quiet intelligence doesn't scream.
- **60 chars**: brevity remains the priority.
- **warmth**: "maybe check in with alex?" instead of "Contact Alex Reminder".

---

## ⚖️ The Intelligence Rulebook

| Signal | Logic | Score | Source |
|:--- |:--- |:---:|:--- |
| **Event Proximity** | Calendar event starting in < 60 min | **0.80** | 📅 Calendar |
| **Event Upcoming** | Calendar event starting in 1-3 hours | **0.50** | 📅 Calendar |
| **Sleep Alert** | Sleep duration < 6 hours last night | **0.70** | 😴 Health |
| **Sleep Quality** | Sleep < 7h + "poor" quality rating | **0.55** | 😴 Health |
| **Habit Gap** | Frequent contact not messaged in 7+ days | **0.60** | 👤 Contacts |
| **Contact Reconnect** | Frequent contact not messaged in 3-7 days | **0.50** | 👤 Contacts |
| **Step Alert** | Steps < 3000 detected after 8:00 PM | **0.55** | 🚶 Health |
| **Very Low Activity**| Steps < 1000 detected after 12:00 PM | **0.50** | 🚶 Health |
| **Unread Spike** | Currently > 5 unread messages waiting | **0.65** | 📱 Messages |

---

## 📱 Widget Matrix

### Android (Jetpack Glance)
| Size | Design Goal | Key Content |
|:--- |:--- |:--- |
| **Small (2x2)** | Quick Catch-up | Unread count + Direct Message action |
| **Medium (4x2)** | Contextual Flow | Message sender/snippet + Reply/Open buttons |
| **Large (4x4)** | Dashboard | Full context: Message + Next Event + Health + Suggestion |

### iOS (WidgetKit SwiftUI)
| Family | Content Breakdown |
|:--- |:--- |
| **Small** | Circle unread count + simple status greeting |
| **Medium** | Split view: Messages (left) / Events & Suggestions (right) |
| **Large** | Complete vertical stack of all active signals |
| **Lock Screen** | Rectangular (Event details), Circular (Unread badge), Inline (Suggestion text) |

---

## 🛠 Developer & Setup

### Requirements
- **Expo SDK 54+**
- **EAS CLI** (`npm install -g eas-cli`)
- **Android Studio** (for emulator) or **iPhone** (with Expo Go/Dev Client)

### Environment Setup
```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Run unit tests (57 tests passing)
npm test

# 3. Development Prebuild (Generates Android/iOS folders)
npx expo prebuild --clean

# 4. EAS Cloud Build (Android APK)
npx eas-cli build --platform android --profile development
```

> [!IMPORTANT]
> **Mock Data Mode**: A Developer Mode toggle is located in the app home. This allows you to test the intelligence engine logic on emulators without needing real device data permissions.

---

## 📁 Project Structure

```text
.
├── android-widget/       # Kotlin/Glance source
├── ios-widget/           # Swift/SwiftUI source (Review Only)
├── modules/              # Custom Expo Module (Native Bridge)
├── app/                  # Expo Router Screens
│   ├── onboarding/       # Permission Wizard
│   └── settings.tsx      # Config & Toggles
├── src/
│   ├── engine/           # Core Rule Scoring Logic
│   ├── hooks/            # Contextual Suggestion Hooks
│   ├── types/            # Shared JSON Contracts
│   └── store.ts          # Zustand Global State
├── __tests__/            # Jest Suites (Engine Coverage)
└── README.md             # You are here
```
