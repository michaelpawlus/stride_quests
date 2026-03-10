"use client";

import { useEffect, useState } from "react";
import {
  Footprints,
  Award,
  Route,
  Search,
  Trees,
  Flame,
  Zap,
  Star,
  Crown,
  Activity,
  Heart,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserBadge, BadgeCategory } from "@/types";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Footprints,
  Award,
  Route,
  Search,
  Trees,
  Flame,
  Zap,
  Star,
  Crown,
  Activity,
  Heart,
};

const CATEGORY_LABELS: Record<BadgeCategory, string> = {
  quest: "Quest Badges",
  momentum: "Momentum Badges",
  xp: "XP Badges",
  activity: "Activity Badges",
};

const CATEGORY_ORDER: BadgeCategory[] = ["quest", "momentum", "xp", "activity"];

export function BadgeGrid() {
  const [badges, setBadges] = useState<UserBadge[] | null>(null);

  useEffect(() => {
    fetch("/api/user/badges")
      .then((res) => res.json())
      .then(setBadges)
      .catch(() => setBadges([]));
  }, []);

  if (badges === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Achievement Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    label: CATEGORY_LABELS[category],
    badges: badges.filter((b) => b.category === category),
  })).filter((g) => g.badges.length > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Achievement Badges</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <TooltipProvider>
          {grouped.map((group) => (
            <div key={group.category}>
              <h3 className="mb-3 text-sm font-medium text-muted-foreground">
                {group.label}
              </h3>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                {group.badges.map((badge) => {
                  const Icon = ICON_MAP[badge.icon];
                  return (
                    <Tooltip key={badge.id}>
                      <TooltipTrigger asChild>
                        <div
                          className={`relative flex flex-col items-center justify-center gap-1.5 rounded-lg border p-3 text-center transition-colors ${
                            badge.unlocked
                              ? "border-primary/30 bg-primary/5"
                              : "border-muted bg-muted/30 opacity-50"
                          }`}
                        >
                          {badge.unlocked ? (
                            Icon && <Icon className="h-6 w-6 text-primary" />
                          ) : (
                            <div className="relative">
                              {Icon && (
                                <Icon className="h-6 w-6 text-muted-foreground/40" />
                              )}
                              <Lock className="absolute -bottom-1 -right-1 h-3 w-3 text-muted-foreground" />
                            </div>
                          )}
                          <span className="text-xs font-medium leading-tight">
                            {badge.name}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-medium">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {badge.description}
                        </p>
                        {badge.unlocked && badge.unlockedAt && (
                          <p className="mt-1 text-xs text-muted-foreground">
                            Unlocked{" "}
                            {new Date(badge.unlockedAt).toLocaleDateString()}
                          </p>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
