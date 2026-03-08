import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Signal, Zap } from "lucide-react";
import type { FiConnectionState, FiLedColor, FiOperationParams } from "~/types/fi";

interface DeviceStatusWidgetProps {
  device: {
    __typename: string;
    moduleId: string;
    info: string;
    operationParams: FiOperationParams;
    nextLocationUpdateExpectedBy: string;
    lastConnectionState: FiConnectionState;
    ledColor: FiLedColor;
  };
}

function getConnectionLabel(type: string): string {
  switch (type) {
    case "ConnectedToUser":
      return "Bluetooth";
    case "ConnectedToBase":
      return "Charging";
    case "ConnectedToCellular":
      return "Cellular";
    case "UnknownConnectivity":
      return "Unknown";
    default:
      return type;
  }
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

export function DeviceStatusWidget({ device }: DeviceStatusWidgetProps) {
  const connType = device.lastConnectionState.__typename;
  const isCharging = connType === "ConnectedToBase";
  const isConnected =
    connType === "ConnectedToUser" ||
    connType === "ConnectedToBase" ||
    connType === "ConnectedToCellular";
  const isLost = device.operationParams.mode === "LOST_DOG";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Device
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-green-500" : "bg-muted-foreground"
              }`}
            />
            <span className="text-sm font-medium">
              {getConnectionLabel(connType)}
            </span>
          </div>
          {isCharging && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Zap className="h-3 w-3" />
              Charging
            </Badge>
          )}
        </div>

        {device.lastConnectionState.signalStrengthPercent !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Signal className="h-3.5 w-3.5" />
              Signal
            </span>
            <span className="font-medium">{device.lastConnectionState.signalStrengthPercent}%</span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">LED</span>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full ring-1 ring-border"
              style={{
                backgroundColor: device.ledColor?.hexCode
                  ? `#${device.ledColor.hexCode}`
                  : undefined,
              }}
            />
            <span className="font-medium">{device.ledColor?.name ?? "Off"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last seen</span>
          <span className="font-medium">{timeAgo(device.lastConnectionState.date)}</span>
        </div>

        {isLost && (
          <Badge variant="destructive" className="w-full justify-center">
            Lost Dog Mode Active
          </Badge>
        )}
      </CardContent>
    </Card>
  );
}
