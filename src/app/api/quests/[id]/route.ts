import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import {
  quests,
  questCheckpoints,
  userQuests,
  checkpointHits,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import type { CheckpointDetail, QuestDetail } from "@/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const questId = parseInt(id, 10);
  if (isNaN(questId)) {
    return NextResponse.json({ error: "Invalid quest ID" }, { status: 400 });
  }

  const quest = db
    .select()
    .from(quests)
    .where(eq(quests.id, questId))
    .get();

  if (!quest) {
    return NextResponse.json({ error: "Quest not found" }, { status: 404 });
  }

  const checkpointRows = db
    .select()
    .from(questCheckpoints)
    .where(eq(questCheckpoints.questId, questId))
    .all()
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // Get user quest status
  const uq = db
    .select()
    .from(userQuests)
    .where(
      and(
        eq(userQuests.userId, session.userId),
        eq(userQuests.questId, questId)
      )
    )
    .get();

  const hitCheckpointIds = new Set<number>();
  if (uq) {
    const hits = db
      .select()
      .from(checkpointHits)
      .where(eq(checkpointHits.userQuestId, uq.id))
      .all();
    hits.forEach((h) => hitCheckpointIds.add(h.checkpointId));
  }

  const checkpoints: CheckpointDetail[] = checkpointRows.map((cp) => {
    const isCompleted = hitCheckpointIds.has(cp.id);

    // For scavenger quests, only show hints (not coordinates) for unrevealed checkpoints
    const shouldReveal =
      quest.type !== "scavenger" ||
      cp.isRevealed ||
      isCompleted ||
      isNextScavengerCheckpoint(cp, checkpointRows, hitCheckpointIds);

    return {
      id: cp.id,
      name: shouldReveal ? cp.name : "???",
      description: shouldReveal ? cp.description : null,
      hint: quest.type === "scavenger" && shouldReveal ? cp.hint : null,
      latitude: shouldReveal ? cp.latitude : 0,
      longitude: shouldReveal ? cp.longitude : 0,
      radiusMeters: cp.radiusMeters,
      sortOrder: cp.sortOrder,
      isRevealed: shouldReveal,
      isCompleted,
    };
  });

  const result: QuestDetail = {
    id: quest.id,
    name: quest.name,
    description: quest.description,
    flavorText: quest.flavorText,
    type: quest.type,
    difficulty: quest.difficulty,
    xpReward: quest.xpReward,
    restCreditReward: quest.restCreditReward,
    totalCheckpoints: checkpointRows.length,
    completedCheckpoints: hitCheckpointIds.size,
    status: uq?.status ?? "available",
    checkpoints,
  };

  return NextResponse.json(result);
}

// Activate a quest for the user
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const questId = parseInt(id, 10);
  if (isNaN(questId)) {
    return NextResponse.json({ error: "Invalid quest ID" }, { status: 400 });
  }

  const quest = db
    .select()
    .from(quests)
    .where(eq(quests.id, questId))
    .get();

  if (!quest) {
    return NextResponse.json({ error: "Quest not found" }, { status: 404 });
  }

  // Check if already active
  const existing = db
    .select()
    .from(userQuests)
    .where(
      and(
        eq(userQuests.userId, session.userId),
        eq(userQuests.questId, questId),
        eq(userQuests.status, "active")
      )
    )
    .get();

  if (existing) {
    return NextResponse.json({ error: "Quest already active" }, { status: 409 });
  }

  db.insert(userQuests)
    .values({
      userId: session.userId,
      questId,
    })
    .run();

  return NextResponse.json({ status: "activated" }, { status: 201 });
}

function isNextScavengerCheckpoint(
  cp: { id: number; sortOrder: number },
  allCheckpoints: { id: number; sortOrder: number }[],
  hitIds: Set<number>
): boolean {
  const sorted = [...allCheckpoints].sort((a, b) => a.sortOrder - b.sortOrder);
  for (const c of sorted) {
    if (!hitIds.has(c.id)) {
      return c.id === cp.id;
    }
  }
  return false;
}
