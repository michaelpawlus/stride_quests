# Stride Quests - Product Requirements Document

## Overview

Stride Quests is a gamified companion app for runners that transforms Columbus, OH into an adventure map. It layers on top of Strava, using GPS polyline data to validate "Quest" completion. Users discover quests on a Bounty Board, run with Strava, and earn XP plus Rest Credits when their GPS track passes through quest geofences. A forgiving "Momentum Meter" replaces traditional punitive streak systems with a rest-credit bank so runners can take days off without losing progress.

## Problem Statement

Running apps today are excellent at tracking distance, pace, and splits, but they do nothing to make running feel like an adventure. Routes grow stale, motivation drops, and the prevailing "streak" mechanic actively punishes rest days -- the very thing runners need to stay healthy. There is no mainstream app that turns a city into an explorable quest map while rewarding consistency without penalizing recovery.

## Target Users

- Columbus, OH area runners who already use Strava
- Runners looking for extra motivation to explore new routes and neighborhoods
- Casual to intermediate runners who want a game-like layer on top of their training
- Runners frustrated by streak mechanics that break when they take a rest day

## Core Features

### Strava Integration

- **OAuth Connect**: Users link their Strava account via OAuth 2.0 to authorize activity access.
- **Webhook-Based Activity Sync**: Strava pushes new activity events to the app via webhooks. The app fetches the full activity (including the encoded polyline) on each webhook event.
- **Polyline GPS Validation**: The app decodes the activity's summary polyline into a series of lat/lng points and checks those points against quest checkpoint geofences.

### Quest System

Three quest types provide variety in how runners engage with the map:

| Quest Type | Description | Example |
|---|---|---|
| **Point-to-Point** | Run from location A to location B. All checkpoints must be hit in order. | Start at the OSU Oval, finish at Ohio Stadium. |
| **Collector** | Visit N locations in any order during one or more activities. | Hit 3 Columbus metro parks. |
| **Scavenger** | Find hidden locations using text hints. The next checkpoint is only revealed after the current one is reached. | "Start where the Short North meets the highway..." |

Each quest has:
- A title, description, and difficulty rating (easy, medium, hard)
- One or more checkpoints, each with a lat/lng coordinate and a geofence radius
- An XP reward scaled by difficulty

### Bounty Board

The Bounty Board is the main dashboard where runners browse quests. It displays:

- **Available Quests**: Quests the user has not yet started
- **Active Quests**: Quests the user has accepted and is working on
- **Completed Quests**: Quests the user has finished, with completion date and stats

Filtering and sorting options include: quest type, difficulty, distance from current location, and XP reward.

### Momentum Meter

The Momentum Meter replaces traditional punitive streak systems with a forgiving rest-credit bank:

- Running on any given day earns rest credits that accumulate in a bank.
- Missing a day automatically spends one rest credit from the bank instead of breaking the streak.
- The streak only breaks when the user misses a day and has zero rest credits remaining.
- This lets runners take planned rest days guilt-free while still rewarding consistency.

See the **Rest Credit Rules** section below for full mechanics.

### XP System

- Users earn XP for completing quests.
- XP reward is base quest XP multiplied by a difficulty multiplier:
  - Easy: 1.0x
  - Medium: 1.5x
  - Hard: 2.0x
- XP accumulates over time and serves as the primary measure of overall progress.

## Geofence Validation

Each quest checkpoint defines a circular geofence:

- **Center**: Latitude and longitude of the checkpoint location
- **Radius**: Default 100 meters (configurable per checkpoint)

A checkpoint is considered "hit" when any point on the decoded GPS polyline of a Strava activity falls within the checkpoint's radius. Distance is calculated using the **Haversine formula** to account for Earth's curvature.

## Quest Completion Rules

| Quest Type | Completion Criteria |
|---|---|
| **Point-to-Point** | All checkpoints must be hit **in order** within a single activity. |
| **Collector** | All required locations must be hit in **any order**, across one or more activities. |
| **Scavenger** | Checkpoints are revealed one at a time. The next checkpoint hint is shown only after the current checkpoint is hit. All checkpoints must be completed sequentially across one or more activities. |

## Rest Credit Rules

| Rule | Detail |
|---|---|
| **Earn rate** | 1 base rest credit per day that includes at least one recorded run. |
| **Bonus credits** | Additional rest credits awarded upon quest completion (amount varies by quest difficulty). |
| **Maximum bank** | 7 rest credits. Credits beyond 7 are lost. |
| **Missed day cost** | Each calendar day with no recorded run auto-consumes 1 rest credit. |
| **Streak break** | The momentum streak breaks only when a day is missed AND the credit bank is already at 0. |

## Phase 1 Scope

Phase 1 is the minimum viable product focused on core mechanics:

- SQLite backend for data storage
- 12 seeded quests located across Columbus, OH
- Strava OAuth integration and webhook-based activity sync
- Polyline-based geofence validation
- Bounty Board UI with quest browsing, acceptance, and completion tracking
- Momentum Meter with rest credit mechanics
- XP tracking and difficulty multipliers
- No social features, no leaderboard

## Non-Goals for Phase 1

The following are explicitly out of scope for Phase 1:

- User-created quests
- Social or team features
- Route display on an interactive map
- Native mobile app (web-only for Phase 1)
- Leaderboards or competitive features
- Achievement badges
- Premium/paid features

## Success Metrics

| Metric | Target |
|---|---|
| Strava connection rate | User successfully connects Strava account on first session |
| Quest completion | User completes at least 1 quest within first 2 weeks |
| Momentum streak | User maintains a 7+ day momentum streak |
| Retention | User logs at least 1 activity per week over first month |
