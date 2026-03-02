"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RestCredits } from "./rest-credits";
import { StreakCalendar } from "./streak-calendar";
import type { UserMomentum } from "@/types";

export function MomentumDisplay() {
  const [momentum, setMomentum] = useState<UserMomentum | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/user/momentum")
      .then((res) => (res.ok ? res.json() : null))
      .then(setMomentum)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!momentum) {
    return (
      <p className="py-8 text-center text-muted-foreground">
        Connect Strava and start running to build momentum!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {/* Streak Display */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-center text-sm font-medium text-muted-foreground">
            Current Streak
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center pb-6">
          <MomentumArc streak={momentum.currentStreak} />
          <p className="mt-2 text-sm text-muted-foreground">
            Longest: {momentum.longestStreak} days
          </p>
        </CardContent>
      </Card>

      {/* Rest Credits */}
      <RestCredits
        current={momentum.restCredits}
        max={momentum.maxRestCredits}
      />

      {/* Trailing Calendar */}
      <StreakCalendar days={momentum.recentDays} />
    </div>
  );
}

function MomentumArc({ streak }: { streak: number }) {
  // Simple arc visualization using SVG
  const maxStreak = 30;
  const angle = Math.min((streak / maxStreak) * 270, 270);
  const radians = ((angle - 135) * Math.PI) / 180;
  const r = 70;
  const cx = 90;
  const cy = 90;
  const endX = cx + r * Math.cos(radians);
  const endY = cy + r * Math.sin(radians);
  const largeArc = angle > 180 ? 1 : 0;

  // Start position (at -135 degrees = 225 degrees)
  const startRadians = (-135 * Math.PI) / 180;
  const startX = cx + r * Math.cos(startRadians);
  const startY = cy + r * Math.sin(startRadians);

  return (
    <div className="relative">
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* Background arc */}
        <path
          d={describeArc(cx, cy, r, -135, 135)}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Active arc */}
        {streak > 0 && (
          <path
            d={describeArc(cx, cy, r, -135, -135 + angle)}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="12"
            strokeLinecap="round"
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold">{streak}</span>
        <span className="text-xs text-muted-foreground">days</span>
      </div>
    </div>
  );
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleDegrees: number
) {
  const angleRadians = (angleDegrees * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRadians),
    y: cy + r * Math.sin(angleRadians),
  };
}
