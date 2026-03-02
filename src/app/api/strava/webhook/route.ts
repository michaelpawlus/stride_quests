import { NextRequest, NextResponse } from "next/server";
import { stravaWebhookSchema } from "@/lib/validators";
import { processStravaActivity } from "@/lib/quest-validator";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Webhook subscription verification
export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("hub.mode");
  const token = request.nextUrl.searchParams.get("hub.verify_token");
  const challenge = request.nextUrl.searchParams.get("hub.challenge");

  if (
    mode === "subscribe" &&
    token === process.env.STRAVA_WEBHOOK_VERIFY_TOKEN
  ) {
    return NextResponse.json({ "hub.challenge": challenge });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// Webhook event handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = stravaWebhookSchema.parse(body);

    // Only process new activity events
    if (event.object_type !== "activity" || event.aspect_type !== "create") {
      return NextResponse.json({ status: "ignored" });
    }

    // Find user by Strava athlete ID
    const user = db
      .select()
      .from(users)
      .where(eq(users.stravaAthleteId, event.owner_id))
      .get();

    if (!user) {
      return NextResponse.json({ status: "user_not_found" });
    }

    // Process asynchronously (don't block the webhook response)
    processStravaActivity(user.id, event.object_id).catch((err) =>
      console.error("Failed to process activity:", err)
    );

    return NextResponse.json({ status: "ok" });
  } catch (e) {
    console.error("Webhook error:", e);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
