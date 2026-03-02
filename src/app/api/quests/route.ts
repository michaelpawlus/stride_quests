import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import {
  quests,
  questCheckpoints,
  userQuests,
  checkpointHits,
} from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import type { QuestWithProgress } from "@/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allQuests = db
    .select()
    .from(quests)
    .where(eq(quests.isActive, true))
    .all();

  const result: QuestWithProgress[] = [];

  for (const quest of allQuests) {
    const checkpointCount = db
      .select({ count: count() })
      .from(questCheckpoints)
      .where(eq(questCheckpoints.questId, quest.id))
      .get();

    const totalCheckpoints = checkpointCount?.count ?? 0;

    // Check if user has this quest active/completed
    const uq = db
      .select()
      .from(userQuests)
      .where(
        and(
          eq(userQuests.userId, session.userId),
          eq(userQuests.questId, quest.id)
        )
      )
      .get();

    let completedCheckpoints = 0;
    if (uq) {
      const hitCount = db
        .select({ count: count() })
        .from(checkpointHits)
        .where(eq(checkpointHits.userQuestId, uq.id))
        .get();
      completedCheckpoints = hitCount?.count ?? 0;
    }

    result.push({
      id: quest.id,
      name: quest.name,
      description: quest.description,
      flavorText: quest.flavorText,
      type: quest.type,
      difficulty: quest.difficulty,
      xpReward: quest.xpReward,
      restCreditReward: quest.restCreditReward,
      totalCheckpoints,
      completedCheckpoints,
      status: uq?.status ?? "available",
    });
  }

  return NextResponse.json(result);
}
