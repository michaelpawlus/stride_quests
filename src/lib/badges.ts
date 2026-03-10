import { db } from "@/db";
import {
  userBadges,
  userQuests,
  userStats,
  users,
  quests,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { BadgeCategory, UserBadge } from "@/types";
import { getOrCreateStats } from "./momentum";

type BadgeDefinition = {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  check: (userId: number) => boolean;
};

const BADGES: BadgeDefinition[] = [
  // Quest badges
  {
    id: "first_steps",
    name: "First Steps",
    description: "Complete your first quest",
    icon: "Footprints",
    category: "quest",
    check: (userId) => {
      const stats = getOrCreateStats(userId);
      return stats.questsCompleted >= 1;
    },
  },
  {
    id: "quest_veteran",
    name: "Quest Veteran",
    description: "Complete 10 quests",
    icon: "Award",
    category: "quest",
    check: (userId) => {
      const stats = getOrCreateStats(userId);
      return stats.questsCompleted >= 10;
    },
  },
  {
    id: "trailblazer",
    name: "Trailblazer",
    description: "Complete a point-to-point quest",
    icon: "Route",
    category: "quest",
    check: (userId) => {
      const completed = db
        .select({ type: quests.type })
        .from(userQuests)
        .innerJoin(quests, eq(userQuests.questId, quests.id))
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(userQuests.status, "completed"),
            eq(quests.type, "point_to_point")
          )
        )
        .all();
      return completed.length > 0;
    },
  },
  {
    id: "seeker",
    name: "Seeker",
    description: "Complete a scavenger quest",
    icon: "Search",
    category: "quest",
    check: (userId) => {
      const completed = db
        .select({ type: quests.type })
        .from(userQuests)
        .innerJoin(quests, eq(userQuests.questId, quests.id))
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(userQuests.status, "completed"),
            eq(quests.type, "scavenger")
          )
        )
        .all();
      return completed.length > 0;
    },
  },
  {
    id: "park_champion",
    name: "Park Champion",
    description: "Complete all collector quests",
    icon: "Trees",
    category: "quest",
    check: (userId) => {
      const allCollectors = db
        .select({ id: quests.id })
        .from(quests)
        .where(eq(quests.type, "collector"))
        .all();
      if (allCollectors.length === 0) return false;
      const completedCollectors = db
        .select({ questId: userQuests.questId })
        .from(userQuests)
        .innerJoin(quests, eq(userQuests.questId, quests.id))
        .where(
          and(
            eq(userQuests.userId, userId),
            eq(userQuests.status, "completed"),
            eq(quests.type, "collector")
          )
        )
        .all();
      return completedCollectors.length >= allCollectors.length;
    },
  },

  // Momentum badges
  {
    id: "unstoppable",
    name: "Unstoppable",
    description: "Achieve a 30-day streak",
    icon: "Flame",
    category: "momentum",
    check: (userId) => {
      const stats = getOrCreateStats(userId);
      return stats.longestStreak >= 30;
    },
  },

  // XP badges
  {
    id: "getting_started",
    name: "Getting Started",
    description: "Earn 100 XP",
    icon: "Zap",
    category: "xp",
    check: (userId) => {
      const user = db
        .select({ totalXp: users.totalXp })
        .from(users)
        .where(eq(users.id, userId))
        .get();
      return (user?.totalXp ?? 0) >= 100;
    },
  },
  {
    id: "rising_star",
    name: "Rising Star",
    description: "Earn 500 XP",
    icon: "Star",
    category: "xp",
    check: (userId) => {
      const user = db
        .select({ totalXp: users.totalXp })
        .from(users)
        .where(eq(users.id, userId))
        .get();
      return (user?.totalXp ?? 0) >= 500;
    },
  },
  {
    id: "legend",
    name: "Legend",
    description: "Earn 1000 XP",
    icon: "Crown",
    category: "xp",
    check: (userId) => {
      const user = db
        .select({ totalXp: users.totalXp })
        .from(users)
        .where(eq(users.id, userId))
        .get();
      return (user?.totalXp ?? 0) >= 1000;
    },
  },

  // Activity badges
  {
    id: "regular_runner",
    name: "Regular Runner",
    description: "Sync 10 activities from Strava",
    icon: "Activity",
    category: "activity",
    check: (userId) => {
      const stats = getOrCreateStats(userId);
      return stats.activitiesSynced >= 10;
    },
  },
  {
    id: "dedicated",
    name: "Dedicated",
    description: "Sync 50 activities from Strava",
    icon: "Heart",
    category: "activity",
    check: (userId) => {
      const stats = getOrCreateStats(userId);
      return stats.activitiesSynced >= 50;
    },
  },
];

export function checkAndAwardBadges(userId: number): string[] {
  const existing = db
    .select({ badgeId: userBadges.badgeId })
    .from(userBadges)
    .where(eq(userBadges.userId, userId))
    .all();

  const earnedIds = new Set(existing.map((b) => b.badgeId));
  const newBadgeIds: string[] = [];

  for (const badge of BADGES) {
    if (earnedIds.has(badge.id)) continue;

    if (badge.check(userId)) {
      db.insert(userBadges)
        .values({ userId, badgeId: badge.id })
        .run();
      newBadgeIds.push(badge.id);
    }
  }

  return newBadgeIds;
}

export function getUserBadges(userId: number): UserBadge[] {
  const earned = db
    .select()
    .from(userBadges)
    .where(eq(userBadges.userId, userId))
    .all();

  const earnedMap = new Map(
    earned.map((b) => [b.badgeId, b.unlockedAt])
  );

  return BADGES.map((badge) => ({
    id: badge.id,
    name: badge.name,
    description: badge.description,
    icon: badge.icon,
    category: badge.category,
    unlocked: earnedMap.has(badge.id),
    unlockedAt: earnedMap.get(badge.id) ?? null,
  }));
}
