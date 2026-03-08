"use client";

import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "~/lib/utils";
import type { FiBase } from "~/types/fi";

interface BaseStationsWidgetProps {
  bases: FiBase[];
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function BaseStationsWidget({ bases }: BaseStationsWidgetProps) {
  if (bases.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Base Stations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {bases.map((base) => (
          <div key={base.baseId} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {base.online ? (
                <Wifi className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <WifiOff className="h-3.5 w-3.5 text-muted-foreground" />
              )}
              <div className="flex flex-col">
                <span className="font-medium">{base.name}</span>
                {base.networkName && (
                  <span className="text-xs text-muted-foreground">{base.networkName}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={cn("text-xs font-medium", base.online ? "text-green-500" : "text-muted-foreground")}>
                {base.online ? "Online" : "Offline"}
              </span>
              <span className="text-xs text-muted-foreground">
                {timeAgo(base.infoLastUpdated)}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
