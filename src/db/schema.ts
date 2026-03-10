import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  stravaAthleteId: integer("strava_athlete_id").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  stravaAccessToken: text("strava_access_token").notNull(),
  stravaRefreshToken: text("strava_refresh_token").notNull(),
  stravaTokenExpiresAt: integer("strava_token_expires_at").notNull(),
  totalXp: integer("total_xp").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`)
    .$onUpdate(() => sql`(datetime('now'))`),
});

export const quests = sqliteTable("quests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  flavorText: text("flavor_text"),
  type: text("type", {
    enum: ["point_to_point", "collector", "scavenger"],
  }).notNull(),
  difficulty: text("difficulty", {
    enum: ["easy", "medium", "hard"],
  }).notNull(),
  xpReward: integer("xp_reward").notNull(),
  restCreditReward: integer("rest_credit_reward").notNull().default(1),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const questCheckpoints = sqliteTable("quest_checkpoints", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  questId: integer("quest_id")
    .notNull()
    .references(() => quests.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  hint: text("hint"),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  radiusMeters: integer("radius_meters").notNull().default(100),
  sortOrder: integer("sort_order").notNull().default(0),
  isRevealed: integer("is_revealed", { mode: "boolean" })
    .notNull()
    .default(true),
});

export const userQuests = sqliteTable("user_quests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  questId: integer("quest_id")
    .notNull()
    .references(() => quests.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["active", "completed", "abandoned"],
  })
    .notNull()
    .default("active"),
  activatedAt: text("activated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  completedAt: text("completed_at"),
});

export const checkpointHits = sqliteTable("checkpoint_hits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  userQuestId: integer("user_quest_id")
    .notNull()
    .references(() => userQuests.id, { onDelete: "cascade" }),
  checkpointId: integer("checkpoint_id")
    .notNull()
    .references(() => questCheckpoints.id, { onDelete: "cascade" }),
  stravaActivityId: integer("strava_activity_id"),
  hitAt: text("hit_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  distanceMeters: real("distance_meters"),
});

export const stravaActivities = sqliteTable("strava_activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  stravaActivityId: integer("strava_activity_id").notNull().unique(),
  name: text("name"),
  activityType: text("activity_type"),
  startDate: text("start_date"),
  distanceMeters: real("distance_meters"),
  movingTimeSeconds: integer("moving_time_seconds"),
  summaryPolyline: text("summary_polyline"),
  processedAt: text("processed_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const momentumLog = sqliteTable("momentum_log", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: text("date").notNull(),
  didRun: integer("did_run", { mode: "boolean" }).notNull().default(false),
  usedRestCredit: integer("used_rest_credit", { mode: "boolean" })
    .notNull()
    .default(false),
  streakBroken: integer("streak_broken", { mode: "boolean" })
    .notNull()
    .default(false),
});

export const userBadges = sqliteTable("user_badges", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  badgeId: text("badge_id").notNull(),
  unlockedAt: text("unlocked_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

export const userStats = sqliteTable("user_stats", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  restCredits: integer("rest_credits").notNull().default(0),
  maxRestCredits: integer("max_rest_credits").notNull().default(7),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  questsCompleted: integer("quests_completed").notNull().default(0),
  activitiesSynced: integer("activities_synced").notNull().default(0),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`)
    .$onUpdate(() => sql`(datetime('now'))`),
});
