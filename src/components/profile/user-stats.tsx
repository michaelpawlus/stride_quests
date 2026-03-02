import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Stats = {
  totalXp: number;
  questsCompleted: number;
  activitiesSynced: number;
  currentStreak: number;
};

export function UserStatsDisplay({ stats }: { stats: Stats }) {
  const items = [
    { label: "Total XP", value: stats.totalXp.toLocaleString() },
    { label: "Quests Completed", value: stats.questsCompleted },
    { label: "Activities Synced", value: stats.activitiesSynced },
    { label: "Current Streak", value: `${stats.currentStreak} days` },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Stats
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) => (
            <div key={item.label} className="text-center">
              <p className="text-2xl font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
