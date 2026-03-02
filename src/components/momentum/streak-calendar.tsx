import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MomentumDay } from "@/types";

export function StreakCalendar({ days }: { days: MomentumDay[] }) {
  // Reverse so most recent is last (right side)
  const sorted = [...days].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Last 30 Days
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1.5">
          {sorted.map((day) => (
            <Tooltip key={day.date}>
              <TooltipTrigger asChild>
                <div
                  className={`aspect-square rounded-sm transition-colors ${getDayColor(
                    day
                  )}`}
                />
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">
                  {formatDate(day.date)}:{" "}
                  {day.didRun
                    ? "Ran"
                    : day.usedRestCredit
                      ? "Rest credit"
                      : day.streakBroken
                        ? "Streak broken"
                        : "No activity"}
                </p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-sm bg-emerald-500" /> Ran
          </span>
          <span className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-sm bg-amber-400" /> Rest credit
          </span>
          <span className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-sm bg-red-400" /> Broken
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function getDayColor(day: MomentumDay): string {
  if (day.didRun) return "bg-emerald-500";
  if (day.usedRestCredit) return "bg-amber-400";
  if (day.streakBroken) return "bg-red-400";
  return "bg-muted";
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
