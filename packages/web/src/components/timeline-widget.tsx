"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineHeader,
  TimelineItem,
  TimelineTitle,
  TimelineDescription,
} from "~/components/ui/timeline";
import { Button } from "~/components/ui/button";
import { Footprints, Moon, Car, Gamepad2, Bell, ChevronDown, Loader2 } from "lucide-react";
import type { FiTimelineFeed, FiTimelineItem, FiTimelineActivityItem } from "~/types/fi";

interface TimelineWidgetProps {
  initialFeed: FiTimelineFeed | null;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatDuration(start: string, end: string): string {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  const rem = mins % 60;
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
}

function formatDistance(meters?: number): string | null {
  if (!meters) return null;
  const miles = meters * 0.000621371;
  return miles >= 0.1 ? `${miles.toFixed(1)} mi` : `${Math.round(meters)} m`;
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "Walk":
      return <Footprints className="h-3 w-3" />;
    case "Rest":
      return <Moon className="h-3 w-3" />;
    case "Travel":
      return <Car className="h-3 w-3" />;
    case "Play":
      return <Gamepad2 className="h-3 w-3" />;
    default:
      return <Bell className="h-3 w-3" />;
  }
}

function getActivityLabel(item: FiTimelineActivityItem): string {
  const act = item.activity;
  switch (act.__typename) {
    case "Walk": {
      const loc = act.neighborhood || act.areaName;
      return loc ? `Walk in ${loc}` : "Walk";
    }
    case "Rest": {
      const place = act.place?.name || act.areaName;
      return place ? `Resting at ${place}` : "Resting";
    }
    case "Travel":
      return "Car ride";
    case "Play": {
      const place = act.place?.name || act.areaName;
      return place ? `Playing at ${place}` : "Playing";
    }
    default:
      return act.__typename;
  }
}

function getActivityDetails(item: FiTimelineActivityItem): string {
  const act = item.activity;
  const parts: string[] = [];

  const duration = formatDuration(act.start, act.end);
  parts.push(duration);

  if (act.__typename === "Walk" || act.__typename === "Travel") {
    const dist = formatDistance(act.distance);
    if (dist) parts.push(dist);
  }

  if (act.__typename === "Walk" && act.totalSteps > 0) {
    parts.push(`${act.totalSteps.toLocaleString()} steps`);
  }

  if (act.presentUserString) {
    parts.push(`with ${act.presentUserString}`);
  }

  return parts.join(" · ");
}

export function TimelineWidget({ initialFeed }: TimelineWidgetProps) {
  const [feed, setFeed] = useState<FiTimelineFeed | null>(initialFeed);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialFeed) setFeed(initialFeed);
  }, [initialFeed]);

  if (!feed || feed.feedItems.length === 0) return null;

  async function loadMore() {
    if (!feed?.pageInfo.hasNextPage) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/timeline?cursor=${encodeURIComponent(feed.pageInfo.endCursor)}`);
      if (!res.ok) throw new Error("Failed to load more");
      const nextFeed: FiTimelineFeed = await res.json();
      setFeed((prev) =>
        prev
          ? {
              feedItems: [...prev.feedItems, ...nextFeed.feedItems],
              pageInfo: nextFeed.pageInfo,
            }
          : nextFeed,
      );
    } catch (err) {
      console.error("Failed to load more timeline:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Timeline>
          {feed.feedItems.map((item: FiTimelineItem) => {
            if (item.__typename === "FiFeedActivityItem") {
              const actItem = item as FiTimelineActivityItem;
              return (
                <TimelineItem key={item.id}>
                  <TimelineDot />
                  <TimelineConnector />
                  <TimelineContent>
                    <TimelineHeader>
                      <TimelineTitle className="flex items-center gap-1.5 text-sm">
                        <ActivityIcon type={actItem.activity.__typename} />
                        {getActivityLabel(actItem)}
                      </TimelineTitle>
                    </TimelineHeader>
                    <TimelineDescription className="text-xs">
                      {formatTime(actItem.activity.start)} · {getActivityDetails(actItem)}
                    </TimelineDescription>
                  </TimelineContent>
                </TimelineItem>
              );
            }

            if (item.__typename === "FiFeedGenericNotificationItem") {
              const text = item.body?.text || item.title || "";
              if (!text) return null;
              return (
                <TimelineItem key={item.id}>
                  <TimelineDot />
                  <TimelineConnector />
                  <TimelineContent>
                    <TimelineHeader>
                      <TimelineTitle className="flex items-center gap-1.5 text-sm">
                        <Bell className="h-3 w-3" />
                        {text}
                      </TimelineTitle>
                    </TimelineHeader>
                    <TimelineDescription className="text-xs">
                      {formatTime(item.timestamp)}
                    </TimelineDescription>
                  </TimelineContent>
                </TimelineItem>
              );
            }

            return null;
          })}
        </Timeline>

        {feed.pageInfo.hasNextPage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={loadMore}
            disabled={loading}
            className="mt-3 w-full text-xs text-muted-foreground"
          >
            {loading ? (
              <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
            ) : (
              <ChevronDown className="mr-1.5 h-3 w-3" />
            )}
            Load more
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
