import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { MapPin } from "lucide-react";
import type { FiOngoingActivity } from "~/types/fi";

interface LocationWidgetProps {
  activity: FiOngoingActivity | null;
  compact?: boolean;
}

export function LocationWidget({ activity, compact }: LocationWidgetProps) {
  if (!activity) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Location
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No location data available</p>
        </CardContent>
      </Card>
    );
  }

  const isWalking = activity.__typename === "OngoingWalk";

  let lat: number | null = null;
  let lng: number | null = null;

  if (activity.__typename === "OngoingRest" && activity.position) {
    lat = activity.position.latitude;
    lng = activity.position.longitude;
  } else if (isWalking && activity.positions?.length) {
    const latest = activity.positions[activity.positions.length - 1];
    lat = latest.position.latitude;
    lng = latest.position.longitude;
  }

  const mapSrc =
    lat !== null && lng !== null
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.005},${lat - 0.005},${lng + 0.005},${lat + 0.005}&layer=mapnik&marker=${lat},${lng}`
      : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Location
          </CardTitle>
          <Badge variant={isWalking ? "default" : "secondary"} className="text-xs">
            {isWalking ? "Walking" : "Resting"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {mapSrc && (
          <div className="overflow-hidden rounded-xl ring-1 ring-border">
            <iframe
              src={mapSrc}
              className={`w-full border-0 ${compact ? "h-[140px]" : "h-[180px]"}`}
              title="Pet location"
            />
          </div>
        )}

        <div className="space-y-1">
          {activity.place?.name && (
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {activity.place.name}
            </div>
          )}
          {activity.place?.address && (
            <p className="text-xs text-muted-foreground pl-5">
              {activity.place.address}
            </p>
          )}
          {activity.areaName && !activity.place?.name && (
            <div className="flex items-center gap-1.5 text-sm font-medium">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              {activity.areaName}
            </div>
          )}
          {isWalking && activity.distance !== undefined && (
            <p className="text-xs text-muted-foreground pl-5">
              {(activity.distance * 0.000621371).toFixed(2)} mi walked
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
