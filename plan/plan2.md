# Cross-App Intelligence & Home Screen Widget System — Adjusted Plan

This plan is adapted from the original exhaustive engineering plan, specifically tailored for a Windows development environment without an active Apple Developer ID.

## 1. Key Assumptions & Constraints

1.  **iOS Build Limitation:** Due to the lack of an Apple Developer Account and macOS environment, building and distributing a signed iOS `.ipa` (especially with App Groups and WidgetKit extensions) via EAS is not feasible. 
    *   *Action:* The primary functional deliverable and compiled binary will be for **Android (.apk)**. 
    *   *Action:* iOS Swift code (WidgetKit + Native Modules) will be written and provided for code review but will not be expected to be tested by the candidate.
2.  **Reviewer Environment:** Evaluators testing the APK may not have rich, populated data (like HealthKit/Google Fit, full calendars, or deep app usage history) on their test devices.
    *   *Action:* A "Mock Data Mode" or "Simulation Toggle" will be included in the host app to feed the intelligence engine with realistic simulated signals, ensuring reviewers can evaluate the engine's logic.
3.  **Host App Scope:** The host messaging app is purely a shell.
    *   *Action:* Only build screens necessary for Permissions Onboarding, Widget Data bridging, and the Developer/Mock Data toggle. No actual chat functionality will be built.
4.  **Local-First Engine:** Deploying a backend API adds overhead and violates privacy principles.
    *   *Action:* The Contexual Suggestion Engine will run entirely on-device using a pure TypeScript rule-engine and/or lightweight local heuristics.

---

## 2. Updated Project Scope

### Phase 1: Foundation & Android Widget (Hours 0-24)
*   **Init:** Expo SDK 51 bare workflow (or managed with config plugins).
*   **Native Bridge:** Implement `Expo Modules API` for Android to write to `DataStore`.
*   **Android Widget Development:** Use `react-native-android-widget` (or write direct Kotlin + Jetpack Glance). 
    *   Implement Small, Medium, and Large variants.
    *   Test on local Android Emulator.

### Phase 2: iOS Code [Review Only] (Hours 24-36)
*   *Note: This phase is for source code delivery only.*
*   **WidgetKit Swift Code:** Write `WidgetBundle`, `TimelineProvider`, and SwiftUI Views (Small, Medium, Large, LockScreen).
*   **Expo Plugin:** Write the `app.config.ts` plugin logic to inject the App Group entitlements and iOS widget build phases, proving knowledge of the pipeline.

### Phase 3: Intelligence Engine & Native Signals (Hours 36-54)
*   **Data Sources:** Implement native hooks for Calendar (`expo-calendar`), Contacts (`expo-contacts`), and local mock generators.
*   **Engine Core:** 
    *   `SignalCollector`: Normalizes OS signals.
    *   `RuleEngine`: Scores events (e.g., event within 30 mins = high score).
    *   `SuggestionQueue`: Prioritizes top 3 widgets to display.

### Phase 4: Permissions UX & Integration (Hours 54-66)
*   **UI:** Build progressive onboarding using Expo Router.
*   **Bridging:** Connect the Engine's output to the WidgetData payload and trigger OS widget refreshes.

### Phase 5: Polish & Documentation (Hours 66-72)
*   **Testing:** Jest unit tests for the RuleEngine and SuggestionQueue.
*   **Docs:** Update README explaining the architecture, how to trigger mock data, and detailing the iOS limitation.

---

## 3. Architecture Adjustments

Because of the Windows/iOS limits, the build pipeline targets local Android emulation and EAS Android builds:

```
Windows Machine 
  ├── Native Android Code (Kotlin/Glance) ---> Local Android Emulator (Testing)
  ├── React Native UI (Permissions/Engine) --> Local Android Emulator
  └── iOS Native Code (Swift/WidgetKit) -----> Stored in Git (Code Review only)

EAS Build System
  └── platform: android ---> .apk (Deliverable for Evaluator)
```

## 4. Suggestion Engine (On-Device)
Instead of ML/Backend, we will use a strict deterministic scoring model:
1.  **Time Proximity:** Event starts in < 1h (+0.8 score).
2.  **Habit Gap:** Top contact hasn't been messaged in 3 days (+0.6 score).
3.  **Contextual Nudge:** Late night (11 PM) + low sleep last night (+0.7 score).
*Any score > 0.5 surfaces to the widget.*
