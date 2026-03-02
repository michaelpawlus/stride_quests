import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import {
  getOrCreateStats,
  reconcileMissedDays,
  getRecentDays,
} from "@/lib/momentum";
import type { UserMomentum } from "@/types";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Reconcile any missed days first
  reconcileMissedDays(session.userId);

  const stats = getOrCreateStats(session.userId);
  const recentDays = getRecentDays(session.userId, 30);

  const result: UserMomentum = {
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    restCredits: stats.restCredits,
    maxRestCredits: stats.maxRestCredits,
    recentDays: recentDays.map((d) => ({
      date: d.date,
      didRun: d.didRun,
      usedRestCredit: d.usedRestCredit,
      streakBroken: d.streakBroken,
    })),
  };

  return NextResponse.json(result);
}
