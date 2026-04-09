Cross-App Intelligence & Home Screen Widget System
Duration: 72 hours
Goal: Evaluate mobile system integration, widget development, contextual intelligence, permission design, and cross-app data access.
Context
You're building a home-screen widget + intelligence engine similar to "Google At a Glance" + "Siri Suggestions".
The system should surface relevant content (e.g., unread messages, upcoming meetings, health insights) and enable quick actions.
You will deliver:
* High-level architecture
* Low-level design
* Widget implementations (Android + iOS)
* Native modules for reading cross-app data (with permissions)
* Contextual suggestion engine
* Tests and documentation
Part A — Widgets (Android + iOS)
Android
Build using Jetpack Glance or RemoteViews.
Widget variants:
* Small: unread count + quick chat
* Medium: unread count + message preview + actions
* Large: preview + quick actions + contextual suggestion
Support:
* Dark mode
* Deep linking into app
* Tap zones
* Periodic refresh (∼15 min or OS-dependent)
* Optional animated refresh indicator
iOS
WidgetKit (SwiftUI):
* Small, Medium, Large
* Lock screen widget
* Deep linking
* Timelines that update based on time of day or external triggers
Part B — Cross-App Intelligence Layer (Permissions Required)
Expose a React Native interface that retrieves contextual signals such as:
* Installed apps (by category)
* Calendar / upcoming events
* Music listening history
* Health data (sleep, steps)
* Frequent contacts
* App usage patterns
You decide how to:
* Cache
* Prioritize data sources
* Handle denied permissions
* Model user preferences
Part C — Contextual Suggestion Engine
Given your cross-app data:
Generate contextual suggestions such as:
* Conversation starters
* Reminders
* Wellness nudges
* Timely prompts
* Behavior-based "Ira feels present" moments
This can be rule-based or ML-inspired — you decide.
Each suggestion includes:
* message
* relevance score
* source
* optional deep link action
Part D — Permission UX
Design the permission flow:
* Progressive onboarding
* Clear justification
* Graceful fallback
* Re-request logic
* Settings page
Deliverables
* [ ] High-level architectural diagram
* [ ] Low-level design (widget architecture, data pipeline, suggestion engine)
* [ ] Working Android + iOS widget implementations
* [ ] Native modules for cross-app intelligence
* [ ] React Native hooks (e.g., useWidget, useContextualSuggestions)
* [ ] Tests for native modules
* [ ] Documentation