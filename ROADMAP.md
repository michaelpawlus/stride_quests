# Stride Quests - Roadmap

## Phase 1: Core Mechanics (Current)

Deliver the minimum viable product with Strava integration, quest validation, the Bounty Board, Momentum Meter, and XP system. See [PRD.md](./PRD.md) for full Phase 1 requirements.

---

## Phase 2: Maps & Social

Add visual map experiences and light social features to increase engagement and discovery.

- **Interactive Quest Map**: Leaflet or Mapbox-powered map showing quest checkpoint locations, geofence radii, and the user's completed route overlays.
- **Activity Feed**: A feed displaying recent quest completions across all users, giving a sense of community activity.
- **Leaderboard**: XP-based leaderboard with weekly, monthly, and all-time views so runners can compare progress.
- **Achievement Badges**: Unlockable badges for milestones such as first quest completed, 10 quests completed, 30-day momentum streak, all Columbus parks visited, etc.
- **Quest Difficulty Auto-Calibration**: Adjust quest difficulty ratings dynamically based on aggregate completion rates and average completion times.

---

## Phase 3: User-Generated Content & Guilds

Shift from curated content to a community-driven quest ecosystem with team mechanics.

- **Custom Quest Creation**: Users can design and publish their own quests by placing checkpoints on the map, writing descriptions, and setting difficulty.
- **Quest Rating & Review System**: Runners can rate and leave reviews on quests, surfacing the best community-created content.
- **Running Guilds / Teams**: Users form or join guilds. Guild members share a combined quest log and XP total.
- **Guild Challenges & Competitions**: Time-limited guild vs. guild competitions (e.g., "Which guild completes the most quests this month?").
- **Seasonal Quest Rotations**: Curated seasonal quest packs that rotate on a schedule (e.g., summer park series, fall foliage routes, holiday-themed scavenger hunts).

---

## Phase 4: AI & Expansion

Scale beyond Columbus and introduce intelligent quest generation and premium offerings.

- **AI-Generated Quests**: Use AI to generate quests tailored to user preferences, running history, and unexplored areas of the city. Quests adapt to the runner's fitness level and interests.
- **Multi-City Expansion**: Generalize the platform beyond Columbus with dynamic city support. New cities can be onboarded with seed quest packs and community contributions.
- **Training Plan Integration**: Quests that align with a runner's training plan -- e.g., a long-run quest on Sunday that matches the prescribed mileage, or interval-friendly routes for speed work days.
- **Premium Features & Monetization**: Introduce a premium tier with perks such as unlimited quest slots, exclusive quest packs, advanced analytics, and priority access to new cities.
- **Native Mobile App**: Build a React Native mobile app for iOS and Android, enabling push notifications, live quest tracking, and offline map caching.
