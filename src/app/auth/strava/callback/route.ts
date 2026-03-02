import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/strava";
import { createSession } from "@/lib/session";
import { db } from "@/db";
import { users, userStats } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL("/?error=auth_failed", request.url)
    );
  }

  try {
    const data = await exchangeCodeForTokens(code);

    // Upsert user
    let user = db
      .select()
      .from(users)
      .where(eq(users.stravaAthleteId, data.athlete.id))
      .get();

    if (user) {
      db.update(users)
        .set({
          firstName: data.athlete.firstname,
          lastName: data.athlete.lastname,
          profileImageUrl: data.athlete.profile,
          stravaAccessToken: data.access_token,
          stravaRefreshToken: data.refresh_token,
          stravaTokenExpiresAt: data.expires_at,
        })
        .where(eq(users.id, user.id))
        .run();
    } else {
      const rows = db
        .insert(users)
        .values({
          stravaAthleteId: data.athlete.id,
          firstName: data.athlete.firstname,
          lastName: data.athlete.lastname,
          profileImageUrl: data.athlete.profile,
          stravaAccessToken: data.access_token,
          stravaRefreshToken: data.refresh_token,
          stravaTokenExpiresAt: data.expires_at,
        })
        .returning()
        .all();
      user = rows[0];

      // Create user stats row
      db.insert(userStats).values({ userId: user.id }).run();
    }

    await createSession({
      userId: user.id,
      stravaAthleteId: user.stravaAthleteId,
    });

    return NextResponse.redirect(new URL("/dashboard", request.url));
  } catch (e) {
    console.error("Strava OAuth error:", e);
    return NextResponse.redirect(
      new URL("/?error=auth_failed", request.url)
    );
  }
}
