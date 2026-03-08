"use client";

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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Daily progress bar */}
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
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {goalPercent}% of daily goal · {dailyMiles} mi today
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">This week</p>
            <p className="text-sm font-medium tabular-nums">
              {weekly.totalSteps.toLocaleString()} steps
            </p>
            <p className="text-xs text-muted-foreground">
              {(weekly.totalDistance * 0.000621371).toFixed(1)} mi
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs text-muted-foreground">This month</p>
            <p className="text-sm font-medium tabular-nums">
              {monthly.totalSteps.toLocaleString()} steps
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
