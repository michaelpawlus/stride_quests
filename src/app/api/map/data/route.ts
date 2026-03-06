import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import {
  quests,
  questCheckpoints,
  userQuests,
  checkpointHits,
  stravaActivities,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { isNextScavengerCheckpoint } from "@/lib/quest-utils";
import type { MapData, MapQuest, MapCheckpoint } from "@/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allQuests = db.select().from(quests).where(eq(quests.isActive, true)).all();
  const allCheckpoints = db.select().from(questCheckpoints).all();
  const allUserQuests = db
    .select()
    .from(userQuests)
    .where(eq(userQuests.userId, session.userId))
    .all();

  const allHits = allUserQuests.length
    ? db
        .select()
        .from(checkpointHits)
        .where(eq(checkpointHits.userId, session.userId))
        .all()
    : [];

  // Build lookup maps
  const uqByQuestId = new Map(allUserQuests.map((uq) => [uq.questId, uq]));
  const hitsByUqId = new Map<number, Set<number>>();
  for (const hit of allHits) {
    if (!hitsByUqId.has(hit.userQuestId)) {
      hitsByUqId.set(hit.userQuestId, new Set());
    }
    hitsByUqId.get(hit.userQuestId)!.add(hit.checkpointId);
  }

  // Get route polylines for completed quests
  const completedUqs = allUserQuests.filter((uq) => uq.status === "completed");
  const completedActivityIds = new Set<number>();
  for (const uq of completedUqs) {
    const hits = allHits.filter((h) => h.userQuestId === uq.id && h.stravaActivityId);
    hits.forEach((h) => completedActivityIds.add(h.stravaActivityId!));
  }

  const routePolylines = new Map<number, string[]>();
  if (completedActivityIds.size > 0) {
    const activities = db.select().from(stravaActivities).all();
    const activityMap = new Map(
      activities
        .filter((a) => a.summaryPolyline)
        .map((a) => [a.stravaActivityId, a.summaryPolyline!])
    );

    for (const uq of completedUqs) {
      const hits = allHits.filter((h) => h.userQuestId === uq.id && h.stravaActivityId);
      const polylines: string[] = [];
      const seen = new Set<number>();
      for (const hit of hits) {
        if (seen.has(hit.stravaActivityId!)) continue;
        seen.add(hit.stravaActivityId!);
        const poly = activityMap.get(hit.stravaActivityId!);
        if (poly) polylines.push(poly);
      }
      if (polylines.length) routePolylines.set(uq.questId, polylines);
    }
  }

  const mapQuests: MapQuest[] = allQuests.map((quest) => {
    const uq = uqByQuestId.get(quest.id);
    const hitIds = uq ? hitsByUqId.get(uq.id) ?? new Set<number>() : new Set<number>();
    const questCps = allCheckpoints
      .filter((cp) => cp.questId === quest.id)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const checkpoints: MapCheckpoint[] = questCps
      .map((cp) => {
        const isCompleted = hitIds.has(cp.id);
        const shouldReveal =
          quest.type !== "scavenger" ||
          cp.isRevealed ||
          isCompleted ||
          isNextScavengerCheckpoint(cp, questCps, hitIds);

        if (!shouldReveal) return null;

        return {
          id: cp.id,
          name: cp.name,
          latitude: cp.latitude,
          longitude: cp.longitude,
          radiusMeters: cp.radiusMeters,
          isCompleted,
        };
      })
      .filter((cp): cp is MapCheckpoint => cp !== null);

    const status = uq?.status ?? "available";

    return {
      id: quest.id,
      name: quest.name,
      type: quest.type,
      difficulty: quest.difficulty,
      status,
      checkpoints,
      routePolylines: routePolylines.get(quest.id) ?? [],
    };
  });

  const data: MapData = { quests: mapQuests };
  return NextResponse.json(data);
}
