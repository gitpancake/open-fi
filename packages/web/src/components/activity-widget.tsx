"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { FiActivitySummary } from "~/types/fi";

interface ActivityWidgetProps {
  daily: FiActivitySummary;
  weekly: FiActivitySummary;
  monthly: FiActivitySummary;
}

export function ActivityWidget({ daily, weekly, monthly }: ActivityWidgetProps) {
  const goalPercent = daily.stepGoal > 0
    ? Math.min(100, Math.round((daily.totalSteps / daily.stepGoal) * 100))
    : 0;

  const dailyMiles = (daily.totalDistance * 0.000621371).toFixed(1);

  const [animatedPercent, setAnimatedPercent] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPercent(goalPercent), 100);
    return () => clearTimeout(timer);
  }, [goalPercent]);

  const barColor =
    goalPercent >= 80
      ? "bg-green-500"
      : goalPercent >= 40
        ? "bg-amber-500"
        : "bg-muted-foreground/50";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily progress */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold tabular-nums">
              {daily.totalSteps.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              / {daily.stepGoal.toLocaleString()} steps
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${barColor} transition-all duration-1000 ease-out`}
              style={{ width: `${animatedPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {goalPercent}% of daily goal · {dailyMiles} mi today
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-muted/50 p-3 space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">This week</p>
            <p className="text-sm font-semibold tabular-nums">
              {weekly.totalSteps.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {(weekly.totalDistance * 0.000621371).toFixed(1)} mi
            </p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 space-y-0.5">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">This month</p>
            <p className="text-sm font-semibold tabular-nums">
              {monthly.totalSteps.toLocaleString()}
            </p>
            <p className="text-xs text-muted-foreground">
              {(monthly.totalDistance * 0.000621371).toFixed(1)} mi
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
