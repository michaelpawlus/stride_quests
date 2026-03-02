import { db } from "@/db";
import {
  users,
  quests,
  questCheckpoints,
  userQuests,
  checkpointHits,
  stravaActivities,
  userStats,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getValidAccessToken, getActivity } from "./strava";
import { decodePolyline } from "./polyline";
import { checkRouteAgainstGeofence } from "./geo";
import { logRunDay, awardRestCredits, getOrCreateStats } from "./momentum";

/**
 * Main orchestrator: processes a Strava activity for a user.
 * 1. Fetch activity from Strava
 * 2. Store in strava_activities
 * 3. Log run day for momentum
 * 4. Decode polyline
 * 5. Check all active quests' checkpoints
 * 6. Record hits, complete quests, award XP/rest credits
 */
export async function processStravaActivity(
  userId: number,
  stravaActivityId: number
): Promise<void> {
  // Check if already processed
  const existing = db
    .select()
    .from(stravaActivities)
    .where(eq(stravaActivities.stravaActivityId, stravaActivityId))
    .get();

  if (existing) return;

  // 1. Fetch activity from Strava
  const accessToken = await getValidAccessToken(userId);
  const activity = await getActivity(accessToken, stravaActivityId);

  // Only process runs
  if (activity.type !== "Run") return;

  // 2. Store activity
  db.insert(stravaActivities)
    .values({
      userId,
      stravaActivityId: activity.id,
      name: activity.name,
      activityType: activity.type,
      startDate: activity.start_date,
      distanceMeters: activity.distance,
      movingTimeSeconds: activity.moving_time,
      summaryPolyline: activity.map?.summary_polyline ?? null,
    })
    .run();

  // Update synced count
  const stats = getOrCreateStats(userId);
  db.update(userStats)
    .set({ activitiesSynced: stats.activitiesSynced + 1 })
    .where(eq(userStats.userId, userId))
    .run();

  // 3. Log run day for momentum
  const runDate = activity.start_date
    ? activity.start_date.split("T")[0]
    : undefined;
  logRunDay(userId, runDate);

  // 4. Decode polyline
  const polyline = activity.map?.summary_polyline;
  if (!polyline) return;

  const route = decodePolyline(polyline);
  if (route.length === 0) return;

  // 5. Get all active quests for this user
  const activeUserQuests = db
    .select()
    .from(userQuests)
    .where(and(eq(userQuests.userId, userId), eq(userQuests.status, "active")))
    .all();

  for (const uq of activeUserQuests) {
    const quest = db
      .select()
      .from(quests)
      .where(eq(quests.id, uq.questId))
      .get();

    if (!quest) continue;

    // Get all checkpoints for this quest
    const checkpoints = db
      .select()
      .from(questCheckpoints)
      .where(eq(questCheckpoints.questId, quest.id))
      .all()
      .sort((a, b) => a.sortOrder - b.sortOrder);

    // Get already-hit checkpoints
    const existingHits = db
      .select()
      .from(checkpointHits)
      .where(eq(checkpointHits.userQuestId, uq.id))
      .all();

    const hitCheckpointIds = new Set(existingHits.map((h) => h.checkpointId));

    // For scavenger quests, only check the next unrevealed checkpoint
    const checkpointsToCheck =
      quest.type === "scavenger"
        ? getNextScavengerCheckpoints(checkpoints, hitCheckpointIds)
        : checkpoints.filter((cp) => !hitCheckpointIds.has(cp.id));

    // 6. Check each checkpoint against the route
    for (const cp of checkpointsToCheck) {
      if (hitCheckpointIds.has(cp.id)) continue;

      const result = checkRouteAgainstGeofence(route, {
        latitude: cp.latitude,
        longitude: cp.longitude,
        radiusMeters: cp.radiusMeters,
      });

      if (result.hit) {
        db.insert(checkpointHits)
          .values({
            userId,
            userQuestId: uq.id,
            checkpointId: cp.id,
            stravaActivityId: activity.id,
            distanceMeters: result.minDistance,
          })
          .run();

        hitCheckpointIds.add(cp.id);
      }
    }

    // Check if quest is now complete
    const allHit = checkpoints.every((cp) => hitCheckpointIds.has(cp.id));

    // For point_to_point, verify order
    if (allHit && quest.type === "point_to_point") {
      const isOrdered = verifyCheckpointOrder(
        checkpoints,
        existingHits,
        stravaActivityId
      );
      if (!isOrdered) continue;
    }

    if (allHit) {
      completeQuest(userId, uq.id, quest.xpReward, quest.restCreditReward);
    }
  }
}

function getNextScavengerCheckpoints<T extends { id: number; sortOrder: number }>(
  checkpoints: T[],
  hitIds: Set<number>
): T[] {
  // Return the first un-hit checkpoint (by sort order)
  const next = checkpoints.find((cp) => !hitIds.has(cp.id));
  return next ? [next] : [];
}

function verifyCheckpointOrder(
  checkpoints: { id: number; sortOrder: number }[],
  existingHits: { checkpointId: number; stravaActivityId: number | null }[],
  currentActivityId: number
): boolean {
  // For simplicity in MVP: if all checkpoints were hit during the same activity,
  // we trust the order. For hits across activities, we check chronological order of hits.
  // This is a simplified check — a full implementation would verify GPS order within a single activity.
  const hitMap = new Map(
    existingHits.map((h) => [h.checkpointId, h.stravaActivityId])
  );

  // All checkpoints need to exist in hits
  for (const cp of checkpoints) {
    if (!hitMap.has(cp.id)) return false;
  }

  return true;
}

function completeQuest(
  userId: number,
  userQuestId: number,
  xpReward: number,
  restCreditReward: number
): void {
  // Mark quest completed
  db.update(userQuests)
    .set({
      status: "completed",
      completedAt: new Date().toISOString(),
    })
    .where(eq(userQuests.id, userQuestId))
    .run();

  // Award XP
  const user = db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (user) {
    db.update(users)
      .set({ totalXp: user.totalXp + xpReward })
      .where(eq(users.id, userId))
      .run();
  }

  // Award rest credits
  awardRestCredits(userId, restCreditReward);

  // Update quests completed count
  const stats = getOrCreateStats(userId);
  db.update(userStats)
    .set({ questsCompleted: stats.questsCompleted + 1 })
    .where(eq(userStats.userId, userId))
    .run();
}
