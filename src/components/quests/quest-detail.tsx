"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import type { QuestDetail } from "@/types";

const difficultyColors = {
  easy: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  hard: "bg-red-500/10 text-red-600 border-red-500/20",
};

const typeLabels = {
  point_to_point: "Point to Point",
  collector: "Collector",
  scavenger: "Scavenger",
};

export function QuestDetailView({ questId }: { questId: number }) {
  const [quest, setQuest] = useState<QuestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch(`/api/quests/${questId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then(setQuest)
      .finally(() => setLoading(false));
  }, [questId]);

  const activateQuest = async () => {
    const res = await fetch(`/api/quests/${questId}`, { method: "POST" });
    if (res.ok) {
      router.refresh();
      // Re-fetch quest data
      const updated = await fetch(`/api/quests/${questId}`);
      if (updated.ok) setQuest(await updated.json());
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (!quest) {
    return <p className="py-8 text-center text-muted-foreground">Quest not found</p>;
  }

  const progressPercent =
    quest.totalCheckpoints > 0
      ? (quest.completedCheckpoints / quest.totalCheckpoints) * 100
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{quest.name}</h2>
        <div className="mt-2 flex items-center gap-2">
          <Badge variant="outline">{typeLabels[quest.type]}</Badge>
          <Badge
            variant="outline"
            className={difficultyColors[quest.difficulty]}
          >
            {quest.difficulty}
          </Badge>
          {quest.status === "completed" && (
            <Badge className="bg-emerald-500/10 text-emerald-600">
              Complete
            </Badge>
          )}
          {quest.status === "active" && (
            <Badge className="bg-blue-500/10 text-blue-600">Active</Badge>
          )}
        </div>
      </div>

      {quest.flavorText && (
        <p className="italic text-muted-foreground">&ldquo;{quest.flavorText}&rdquo;</p>
      )}

      <p className="text-sm">{quest.description}</p>

      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span>{quest.xpReward} XP reward</span>
        <span>+{quest.restCreditReward} rest credits</span>
      </div>

      {quest.status === "active" && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>
              {quest.completedCheckpoints}/{quest.totalCheckpoints}
            </span>
          </div>
          <Progress value={progressPercent} className="h-3" />
        </div>
      )}

      {quest.status === "available" && (
        <Button onClick={activateQuest} className="w-full" size="lg">
          Accept Quest
        </Button>
      )}

      <Separator />

      <div>
        <h3 className="mb-4 text-lg font-semibold">Checkpoints</h3>
        <div className="space-y-3">
          {quest.checkpoints.map((cp, i) => (
            <Card
              key={cp.id}
              className={
                cp.isCompleted
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : ""
              }
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    {i + 1}. {cp.name}
                  </CardTitle>
                  {cp.isCompleted && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-emerald-500"
                    >
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {cp.description && (
                  <p className="text-xs text-muted-foreground">
                    {cp.description}
                  </p>
                )}
                {cp.hint && (
                  <p className="mt-1 text-xs italic text-amber-600">
                    Hint: {cp.hint}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
