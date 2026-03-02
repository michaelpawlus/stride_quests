import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { StravaActivity, StravaTokens } from "@/types";
import {
  stravaTokenResponseSchema,
  stravaRefreshResponseSchema,
} from "./validators";

const STRAVA_API_BASE = "https://www.strava.com/api/v3";
const STRAVA_AUTH_BASE = "https://www.strava.com/oauth";

export function getStravaAuthUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: process.env.STRAVA_REDIRECT_URI!,
    response_type: "code",
    scope: "activity:read_all",
  });
  return `${STRAVA_AUTH_BASE}/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string) {
  const res = await fetch(`${STRAVA_AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
    }),
  });

  if (!res.ok) {
    throw new Error(`Strava token exchange failed: ${res.status}`);
  }

  const data = await res.json();
  return stravaTokenResponseSchema.parse(data);
}

export async function refreshAccessToken(refreshToken: string): Promise<StravaTokens> {
  const res = await fetch(`${STRAVA_AUTH_BASE}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`Strava token refresh failed: ${res.status}`);
  }

  const data = await res.json();
  const parsed = stravaRefreshResponseSchema.parse(data);

  return {
    accessToken: parsed.access_token,
    refreshToken: parsed.refresh_token,
    expiresAt: parsed.expires_at,
  };
}

export async function getValidAccessToken(userId: number): Promise<string> {
  const user = db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!user) throw new Error(`User ${userId} not found`);

  const now = Math.floor(Date.now() / 1000);
  if (user.stravaTokenExpiresAt > now + 60) {
    return user.stravaAccessToken;
  }

  const tokens = await refreshAccessToken(user.stravaRefreshToken);

  db.update(users)
    .set({
      stravaAccessToken: tokens.accessToken,
      stravaRefreshToken: tokens.refreshToken,
      stravaTokenExpiresAt: tokens.expiresAt,
    })
    .where(eq(users.id, userId))
    .run();

  return tokens.accessToken;
}

export async function getActivity(
  accessToken: string,
  activityId: number
): Promise<StravaActivity> {
  const res = await fetch(`${STRAVA_API_BASE}/activities/${activityId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error(`Strava get activity failed: ${res.status}`);
  }

  return res.json();
}
