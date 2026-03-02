import { z } from "zod";

export const activateQuestSchema = z.object({
  questId: z.number().int().positive(),
});

export const stravaWebhookSchema = z.object({
  aspect_type: z.enum(["create", "update", "delete"]),
  event_time: z.number(),
  object_id: z.number(),
  object_type: z.enum(["activity", "athlete"]),
  owner_id: z.number(),
  subscription_id: z.number(),
  updates: z.record(z.string(), z.unknown()).optional(),
});

export const stravaTokenResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(),
  athlete: z.object({
    id: z.number(),
    firstname: z.string(),
    lastname: z.string(),
    profile: z.string(),
  }),
});

export const stravaRefreshResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_at: z.number(),
});
