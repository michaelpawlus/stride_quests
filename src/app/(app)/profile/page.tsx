import { Header } from "@/components/layout/header";
import { StravaConnect } from "@/components/profile/strava-connect";
import { UserStatsDisplay } from "@/components/profile/user-stats";
import { BadgeGrid } from "@/components/profile/badge-grid";
import { getSession } from "@/lib/session";
import { db } from "@/db";
import { users, userStats } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) return null;

  const user = db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  const stats = db
    .select()
    .from(userStats)
    .where(eq(userStats.userId, session.userId))
    .get();

  return (
    <>
      <Header title="Profile" />
      <main className="space-y-6 p-4">
        {user && (
          <div className="flex items-center gap-4">
            {user.profileImageUrl && (
              <img
                src={user.profileImageUrl}
                alt={user.firstName}
                className="h-16 w-16 rounded-full"
              />
            )}
            <div>
              <h2 className="text-lg font-semibold">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-sm text-muted-foreground">
                {user.totalXp.toLocaleString()} XP
              </p>
            </div>
          </div>
        )}

        <StravaConnect isConnected={!!user} />

        {stats && (
          <UserStatsDisplay
            stats={{
              totalXp: user?.totalXp ?? 0,
              questsCompleted: stats.questsCompleted,
              activitiesSynced: stats.activitiesSynced,
              currentStreak: stats.currentStreak,
            }}
          />
        )}

        <BadgeGrid />
      </main>
    </>
  );
}
