import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
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
      return "Connected (Bluetooth)";
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
            <span className="text-sm">
              {getConnectionLabel(connType)}
            </span>
          </div>
          {isCharging && (
            <Badge variant="secondary" className="text-xs">
              Charging
            </Badge>
          )}
        </div>

        {device.lastConnectionState.signalStrengthPercent !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Signal</span>
            <span>{device.lastConnectionState.signalStrengthPercent}%</span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">LED</span>
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full border"
              style={{
                backgroundColor: device.ledColor?.hexCode
                  ? `#${device.ledColor.hexCode}`
                  : undefined,
              }}
            />
            <span>{device.ledColor?.name ?? "Off"}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last seen</span>
          <span>{timeAgo(device.lastConnectionState.date)}</span>
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
