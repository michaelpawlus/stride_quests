import { db } from "@/db";
import { momentumLog, userStats } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

function dateString(d: Date): string {
  return d.toISOString().split("T")[0];
}

export function logRunDay(userId: number, date?: string): void {
  const day = date ?? todayString();

  const existing = db
    .select()
    .from(momentumLog)
    .where(and(eq(momentumLog.userId, userId), eq(momentumLog.date, day)))
    .get();

  if (existing) {
    if (!existing.didRun) {
      db.update(momentumLog)
        .set({ didRun: true, usedRestCredit: false, streakBroken: false })
        .where(eq(momentumLog.id, existing.id))
        .run();
    }
    return;
  }

  db.insert(momentumLog)
    .values({ userId, date: day, didRun: true })
    .run();

  // Award 1 base rest credit for running
  awardRestCredits(userId, 1);
}

export function awardRestCredits(userId: number, amount: number): void {
  const stats = getOrCreateStats(userId);
  const newCredits = Math.min(stats.restCredits + amount, stats.maxRestCredits);

  db.update(userStats)
    .set({ restCredits: newCredits })
    .where(eq(userStats.userId, userId))
    .run();
}

export function getOrCreateStats(userId: number) {
  let stats = db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .get();

  if (!stats) {
    db.insert(userStats).values({ userId }).run();
    stats = db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .get()!;
  }

  return stats;
}

/**
 * Fill in any missed days between the last logged day and today.
 * For each missed day, consume a rest credit or break the streak.
 */
export function reconcileMissedDays(userId: number): void {
  const stats = getOrCreateStats(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the most recent log entry
  const lastLog = db
    .select()
    .from(momentumLog)
    .where(eq(momentumLog.userId, userId))
    .orderBy(desc(momentumLog.date))
    .limit(1)
    .get();

  if (!lastLog) return;

  const lastDate = new Date(lastLog.date + "T00:00:00");
  const dayAfterLast = new Date(lastDate);
  dayAfterLast.setDate(dayAfterLast.getDate() + 1);

  let currentCredits = stats.restCredits;

  // Fill each missed day
  const cursor = new Date(dayAfterLast);
  while (cursor < today) {
    const day = dateString(cursor);

    const existing = db
      .select()
      .from(momentumLog)
      .where(and(eq(momentumLog.userId, userId), eq(momentumLog.date, day)))
      .get();

    if (!existing) {
      if (currentCredits > 0) {
        // Use a rest credit
        currentCredits--;
        db.insert(momentumLog)
          .values({
            userId,
            date: day,
            didRun: false,
            usedRestCredit: true,
            streakBroken: false,
          })
          .run();
      } else {
        // Streak broken
        db.insert(momentumLog)
          .values({
            userId,
            date: day,
            didRun: false,
            usedRestCredit: false,
            streakBroken: true,
          })
          .run();
      }
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  // Update rest credits
  db.update(userStats)
    .set({ restCredits: currentCredits })
    .where(eq(userStats.userId, userId))
    .run();

  // Recalculate streak
  recalculateMomentum(userId);
}

/**
 * Count consecutive days backward from yesterday where streak was not broken.
 */
export function recalculateMomentum(userId: number): void {
  const logs = db
    .select()
    .from(momentumLog)
    .where(eq(momentumLog.userId, userId))
    .orderBy(desc(momentumLog.date))
    .all();

  let streak = 0;
  for (const log of logs) {
    if (log.streakBroken) break;
    if (log.didRun || log.usedRestCredit) {
      streak++;
    } else {
      break;
    }
  }

  const stats = getOrCreateStats(userId);
  const longestStreak = Math.max(stats.longestStreak, streak);

  db.update(userStats)
    .set({ currentStreak: streak, longestStreak })
    .where(eq(userStats.userId, userId))
    .run();
}

export function getRecentDays(userId: number, count: number = 30) {
  return db
    .select()
    .from(momentumLog)
    .where(eq(momentumLog.userId, userId))
    .orderBy(desc(momentumLog.date))
    .limit(count)
    .all();
}
