import { db } from "@/db";
import { momentumLog, userStats } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

function dateString(d: Date): string {
  return d.toISOString().split("T")[0];
}

export async function logRunDay(userId: number, date?: string): Promise<void> {
  const day = date ?? todayString();

  const existing = await db
    .select()
    .from(momentumLog)
    .where(and(eq(momentumLog.userId, userId), eq(momentumLog.date, day)))
    .get();

  if (existing) {
    if (!existing.didRun) {
      await db.update(momentumLog)
        .set({ didRun: true, usedRestCredit: false, streakBroken: false })
        .where(eq(momentumLog.id, existing.id))
        .run();
    }
    return;
  }

  await db.insert(momentumLog)
    .values({ userId, date: day, didRun: true })
    .run();

  // Award 1 base rest credit for running
  await awardRestCredits(userId, 1);
}

export async function awardRestCredits(userId: number, amount: number): Promise<void> {
  const stats = await getOrCreateStats(userId);
  const newCredits = Math.min(stats.restCredits + amount, stats.maxRestCredits);

  await db.update(userStats)
    .set({ restCredits: newCredits })
    .where(eq(userStats.userId, userId))
    .run();
}

export async function getOrCreateStats(userId: number) {
  let stats = await db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, userId))
    .get();

  if (!stats) {
    await db.insert(userStats).values({ userId }).run();
    stats = (await db
      .select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .get())!;
  }

  return stats;
}

/**
 * Fill in any missed days between the last logged day and today.
 * For each missed day, consume a rest credit or break the streak.
 */
export async function reconcileMissedDays(userId: number): Promise<void> {
  const stats = await getOrCreateStats(userId);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Find the most recent log entry
  const lastLog = await db
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

    const existing = await db
      .select()
      .from(momentumLog)
      .where(and(eq(momentumLog.userId, userId), eq(momentumLog.date, day)))
      .get();

    if (!existing) {
      if (currentCredits > 0) {
        // Use a rest credit
        currentCredits--;
        await db.insert(momentumLog)
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
        await db.insert(momentumLog)
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
  await db.update(userStats)
    .set({ restCredits: currentCredits })
    .where(eq(userStats.userId, userId))
    .run();

  // Recalculate streak
  await recalculateMomentum(userId);
}

/**
 * Count consecutive days backward from yesterday where streak was not broken.
 */
export async function recalculateMomentum(userId: number): Promise<void> {
  const logs = await db
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

  const stats = await getOrCreateStats(userId);
  const longestStreak = Math.max(stats.longestStreak, streak);

  await db.update(userStats)
    .set({ currentStreak: streak, longestStreak })
    .where(eq(userStats.userId, userId))
    .run();
}

export async function getRecentDays(userId: number, count: number = 30) {
  return await db
    .select()
    .from(momentumLog)
    .where(eq(momentumLog.userId, userId))
    .orderBy(desc(momentumLog.date))
    .limit(count)
    .all();
}
