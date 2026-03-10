import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getUserBadges } from "@/lib/badges";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const badges = getUserBadges(session.userId);
  return NextResponse.json(badges);
}
