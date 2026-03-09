"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import type {
  FiHealthTrendsResponse,
  FiHealthTrend,
  FiHealthTrendGraph,
  FiHealthTrendSegmentedTimeline,
} from "~/types/fi";

interface HealthTrendsWidgetProps {
  petId: string;
  initialTrends: FiHealthTrendsResponse | null;
}

const PERIODS = ["DAY", "WEEK", "MONTH"] as const;
const PERIOD_LABELS: Record<string, string> = { DAY: "Day", WEEK: "Week", MONTH: "Month" };

function MiniGraph({ chart }: { chart: FiHealthTrendGraph }) {
  const { points, minimum, maximum, color } = chart;
  if (!points.length) return null;

  const range = maximum - minimum || 1;
  const h = 32;
  const w = 120;
  const step = w / Math.max(points.length - 1, 1);

  const pathPoints = points.map((val, i) => {
    const x = i * step;
    const y = h - ((val - minimum) / range) * h;
    return `${x},${y}`;
  });

  const strokeColor = color || "currentColor";

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none">
      <polyline
        points={pathPoints.join(" ")}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

function SegmentBar({ chart }: { chart: FiHealthTrendSegmentedTimeline }) {
  const { length, segments } = chart;
  if (!length || !segments.length) return null;

  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
      {segments.map((seg, i) => (
        <div
          key={i}
          style={{
            width: `${(seg.length / length) * 100}%`,
            marginLeft: i === 0 ? `${(seg.offset / length) * 100}%` : undefined,
            backgroundColor: seg.color || "var(--muted-foreground)",
          }}
          className="h-full"
          title={seg.intervalType}
        />
      ))}
    </div>
  );
}

function ChangeIndicator({ direction, change }: { direction: string; change: string }) {
  const Icon =
    direction === "UP" ? TrendingUp : direction === "DOWN" ? TrendingDown : Minus;
  const color =
    direction === "UP"
      ? "text-green-500"
      : direction === "DOWN"
        ? "text-red-500"
        : "text-muted-foreground";

  return (
    <span className={`inline-flex items-center gap-0.5 text-[10px] ${color}`}>
      <Icon className="h-2.5 w-2.5" />
      {change}
    </span>
  );
}

function TrendCard({ trend }: { trend: FiHealthTrend }) {
  if (trend.disabled) return null;

  const summary = trend.summaryComponents?.[0];
  const chart = trend.chart;

  return (
    <div className="space-y-1.5 rounded-lg bg-muted/50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium">{trend.title}</p>
        {summary?.eventsChange && (
          <ChangeIndicator
            direction={summary.eventsChange.direction}
            change={summary.eventsChange.change}
          />
        )}
        {!summary?.eventsChange && summary?.durationChange && (
          <ChangeIndicator
            direction={summary.durationChange.direction}
            change={summary.durationChange.change}
          />
        )}
      </div>

      {chart?.__typename === "PetHealthTrendGraph" && (
        <MiniGraph chart={chart as FiHealthTrendGraph} />
      )}
      {chart?.__typename === "PetHealthTrendSegmentedTimeline" && (
        <SegmentBar chart={chart as FiHealthTrendSegmentedTimeline} />
      )}

      {summary && (
        <div className="flex gap-3 text-[10px] text-muted-foreground">
          {summary.eventsSummary && <span>{summary.eventsSummary}</span>}
          {summary.durationSummary && <span>{summary.durationSummary}</span>}
        </div>
      )}
    </div>
  );
}

export function HealthTrendsWidget({ petId, initialTrends }: HealthTrendsWidgetProps) {
  const [trends, setTrends] = useState<FiHealthTrendsResponse | null>(initialTrends);
  const [period, setPeriod] = useState<string>("DAY");
  const [loading, setLoading] = useState(false);

  const fetchTrends = useCallback(async (p: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/health-trends/${petId}?period=${p}`);
      if (!res.ok) throw new Error("Failed to fetch trends");
      const data: FiHealthTrendsResponse = await res.json();
      setTrends(data);
    } catch (err) {
      console.error("Failed to fetch health trends:", err);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useEffect(() => {
    if (initialTrends) setTrends(initialTrends);
  }, [initialTrends]);

  function handlePeriodChange(p: string) {
    setPeriod(p);
    fetchTrends(p);
  }

  const allTrends = [
    ...(trends?.genericTrends ?? []),
    ...(trends?.behaviorTrends ?? []),
  ].filter((t) => !t.disabled);

  if (!trends && !loading) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Health Trends
          </CardTitle>
          <div className="flex gap-0.5 rounded-md bg-muted p-0.5">
            {PERIODS.map((p) => (
              <Button
                key={p}
                variant="ghost"
                size="sm"
                onClick={() => handlePeriodChange(p)}
                className={`h-6 px-2 text-[10px] ${
                  period === p
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {PERIOD_LABELS[p]}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : allTrends.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {allTrends.map((trend) => (
              <TrendCard key={trend.id} trend={trend} />
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No trend data available
          </p>
        )}
      </CardContent>
    </Card>
  );
}
