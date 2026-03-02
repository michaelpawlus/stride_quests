"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { QuestWithProgress } from "@/types";

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

export function QuestCard({
  quest,
  onActivate,
}: {
  quest: QuestWithProgress;
  onActivate?: (questId: number) => void;
}) {
  const progressPercent =
    quest.totalCheckpoints > 0
      ? (quest.completedCheckpoints / quest.totalCheckpoints) * 100
      : 0;

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-tight">
            <Link
              href={`/quests/${quest.id}`}
              className="hover:underline"
            >
              {quest.name}
            </Link>
          </CardTitle>
          {quest.status === "completed" && (
            <Badge variant="secondary" className="shrink-0 bg-emerald-500/10 text-emerald-600">
              Complete
            </Badge>
          )}
          {quest.status === "active" && (
            <Badge variant="secondary" className="shrink-0 bg-blue-500/10 text-blue-600">
              Active
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 pt-1">
          <Badge variant="outline" className="text-xs">
            {typeLabels[quest.type]}
          </Badge>
          <Badge
            variant="outline"
            className={`text-xs ${difficultyColors[quest.difficulty]}`}
          >
            {quest.difficulty}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {quest.description}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{quest.xpReward} XP</span>
          <span>
            {quest.completedCheckpoints}/{quest.totalCheckpoints} checkpoints
          </span>
        </div>
        {quest.status === "active" && (
          <Progress value={progressPercent} className="h-2" />
        )}
        {quest.status === "available" && onActivate && (
          <Button
            size="sm"
            className="w-full"
            onClick={() => onActivate(quest.id)}
          >
            Accept Quest
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
